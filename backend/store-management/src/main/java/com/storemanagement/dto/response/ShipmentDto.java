package com.storemanagement.dto.response;

import com.storemanagement.model.Shipment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO cho Shipment
 * 
 * Chứa thông tin đầy đủ về shipment bao gồm:
 * - Thông tin cơ bản (id, status, tracking number)
 * - Thông tin GHN (order code, shipping fee, expected delivery time, status)
 * - Thông tin đơn hàng liên quan
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentDto {
    
    /**
     * ID shipment
     */
    private Integer idShipment;
    
    /**
     * ID đơn hàng liên quan
     */
    private Integer idOrder;
    
    /**
     * Trạng thái vận chuyển
     * - PREPARING: Đang chuẩn bị
     * - SHIPPED: Đã gửi hàng
     * - DELIVERED: Đã giao hàng
     */
    private Shipment.ShippingStatus shippingStatus;
    
    /**
     * Mã tracking (nếu có)
     */
    private String trackingNumber;
    
    /**
     * Vĩ độ (nếu có)
     */
    private BigDecimal locationLat;
    
    /**
     * Kinh độ (nếu có)
     */
    private BigDecimal locationLong;
    
    // ========== GHN Integration Fields ==========
    
    /**
     * Mã đơn hàng từ GHN
     * Được trả về khi tạo đơn thành công qua GHN API
     * Sử dụng để tracking và hủy đơn
     */
    private String ghnOrderCode;
    
    /**
     * Phí vận chuyển từ GHN (VND)
     * Được tính toán từ GHN Calculate Fee API
     */
    private BigDecimal ghnShippingFee;
    
    /**
     * Thời gian giao hàng dự kiến từ GHN
     */
    private LocalDateTime ghnExpectedDeliveryTime;
    
    /**
     * Trạng thái từ GHN API
     * Các giá trị: ready_to_pick, picking, cancel, money_collect_picking,
     * picked, storing, transporting, sorting, delivering, money_collect_delivering,
     * delivered, delivery_fail, wait_for_return, return, return_transporting,
     * return_sorting, returning, return_fail, returned, exception, damage, lost
     */
    private String ghnStatus;
    
    /**
     * Thời gian cập nhật trạng thái từ GHN (webhook)
     */
    private LocalDateTime ghnUpdatedAt;
    
    /**
     * Ghi chú/Lý do từ GHN
     * Ví dụ: "Giao hàng thất bại - Khách hàng không có mặt"
     */
    private String ghnNote;
    
    /**
     * Phương thức vận chuyển
     * - GHN: Giao hàng qua GHN
     * - SELF_PICKUP: Khách tự đến lấy
     */
    private Shipment.ShippingMethod shippingMethod;
}




