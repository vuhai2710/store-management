package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho dịch vụ vận chuyển từ GHN API
 * 
 * Endpoint: GET /shiip/public-api/v2/shipping-order/available-services
 * 
 * Mỗi dịch vụ có:
 * - service_id: ID dịch vụ (dùng để tạo đơn hàng)
 * - short_name: Tên ngắn
 * - service_type_id: Loại dịch vụ
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNServiceDto {
    
    /**
     * ID dịch vụ
     * Sử dụng trong GHNCreateOrderRequestDto.serviceId
     */
    @JsonProperty("service_id")
    private Integer serviceId;
    
    /**
     * Tên ngắn dịch vụ
     * Ví dụ: "Chuyển phát nhanh", "Chuyển phát tiết kiệm"
     */
    @JsonProperty("short_name")
    private String shortName;
    
    /**
     * Loại dịch vụ
     */
    @JsonProperty("service_type_id")
    private Integer serviceTypeId;
}




