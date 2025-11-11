package com.storemanagement.service;

import com.storemanagement.dto.purchase.PurchaseOrderDTO;
import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ImportOrderService {

    // Tạo đơn nhập hàng mới và cập nhật inventory
    PurchaseOrderDTO createImportOrder(PurchaseOrderDTO purchaseOrderDTO, Integer employeeId);

    // Xem chi tiết đơn nhập hàng
    PurchaseOrderDTO getImportOrderById(Integer id);

    // Lấy danh sách đơn nhập hàng (có phân trang)
    PageResponse<PurchaseOrderDTO> getAllImportOrders(Pageable pageable);

    // Lấy danh sách đơn nhập hàng theo supplier
    PageResponse<PurchaseOrderDTO> getImportOrdersBySupplier(Integer supplierId, Pageable pageable);

    // Lấy danh sách đơn nhập hàng trong khoảng thời gian
    PageResponse<PurchaseOrderDTO> getImportOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Lấy lịch sử nhập hàng theo supplier và khoảng thời gian
    PageResponse<PurchaseOrderDTO> getImportOrdersBySupplierAndDateRange(Integer supplierId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Xuất PDF phiếu nhập hàng
    byte[] exportImportOrderToPdf(Integer id);
}

