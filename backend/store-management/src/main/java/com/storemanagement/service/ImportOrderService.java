package com.storemanagement.service;

import com.storemanagement.dto.purchase.PurchaseOrderDTO;
import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ImportOrderService {
    PurchaseOrderDTO createImportOrder(PurchaseOrderDTO purchaseOrderDTO, Integer employeeId);

    PurchaseOrderDTO getImportOrderById(Integer id);

    PageResponse<PurchaseOrderDTO> getAllImportOrders(String keyword, Pageable pageable);

    PageResponse<PurchaseOrderDTO> getImportOrdersBySupplier(Integer supplierId, Pageable pageable);

    PageResponse<PurchaseOrderDTO> getImportOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    PageResponse<PurchaseOrderDTO> getImportOrdersBySupplierAndDateRange(Integer supplierId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    byte[] exportImportOrderToPdf(Integer id);
}

