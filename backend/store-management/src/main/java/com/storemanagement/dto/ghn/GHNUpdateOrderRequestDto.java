package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để cập nhật đơn hàng GHN
 * 
 * Endpoint: POST /shiip/public-api/v2/shipping-order/update
 * 
 * Cho phép cập nhật thông tin đơn hàng đã tạo
 * (chỉ một số thông tin có thể cập nhật)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNUpdateOrderRequestDto {
    
    /**
     * Mã đơn hàng GHN cần cập nhật
     */
    @JsonProperty("order_code")
    private String orderCode;
    
    /**
     * Tên người nhận mới (nếu cần cập nhật)
     */
    @JsonProperty("to_name")
    private String toName;
    
    /**
     * Số điện thoại người nhận mới (nếu cần cập nhật)
     */
    @JsonProperty("to_phone")
    private String toPhone;
    
    /**
     * Địa chỉ người nhận mới (nếu cần cập nhật)
     */
    @JsonProperty("to_address")
    private String toAddress;
    
    /**
     * Ghi chú mới (nếu cần cập nhật)
     */
    @JsonProperty("note")
    private String note;
}














