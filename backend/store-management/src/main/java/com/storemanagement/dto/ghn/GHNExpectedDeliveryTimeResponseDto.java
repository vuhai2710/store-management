package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO chứa thời gian giao hàng dự kiến
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNExpectedDeliveryTimeResponseDto {
    
    /**
     * Thời gian giao hàng dự kiến
     * Format: ISO 8601 datetime string
     */
    @JsonProperty("leadtime")
    private String leadtime;
    
    /**
     * Số ngày dự kiến
     */
    @JsonProperty("order_date")
    private String orderDate;
}














