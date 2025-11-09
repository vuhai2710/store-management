package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO từ GHN API khi tạo đơn hàng thành công
 * 
 * Endpoint: POST /shiip/public-api/v2/shipping-order/create
 * 
 * Chứa thông tin:
 * - order_code: Mã đơn hàng GHN (quan trọng, dùng để tracking)
 * - sort_code: Mã sắp xếp
 * - trans_type: Loại vận chuyển
 * - ward_encode: Mã phường/xã đã encode
 * - district_encode: Mã quận/huyện đã encode
 * - expected_delivery_time: Thời gian giao hàng dự kiến
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNCreateOrderResponseDto {
    
    /**
     * Mã đơn hàng GHN
     * Đây là mã quan trọng nhất, được lưu vào Shipment.ghnOrderCode
     * Sử dụng để tracking và hủy đơn hàng sau này
     */
    @JsonProperty("order_code")
    private String orderCode;
    
    /**
     * Mã sắp xếp
     */
    @JsonProperty("sort_code")
    private String sortCode;
    
    /**
     * Loại vận chuyển
     */
    @JsonProperty("trans_type")
    private String transType;
    
    /**
     * Mã phường/xã đã encode
     */
    @JsonProperty("ward_encode")
    private String wardEncode;
    
    /**
     * Mã quận/huyện đã encode
     */
    @JsonProperty("district_encode")
    private String districtEncode;
    
    /**
     * Thời gian giao hàng dự kiến
     * Format: ISO 8601 datetime string
     * Được parse và lưu vào Shipment.ghnExpectedDeliveryTime
     */
    @JsonProperty("expected_delivery_time")
    private String expectedDeliveryTime;
    
    /**
     * Mã đơn hàng của client (order ID từ hệ thống)
     */
    @JsonProperty("client_order_code")
    private String clientOrderCode;
}

