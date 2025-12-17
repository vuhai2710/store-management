package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.product.ProductOnSaleDTO;
import com.storemanagement.dto.promotion.*;
import com.storemanagement.mapper.PromotionMapper;
import com.storemanagement.mapper.PromotionRuleMapper;
import com.storemanagement.model.*;
import com.storemanagement.repository.*;
import com.storemanagement.service.PromotionService;
import com.storemanagement.utils.PageUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionUsageRepository promotionUsageRepository;
    private final PromotionRuleRepository promotionRuleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PromotionMapper promotionMapper;
    private final PromotionRuleMapper promotionRuleMapper;

    @Override
    @Transactional(readOnly = true)
    public ValidatePromotionResponseDTO validatePromotion(ValidatePromotionRequestDTO request) {
        log.info("Validating promotion code: {}, expectedScope: {}", request.getCode(), request.getExpectedScope());

        Promotion promotion = promotionRepository.findByCodeAndIsActiveTrue(request.getCode())
                .orElse(null);

        if (promotion == null) {
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message("Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa")
                    .build();
        }

        // Validate scope if expectedScope is provided
        if (request.getExpectedScope() != null && promotion.getScope() != request.getExpectedScope()) {
            String scopeMessage = promotion.getScope() == Promotion.PromotionScope.SHIPPING
                    ? "Mã này chỉ áp dụng cho phí vận chuyển"
                    : "Mã này chỉ áp dụng cho đơn hàng";
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message(scopeMessage)
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(promotion.getStartDate()) || now.isAfter(promotion.getEndDate())) {
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message("Mã giảm giá không trong thời gian hiệu lực")
                    .build();
        }

        if (promotion.getUsageLimit() != null && promotion.getUsageCount() >= promotion.getUsageLimit()) {
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message("Mã giảm giá đã hết lượt sử dụng")
                    .build();
        }

        if (request.getTotalAmount().compareTo(promotion.getMinOrderAmount()) < 0) {
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message("Đơn hàng phải có giá trị tối thiểu " + promotion.getMinOrderAmount() + " VNĐ")
                    .build();
        }

        BigDecimal discount = calculateDiscountFromPromotion(promotion, request.getTotalAmount());

        // For SHIPPING scope, cap discount at shippingFee if provided
        if (promotion.getScope() == Promotion.PromotionScope.SHIPPING && request.getShippingFee() != null) {
            discount = discount.min(request.getShippingFee());
        }

        return ValidatePromotionResponseDTO.builder()
                .valid(true)
                .message("Mã giảm giá hợp lệ")
                .discount(discount)
                .discountType(promotion.getDiscountType())
                .code(promotion.getCode())
                .scope(promotion.getScope())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CalculateDiscountResponseDTO calculateAutomaticDiscount(CalculateDiscountRequestDTO request,
            String customerType) {
        log.info("Calculating automatic discount for total amount: {}, customer type: {}", request.getTotalAmount(),
                customerType);

        LocalDateTime now = LocalDateTime.now();

        List<PromotionRule> rules = promotionRuleRepository.findApplicableRules(
                now,
                request.getTotalAmount(),
                customerType != null ? customerType : "REGULAR");

        if (rules.isEmpty()) {
            return CalculateDiscountResponseDTO.builder()
                    .applicable(false)
                    .discount(BigDecimal.ZERO)
                    .build();
        }

        PromotionRule rule = rules.get(0);

        BigDecimal discount = calculateDiscountFromRule(rule, request.getTotalAmount());

        return CalculateDiscountResponseDTO.builder()
                .applicable(true)
                .discount(discount)
                .discountType(rule.getDiscountType())
                .ruleName(rule.getRuleName())
                .ruleId(rule.getIdRule())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateDiscountForOrder(BigDecimal totalAmount, String promotionCode, String customerType) {
        log.info("Calculating discount for order: totalAmount={}, promotionCode={}, customerType={}",
                totalAmount, promotionCode, customerType);

        if (promotionCode != null && !promotionCode.trim().isEmpty()) {
            // Only accept ORDER scope promotions for order discount
            ValidatePromotionRequestDTO validateRequest = ValidatePromotionRequestDTO.builder()
                    .code(promotionCode.trim())
                    .totalAmount(totalAmount)
                    .expectedScope(Promotion.PromotionScope.ORDER) // Only ORDER scope
                    .build();

            ValidatePromotionResponseDTO validateResponse = validatePromotion(validateRequest);

            if (validateResponse.getValid()) {
                log.info("Applying promotion code: {}, discount: {}", promotionCode, validateResponse.getDiscount());
                return validateResponse.getDiscount();
            } else {
                log.info("Promotion code rejected for order: {}, reason: {}", promotionCode,
                        validateResponse.getMessage());
            }
        }

        CalculateDiscountRequestDTO calculateRequest = CalculateDiscountRequestDTO.builder()
                .totalAmount(totalAmount)
                .customerType(customerType)
                .build();

        CalculateDiscountResponseDTO calculateResponse = calculateAutomaticDiscount(calculateRequest, customerType);

        if (calculateResponse.getApplicable()) {
            log.info("Applying automatic discount: {}, discount: {}", calculateResponse.getRuleName(),
                    calculateResponse.getDiscount());
            return calculateResponse.getDiscount();
        }

        return BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateShippingDiscount(BigDecimal shippingFee, String shippingPromotionCode) {
        log.info("Calculating shipping discount: shippingFee={}, shippingPromotionCode={}",
                shippingFee, shippingPromotionCode);

        if (shippingPromotionCode == null || shippingPromotionCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        if (shippingFee == null || shippingFee.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        ValidatePromotionRequestDTO validateRequest = ValidatePromotionRequestDTO.builder()
                .code(shippingPromotionCode.trim())
                .totalAmount(shippingFee) // Use shippingFee as totalAmount for min order check
                .shippingFee(shippingFee) // Cap discount at this
                .expectedScope(Promotion.PromotionScope.SHIPPING)
                .build();

        ValidatePromotionResponseDTO validateResponse = validatePromotion(validateRequest);

        if (validateResponse.getValid()) {
            // Discount is already capped at shippingFee in validatePromotion
            log.info("Applying shipping promotion code: {}, discount: {}",
                    shippingPromotionCode, validateResponse.getDiscount());
            return validateResponse.getDiscount();
        }

        log.info("Shipping promotion code not valid: {}", validateResponse.getMessage());
        return BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public CalculateDiscountResponseDTO calculateAutoShippingDiscount(BigDecimal shippingFee, BigDecimal orderTotal,
            String customerType) {
        log.info("Calculating automatic shipping discount: shippingFee={}, orderTotal={}, customerType={}",
                shippingFee, orderTotal, customerType);

        // If no shipping fee, no discount
        if (shippingFee == null || shippingFee.compareTo(BigDecimal.ZERO) <= 0) {
            return CalculateDiscountResponseDTO.builder()
                    .applicable(false)
                    .discount(BigDecimal.ZERO)
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();

        // Find applicable SHIPPING scope rules
        List<PromotionRule> shippingRules = promotionRuleRepository.findApplicableShippingRules(
                now,
                orderTotal != null ? orderTotal : BigDecimal.ZERO,
                customerType != null ? customerType : "REGULAR");

        if (shippingRules.isEmpty()) {
            log.info("No applicable auto shipping discount rules found");
            return CalculateDiscountResponseDTO.builder()
                    .applicable(false)
                    .discount(BigDecimal.ZERO)
                    .build();
        }

        // Get the first rule (highest priority)
        PromotionRule rule = shippingRules.get(0);

        // Calculate discount (applied to shippingFee, not orderTotal)
        BigDecimal discount = calculateDiscountFromRule(rule, shippingFee);

        // Cap discount at shippingFee (cannot reduce below 0)
        discount = discount.min(shippingFee);

        log.info("Auto shipping discount applied: rule={}, discount={}", rule.getRuleName(), discount);

        return CalculateDiscountResponseDTO.builder()
                .applicable(true)
                .discount(discount)
                .discountType(rule.getDiscountType())
                .ruleName(rule.getRuleName())
                .ruleId(rule.getIdRule())
                .build();
    }

    private BigDecimal calculateDiscountFromPromotion(Promotion promotion, BigDecimal totalAmount) {
        if (promotion.getDiscountType() == Promotion.DiscountType.PERCENTAGE) {
            // Percentage discount
            BigDecimal discount = totalAmount.multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // Discount cannot exceed total amount
            return discount.min(totalAmount);
        } else {
            // Fixed amount discount
            // Discount cannot exceed total amount
            return promotion.getDiscountValue().min(totalAmount);
        }
    }

    private BigDecimal calculateDiscountFromRule(PromotionRule rule, BigDecimal totalAmount) {
        if (rule.getDiscountType() == PromotionRule.DiscountType.PERCENTAGE) {
            BigDecimal discount = totalAmount.multiply(rule.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return discount.min(totalAmount);
        } else {
            return rule.getDiscountValue().min(totalAmount);
        }
    }

    @Override
    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        log.info("Creating promotion: {}", promotionDTO.getCode());

        if (promotionRepository.findByCode(promotionDTO.getCode()).isPresent()) {
            throw new RuntimeException("Mã giảm giá đã tồn tại");
        }

        Promotion promotion = promotionMapper.toEntity(promotionDTO);
        promotion = promotionRepository.save(promotion);

        log.info("Promotion created successfully with ID: {}", promotion.getIdPromotion());
        return promotionMapper.toDTO(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionDTO> getAllPromotions(String keyword, Pageable pageable) {
        log.info("Getting all promotions with keyword: {}", keyword);

        Page<Promotion> promotions;

        if (keyword != null && !keyword.trim().isEmpty()) {
            promotions = promotionRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            promotions = promotionRepository.findAll(pageable);
        }

        return PageUtils.toPageResponse(promotions.map(promotionMapper::toDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionDTO> getAllPromotions(String keyword, Promotion.PromotionScope scope,
            Pageable pageable) {
        log.info("Getting all promotions with keyword: {}, scope: {}", keyword, scope);

        Page<Promotion> promotions = promotionRepository.searchByKeywordAndScope(
                keyword != null ? keyword.trim() : null,
                scope,
                pageable);

        return PageUtils.toPageResponse(promotions.map(promotionMapper::toDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionDTO getPromotionById(Integer id) {
        log.info("Getting promotion by ID: {}", id);

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mã giảm giá"));

        return promotionMapper.toDTO(promotion);
    }

    @Override
    public PromotionDTO updatePromotion(Integer id, PromotionDTO promotionDTO) {
        log.info("Updating promotion ID: {}", id);

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mã giảm giá"));

        promotion.setCode(promotionDTO.getCode());
        promotion.setDiscountType(promotionDTO.getDiscountType());
        promotion.setDiscountValue(promotionDTO.getDiscountValue());
        promotion.setMinOrderAmount(promotionDTO.getMinOrderAmount());
        promotion.setUsageLimit(promotionDTO.getUsageLimit());
        promotion.setStartDate(promotionDTO.getStartDate());
        promotion.setEndDate(promotionDTO.getEndDate());
        promotion.setIsActive(promotionDTO.getIsActive());
        if (promotionDTO.getScope() != null) {
            promotion.setScope(promotionDTO.getScope());
        }

        promotion = promotionRepository.save(promotion);

        log.info("Promotion updated successfully with ID: {}", promotion.getIdPromotion());
        return promotionMapper.toDTO(promotion);
    }

    @Override
    public void deletePromotion(Integer id) {
        log.info("Deleting promotion ID: {}", id);

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mã giảm giá"));

        promotionRepository.delete(promotion);
        log.info("Promotion deleted successfully with ID: {}", id);
    }

    @Override
    public PromotionRuleDTO createPromotionRule(PromotionRuleDTO ruleDTO) {
        log.info("Creating promotion rule: {}", ruleDTO.getRuleName());

        PromotionRule rule = promotionRuleMapper.toEntity(ruleDTO);
        rule = promotionRuleRepository.save(rule);

        log.info("Promotion rule created successfully with ID: {}", rule.getIdRule());
        return promotionRuleMapper.toDTO(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionRuleDTO> getAllPromotionRules(Pageable pageable) {
        log.info("Getting all promotion rules");

        Page<PromotionRule> rules = promotionRuleRepository.findAll(pageable);
        return PageUtils.toPageResponse(rules.map(promotionRuleMapper::toDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionRuleDTO getPromotionRuleById(Integer id) {
        log.info("Getting promotion rule by ID: {}", id);

        PromotionRule rule = promotionRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quy tắc giảm giá"));

        return promotionRuleMapper.toDTO(rule);
    }

    @Override
    public PromotionRuleDTO updatePromotionRule(Integer id, PromotionRuleDTO ruleDTO) {
        log.info("Updating promotion rule ID: {}", id);

        PromotionRule rule = promotionRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quy tắc giảm giá"));

        rule.setRuleName(ruleDTO.getRuleName());
        rule.setDiscountType(ruleDTO.getDiscountType());
        rule.setDiscountValue(ruleDTO.getDiscountValue());
        rule.setMinOrderAmount(ruleDTO.getMinOrderAmount());
        rule.setCustomerType(ruleDTO.getCustomerType());
        rule.setStartDate(ruleDTO.getStartDate());
        rule.setEndDate(ruleDTO.getEndDate());
        rule.setIsActive(ruleDTO.getIsActive());
        rule.setPriority(ruleDTO.getPriority());
        if (ruleDTO.getScope() != null) {
            rule.setScope(ruleDTO.getScope());
        }

        rule = promotionRuleRepository.save(rule);

        log.info("Promotion rule updated successfully with ID: {}", rule.getIdRule());
        return promotionRuleMapper.toDTO(rule);
    }

    @Override
    public void deletePromotionRule(Integer id) {
        log.info("Deleting promotion rule ID: {}", id);

        PromotionRule rule = promotionRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quy tắc giảm giá"));

        promotionRuleRepository.delete(rule);
        log.info("Promotion rule deleted successfully with ID: {}", id);
    }

    @Override
    public void recordPromotionUsage(Integer promotionId, Integer orderId, Integer customerId) {
        log.info("recordPromotionUsage called (no-op): promotionId={}, orderId={}, customerId={}",
                promotionId, orderId, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductOnSaleDTO> getProductsOnSale() {
        log.info("Fetching products on sale based on automatic promotion rules");
        LocalDateTime now = LocalDateTime.now();

        // Find all active promotion rules (automatic discounts)
        List<PromotionRule> activeRules = promotionRuleRepository.findByIsActiveTrue().stream()
                .filter(rule -> rule.getStartDate() != null && rule.getEndDate() != null)
                .filter(rule -> !now.isBefore(rule.getStartDate()) && !now.isAfter(rule.getEndDate()))
                .filter(rule -> rule.getScope() == PromotionRule.PromotionScope.ORDER) // Only ORDER scope for product
                                                                                       // discounts
                .toList();

        log.info("Found {} active promotion rules", activeRules.size());

        if (activeRules.isEmpty()) {
            return new java.util.ArrayList<>();
        }

        // Get the best rule (highest priority or highest discount)
        PromotionRule bestRule = activeRules.stream()
                .max((a, b) -> {
                    // First compare by priority
                    int priorityCompare = Integer.compare(
                            a.getPriority() != null ? a.getPriority() : 0,
                            b.getPriority() != null ? b.getPriority() : 0);
                    if (priorityCompare != 0)
                        return priorityCompare;
                    // Then by discount value
                    return a.getDiscountValue().compareTo(b.getDiscountValue());
                })
                .orElse(null);

        if (bestRule == null) {
            return new java.util.ArrayList<>();
        }

        log.info("Using promotion rule: {} with {}% discount, minOrderAmount: {}",
                bestRule.getRuleName(), bestRule.getDiscountValue(), bestRule.getMinOrderAmount());

        // Find products where price >= minOrderAmount of the rule, and stock > 0
        BigDecimal minPrice = bestRule.getMinOrderAmount() != null ? bestRule.getMinOrderAmount() : BigDecimal.ZERO;

        List<Product> eligibleProducts = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0)
                .filter(p -> p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0)
                .limit(20) // Limit to 20 products for performance
                .toList();

        log.info("Found {} products eligible for automatic discount", eligibleProducts.size());

        // Build list of products on sale
        java.util.List<ProductOnSaleDTO> productsOnSale = new java.util.ArrayList<>();

        for (Product product : eligibleProducts) {
            BigDecimal originalPrice = product.getPrice();

            // Use the same discount calculation as checkout (calculateDiscountFromRule)
            BigDecimal discountAmount = calculateDiscountFromRule(bestRule, originalPrice);
            BigDecimal discountedPrice = originalPrice.subtract(discountAmount);

            // Ensure discounted price is not negative
            if (discountedPrice.compareTo(BigDecimal.ZERO) < 0) {
                discountedPrice = BigDecimal.ZERO;
            }

            // Build discount label
            String discountLabel;
            Integer discountPercentage = null;
            if (bestRule.getDiscountType() == PromotionRule.DiscountType.PERCENTAGE) {
                discountLabel = "-" + bestRule.getDiscountValue().stripTrailingZeros().toPlainString() + "%";
                discountPercentage = bestRule.getDiscountValue().intValue();
            } else {
                discountLabel = "-" + formatCurrency(bestRule.getDiscountValue());
            }

            // Get product image URL
            String imageUrl = product.getImageUrl();
            if ((imageUrl == null || imageUrl.isEmpty()) && product.getImages() != null
                    && !product.getImages().isEmpty()) {
                imageUrl = product.getImages().stream()
                        .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
                        .findFirst()
                        .map(ProductImage::getImageUrl)
                        .orElseGet(() -> product.getImages().get(0).getImageUrl());
            }

            ProductOnSaleDTO dto = ProductOnSaleDTO.builder()
                    .productId(product.getIdProduct())
                    .name(product.getProductName())
                    .image(imageUrl)
                    .originalPrice(originalPrice)
                    .discountedPrice(discountedPrice)
                    .promotionEndTime(bestRule.getEndDate())
                    .discountLabel(discountLabel)
                    .promotionName(bestRule.getRuleName())
                    .remainingStock(product.getStockQuantity())
                    .discountPercentage(discountPercentage)
                    .build();

            productsOnSale.add(dto);
        }

        // Sort by discount percentage (highest first), then by price
        productsOnSale.sort((a, b) -> {
            if (a.getDiscountPercentage() != null && b.getDiscountPercentage() != null) {
                int discountCompare = b.getDiscountPercentage().compareTo(a.getDiscountPercentage());
                if (discountCompare != 0)
                    return discountCompare;
            }
            return b.getOriginalPrice().compareTo(a.getOriginalPrice());
        });

        log.info("Returning {} products on sale", productsOnSale.size());
        return productsOnSale;
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null)
            return "0đ";
        java.text.NumberFormat formatter = java.text.NumberFormat.getInstance(new java.util.Locale("vi", "VN"));
        return formatter.format(amount.longValue()) + "đ";
    }
}
