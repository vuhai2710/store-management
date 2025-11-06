package com.storemanagement.service;

import com.storemanagement.dto.request.BuyNowRequestDto;
import com.storemanagement.dto.request.CreateOrderForCustomerRequestDto;
import com.storemanagement.dto.request.CreateOrderRequestDto;
import com.storemanagement.dto.response.OrderDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.model.Order;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    // Xem chi tiết đơn hàng
    OrderDto getOrderById(Integer id);

    // Xuất PDF hóa đơn bán hàng
    byte[] exportOrderToPdf(Integer id);
    
    // Customer: Tạo order từ cart
    OrderDto createOrderFromCart(Integer customerId, CreateOrderRequestDto request);
    
    // Customer: Tạo order trực tiếp từ sản phẩm (Buy Now)
    OrderDto createOrderDirectly(Integer customerId, BuyNowRequestDto request);
    
    // Admin/Employee: Tạo order cho khách hàng (có thể không có tài khoản)
    OrderDto createOrderForCustomer(Integer employeeId, CreateOrderForCustomerRequestDto request);
    
    // Customer: Lấy danh sách order của customer (có thể filter theo status)
    PageResponse<OrderDto> getMyOrders(Integer customerId, Order.OrderStatus status, Pageable pageable);
    
    // Customer: Xem chi tiết order của customer
    OrderDto getMyOrderById(Integer customerId, Integer orderId);
    
    // Customer: Hủy order (chỉ khi status = PENDING)
    OrderDto cancelOrder(Integer customerId, Integer orderId);
    
    // Customer: Xác nhận đã nhận hàng
    OrderDto confirmDelivery(Integer customerId, Integer orderId);
}




