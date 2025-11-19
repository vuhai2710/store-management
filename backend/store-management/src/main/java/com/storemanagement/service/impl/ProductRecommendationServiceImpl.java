package com.storemanagement.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.dto.product.ProductRecommendationDTO;
import com.storemanagement.mapper.ProductMapper;
import com.storemanagement.model.Product;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.OrderRepository;
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
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    @Value("${python.script.path:product_recommendation_api.py}")
    private String pythonScriptPath;

    @Value("${python.executable:python}")
    private String pythonExecutable;
    
    // Constructor để inject ObjectMapper
    public ProductRecommendationServiceImpl(
            ProductRepository productRepository,
            ProductService productService,
            ProductMapper productMapper,
            ObjectMapper objectMapper,
            OrderRepository orderRepository,
            CustomerRepository customerRepository) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.productMapper = productMapper;
        this.objectMapper = objectMapper;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
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
    public List<ProductRecommendationDTO> getHomePageRecommendations(Integer customerId, Integer limit) {
        log.info("Getting home page recommendations with Content-based Filtering, customerId: {}, limit: {}", 
                customerId, limit);
        
        try {
            // Bước 1: Lấy sản phẩm user đã mua gần đây (seed products)
            List<Integer> seedProductIds = new ArrayList<>();
            
            if (customerId != null) {
                // Lấy sản phẩm user đã mua gần đây (tối đa 5 sản phẩm)
                seedProductIds = orderRepository.findRecentlyPurchasedProductIds(customerId, 5);
                log.info("Found {} recently purchased products for customer ID: {}", 
                        seedProductIds.size(), customerId);
            }
            
            // Bước 2: Nếu không có lịch sử mua hàng, lấy sản phẩm bán chạy làm seed
            if (seedProductIds.isEmpty()) {
                log.info("No purchase history found, using best sellers as seed");
                List<Object[]> bestSellers = productRepository.findBestSellingProductIds(
                        "COMPLETED", 3, 0);
                for (Object[] row : bestSellers) {
                    seedProductIds.add(((Number) row[0]).intValue());
                }
            }
            
            // Bước 3: Nếu vẫn không có seed, lấy sản phẩm mới nhất
            if (seedProductIds.isEmpty()) {
                log.info("No best sellers found, using newest products as seed");
                List<Product> newProducts = productRepository.findNewProductsByStatus(
                        org.springframework.data.domain.PageRequest.of(0, 3))
                        .getContent();
                seedProductIds = newProducts.stream()
                        .map(Product::getIdProduct)
                        .collect(Collectors.toList());
            }
            
            if (seedProductIds.isEmpty()) {
                log.warn("No seed products found, returning empty recommendations");
                return new ArrayList<>();
            }
            
            // Bước 4: Tính similarity với các seed products và gộp kết quả
            List<ProductRecommendationDTO> allRecommendations = new ArrayList<>();
            int topNPerSeed = (limit != null ? limit : 10) / seedProductIds.size() + 1;
            
            for (Integer seedProductId : seedProductIds) {
                try {
                    // Gọi Python script để tính similarity
                    List<Map<String, Object>> recommendations = 
                            callPythonRecommendationScript(seedProductId, topNPerSeed);
                    
                    // Map kết quả
                    for (Map<String, Object> rec : recommendations) {
                        Integer recommendedProductId = ((Number) rec.get("product_id")).intValue();
                        
                        // Bỏ qua seed product
                        if (recommendedProductId.equals(seedProductId)) {
                            continue;
                        }
                        
                        // Lấy thông tin sản phẩm từ database
                        Product recommendedProduct = productRepository.findById(recommendedProductId)
                                .orElse(null);
                        
                        if (recommendedProduct != null && 
                            recommendedProduct.getStatus() == ProductStatus.IN_STOCK) {
                            
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
                            allRecommendations.add(dto);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Error getting recommendations for seed product ID: {}", seedProductId, e);
                    // Tiếp tục với seed product tiếp theo
                }
            }
            
            // Bước 5: Loại bỏ duplicate, sắp xếp theo similarity, lấy top N
            List<ProductRecommendationDTO> result = allRecommendations.stream()
                    .collect(Collectors.toMap(
                            ProductRecommendationDTO::getProductId,
                            dto -> dto,
                            (dto1, dto2) -> dto1.getSimilarity() > dto2.getSimilarity() ? dto1 : dto2
                    ))
                    .values()
                    .stream()
                    .sorted((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()))
                    .limit(limit != null ? limit : 10)
                    .collect(Collectors.toList());
            
            log.info("Found {} recommendations for homepage (customerId: {})", 
                    result.size(), customerId);
            return result;
            
        } catch (Exception e) {
            log.error("Error getting home page recommendations", e);
            // Fallback: trả về sản phẩm mới nhất
            return getFallbackHomeRecommendations(limit);
        }
    }
    
    /**
     * Fallback: Lấy sản phẩm mới nhất nếu Content-based Filtering thất bại
     */
    private List<ProductRecommendationDTO> getFallbackHomeRecommendations(Integer limit) {
        log.info("Using fallback recommendations for homepage");
        
        List<Product> products = productRepository.findNewProductsByStatus(
                org.springframework.data.domain.PageRequest.of(0, limit != null ? limit : 10))
                .getContent();
        
        return products.stream()
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

