package com.storemanagement.service.impl;

import com.storemanagement.dto.purchase.PurchaseOrderDTO;
import com.storemanagement.dto.purchase.PurchaseOrderDetailDTO;
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

    private void recalculateTotalAmount(PurchaseOrderDTO dto) {
        if (dto.getImportOrderDetails() == null || dto.getImportOrderDetails().isEmpty()) {
            dto.setTotalAmount(BigDecimal.ZERO);
            return;
        }

        BigDecimal computedTotal = dto.getImportOrderDetails().stream()
                .map(detail -> {

                    BigDecimal subtotal = detail.getImportPrice()
                            .multiply(BigDecimal.valueOf(detail.getQuantity()))
                            .setScale(2, RoundingMode.HALF_UP);

                    detail.setSubtotal(subtotal);
                    return subtotal;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        dto.setTotalAmount(computedTotal);
    }

    private void enrichPurchaseOrderDTO(PurchaseOrderDTO dto) {

        recalculateTotalAmount(dto);

        if (dto.getIdEmployee() != null) {
            employeeRepository.findById(dto.getIdEmployee())
                    .ifPresent(emp -> dto.setEmployeeName(emp.getEmployeeName()));
        } else {
            dto.setEmployeeName("Quản trị viên");
        }
    }

    private void enrichPurchaseOrderDTOs(List<PurchaseOrderDTO> dtos) {
        dtos.forEach(this::enrichPurchaseOrderDTO);
    }

    @Override
    public PurchaseOrderDTO createImportOrder(PurchaseOrderDTO purchaseOrderDTO, Integer employeeId) {
        log.info("Creating import order for supplier: {}", purchaseOrderDTO.getIdSupplier());

        Supplier supplier = supplierRepository.findById(purchaseOrderDTO.getIdSupplier())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Nhà cung cấp không tồn tại với ID: " + purchaseOrderDTO.getIdSupplier()));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<ImportOrderDetail> details = new ArrayList<>();

        for (PurchaseOrderDetailDTO detailDto : purchaseOrderDTO.getImportOrderDetails()) {

            Product product = productRepository.findById(detailDto.getIdProduct())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Sản phẩm không tồn tại với ID: " + detailDto.getIdProduct()));

            if (detailDto.getQuantity() == null || detailDto.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0 cho sản phẩm: " + product.getProductName());
            }

            if (detailDto.getImportPrice() == null || detailDto.getImportPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Giá nhập không hợp lệ cho sản phẩm: " + product.getProductName());
            }

            BigDecimal subtotal = detailDto.getImportPrice()
                    .multiply(BigDecimal.valueOf(detailDto.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            totalAmount = totalAmount.add(subtotal);

            ImportOrderDetail detail = ImportOrderDetail.builder()
                    .product(product)
                    .quantity(detailDto.getQuantity())
                    .importPrice(detailDto.getImportPrice())
                    .build();
            details.add(detail);
        }

        ImportOrder importOrder = ImportOrder.builder()
                .supplier(supplier)
                .idEmployee(employeeId)
                .orderDate(LocalDateTime.now())
                .totalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP))
                .build();

        details.forEach(detail -> detail.setImportOrder(importOrder));

        importOrder.setImportOrderDetails(details);

        ImportOrder savedOrder = importOrderRepository.save(importOrder);
        log.info("Import order created with ID: {}, Total: {}", savedOrder.getIdImportOrder(), savedOrder.getTotalAmount());

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId).orElse(null);
        }

        for (ImportOrderDetail detail : savedOrder.getImportOrderDetails()) {
            Product product = detail.getProduct();

            Integer oldStockQuantity = product.getStockQuantity() == null ? 0 : product.getStockQuantity();

            Integer newStockQuantity = oldStockQuantity + detail.getQuantity();

            product.setStockQuantity(newStockQuantity);

            if (newStockQuantity > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.IN_STOCK);
            }

            productRepository.save(product);
            log.info("Updated stock for product {}: {} -> {}",
                    product.getIdProduct(), oldStockQuantity, newStockQuantity);

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

        PurchaseOrderDTO result = importOrderMapper.toDTO(savedOrder);

        enrichPurchaseOrderDTO(result);

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderDTO getImportOrderById(Integer id) {
        ImportOrder importOrder = importOrderRepository.findByIdWithDetails(id);
        if (importOrder == null) {
            importOrder = importOrderRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Đơn nhập hàng không tồn tại với ID: " + id));
        }

        PurchaseOrderDTO dto = importOrderMapper.toDTO(importOrder);

        enrichPurchaseOrderDTO(dto);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDTO> getAllImportOrders(String keyword, Pageable pageable) {
        Page<ImportOrder> orderPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            orderPage = importOrderRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            orderPage = importOrderRepository.findAll(pageable);
        }

        List<PurchaseOrderDTO> dtos = importOrderMapper.toDTOList(orderPage.getContent());

        enrichPurchaseOrderDTOs(dtos);

        return PageUtils.toPageResponse(orderPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDTO> getImportOrdersBySupplier(Integer supplierId, Pageable pageable) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + supplierId);
        }

        Page<ImportOrder> orderPage = importOrderRepository.findBySupplier_IdSupplier(supplierId, pageable);
        List<PurchaseOrderDTO> dtos = importOrderMapper.toDTOList(orderPage.getContent());

        enrichPurchaseOrderDTOs(dtos);

        return PageUtils.toPageResponse(orderPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDTO> getImportOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<ImportOrder> orderPage = importOrderRepository.findByOrderDateBetween(startDate, endDate, pageable);
        List<PurchaseOrderDTO> dtos = importOrderMapper.toDTOList(orderPage.getContent());

        enrichPurchaseOrderDTOs(dtos);

        return PageUtils.toPageResponse(orderPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDTO> getImportOrdersBySupplierAndDateRange(Integer supplierId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {

        if (!supplierRepository.existsById(supplierId)) {
            throw new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + supplierId);
        }

        Page<ImportOrder> orderPage = importOrderRepository.findBySupplierAndDateRange(supplierId, startDate, endDate, pageable);
        List<PurchaseOrderDTO> dtos = importOrderMapper.toDTOList(orderPage.getContent());

        enrichPurchaseOrderDTOs(dtos);

        return PageUtils.toPageResponse(orderPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportImportOrderToPdf(Integer id) {
        PurchaseOrderDTO purchaseOrderDTO = getImportOrderById(id);
        return pdfService.generateImportOrderPdf(purchaseOrderDTO);
    }
}
