package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO để tạo đơn hàng GHN
 * 
 * Endpoint: POST /shiip/public-api/v2/shipping-order/create
 * 
 * Logic:
 * - Tạo đơn hàng vận chuyển trên hệ thống GHN
 * - Sau khi tạo thành công, GHN trả về order_code
 * - order_code được lưu vào Shipment.ghnOrderCode để tracking sau này
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNCreateOrderRequestDto {
    
    /**
     * ID quận/huyện nơi gửi hàng
     */
    @JsonProperty("from_district_id")
    private Integer fromDistrictId;
    
    /**
     * Mã phường/xã nơi gửi hàng
     */
    @JsonProperty("from_ward_code")
    private String fromWardCode;
    
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
     * Địa chỉ chi tiết người nhận
     */
    @JsonProperty("to_address")
    private String toAddress;
    
    /**
     * Trọng lượng (gram)
     */
    @JsonProperty("weight")
    private Integer weight;
    
    /**
     * Chiều dài (cm)
     */
    @JsonProperty("length")
    private Integer length;
    
    /**
     * Chiều rộng (cm)
     */
    @JsonProperty("width")
    private Integer width;
    
    /**
     * Chiều cao (cm)
     */
    @JsonProperty("height")
    private Integer height;
    
    /**
     * ID dịch vụ vận chuyển
     * Lấy từ API: GET /shiip/public-api/v2/shipping-order/available-services
     */
    @JsonProperty("service_id")
    private Integer serviceId;
    
    /**
     * Giá trị đơn hàng (VND)
     * Dùng để tính bảo hiểm
     */
    @JsonProperty("insurance_value")
    private Integer insuranceValue;
    
    /**
     * Phí thu hộ (COD) (VND)
     * Số tiền cần thu từ khách hàng
     */
    @JsonProperty("cod_amount")
    private Integer codAmount;
    
    /**
     * Ghi chú cho shipper
     */
    @JsonProperty("note")
    private String note;
    
    /**
     * Danh sách sản phẩm trong đơn hàng
     * Optional - có thể để trống
     */
    @JsonProperty("items")
    private List<GHNOrderItemDto> items;
    
    /**
     * Mã đơn hàng của hệ thống (order ID)
     * Sử dụng để mapping với order trong database
     */
    @JsonProperty("client_order_code")
    private String clientOrderCode;
}











