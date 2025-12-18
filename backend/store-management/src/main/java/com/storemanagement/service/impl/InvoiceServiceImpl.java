package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.invoice.ExportInvoiceDTO;
import com.storemanagement.dto.invoice.ImportInvoiceDTO;
import com.storemanagement.dto.invoice.InvoiceItemDTO;
import com.storemanagement.exception.InvoiceAlreadyPrintedException;
import com.storemanagement.model.*;
import com.storemanagement.repository.ImportOrderRepository;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.repository.EmployeeRepository;
import com.storemanagement.service.InvoiceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final OrderRepository orderRepository;
    private final ImportOrderRepository importOrderRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public PageResponse<ExportInvoiceDTO> getExportInvoices(
            Pageable pageable,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Order.OrderStatus status) {

        Page<Order> orderPage;

        if (status != null && fromDate != null && toDate != null) {
            orderPage = orderRepository.findByFilters(null, status, pageable);
        } else if (status != null) {
            orderPage = orderRepository.findByStatusOrderByOrderDateDesc(status, pageable);
        } else {
            orderPage = orderRepository.findAllOrdersByOrderDateDesc(pageable);
        }

        List<ExportInvoiceDTO> invoices = orderPage.getContent().stream()
                .map(this::mapToExportInvoiceDTO)
                .collect(Collectors.toList());

        return PageResponse.<ExportInvoiceDTO>builder()
                .content(invoices)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .pageNo(orderPage.getNumber() + 1)
                .pageSize(orderPage.getSize())
                .build();
    }

    @Override
    public PageResponse<ImportInvoiceDTO> getImportInvoices(
            Pageable pageable,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Integer supplierId) {

        Page<ImportOrder> orderPage;

        if (supplierId != null && fromDate != null && toDate != null) {
            orderPage = importOrderRepository.findBySupplierAndDateRange(supplierId, fromDate, toDate, pageable);
        } else if (supplierId != null) {
            orderPage = importOrderRepository.findBySupplier_IdSupplier(supplierId, pageable);
        } else if (fromDate != null && toDate != null) {
            orderPage = importOrderRepository.findByOrderDateBetween(fromDate, toDate, pageable);
        } else {
            orderPage = importOrderRepository.findAll(pageable);
        }

        List<ImportInvoiceDTO> invoices = orderPage.getContent().stream()
                .map(this::mapToImportInvoiceDTO)
                .collect(Collectors.toList());

        return PageResponse.<ImportInvoiceDTO>builder()
                .content(invoices)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .pageNo(orderPage.getNumber() + 1)
                .pageSize(orderPage.getSize())
                .build();
    }

    @Override
    public ExportInvoiceDTO getExportInvoiceById(Integer orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        return mapToExportInvoiceDTO(order);
    }

    @Override
    public ImportInvoiceDTO getImportInvoiceById(Integer purchaseOrderId) {
        ImportOrder importOrder = importOrderRepository.findByIdWithDetails(purchaseOrderId);
        if (importOrder == null) {
            throw new EntityNotFoundException("Không tìm thấy đơn nhập hàng với ID: " + purchaseOrderId);
        }
        return mapToImportInvoiceDTO(importOrder);
    }

    @Override
    @Transactional
    public ExportInvoiceDTO printExportInvoice(Integer orderId, Integer userId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (order.getStatus() != Order.OrderStatus.COMPLETED) {
            throw new IllegalStateException("Chỉ có thể in hóa đơn cho đơn hàng đã hoàn thành");
        }

        if (Boolean.TRUE.equals(order.getInvoicePrinted())) {
            throw new InvoiceAlreadyPrintedException("Hóa đơn đã được in trước đó");
        }

        order.setInvoicePrinted(true);
        order.setInvoicePrintedAt(LocalDateTime.now());
        order.setInvoicePrintedBy(userId);
        orderRepository.save(order);

        return mapToExportInvoiceDTO(order);
    }

    @Override
    @Transactional
    public ImportInvoiceDTO printImportInvoice(Integer purchaseOrderId, Integer userId) {
        ImportOrder importOrder = importOrderRepository.findByIdWithDetails(purchaseOrderId);
        if (importOrder == null) {
            throw new EntityNotFoundException("Không tìm thấy đơn nhập hàng với ID: " + purchaseOrderId);
        }

        if (Boolean.TRUE.equals(importOrder.getInvoicePrinted())) {
            throw new InvoiceAlreadyPrintedException("Hóa đơn đã được in trước đó");
        }

        importOrder.setInvoicePrinted(true);
        importOrder.setInvoicePrintedAt(LocalDateTime.now());
        importOrder.setInvoicePrintedBy(userId);
        importOrderRepository.save(importOrder);

        return mapToImportInvoiceDTO(importOrder);
    }

    private ExportInvoiceDTO mapToExportInvoiceDTO(Order order) {

        BigDecimal productSubtotal = BigDecimal.ZERO;
        List<InvoiceItemDTO> items = null;

        if (order.getOrderDetails() != null) {
            items = order.getOrderDetails().stream()
                    .map(this::mapToInvoiceItemDTO)
                    .collect(Collectors.toList());

            productSubtotal = order.getOrderDetails().stream()
                    .map(od -> od.getPrice().multiply(BigDecimal.valueOf(od.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        String printedByName = null;
        if (order.getInvoicePrintedBy() != null) {
            printedByName = employeeRepository.findById(order.getInvoicePrintedBy())
                    .map(Employee::getEmployeeName)
                    .orElse(null);
        }

        return ExportInvoiceDTO.builder()
                .orderId(order.getIdOrder())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .customerId(order.getCustomer() != null ? order.getCustomer().getIdCustomer() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getCustomerName() : null)
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhoneNumber() : null)
                .customerAddress(order.getShippingAddressSnapshot())
                .employeeId(order.getEmployee() != null ? order.getEmployee().getIdEmployee() : null)
                .employeeName(order.getEmployee() != null ? order.getEmployee().getEmployeeName() : null)
                .items(items)
                .productSubtotal(productSubtotal)
                .shippingFee(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO)
                .discount(order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO)
                .shippingDiscount(order.getShippingDiscount() != null ? order.getShippingDiscount() : BigDecimal.ZERO)
                .finalPayable(order.getFinalAmount())
                .promotionCode(order.getPromotionCode())
                .shippingPromotionCode(order.getShippingPromotionCode())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .invoicePrinted(order.getInvoicePrinted())
                .invoicePrintedAt(order.getInvoicePrintedAt())
                .invoicePrintedBy(order.getInvoicePrintedBy())
                .printedByName(printedByName)
                .build();
    }

    private ImportInvoiceDTO mapToImportInvoiceDTO(ImportOrder importOrder) {
        List<InvoiceItemDTO> items = null;

        if (importOrder.getImportOrderDetails() != null) {
            items = importOrder.getImportOrderDetails().stream()
                    .map(this::mapToImportInvoiceItemDTO)
                    .collect(Collectors.toList());
        }

        String printedByName = null;
        if (importOrder.getInvoicePrintedBy() != null) {
            printedByName = employeeRepository.findById(importOrder.getInvoicePrintedBy())
                    .map(Employee::getEmployeeName)
                    .orElse(null);
        }

        String employeeName = null;
        if (importOrder.getIdEmployee() != null) {
            employeeName = employeeRepository.findById(importOrder.getIdEmployee())
                    .map(Employee::getEmployeeName)
                    .orElse(null);
        }

        Supplier supplier = importOrder.getSupplier();

        return ImportInvoiceDTO.builder()
                .purchaseOrderId(importOrder.getIdImportOrder())
                .orderDate(importOrder.getOrderDate())
                .supplierId(supplier != null ? supplier.getIdSupplier() : null)
                .supplierName(supplier != null ? supplier.getSupplierName() : null)
                .supplierPhone(supplier != null ? supplier.getPhoneNumber() : null)
                .supplierEmail(supplier != null ? supplier.getEmail() : null)
                .supplierAddress(supplier != null ? supplier.getAddress() : null)
                .employeeId(importOrder.getIdEmployee())
                .employeeName(employeeName)
                .items(items)
                .totalAmount(importOrder.getTotalAmount())
                .invoicePrinted(importOrder.getInvoicePrinted())
                .invoicePrintedAt(importOrder.getInvoicePrintedAt())
                .invoicePrintedBy(importOrder.getInvoicePrintedBy())
                .printedByName(printedByName)
                .build();
    }

    private InvoiceItemDTO mapToInvoiceItemDTO(OrderDetail detail) {
        return InvoiceItemDTO.builder()
                .productId(detail.getProduct() != null ? detail.getProduct().getIdProduct() : null)
                .productName(detail.getProductNameSnapshot() != null ? detail.getProductNameSnapshot()
                        : (detail.getProduct() != null ? detail.getProduct().getProductName() : null))
                .productCode(detail.getProductCodeSnapshot() != null ? detail.getProductCodeSnapshot()
                        : (detail.getProduct() != null ? detail.getProduct().getProductCode() : null))
                .quantity(detail.getQuantity())
                .unitPrice(detail.getPrice())
                .subtotal(detail.getPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                .build();
    }

    private InvoiceItemDTO mapToImportInvoiceItemDTO(ImportOrderDetail detail) {
        return InvoiceItemDTO.builder()
                .productId(detail.getProduct() != null ? detail.getProduct().getIdProduct() : null)
                .productName(detail.getProduct() != null ? detail.getProduct().getProductName() : null)
                .productCode(detail.getProduct() != null ? detail.getProduct().getProductCode() : null)
                .quantity(detail.getQuantity())
                .unitPrice(detail.getImportPrice())
                .subtotal(detail.getImportPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                .build();
    }
}
