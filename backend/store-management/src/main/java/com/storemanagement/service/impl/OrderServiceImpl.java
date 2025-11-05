package com.storemanagement.service.impl;

import com.storemanagement.dto.OrderDto;
import com.storemanagement.mapper.OrderMapper;
import com.storemanagement.model.Order;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.service.OrderService;
import com.storemanagement.service.PdfService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final PdfService pdfService;

    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Integer id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Đơn hàng không tồn tại với ID: " + id));

        OrderDto dto = orderMapper.toDto(order);

        // Set employee name nếu có (đã có trong mapper, nhưng để đảm bảo)
        if (order.getEmployee() != null && dto.getEmployeeName() == null) {
            dto.setEmployeeName(order.getEmployee().getEmployeeName());
        }

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportOrderToPdf(Integer id) {
        OrderDto orderDto = getOrderById(id);
        return pdfService.generateInvoicePdf(orderDto);
    }
}

