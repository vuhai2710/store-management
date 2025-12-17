package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.order.OrderReturnDTO;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface OrderReturnService {

    OrderReturnDTO requestReturn(Integer customerId, Integer orderId, OrderReturnDTO request);

    OrderReturnDTO requestExchange(Integer customerId, Integer orderId, OrderReturnDTO request);

    PageResponse<OrderReturnDTO> getMyReturns(Integer customerId, Pageable pageable);

    PageResponse<OrderReturnDTO> getAllReturns(Pageable pageable, String status, String returnType, String keyword, String customerKeyword);

    OrderReturnDTO approve(Integer idReturn, Integer employeeId, String noteAdmin, BigDecimal refundAmount);

    OrderReturnDTO reject(Integer idReturn, Integer employeeId, String noteAdmin);

    OrderReturnDTO complete(Integer idReturn, Integer employeeId);

    OrderReturnDTO getOrderReturnById(Integer id);

    boolean hasActiveReturnRequest(Integer orderId);
}
