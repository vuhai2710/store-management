package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO chứa thông tin chi tiết đơn hàng từ GHN API
 * 
 * Endpoint: GET /shiip/public-api/v2/shipping-order/detail
 * 
 * Chứa đầy đủ thông tin về đơn hàng vận chuyển
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNOrderInfoDto {
    
    /**
     * Mã đơn hàng GHN
     */
    @JsonProperty("order_code")
    private String orderCode;
    
    /**
     * Trạng thái đơn hàng
     * Các giá trị: ready_to_pick, picking, cancel, money_collect_picking,
     * picked, storing, transporting, sorting, delivering, money_collect_delivering,
     * delivered, delivery_fail, wait_for_return, return, return_transporting,
     * return_sorting, returning, return_fail, returned, exception, damage, lost
     */
    @JsonProperty("status")
    private String status;
    
    /**
     * Tên người nhận
     */
    @JsonProperty("to_name")
    private String toName;
    
    /**
     * Số điện thoại người nhận
     */
    @JsonProperty("to_phone")
    private String toPhone;
    
    /**
     * Địa chỉ người nhận
     */
    @JsonProperty("to_address")
    private String toAddress;
    
    /**
     * Thời gian giao hàng dự kiến
     */
    @JsonProperty("expected_delivery_time")
    private String expectedDeliveryTime;
    
    /**
     * Ghi chú
     */
    @JsonProperty("note")
    private String note;
    
    /**
     * Phí vận chuyển (VND)
     */
    @JsonProperty("total_fee")
    private Integer totalFee;
    
    /**
     * Phí thu hộ (COD) (VND)
     */
    @JsonProperty("cod_amount")
    private Integer codAmount;
}

