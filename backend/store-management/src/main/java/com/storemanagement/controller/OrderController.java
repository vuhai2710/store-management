package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.OrderDto;
import com.storemanagement.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Xem chi tiết đơn hàng
     * GET /api/v1/orders/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Integer id) {
        OrderDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công", order));
    }

    /**
     * Xuất/In hóa đơn bán hàng ra PDF
     * GET /api/v1/orders/{id}/pdf
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<byte[]> exportOrderToPdf(@PathVariable Integer id) {
        byte[] pdfBytes = orderService.exportOrderToPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "hoa-don-" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}

