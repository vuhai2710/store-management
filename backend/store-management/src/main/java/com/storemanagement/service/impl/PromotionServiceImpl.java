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
import java.util.ArrayList;

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
        if (promotionCode != null && !promotionCode.trim().isEmpty()) {
            ValidatePromotionRequestDTO validateRequest = ValidatePromotionRequestDTO.builder()
                    .code(promotionCode.trim())
                    .totalAmount(totalAmount)
                    .expectedScope(Promotion.PromotionScope.ORDER)
                    .build();

            ValidatePromotionResponseDTO validateResponse = validatePromotion(validateRequest);

            if (validateResponse.getValid()) {
                return validateResponse.getDiscount();
            }
        }

        CalculateDiscountRequestDTO calculateRequest = CalculateDiscountRequestDTO.builder()
                .totalAmount(totalAmount)
                .customerType(customerType)
                .build();

        CalculateDiscountResponseDTO calculateResponse = calculateAutomaticDiscount(calculateRequest, customerType);

        if (calculateResponse.getApplicable()) {
            return calculateResponse.getDiscount();
        }

        return BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateShippingDiscount(BigDecimal shippingFee, String shippingPromotionCode) {
        if (shippingPromotionCode == null || shippingPromotionCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        if (shippingFee == null || shippingFee.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        ValidatePromotionRequestDTO validateRequest = ValidatePromotionRequestDTO.builder()
                .code(shippingPromotionCode.trim())
                .totalAmount(shippingFee)
                .shippingFee(shippingFee)
                .expectedScope(Promotion.PromotionScope.SHIPPING)
                .build();

        ValidatePromotionResponseDTO validateResponse = validatePromotion(validateRequest);

        if (validateResponse.getValid()) {
            return validateResponse.getDiscount();
        }

        return BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public CalculateDiscountResponseDTO calculateAutoShippingDiscount(BigDecimal shippingFee, BigDecimal orderTotal,
            String customerType) {
        if (shippingFee == null || shippingFee.compareTo(BigDecimal.ZERO) <= 0) {
            return CalculateDiscountResponseDTO.builder()
                    .applicable(false)
                    .discount(BigDecimal.ZERO)
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();

        List<PromotionRule> shippingRules = promotionRuleRepository.findApplicableShippingRules(
                now,
                orderTotal != null ? orderTotal : BigDecimal.ZERO,
                customerType != null ? customerType : "REGULAR");

        if (shippingRules.isEmpty()) {
            return CalculateDiscountResponseDTO.builder()
                    .applicable(false)
                    .discount(BigDecimal.ZERO)
                    .build();
        }

        PromotionRule rule = shippingRules.get(0);
        BigDecimal discount = calculateDiscountFromRule(rule, shippingFee);
        discount = discount.min(shippingFee);

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
            BigDecimal discount = totalAmount.multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return discount.min(totalAmount);
        } else {
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
        if (promotionRepository.findByCode(promotionDTO.getCode()).isPresent()) {
            throw new RuntimeException("Mã giảm giá đã tồn tại");
        }

        Promotion promotion = promotionMapper.toEntity(promotionDTO);
        promotion = promotionRepository.save(promotion);
        return promotionMapper.toDTO(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionDTO> getAllPromotions(String keyword, Pageable pageable) {
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
        Page<Promotion> promotions = promotionRepository.searchByKeywordAndScope(
                keyword != null ? keyword.trim() : null,
                scope,
                pageable);
        return PageUtils.toPageResponse(promotions.map(promotionMapper::toDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionDTO getPromotionById(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mã giảm giá"));
        return promotionMapper.toDTO(promotion);
    }

    @Override
    public PromotionDTO updatePromotion(Integer id, PromotionDTO promotionDTO) {
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
        return promotionMapper.toDTO(promotion);
    }

    @Override
    public void deletePromotion(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mã giảm giá"));
        promotionRepository.delete(promotion);
    }

    @Override
    public PromotionRuleDTO createPromotionRule(PromotionRuleDTO ruleDTO) {
        PromotionRule rule = promotionRuleMapper.toEntity(ruleDTO);
        rule = promotionRuleRepository.save(rule);
        return promotionRuleMapper.toDTO(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionRuleDTO> getAllPromotionRules(Pageable pageable) {
        Page<PromotionRule> rules = promotionRuleRepository.findAll(pageable);
        return PageUtils.toPageResponse(rules.map(promotionRuleMapper::toDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionRuleDTO getPromotionRuleById(Integer id) {
        PromotionRule rule = promotionRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quy tắc giảm giá"));
        return promotionRuleMapper.toDTO(rule);
    }

    @Override
    public PromotionRuleDTO updatePromotionRule(Integer id, PromotionRuleDTO ruleDTO) {
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
        return promotionRuleMapper.toDTO(rule);
    }

    @Override
    public void deletePromotionRule(Integer id) {
        PromotionRule rule = promotionRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quy tắc giảm giá"));
        promotionRuleRepository.delete(rule);
    }

    @Override
    public void recordPromotionUsage(Integer promotionId, Integer orderId, Integer customerId) {
        // No-op
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductOnSaleDTO> getProductsOnSale() {
        LocalDateTime now = LocalDateTime.now();

        List<PromotionRule> activeRules = promotionRuleRepository.findByIsActiveTrue().stream()
                .filter(rule -> rule.getStartDate() != null && rule.getEndDate() != null)
                .filter(rule -> !now.isBefore(rule.getStartDate()) && !now.isAfter(rule.getEndDate()))
                .filter(rule -> rule.getScope() == PromotionRule.PromotionScope.ORDER)
                .toList();

        if (activeRules.isEmpty())
            return new ArrayList<>();

        PromotionRule bestRule = activeRules.stream()
                .max((a, b) -> {
                    int priorityCompare = Integer.compare(
                            a.getPriority() != null ? a.getPriority() : 0,
                            b.getPriority() != null ? b.getPriority() : 0);
                    if (priorityCompare != 0)
                        return priorityCompare;
                    return a.getDiscountValue().compareTo(b.getDiscountValue());
                }).orElse(null);

        if (bestRule == null)
            return new ArrayList<>();

        BigDecimal minPrice = bestRule.getMinOrderAmount() != null ? bestRule.getMinOrderAmount() : BigDecimal.ZERO;

        List<Product> eligibleProducts = productRepository.findAllByIsDeleteFalse().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0)
                .filter(p -> p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0)
                .limit(20)
                .toList();

        List<ProductOnSaleDTO> productsOnSale = new ArrayList<>();

        for (Product product : eligibleProducts) {
            BigDecimal originalPrice = product.getPrice();
            BigDecimal discountAmount = calculateDiscountFromRule(bestRule, originalPrice);
            BigDecimal discountedPrice = originalPrice.subtract(discountAmount).max(BigDecimal.ZERO);

            String discountLabel;
            Integer discountPercentage = null;
            if (bestRule.getDiscountType() == PromotionRule.DiscountType.PERCENTAGE) {
                discountLabel = "-" + bestRule.getDiscountValue().stripTrailingZeros().toPlainString() + "%";
                discountPercentage = bestRule.getDiscountValue().intValue();
            } else {
                discountLabel = "-" + formatCurrency(bestRule.getDiscountValue());
            }

            String imageUrl = product.getImageUrl();
            if ((imageUrl == null || imageUrl.isEmpty()) && product.getImages() != null
                    && !product.getImages().isEmpty()) {
                imageUrl = product.getImages().stream()
                        .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
                        .findFirst()
                        .map(ProductImage::getImageUrl)
                        .orElseGet(() -> product.getImages().get(0).getImageUrl());
            }

            productsOnSale.add(ProductOnSaleDTO.builder()
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
                    .build());
        }

        productsOnSale.sort((a, b) -> {
            if (a.getDiscountPercentage() != null && b.getDiscountPercentage() != null) {
                int discountCompare = b.getDiscountPercentage().compareTo(a.getDiscountPercentage());
                if (discountCompare != 0)
                    return discountCompare;
            }
            return b.getOriginalPrice().compareTo(a.getOriginalPrice());
        });

        return productsOnSale;
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null)
            return "0đ";
        java.text.NumberFormat formatter = java.text.NumberFormat.getInstance(new java.util.Locale("vi", "VN"));
        return formatter.format(amount.longValue()) + "đ";
    }
}
