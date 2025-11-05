package com.storemanagement.service;

import com.storemanagement.dto.OrderDto;

public interface OrderService {

    // Xem chi tiết đơn hàng
    OrderDto getOrderById(Integer id);

    // Xuất PDF hóa đơn bán hàng
    byte[] exportOrderToPdf(Integer id);
}

