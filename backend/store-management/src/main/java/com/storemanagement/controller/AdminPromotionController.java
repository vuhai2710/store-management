package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.promotion.PromotionDTO;
import com.storemanagement.dto.promotion.PromotionRuleDTO;
import com.storemanagement.model.Promotion;
import com.storemanagement.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionService promotionService;

    @PostMapping("/promotions")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PromotionDTO>> createPromotion(
            @RequestBody @Valid PromotionDTO promotionDTO) {
        PromotionDTO promotion = promotionService.createPromotion(promotionDTO);
        return ResponseEntity.ok(ApiResponse.success("Tạo mã giảm giá thành công", promotion));
    }

    @GetMapping("/promotions")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<PromotionDTO>>> getAllPromotions(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Promotion.PromotionScope scope) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<PromotionDTO> promotions = promotionService.getAllPromotions(keyword, scope, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách mã giảm giá thành công", promotions));
    }

    @GetMapping("/promotions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PromotionDTO>> getPromotionById(@PathVariable Integer id) {
        PromotionDTO promotion = promotionService.getPromotionById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin mã giảm giá thành công", promotion));
    }

    @PutMapping("/promotions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PromotionDTO>> updatePromotion(
            @PathVariable Integer id,
            @RequestBody @Valid PromotionDTO promotionDTO) {
        PromotionDTO promotion = promotionService.updatePromotion(id, promotionDTO);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mã giảm giá thành công", promotion));
    }

    @DeleteMapping("/promotions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Integer id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mã giảm giá thành công", null));
    }

    @PostMapping("/promotion-rules")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PromotionRuleDTO>> createPromotionRule(
            @RequestBody @Valid PromotionRuleDTO ruleDTO) {
        PromotionRuleDTO rule = promotionService.createPromotionRule(ruleDTO);
        return ResponseEntity.ok(ApiResponse.success("Tạo quy tắc giảm giá thành công", rule));
    }

    @GetMapping("/promotion-rules")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<PromotionRuleDTO>>> getAllPromotionRules(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<PromotionRuleDTO> rules = promotionService.getAllPromotionRules(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách quy tắc giảm giá thành công", rules));
    }

    @GetMapping("/promotion-rules/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PromotionRuleDTO>> getPromotionRuleById(@PathVariable Integer id) {
        PromotionRuleDTO rule = promotionService.getPromotionRuleById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin quy tắc giảm giá thành công", rule));
    }

    @PutMapping("/promotion-rules/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PromotionRuleDTO>> updatePromotionRule(
            @PathVariable Integer id,
            @RequestBody @Valid PromotionRuleDTO ruleDTO) {
        PromotionRuleDTO rule = promotionService.updatePromotionRule(id, ruleDTO);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quy tắc giảm giá thành công", rule));
    }

    @DeleteMapping("/promotion-rules/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> deletePromotionRule(@PathVariable Integer id) {
        promotionService.deletePromotionRule(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa quy tắc giảm giá thành công", null));
    }
}
