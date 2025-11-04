package com.storemanagement.service.impl;

import com.storemanagement.dto.ImportOrderDetailDto;
import com.storemanagement.dto.ImportOrderDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.ImportOrderMapper;
import com.storemanagement.model.*;
import com.storemanagement.repository.*;
import com.storemanagement.service.ImportOrderService;
import com.storemanagement.service.PdfService;
import com.storemanagement.utils.PageUtils;
import com.storemanagement.utils.ProductStatus;
import com.storemanagement.utils.ReferenceType;
import com.storemanagement.utils.TransactionType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ImportOrderServiceImpl implements ImportOrderService {

    private final ImportOrderRepository importOrderRepository;
    private final ImportOrderMapper importOrderMapper;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final EmployeeRepository employeeRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final PdfService pdfService;

    @Override
    public ImportOrderDto createImportOrder(ImportOrderDto importOrderDto, Integer employeeId) {
        log.info("Creating import order for supplier: {}", importOrderDto.getIdSupplier());

        // Validate supplier
        Supplier supplier = supplierRepository.findById(importOrderDto.getIdSupplier())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Nhà cung cấp không tồn tại với ID: " + importOrderDto.getIdSupplier()));

        // Validate products và tính tổng tiền
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<ImportOrderDetail> details = new ArrayList<>();

        for (ImportOrderDetailDto detailDto : importOrderDto.getImportOrderDetails()) {
            Product product = productRepository.findById(detailDto.getIdProduct())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Sản phẩm không tồn tại với ID: " + detailDto.getIdProduct()));

            // Validate số lượng
            if (detailDto.getQuantity() == null || detailDto.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0 cho sản phẩm: " + product.getProductName());
            }

            // Validate giá nhập
            if (detailDto.getImportPrice() == null || detailDto.getImportPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Giá nhập không hợp lệ cho sản phẩm: " + product.getProductName());
            }

            // Tính subtotal
            BigDecimal subtotal = detailDto.getImportPrice()
                    .multiply(BigDecimal.valueOf(detailDto.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            totalAmount = totalAmount.add(subtotal);

            // Tạo ImportOrderDetail
            ImportOrderDetail detail = ImportOrderDetail.builder()
                    .product(product)
                    .quantity(detailDto.getQuantity())
                    .importPrice(detailDto.getImportPrice())
                    .build();
            details.add(detail);
        }

        // Tạo ImportOrder
        ImportOrder importOrder = ImportOrder.builder()
                .supplier(supplier)
                .idEmployee(employeeId)
                .orderDate(LocalDateTime.now())
                .totalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP))
                .build();

        // Link details với order
        details.forEach(detail -> detail.setImportOrder(importOrder));
        importOrder.setImportOrderDetails(details);

        // Lưu đơn nhập hàng
        ImportOrder savedOrder = importOrderRepository.save(importOrder);
        log.info("Import order created with ID: {}, Total: {}", savedOrder.getIdImportOrder(), savedOrder.getTotalAmount());

        // Lấy employee entity nếu có employeeId
        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId).orElse(null);
        }

        // Cập nhật inventory (stock quantity) và tạo inventory_transactions cho từng sản phẩm
        for (ImportOrderDetail detail : savedOrder.getImportOrderDetails()) {
            Product product = detail.getProduct();
            Integer oldStockQuantity = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            Integer newStockQuantity = oldStockQuantity + detail.getQuantity();
            
            product.setStockQuantity(newStockQuantity);
            
            // Cập nhật status nếu cần
            if (newStockQuantity > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.IN_STOCK);
            }
            
            productRepository.save(product);
            log.info("Updated stock for product {}: {} -> {}", 
                    product.getIdProduct(), oldStockQuantity, newStockQuantity);

            // Tạo inventory_transaction cho mỗi sản phẩm
            String notes = String.format("Nhập hàng từ NCC %s - Đơn nhập #%d", 
                    supplier.getSupplierName(), savedOrder.getIdImportOrder());
            
            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(product)
                    .transactionType(TransactionType.IN)
                    .quantity(detail.getQuantity())
                    .referenceType(ReferenceType.PURCHASE_ORDER)
                    .referenceId(savedOrder.getIdImportOrder())
                    .employee(employee)
                    .notes(notes)
                    .transactionDate(LocalDateTime.now())
                    .build();
            
            inventoryTransactionRepository.save(transaction);
            log.info("Created inventory transaction for product {}: IN {} units (PO #{})", 
                    product.getIdProduct(), detail.getQuantity(), savedOrder.getIdImportOrder());
        }

        // Map và trả về DTO
        ImportOrderDto result = importOrderMapper.toDto(savedOrder);
        
        // Set employee name nếu có
        if (savedOrder.getIdEmployee() != null) {
            employeeRepository.findById(savedOrder.getIdEmployee())
                    .ifPresent(emp -> result.setEmployeeName(emp.getEmployeeName()));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ImportOrderDto getImportOrderById(Integer id) {
        ImportOrder importOrder = importOrderRepository.findByIdWithDetails(id);
        if (importOrder == null) {
            importOrder = importOrderRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Đơn nhập hàng không tồn tại với ID: " + id));
        }

        ImportOrderDto dto = importOrderMapper.toDto(importOrder);
        
        // Set employee name nếu có
        if (importOrder.getIdEmployee() != null) {
            employeeRepository.findById(importOrder.getIdEmployee())
                    .ifPresent(emp -> dto.setEmployeeName(emp.getEmployeeName()));
        }

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ImportOrderDto> getAllImportOrders(Pageable pageable) {
        Page<ImportOrder> orderPage = importOrderRepository.findAll(pageable);
        List<ImportOrderDto> dtos = importOrderMapper.toDtoList(orderPage.getContent());
        
        // Set employee names
        dtos.forEach(dto -> {
            if (dto.getIdEmployee() != null) {
                employeeRepository.findById(dto.getIdEmployee())
                        .ifPresent(emp -> dto.setEmployeeName(emp.getEmployeeName()));
            }
        });

        return PageUtils.toPageResponse(orderPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ImportOrderDto> getImportOrdersBySupplier(Integer supplierId, Pageable pageable) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + supplierId);
        }

        Page<ImportOrder> orderPage = importOrderRepository.findBySupplier_IdSupplier(supplierId, pageable);
        List<ImportOrderDto> dtos = importOrderMapper.toDtoList(orderPage.getContent());
        
        // Set employee names
        dtos.forEach(dto -> {
            if (dto.getIdEmployee() != null) {
                employeeRepository.findById(dto.getIdEmployee())
                        .ifPresent(emp -> dto.setEmployeeName(emp.getEmployeeName()));
            }
        });

        return PageUtils.toPageResponse(orderPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ImportOrderDto> getImportOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<ImportOrder> orderPage = importOrderRepository.findByOrderDateBetween(startDate, endDate, pageable);
        List<ImportOrderDto> dtos = importOrderMapper.toDtoList(orderPage.getContent());
        
        // Set employee names
        dtos.forEach(dto -> {
            if (dto.getIdEmployee() != null) {
                employeeRepository.findById(dto.getIdEmployee())
                        .ifPresent(emp -> dto.setEmployeeName(emp.getEmployeeName()));
            }
        });

        return PageUtils.toPageResponse(orderPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ImportOrderDto> getImportOrdersBySupplierAndDateRange(Integer supplierId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        // Validate supplier
        if (!supplierRepository.existsById(supplierId)) {
            throw new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + supplierId);
        }

        Page<ImportOrder> orderPage = importOrderRepository.findBySupplierAndDateRange(supplierId, startDate, endDate, pageable);
        List<ImportOrderDto> dtos = importOrderMapper.toDtoList(orderPage.getContent());
        
        // Set employee names
        dtos.forEach(dto -> {
            if (dto.getIdEmployee() != null) {
                employeeRepository.findById(dto.getIdEmployee())
                        .ifPresent(emp -> dto.setEmployeeName(emp.getEmployeeName()));
            }
        });

        return PageUtils.toPageResponse(orderPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportImportOrderToPdf(Integer id) {
        ImportOrderDto importOrderDto = getImportOrderById(id);
        
        // Tạo HTML content cho phiếu nhập hàng
        String htmlContent = generateImportOrderHtmlContent(importOrderDto);
        
        // Tạo PDF
        return pdfService.generatePdfFromHtml(
                pdfService.generateImportOrderHtmlTemplate("PHIẾU NHẬP HÀNG", htmlContent)
        );
    }

    private String generateImportOrderHtmlContent(ImportOrderDto dto) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        StringBuilder html = new StringBuilder();
        
        // Header
        html.append("""
            <div class="header">
                <h1>PHIẾU NHẬP HÀNG</h1>
                <p>Mã đơn: #PO-%d</p>
                <p>Ngày nhập: %s</p>
            </div>
            """.formatted(dto.getIdImportOrder(), 
                    dto.getOrderDate() != null ? dto.getOrderDate().format(dateFormatter) : ""));

        // Thông tin nhà cung cấp
        html.append("""
            <div class="info-section">
                <h2>Thông tin nhà cung cấp</h2>
                <div class="info-row">
                    <span class="info-label">Tên nhà cung cấp:</span>
                    <span class="info-value">%s</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Địa chỉ:</span>
                    <span class="info-value">%s</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Số điện thoại:</span>
                    <span class="info-value">%s</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">%s</span>
                </div>
            </div>
            """.formatted(
                dto.getSupplierName() != null ? dto.getSupplierName() : "",
                dto.getSupplierAddress() != null ? dto.getSupplierAddress() : "",
                dto.getSupplierPhone() != null ? dto.getSupplierPhone() : "",
                dto.getSupplierEmail() != null ? dto.getSupplierEmail() : ""
        ));

        // Thông tin nhân viên
        if (dto.getIdEmployee() != null) {
            html.append("""
                <div class="info-section">
                    <h2>Thông tin nhân viên</h2>
                    <div class="info-row">
                        <span class="info-label">Nhân viên tạo đơn:</span>
                        <span class="info-value">%s</span>
                    </div>
                </div>
                """.formatted(dto.getEmployeeName() != null ? dto.getEmployeeName() : ""));
        }

        // Bảng chi tiết sản phẩm
        html.append("""
            <div class="info-section">
                <h2>Chi tiết sản phẩm nhập</h2>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Mã sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
            """);

        int stt = 1;
        BigDecimal total = BigDecimal.ZERO;
        for (ImportOrderDetailDto detail : dto.getImportOrderDetails()) {
            BigDecimal subtotal = detail.getImportPrice()
                    .multiply(BigDecimal.valueOf(detail.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            total = total.add(subtotal);

            html.append("""
                <tr>
                    <td>%d</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td class="text-right">%d</td>
                    <td class="text-right">%s</td>
                    <td class="text-right">%s</td>
                </tr>
                """.formatted(
                    stt++,
                    detail.getProductName() != null ? detail.getProductName() : "",
                    detail.getProductCode() != null ? detail.getProductCode() : "",
                    detail.getQuantity(),
                    formatCurrency(detail.getImportPrice()),
                    formatCurrency(subtotal)
            ));
        }

        html.append("""
                    </tbody>
                </table>
            </div>
            """);

        // Tổng tiền
        html.append("""
            <div class="total-section">
                <div class="total-row">
                    <span class="total-label">Tổng tiền:</span>
                    <span class="total-value"><strong>%s</strong></span>
                </div>
            </div>
            """.formatted(formatCurrency(dto.getTotalAmount())));

        // Footer
        html.append("""
            <div class="footer">
                <p>Phiếu này được tạo tự động bởi hệ thống quản lý kho</p>
                <p>Ngày xuất: %s</p>
            </div>
            """.formatted(LocalDateTime.now().format(dateFormatter)));

        return html.toString();
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "0 đ";
        }
        return String.format("%,.0f đ", amount.doubleValue());
    }
}

