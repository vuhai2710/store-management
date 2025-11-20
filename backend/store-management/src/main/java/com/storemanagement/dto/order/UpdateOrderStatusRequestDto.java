package com.storemanagement.dto.order;

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
public class UpdateOrderStatusRequestDto {

    @NotNull(message = "Trạng thái đơn hàng không được để trống")
    private Order.OrderStatus status;
}
