package com.storemanagement.service;

import com.storemanagement.dto.order.OrderDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.model.Order;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderDTO getOrderById(Integer id);

    byte[] exportOrderToPdf(Integer id);
    
    OrderDTO createOrderFromCart(Integer customerId, OrderDTO request);
    
    OrderDTO createOrderDirectly(Integer customerId, OrderDTO request);
    
    OrderDTO createOrderForCustomer(Integer employeeId, OrderDTO request);
    
    PageResponse<OrderDTO> getMyOrders(Integer customerId, Order.OrderStatus status, Pageable pageable);
    
    OrderDTO getMyOrderById(Integer customerId, Integer orderId);
    
    OrderDTO cancelOrder(Integer customerId, Integer orderId);
    
    OrderDTO confirmDelivery(Integer customerId, Integer orderId);

    PageResponse<OrderDTO> getAllOrders(Order.OrderStatus status, Integer customerId, Pageable pageable);

    OrderDTO updateOrderStatus(Integer orderId, Order.OrderStatus newStatus);
}