package com.storemanagement.dto.request;

import com.storemanagement.model.Order;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequestDto {
    private Integer shippingAddressId; // Optional - nếu không có thì dùng default address hoặc customer.address
    
    @NotNull(message = "Phương thức thanh toán không được để trống")
    private Order.PaymentMethod paymentMethod;
    
    private String notes; // Optional
}




