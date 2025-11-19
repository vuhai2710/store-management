package com.storemanagement.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.dto.product.ProductRecommendationDTO;
import com.storemanagement.mapper.ProductMapper;
import com.storemanagement.model.Product;
import com.storemanagement.repository.ProductRepository;
import com.storemanagement.service.ProductRecommendationService;
import com.storemanagement.service.ProductService;
import com.storemanagement.utils.ProductStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service implementation cho Product Recommendation
 * Sử dụng Content-based Filtering với Python script
 */
@Service
@Slf4j
public class ProductRecommendationServiceImpl implements ProductRecommendationService {

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final ProductMapper productMapper;
    private final ObjectMapper objectMapper;

    @Value("${python.script.path:product_recommendation_api.py}")
    private String pythonScriptPath;

    @Value("${python.executable:python}")
    private String pythonExecutable;
    
    // Constructor để inject ObjectMapper
    public ProductRecommendationServiceImpl(
            ProductRepository productRepository,
            ProductService productService,
            ProductMapper productMapper,
            ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.productMapper = productMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public List<ProductRecommendationDTO> getRecommendedProducts(Integer productId, Integer topN) {
        log.info("Getting recommendations for product ID: {}, topN: {}", productId, topN);
        
        try {
            // Kiểm tra sản phẩm có tồn tại không
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
            
            // Gọi Python script để lấy gợi ý
            List<Map<String, Object>> recommendations = callPythonRecommendationScript(productId, topN);
            
            // Map kết quả với dữ liệu từ database
            List<ProductRecommendationDTO> result = new ArrayList<>();
            
            for (Map<String, Object> rec : recommendations) {
                Integer recommendedProductId = ((Number) rec.get("product_id")).intValue();
                
                // Lấy thông tin sản phẩm từ database
                Product recommendedProduct = productRepository.findById(recommendedProductId)
                        .orElse(null);
                
                if (recommendedProduct != null && recommendedProduct.getStatus() == ProductStatus.IN_STOCK) {
                    ProductRecommendationDTO dto = ProductRecommendationDTO.builder()
                            .productId(recommendedProduct.getIdProduct())
                            .name(recommendedProduct.getProductName())
                            .similarity(((Number) rec.get("similarity")).doubleValue())
                            .imageUrl(recommendedProduct.getImageUrl())
                            .price(recommendedProduct.getPrice())
                            .category(recommendedProduct.getCategory() != null 
                                    ? recommendedProduct.getCategory().getCategoryName() 
                                    : null)
                            .brand(recommendedProduct.getBrand())
                            .build();
                    result.add(dto);
                }
            }
            
            log.info("Found {} recommendations for product ID: {}", result.size(), productId);
            return result;
            
        } catch (Exception e) {
            log.error("Error getting recommendations for product ID: {}", productId, e);
            // Trả về sản phẩm liên quan (cùng category) như fallback
            return getFallbackRecommendations(productId, topN);
        }
    }

    @Override
    public List<ProductRecommendationDTO> getHomePageRecommendations(Integer limit) {
        log.info("Getting home page recommendations, limit: {}", limit);
        
        // Lấy các sản phẩm mới hoặc bán chạy để gợi ý
        // Có thể lấy sản phẩm mới nhất hoặc sản phẩm bán chạy
        List<Product> products = productRepository.findAll()
                .stream()
                .filter(p -> p.getStatus() == ProductStatus.IN_STOCK)
                .limit(limit != null ? limit : 10)
                .collect(Collectors.toList());
        
        return products.stream()
                .map(p -> ProductRecommendationDTO.builder()
                        .productId(p.getIdProduct())
                        .name(p.getProductName())
                        .similarity(1.0) // Không có similarity cho trang chủ
                        .imageUrl(p.getImageUrl())
                        .price(p.getPrice())
                        .category(p.getCategory() != null ? p.getCategory().getCategoryName() : null)
                        .brand(p.getBrand())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Gọi Python script để lấy gợi ý sản phẩm
     */
    private List<Map<String, Object>> callPythonRecommendationScript(Integer productId, Integer topN) {
        try {
            // Lấy đường dẫn tuyệt đối của script
            Path scriptPath = Paths.get(pythonScriptPath);
            if (!scriptPath.isAbsolute()) {
                // Nếu là đường dẫn tương đối, lấy từ thư mục gốc project
                Path projectRoot = Paths.get(System.getProperty("user.dir"));
                scriptPath = projectRoot.resolve(pythonScriptPath);
            }
            
            log.info("Calling Python script: {} with productId: {}, topN: {}", 
                    scriptPath, productId, topN);
            
            // Tạo process để chạy Python script
            ProcessBuilder processBuilder = new ProcessBuilder(
                    pythonExecutable,
                    scriptPath.toString(),
                    String.valueOf(productId),
                    String.valueOf(topN)
            );
            
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            // Đọc output từ Python script
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), "UTF-8"))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            // Đợi process hoàn thành
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                log.error("Python script exited with code: {}", exitCode);
                throw new RuntimeException("Python script execution failed");
            }
            
            // Parse JSON response
            String jsonOutput = output.toString().trim();
            log.debug("Python script output: {}", jsonOutput);
            
            JsonNode jsonNode = objectMapper.readTree(jsonOutput);
            
            // Kiểm tra có lỗi không
            if (jsonNode.has("error")) {
                throw new RuntimeException("Python script error: " + jsonNode.get("error").asText());
            }
            
            // Lấy danh sách recommendations
            JsonNode recommendationsNode = jsonNode.get("recommendations");
            if (recommendationsNode == null || !recommendationsNode.isArray()) {
                throw new RuntimeException("Invalid response format from Python script");
            }
            
            return objectMapper.convertValue(recommendationsNode, 
                    new TypeReference<List<Map<String, Object>>>() {});
            
        } catch (Exception e) {
            log.error("Error calling Python recommendation script", e);
            throw new RuntimeException("Failed to get recommendations from Python script", e);
        }
    }

    /**
     * Fallback: Lấy sản phẩm liên quan (cùng category) nếu Python script thất bại
     */
    private List<ProductRecommendationDTO> getFallbackRecommendations(Integer productId, Integer topN) {
        log.info("Using fallback recommendations for product ID: {}", productId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
        
        List<Product> relatedProducts = productRepository.findAll()
                .stream()
                .filter(p -> !p.getIdProduct().equals(productId))
                .filter(p -> p.getStatus() == ProductStatus.IN_STOCK)
                .filter(p -> product.getCategory() != null && 
                            p.getCategory() != null && 
                            p.getCategory().getIdCategory().equals(product.getCategory().getIdCategory()))
                .limit(topN != null ? topN : 5)
                .collect(Collectors.toList());
        
        return relatedProducts.stream()
                .map(p -> ProductRecommendationDTO.builder()
                        .productId(p.getIdProduct())
                        .name(p.getProductName())
                        .similarity(0.5) // Similarity mặc định cho fallback
                        .imageUrl(p.getImageUrl())
                        .price(p.getPrice())
                        .category(p.getCategory() != null ? p.getCategory().getCategoryName() : null)
                        .brand(p.getBrand())
                        .build())
                .collect(Collectors.toList());
    }
}

