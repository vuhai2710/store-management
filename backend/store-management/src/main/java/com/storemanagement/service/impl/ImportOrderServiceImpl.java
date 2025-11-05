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
import java.util.ArrayList;
import java.util.List;

/**
 * Service implementation cho Import Order (Đơn nhập hàng)
 * 
 * Chức năng chính:
 * 1. Tạo đơn nhập hàng từ nhà cung cấp
 * 2. Tự động cập nhật stock quantity của sản phẩm
 * 3. Tự động tạo inventory transactions để track lịch sử nhập/xuất kho
 * 4. Xuất phiếu nhập hàng ra PDF
 * 
 * Business Logic:
 * - Khi tạo đơn nhập hàng:
 *   1. Validate supplier và products
 *   2. Tính tổng tiền từ các sản phẩm
 *   3. Lưu đơn nhập hàng
 *   4. Cập nhật stock quantity cho từng sản phẩm (tăng)
 *   5. Tạo inventory transaction (type: IN) cho mỗi sản phẩm
 *   6. Cập nhật product status nếu cần (OUT_OF_STOCK -> IN_STOCK)
 * 
 * @author Store Management Team
 */
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

    /**
     * Tạo đơn nhập hàng mới
     * 
     * Flow xử lý:
     * 1. Validate supplier tồn tại
     * 2. Validate từng sản phẩm trong danh sách
     * 3. Tính tổng tiền (quantity * importPrice cho mỗi sản phẩm)
     * 4. Tạo và lưu ImportOrder
     * 5. Cập nhật stock quantity cho từng sản phẩm (tăng số lượng)
     * 6. Tạo InventoryTransaction (type: IN) để track lịch sử
     * 7. Cập nhật product status nếu cần
     * 
     * @param importOrderDto DTO chứa thông tin đơn nhập hàng
     * @param employeeId ID của nhân viên tạo đơn (lấy từ JWT token)
     * @return ImportOrderDto đã được tạo với ID
     */
    @Override
    public ImportOrderDto createImportOrder(ImportOrderDto importOrderDto, Integer employeeId) {
        log.info("Creating import order for supplier: {}", importOrderDto.getIdSupplier());

        // Bước 1: Validate supplier tồn tại
        Supplier supplier = supplierRepository.findById(importOrderDto.getIdSupplier())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Nhà cung cấp không tồn tại với ID: " + importOrderDto.getIdSupplier()));

        // Bước 2: Validate products và tính tổng tiền
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<ImportOrderDetail> details = new ArrayList<>();

        // Duyệt qua từng sản phẩm trong đơn nhập hàng
        for (ImportOrderDetailDto detailDto : importOrderDto.getImportOrderDetails()) {
            // Validate product tồn tại
            Product product = productRepository.findById(detailDto.getIdProduct())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Sản phẩm không tồn tại với ID: " + detailDto.getIdProduct()));

            // Validate số lượng phải > 0
            if (detailDto.getQuantity() == null || detailDto.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0 cho sản phẩm: " + product.getProductName());
            }

            // Validate giá nhập phải >= 0
            if (detailDto.getImportPrice() == null || detailDto.getImportPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Giá nhập không hợp lệ cho sản phẩm: " + product.getProductName());
            }

            // Tính subtotal cho sản phẩm này: quantity * importPrice
            BigDecimal subtotal = detailDto.getImportPrice()
                    .multiply(BigDecimal.valueOf(detailDto.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP); // Làm tròn 2 chữ số thập phân
            totalAmount = totalAmount.add(subtotal);

            // Tạo ImportOrderDetail entity
            ImportOrderDetail detail = ImportOrderDetail.builder()
                    .product(product)
                    .quantity(detailDto.getQuantity())
                    .importPrice(detailDto.getImportPrice())
                    .build();
            details.add(detail);
        }

        // Bước 3: Tạo ImportOrder entity
        ImportOrder importOrder = ImportOrder.builder()
                .supplier(supplier)
                .idEmployee(employeeId) // ID nhân viên tạo đơn (lấy từ JWT token)
                .orderDate(LocalDateTime.now()) // Thời gian hiện tại
                .totalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP)) // Tổng tiền (làm tròn 2 chữ số)
                .build();

        // Bước 4: Link details với order (bidirectional relationship)
        // Set parent reference cho mỗi detail
        details.forEach(detail -> detail.setImportOrder(importOrder));
        // Set children reference cho order
        importOrder.setImportOrderDetails(details);

        // Bước 5: Lưu đơn nhập hàng vào database
        // Cascade save sẽ tự động lưu các details
        ImportOrder savedOrder = importOrderRepository.save(importOrder);
        log.info("Import order created with ID: {}, Total: {}", savedOrder.getIdImportOrder(), savedOrder.getTotalAmount());

        // Lấy employee entity nếu có employeeId (để lưu vào inventory transaction)
        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId).orElse(null);
        }

        // Bước 6: Cập nhật inventory (stock quantity) và tạo inventory_transactions cho từng sản phẩm
        // Đây là phần quan trọng nhất - tự động cập nhật kho khi nhập hàng
        for (ImportOrderDetail detail : savedOrder.getImportOrderDetails()) {
            Product product = detail.getProduct();
            
            // Lấy stock quantity hiện tại (nếu null thì = 0)
            Integer oldStockQuantity = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            // Tính stock quantity mới: cũ + số lượng nhập
            Integer newStockQuantity = oldStockQuantity + detail.getQuantity();
            
            // Cập nhật stock quantity
            product.setStockQuantity(newStockQuantity);
            
            // Cập nhật product status nếu cần:
            // Nếu trước đó là OUT_OF_STOCK và bây giờ có hàng (> 0) -> chuyển sang IN_STOCK
            if (newStockQuantity > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.IN_STOCK);
            }
            
            // Lưu product với stock quantity mới
            productRepository.save(product);
            log.info("Updated stock for product {}: {} -> {}", 
                    product.getIdProduct(), oldStockQuantity, newStockQuantity);

            // Bước 7: Tạo inventory_transaction để track lịch sử nhập/xuất kho
            // Transaction này giúp:
            // - Xem lịch sử nhập/xuất của từng sản phẩm
            // - Audit trail (ai nhập, khi nào, từ đâu)
            // - Báo cáo, thống kê
            String notes = String.format("Nhập hàng từ NCC %s - Đơn nhập #%d", 
                    supplier.getSupplierName(), savedOrder.getIdImportOrder());
            
            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(product) // Sản phẩm
                    .transactionType(TransactionType.IN) // Loại: IN (nhập kho)
                    .quantity(detail.getQuantity()) // Số lượng nhập
                    .referenceType(ReferenceType.PURCHASE_ORDER) // Reference: đơn nhập hàng
                    .referenceId(savedOrder.getIdImportOrder()) // ID đơn nhập hàng
                    .employee(employee) // Nhân viên tạo đơn
                    .notes(notes) // Ghi chú
                    .transactionDate(LocalDateTime.now()) // Thời gian
                    .build();
            
            // Lưu transaction
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
        return pdfService.generateImportOrderPdf(importOrderDto);
    }
}

