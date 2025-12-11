package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping("/return-window")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReturnWindow() {
        int days = systemSettingService.getReturnWindowDays();
        Map<String, Object> data = Map.of("days", days);
        return ResponseEntity.ok(ApiResponse.success("Lấy cấu hình thành công", data));
    }

    @PutMapping("/return-window")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateReturnWindow(
            @RequestParam int days) {
        
        systemSettingService.updateReturnWindow(days);
        
        Map<String, Object> data = Map.of(
                "message", "Cập nhật thành công",
                "days", days
        );
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", data));
    }

    @GetMapping("/review-edit-window")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReviewEditWindow() {
        int hours = systemSettingService.getReviewEditWindowHours();
        Map<String, Object> data = Map.of("hours", hours);
        return ResponseEntity.ok(ApiResponse.success("Lấy cấu hình thành công", data));
    }

    @PutMapping("/review-edit-window")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateReviewEditWindow(
            @RequestParam int hours) {
        
        systemSettingService.updateReviewEditWindow(hours);
        
        Map<String, Object> data = Map.of(
                "message", "Cập nhật thành công",
                "hours", hours
        );
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", data));
    }
}
