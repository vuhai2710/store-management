package com.storemanagement.dto.order;

import com.storemanagement.model.Order;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để Admin/Employee cập nhật trạng thái đơn hàng
 *
 * Các trạng thái hợp lệ:
 * - PENDING: Đơn hàng mới tạo, chờ xác nhận
 * - CONFIRMED: Đơn hàng đã được xác nhận và đang chuẩn bị/giao hàng
 * - COMPLETED: Đơn hàng đã hoàn thành (customer đã nhận hàng)
 * - CANCELED: Đơn hàng bị hủy
 *
 * Business rules:
 * - Chỉ có thể CANCEL từ PENDING
 * - Không thể quay lại PENDING từ CONFIRMED/COMPLETED
 * - Không thể update order đã CANCELED hoặc COMPLETED
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStatusRequestDto {

    @NotNull(message = "Trạng thái đơn hàng không được để trống")
    private Order.OrderStatus status;
}










