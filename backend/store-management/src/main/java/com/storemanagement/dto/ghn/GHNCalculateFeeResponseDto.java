package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO từ GHN API khi tính phí vận chuyển
 * 
 * Endpoint: POST /shiip/public-api/v2/shipping-order/fee
 * 
 * Chứa thông tin:
 * - total: Tổng phí vận chuyển (VND)
 * - service_fee: Phí dịch vụ
 * - insurance_fee: Phí bảo hiểm
 * - pick_station_fee: Phí lấy hàng tại bưu cục
 * - etc.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNCalculateFeeResponseDto {
    
    /**
     * Tổng phí vận chuyển (VND)
     * Đây là số tiền khách hàng phải trả cho vận chuyển
     */
    @JsonProperty("total")
    private BigDecimal total;
    
    /**
     * Phí dịch vụ (VND)
     */
    @JsonProperty("service_fee")
    private BigDecimal serviceFee;
    
    /**
     * Phí bảo hiểm (VND)
     * Tính dựa trên insurance_value
     */
    @JsonProperty("insurance_fee")
    private BigDecimal insuranceFee;
    
    /**
     * Phí lấy hàng tại bưu cục (VND)
     */
    @JsonProperty("pick_station_fee")
    private BigDecimal pickStationFee;
    
    /**
     * Phí giao hàng tại bưu cục (VND)
     */
    @JsonProperty("courier_station_fee")
    private BigDecimal courierStationFee;
    
    /**
     * Phí thu hộ (COD) (VND)
     * Nếu có cod_amount
     */
    @JsonProperty("cod_fee")
    private BigDecimal codFee;
    
    /**
     * Phí giao hàng tận nơi (VND)
     */
    @JsonProperty("return_fee")
    private BigDecimal returnFee;
    
    /**
     * Phí rút tiền (VND)
     * Nếu có COD
     */
    @JsonProperty("r2s_fee")
    private BigDecimal r2sFee;
}











