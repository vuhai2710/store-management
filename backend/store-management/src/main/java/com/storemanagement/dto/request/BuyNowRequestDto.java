package com.storemanagement.dto.request;

import com.storemanagement.model.Order;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyNowRequestDto {
    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productId;
    
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
    
    private Integer shippingAddressId; // Optional - nếu không có thì dùng default address hoặc customer.address
    
    @NotNull(message = "Phương thức thanh toán không được để trống")
    private Order.PaymentMethod paymentMethod;
    
    private String notes; // Optional
}

