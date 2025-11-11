package com.storemanagement.service;

import com.storemanagement.dto.order.OrderDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.model.Order;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    // Xem chi tiết đơn hàng
    OrderDTO getOrderById(Integer id);

    // Xuất PDF hóa đơn bán hàng
    byte[] exportOrderToPdf(Integer id);
    
    // Customer: Tạo order từ cart
    OrderDTO createOrderFromCart(Integer customerId, OrderDTO request);
    
    // Customer: Tạo order trực tiếp từ sản phẩm (Buy Now)
    OrderDTO createOrderDirectly(Integer customerId, OrderDTO request);
    
    // Admin/Employee: Tạo order cho khách hàng (có thể không có tài khoản)
    OrderDTO createOrderForCustomer(Integer employeeId, OrderDTO request);
    
    // Customer: Lấy danh sách order của customer (có thể filter theo status)
    PageResponse<OrderDTO> getMyOrders(Integer customerId, Order.OrderStatus status, Pageable pageable);
    
    // Customer: Xem chi tiết order của customer
    OrderDTO getMyOrderById(Integer customerId, Integer orderId);
    
    // Customer: Hủy order (chỉ khi status = PENDING)
    OrderDTO cancelOrder(Integer customerId, Integer orderId);
    
    // Customer: Xác nhận đã nhận hàng
    OrderDTO confirmDelivery(Integer customerId, Integer orderId);

    // Admin/Employee: Lấy tất cả đơn hàng (có filter theo status, customerId, dateRange)
    PageResponse<OrderDTO> getAllOrders(Order.OrderStatus status, Integer customerId, Pageable pageable);

    // Admin/Employee: Cập nhật trạng thái đơn hàng
    OrderDTO updateOrderStatus(Integer orderId, Order.OrderStatus newStatus);
}




