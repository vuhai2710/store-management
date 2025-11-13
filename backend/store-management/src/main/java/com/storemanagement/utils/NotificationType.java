package com.storemanagement.utils;

/**
 * Enum định nghĩa các loại thông báo trong hệ thống
 */
public enum NotificationType {
    /**
     * Thông báo thay đổi trạng thái đơn hàng
     * Ví dụ: Đơn hàng đã được xác nhận, đang giao, đã giao...
     */
    ORDER_STATUS,
    
    /**
     * Cảnh báo hàng tồn kho thấp
     * Gửi cho admin/employee khi sản phẩm < ngưỡng tồn kho
     */
    LOW_STOCK,
    
    /**
     * Thông báo đơn hàng mới
     * Gửi cho admin/employee khi có đơn hàng mới
     */
    NEW_ORDER,
    
    /**
     * Thông báo khách hàng mới đăng ký
     * Gửi cho admin khi có customer mới
     */
    NEW_CUSTOMER,
    
    /**
     * Thông báo cập nhật tồn kho
     * Gửi khi nhập/xuất hàng
     */
    INVENTORY_UPDATE,
    
    /**
     * Thông báo khuyến mãi, ưu đãi
     * Gửi cho customer về các chương trình khuyến mãi
     */
    PROMOTION
}

























