package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO chứa thông tin tracking đơn hàng từ GHN API
 * 
 * Endpoint: GET /shiip/public-api/v2/shipping-order/tracking
 * 
 * Chứa lịch sử cập nhật trạng thái đơn hàng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNTrackingDto {
    
    /**
     * Mã đơn hàng GHN
     */
    @JsonProperty("order_code")
    private String orderCode;
    
    /**
     * Trạng thái hiện tại
     */
    @JsonProperty("status")
    private String status;
    
    /**
     * Lịch sử cập nhật trạng thái
     * Mỗi item trong list là một sự kiện thay đổi trạng thái
     */
    @JsonProperty("tracking")
    private List<GHNTrackingEventDto> tracking;
}

/**
 * DTO cho một sự kiện tracking
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class GHNTrackingEventDto {
    
    /**
     * Thời gian cập nhật
     */
    @JsonProperty("time")
    private String time;
    
    /**
     * Trạng thái tại thời điểm này
     */
    @JsonProperty("status")
    private String status;
    
    /**
     * Mô tả
     */
    @JsonProperty("description")
    private String description;
    
    /**
     * Địa điểm
     */
    @JsonProperty("location")
    private String location;
}





