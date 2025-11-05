package com.storemanagement.dto;

import com.storemanagement.model.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Integer idOrder;

    private Integer idCustomer;
    private String customerName;
    private String customerAddress;
    private String customerPhone;

    private Integer idEmployee;
    private String employeeName;

    private LocalDateTime orderDate;
    private Order.OrderStatus status;

    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal finalAmount;

    private Order.PaymentMethod paymentMethod;
    private String notes;

    private List<OrderDetailDto> orderDetails;
}

