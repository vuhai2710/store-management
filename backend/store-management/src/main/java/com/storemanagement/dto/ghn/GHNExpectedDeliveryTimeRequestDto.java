package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để lấy thời gian giao hàng dự kiến
 * 
 * Endpoint: POST /shiip/public-api/v2/shipping-order/leadtime
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNExpectedDeliveryTimeRequestDto {
    
    /**
     * ID quận/huyện nơi gửi hàng
     */
    @JsonProperty("from_district_id")
    private Integer fromDistrictId;
    
    /**
     * ID quận/huyện nơi nhận hàng
     */
    @JsonProperty("to_district_id")
    private Integer toDistrictId;
    
    /**
     * Mã phường/xã nơi nhận hàng
     */
    @JsonProperty("to_ward_code")
    private String toWardCode;
    
    /**
     * ID dịch vụ vận chuyển
     */
    @JsonProperty("service_id")
    private Integer serviceId;
}
















