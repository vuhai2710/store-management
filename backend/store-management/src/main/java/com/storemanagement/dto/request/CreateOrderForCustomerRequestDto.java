package com.storemanagement.dto.request;

import com.storemanagement.model.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderForCustomerRequestDto {
    private Integer customerId; // Optional - nếu null thì tạo customer mới
    
    // Thông tin khách hàng (required nếu customerId null)
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    
    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<OrderItemDto> orderItems;
    
    @NotNull(message = "Phương thức thanh toán không được để trống")
    private Order.PaymentMethod paymentMethod;
    
    private BigDecimal discount; // Optional, default 0
    
    private String notes; // Optional
}



