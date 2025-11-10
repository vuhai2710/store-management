package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho webhook từ GHN
 * 
 * Endpoint: POST /api/v1/ghn/webhook
 * 
 * GHN gửi webhook khi có cập nhật trạng thái đơn hàng
 * 
 * Logic xử lý:
 * 1. Nhận webhook từ GHN
 * 2. Verify signature (nếu GHN cung cấp)
 * 3. Tìm Shipment theo ghnOrderCode
 * 4. Cập nhật Shipment.ghnStatus, ghnUpdatedAt, ghnNote
 * 5. Sync với Shipment.shippingStatus và Order.status
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNWebhookDto {
    
    /**
     * Mã đơn hàng GHN
     * Sử dụng để tìm Shipment tương ứng
     */
    @JsonProperty("order_code")
    private String orderCode;
    
    /**
     * Trạng thái mới từ GHN
     * Các giá trị: ready_to_pick, picking, cancel, money_collect_picking,
     * picked, storing, transporting, sorting, delivering, money_collect_delivering,
     * delivered, delivery_fail, wait_for_return, return, return_transporting,
     * return_sorting, returning, return_fail, returned, exception, damage, lost
     */
    @JsonProperty("status")
    private String status;
    
    /**
     * Thời gian cập nhật
     * Format: ISO 8601 datetime string
     */
    @JsonProperty("updated_at")
    private String updatedAt;
    
    /**
     * Ghi chú/Lý do
     * Ví dụ: "Giao hàng thất bại - Khách hàng không có mặt"
     */
    @JsonProperty("note")
    private String note;
    
    /**
     * Mã đơn hàng của client (order ID từ hệ thống)
     * Optional - có thể có hoặc không
     */
    @JsonProperty("client_order_code")
    private String clientOrderCode;
}










