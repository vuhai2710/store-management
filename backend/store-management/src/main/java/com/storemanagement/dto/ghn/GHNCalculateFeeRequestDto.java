package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để tính phí vận chuyển từ GHN API
 * 
 * Endpoint: POST /shiip/public-api/v2/shipping-order/fee
 * 
 * Logic:
 * - Tính phí vận chuyển dựa trên địa chỉ gửi và nhận
 * - Cần có shop_id, from_district_id, to_district_id, to_ward_code
 * - Có thể chỉ định service_id (dịch vụ vận chuyển) hoặc để GHN tự chọn
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNCalculateFeeRequestDto {
    
    /**
     * ID quận/huyện nơi gửi hàng (từ shop của bạn)
     * Lấy từ GHN API: GET /shiip/public-api/master-data/district
     */
    @JsonProperty("from_district_id")
    private Integer fromDistrictId;
    
    /**
     * ID quận/huyện nơi nhận hàng
     * Lấy từ GHN API: GET /shiip/public-api/master-data/district
     */
    @JsonProperty("to_district_id")
    private Integer toDistrictId;
    
    /**
     * Mã phường/xã nơi nhận hàng
     * Lấy từ GHN API: GET /shiip/public-api/master-data/ward
     * Format: WardCode (string)
     */
    @JsonProperty("to_ward_code")
    private String toWardCode;
    
    /**
     * Trọng lượng đơn hàng (gram)
     * Mặc định: 1000 (1kg)
     */
    @JsonProperty("weight")
    @Builder.Default
    private Integer weight = 1000;
    
    /**
     * Chiều dài (cm)
     * Mặc định: 20
     */
    @JsonProperty("length")
    @Builder.Default
    private Integer length = 20;
    
    /**
     * Chiều rộng (cm)
     * Mặc định: 20
     */
    @JsonProperty("width")
    @Builder.Default
    private Integer width = 20;
    
    /**
     * Chiều cao (cm)
     * Mặc định: 20
     */
    @JsonProperty("height")
    @Builder.Default
    private Integer height = 20;
    
    /**
     * ID dịch vụ vận chuyển (optional)
     * Nếu không chỉ định, GHN sẽ tự chọn dịch vụ phù hợp
     * Lấy từ GHN API: GET /shiip/public-api/v2/shipping-order/available-services
     */
    @JsonProperty("service_id")
    private Integer serviceId;
    
    /**
     * Giá trị đơn hàng (VND)
     * Sử dụng để tính bảo hiểm (nếu có)
     */
    @JsonProperty("insurance_value")
    private Integer insuranceValue;
    
    /**
     * Phí thu hộ (COD) - nếu có
     * Giá trị tiền thu hộ từ khách hàng (VND)
     */
    @JsonProperty("cod_amount")
    private Integer codAmount;
}

