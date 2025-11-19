package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.promotion.CalculateDiscountRequestDTO;
import com.storemanagement.dto.promotion.CalculateDiscountResponseDTO;
import com.storemanagement.dto.promotion.ValidatePromotionRequestDTO;
import com.storemanagement.dto.promotion.ValidatePromotionResponseDTO;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;
    private final CustomerService customerService;

    /**
     * Customer: Validate coupon code
     *
     * Endpoint: POST /api/v1/promotions/validate
     * Authentication: Required (CUSTOMER role)
     */
    @PostMapping("/validate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ValidatePromotionResponseDTO>> validatePromotion(
            @RequestBody @Valid ValidatePromotionRequestDTO request) {
        ValidatePromotionResponseDTO response = promotionService.validatePromotion(request);
        return ResponseEntity.ok(ApiResponse.success("Validate promotion code", response));
    }

    /**
     * Customer: Calculate automatic discount
     *
     * Endpoint: POST /api/v1/promotions/calculate
     * Authentication: Required (CUSTOMER role)
     */
    @PostMapping("/calculate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CalculateDiscountResponseDTO>> calculateDiscount(
            @RequestBody @Valid CalculateDiscountRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        String customerType = customerService.getCustomerByUsername(username)
                .getCustomerType() != null ? customerService.getCustomerByUsername(username).getCustomerType().name() : "REGULAR";

        CalculateDiscountResponseDTO response = promotionService.calculateAutomaticDiscount(request, customerType);
        return ResponseEntity.ok(ApiResponse.success("Calculate automatic discount", response));
    }
}

