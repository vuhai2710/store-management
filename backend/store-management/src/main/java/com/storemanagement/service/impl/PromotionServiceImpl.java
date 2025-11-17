package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
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
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PromotionMapper promotionMapper;
    private final PromotionRuleMapper promotionRuleMapper;

    @Override
    @Transactional(readOnly = true)
    public ValidatePromotionResponseDTO validatePromotion(ValidatePromotionRequestDTO request) {
        log.info("Validating promotion code: {}", request.getCode());

        // Find promotion by code
        Promotion promotion = promotionRepository.findByCodeAndIsActiveTrue(request.getCode())
                .orElse(null);

        if (promotion == null) {
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message("Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa")
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();

        // Check if promotion is within valid date range
        if (now.isBefore(promotion.getStartDate()) || now.isAfter(promotion.getEndDate())) {
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message("Mã giảm giá không trong thời gian hiệu lực")
                    .build();
        }

        // Check usage limit
        if (promotion.getUsageLimit() != null && promotion.getUsageCount() >= promotion.getUsageLimit()) {
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message("Mã giảm giá đã hết lượt sử dụng")
                    .build();
        }

        // Check min order amount
        if (request.getTotalAmount().compareTo(promotion.getMinOrderAmount()) < 0) {
            return ValidatePromotionResponseDTO.builder()
                    .valid(false)
                    .message("Đơn hàng phải có giá trị tối thiểu " + promotion.getMinOrderAmount() + " VNĐ")
                    .build();
        }

        // Calculate discount
        BigDecimal discount = calculateDiscountFromPromotion(promotion, request.getTotalAmount());

        return ValidatePromotionResponseDTO.builder()
                .valid(true)
                .message("Mã giảm giá hợp lệ")
                .discount(discount)
                .discountType(promotion.getDiscountType())
                .code(promotion.getCode())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CalculateDiscountResponseDTO calculateAutomaticDiscount(CalculateDiscountRequestDTO request, String customerType) {
        log.info("Calculating automatic discount for total amount: {}, customer type: {}", request.getTotalAmount(), customerType);

        LocalDateTime now = LocalDateTime.now();

        // Get applicable rules
        List<PromotionRule> rules = promotionRuleRepository.findApplicableRules(
                now,
                request.getTotalAmount(),
                customerType != null ? customerType : "REGULAR"
        );

        if (rules.isEmpty()) {
            return CalculateDiscountResponseDTO.builder()
                    .applicable(false)
                    .discount(BigDecimal.ZERO)
                    .build();
        }

        // Get first rule (highest priority)
        PromotionRule rule = rules.get(0);

        // Calculate discount
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

        // If promotion code provided, validate and apply coupon
        if (promotionCode != null && !promotionCode.trim().isEmpty()) {
            ValidatePromotionRequestDTO validateRequest = ValidatePromotionRequestDTO.builder()
                    .code(promotionCode.trim())
                    .totalAmount(totalAmount)
                    .build();

            ValidatePromotionResponseDTO validateResponse = validatePromotion(validateRequest);

            if (validateResponse.getValid()) {
                log.info("Applying promotion code: {}, discount: {}", promotionCode, validateResponse.getDiscount());
                return validateResponse.getDiscount();
            }
        }

        // If no coupon code or coupon invalid, calculate automatic discount
        CalculateDiscountRequestDTO calculateRequest = CalculateDiscountRequestDTO.builder()
                .totalAmount(totalAmount)
                .customerType(customerType)
                .build();

        CalculateDiscountResponseDTO calculateResponse = calculateAutomaticDiscount(calculateRequest, customerType);

        if (calculateResponse.getApplicable()) {
            log.info("Applying automatic discount: {}, discount: {}", calculateResponse.getRuleName(), calculateResponse.getDiscount());
            return calculateResponse.getDiscount();
        }

        // No discount applicable
        return BigDecimal.ZERO;
    }

    /**
     * Calculate discount amount from promotion
     */
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

    /**
     * Calculate discount amount from promotion rule
     */
    private BigDecimal calculateDiscountFromRule(PromotionRule rule, BigDecimal totalAmount) {
        if (rule.getDiscountType() == PromotionRule.DiscountType.PERCENTAGE) {
            // Percentage discount
            BigDecimal discount = totalAmount.multiply(rule.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // Discount cannot exceed total amount
            return discount.min(totalAmount);
        } else {
            // Fixed amount discount
            // Discount cannot exceed total amount
            return rule.getDiscountValue().min(totalAmount);
        }
    }

    @Override
    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        log.info("Creating promotion: {}", promotionDTO.getCode());

        // Check if code already exists
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
    public PageResponse<PromotionDTO> getAllPromotions(Pageable pageable) {
        log.info("Getting all promotions");

        Page<Promotion> promotions = promotionRepository.findAll(pageable);
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

        // Update fields
        promotion.setCode(promotionDTO.getCode());
        promotion.setDiscountType(promotionDTO.getDiscountType());
        promotion.setDiscountValue(promotionDTO.getDiscountValue());
        promotion.setMinOrderAmount(promotionDTO.getMinOrderAmount());
        promotion.setUsageLimit(promotionDTO.getUsageLimit());
        promotion.setStartDate(promotionDTO.getStartDate());
        promotion.setEndDate(promotionDTO.getEndDate());
        promotion.setIsActive(promotionDTO.getIsActive());

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

        // Update fields
        rule.setRuleName(ruleDTO.getRuleName());
        rule.setDiscountType(ruleDTO.getDiscountType());
        rule.setDiscountValue(ruleDTO.getDiscountValue());
        rule.setMinOrderAmount(ruleDTO.getMinOrderAmount());
        rule.setCustomerType(ruleDTO.getCustomerType());
        rule.setStartDate(ruleDTO.getStartDate());
        rule.setEndDate(ruleDTO.getEndDate());
        rule.setIsActive(ruleDTO.getIsActive());
        rule.setPriority(ruleDTO.getPriority());

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
        log.info("Recording promotion usage: promotionId={}, orderId={}, customerId={}",
                promotionId, orderId, customerId);

        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mã giảm giá"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        // Create promotion usage record
        PromotionUsage usage = PromotionUsage.builder()
                .promotion(promotion)
                .order(order)
                .customer(customer)
                .build();

        promotionUsageRepository.save(usage);

        // Update promotion usage count
        promotion.setUsageCount(promotion.getUsageCount() + 1);
        promotionRepository.save(promotion);

        log.info("Promotion usage recorded successfully");
    }
}

