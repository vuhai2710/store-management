package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.order.OrderReturnDTO;
import com.storemanagement.dto.order.OrderReturnItemDTO;
import com.storemanagement.mapper.OrderReturnMapper;
import com.storemanagement.model.*;
import com.storemanagement.repository.*;
import com.storemanagement.service.OrderReturnService;
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
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderReturnServiceImpl implements OrderReturnService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderReturnRepository orderReturnRepository;
    private final OrderReturnItemRepository orderReturnItemRepository;
    private final ProductRepository productRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final OrderReturnMapper orderReturnMapper;
    // Note: SystemSettingService removed - now using order.returnWindowDays snapshot

    @Override
    public OrderReturnDTO requestReturn(Integer customerId, Integer orderId, OrderReturnDTO request) {
        log.info("Customer {} is requesting RETURN for order {}", customerId, orderId);
        return createReturnRequest(customerId, orderId, request, OrderReturn.ReturnType.RETURN);
    }

    @Override
    public OrderReturnDTO requestExchange(Integer customerId, Integer orderId, OrderReturnDTO request) {
        log.info("Customer {} is requesting EXCHANGE for order {}", customerId, orderId);
        return createReturnRequest(customerId, orderId, request, OrderReturn.ReturnType.EXCHANGE);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderReturnDTO> getMyReturns(Integer customerId, Pageable pageable) {
        log.info("Getting return/exchange list for customer {}", customerId);

        Page<OrderReturn> page = orderReturnRepository
                .findByCreatedByCustomer_IdCustomerOrderByCreatedAtDesc(customerId, pageable);

        List<OrderReturnDTO> content = orderReturnMapper.toDTOList(page.getContent());

        return PageUtils.toPageResponse(page, content);
    }

    @Override
    public OrderReturnDTO approve(Integer idReturn, Integer employeeId, String noteAdmin, BigDecimal refundAmount) {
        log.info("Approve return/exchange idReturn={} by employeeId={}", idReturn, employeeId);

        OrderReturn orderReturn = orderReturnRepository.findByIdWithItems(idReturn)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu đổi/trả"));

        if (orderReturn.getStatus() != OrderReturn.ReturnStatus.REQUESTED) {
            throw new RuntimeException("Chỉ có thể duyệt yêu cầu ở trạng thái REQUESTED");
        }

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên"));
        }

        orderReturn.setProcessedByEmployee(employee);
        orderReturn.setNoteAdmin(noteAdmin);

        if (refundAmount != null) {
            orderReturn.setRefundAmount(refundAmount);
        }

        orderReturn.setStatus(OrderReturn.ReturnStatus.APPROVED);
        orderReturn.setUpdatedAt(LocalDateTime.now());

        OrderReturn saved = orderReturnRepository.save(orderReturn);
        return orderReturnMapper.toDTO(saved);
    }

    @Override
    public OrderReturnDTO reject(Integer idReturn, Integer employeeId, String noteAdmin) {
        log.info("Reject return/exchange idReturn={} by employeeId={}", idReturn, employeeId);

        OrderReturn orderReturn = orderReturnRepository.findByIdWithItems(idReturn)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu đổi/trả"));

        if (orderReturn.getStatus() != OrderReturn.ReturnStatus.REQUESTED) {
            throw new RuntimeException("Chỉ có thể từ chối yêu cầu ở trạng thái REQUESTED");
        }

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên"));
        }

        orderReturn.setProcessedByEmployee(employee);
        orderReturn.setNoteAdmin(noteAdmin);
        orderReturn.setStatus(OrderReturn.ReturnStatus.REJECTED);
        orderReturn.setUpdatedAt(LocalDateTime.now());

        OrderReturn saved = orderReturnRepository.save(orderReturn);
        return orderReturnMapper.toDTO(saved);
    }

    @Override
    public OrderReturnDTO complete(Integer idReturn, Integer employeeId) {
        log.info("Complete return/exchange idReturn={} by employeeId={}", idReturn, employeeId);

        OrderReturn orderReturn = orderReturnRepository.findByIdWithItems(idReturn)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu đổi/trả"));

        if (orderReturn.getStatus() != OrderReturn.ReturnStatus.APPROVED) {
            throw new RuntimeException("Chỉ có thể hoàn tất yêu cầu ở trạng thái APPROVED");
        }

        if (orderReturn.getReturnType() == OrderReturn.ReturnType.RETURN) {
            processReturnStock(orderReturn);
        } else if (orderReturn.getReturnType() == OrderReturn.ReturnType.EXCHANGE) {
            processExchangeStock(orderReturn);
        }

        orderReturn.setStatus(OrderReturn.ReturnStatus.COMPLETED);
        orderReturn.setUpdatedAt(LocalDateTime.now());

        OrderReturn saved = orderReturnRepository.save(orderReturn);
        return orderReturnMapper.toDTO(saved);
    }

    private OrderReturnDTO createReturnRequest(Integer customerId,
                                               Integer orderId,
                                               OrderReturnDTO request,
                                               OrderReturn.ReturnType type) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền tạo yêu cầu cho đơn hàng này");
        }

        if (order.getStatus() != Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Chỉ có thể đổi/trả đơn hàng đã hoàn thành");
        }

        validateReturnWindow(order);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm đổi/trả không được để trống");
        }

        // ======= TÍNH REFUND THEO CHUẨN TMĐT =======
        // Lấy thông tin đơn hàng để tính tỷ lệ giảm giá
        BigDecimal orderTotalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal orderDiscount = order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO;

        OrderReturn orderReturn = new OrderReturn();
        orderReturn.setOrder(order);
        orderReturn.setReturnType(type);
        orderReturn.setStatus(OrderReturn.ReturnStatus.REQUESTED);
        orderReturn.setReason(request.getReason());
        orderReturn.setCreatedByCustomer(customer);
        orderReturn.setCreatedAt(LocalDateTime.now());
        orderReturn.setUpdatedAt(LocalDateTime.now());

        BigDecimal totalLineRefund = BigDecimal.ZERO;

        for (OrderReturnItemDTO itemDTO : request.getItems()) {
            if (itemDTO.getIdOrderDetail() == null) {
                throw new RuntimeException("idOrderDetail không được để trống");
            }

            OrderDetail detail = orderDetailRepository.findById(itemDTO.getIdOrderDetail())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chi tiết đơn hàng"));

            if (!detail.getOrder().getIdOrder().equals(orderId)) {
                throw new RuntimeException("Chi tiết đơn hàng không thuộc về order này");
            }

            if (itemDTO.getQuantity() == null || itemDTO.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng đổi/trả phải lớn hơn 0");
            }

            if (itemDTO.getQuantity() > detail.getQuantity()) {
                throw new RuntimeException("Số lượng đổi/trả vượt quá số lượng đã mua");
            }

            OrderReturnItem item = new OrderReturnItem();
            item.setOrderReturn(orderReturn);
            item.setOrderDetail(detail);
            item.setQuantity(itemDTO.getQuantity());

            if (type == OrderReturn.ReturnType.EXCHANGE) {
                if (itemDTO.getExchangeProductId() != null) {
                    Product exchangeProduct = productRepository.findById(itemDTO.getExchangeProductId())
                            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm đổi không tồn tại"));
                    item.setExchangeProduct(exchangeProduct);
                }
                item.setExchangeQuantity(itemDTO.getExchangeQuantity() != null
                        ? itemDTO.getExchangeQuantity()
                        : itemDTO.getQuantity());
            }

            // ======= TÍNH LINE REFUND THEO CÔNG THỨC PHÂN BỔ DISCOUNT =======
            // itemSubtotal = price * quantity (giá gốc của sản phẩm trả)
            BigDecimal itemSubtotal = detail.getPrice()
                    .multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            
            BigDecimal lineRefund;
            
            if (orderTotalAmount.compareTo(BigDecimal.ZERO) > 0 && orderDiscount.compareTo(BigDecimal.ZERO) > 0) {
                // Có giảm giá → phân bổ discount theo tỷ lệ
                // ratio = itemSubtotal / orderTotalAmount
                // discountShare = orderDiscount * ratio
                // lineRefund = itemSubtotal - discountShare
                BigDecimal ratio = itemSubtotal.divide(orderTotalAmount, 10, java.math.RoundingMode.HALF_UP);
                BigDecimal discountShare = orderDiscount.multiply(ratio);
                lineRefund = itemSubtotal.subtract(discountShare);
            } else {
                // Không có giảm giá → hoàn nguyên giá
                lineRefund = itemSubtotal;
            }
            
            // Làm tròn đến đơn vị, đảm bảo không âm
            lineRefund = lineRefund.max(BigDecimal.ZERO).setScale(0, java.math.RoundingMode.HALF_UP);
            item.setLineRefundAmount(lineRefund);

            totalLineRefund = totalLineRefund.add(lineRefund);

            orderReturn.getItems().add(item);
        }

        orderReturn.setRefundAmount(totalLineRefund);

        OrderReturn saved = orderReturnRepository.save(orderReturn);
        return orderReturnMapper.toDTO(saved);
    }

    private void processReturnStock(OrderReturn orderReturn) {
        Order order = orderReturn.getOrder();
        for (OrderReturnItem item : orderReturn.getItems()) {
            Product product = item.getOrderDetail().getProduct();

            int newStock = product.getStockQuantity() + item.getQuantity();
            product.setStockQuantity(newStock);

            if (product.getStatus() == ProductStatus.OUT_OF_STOCK && newStock > 0) {
                product.setStatus(ProductStatus.IN_STOCK);
            }

            productRepository.save(product);

            InventoryTransaction tx = InventoryTransaction.builder()
                    .product(product)
                    .transactionType(TransactionType.IN)
                    .quantity(item.getQuantity())
                    .referenceType(ReferenceType.SALE_RETURN)
                    .referenceId(order.getIdOrder())
                    .notes("Khách trả hàng - Return #" + orderReturn.getIdReturn())
                    .transactionDate(LocalDateTime.now())
                    .build();

            inventoryTransactionRepository.save(tx);
        }
    }

    private void processExchangeStock(OrderReturn orderReturn) {
        Order order = orderReturn.getOrder();

        for (OrderReturnItem item : orderReturn.getItems()) {

            Product oldProduct = item.getOrderDetail().getProduct();
            int newOldStock = oldProduct.getStockQuantity() + item.getQuantity();
            oldProduct.setStockQuantity(newOldStock);
            if (oldProduct.getStatus() == ProductStatus.OUT_OF_STOCK && newOldStock > 0) {
                oldProduct.setStatus(ProductStatus.IN_STOCK);
            }
            productRepository.save(oldProduct);

            InventoryTransaction inTx = InventoryTransaction.builder()
                    .product(oldProduct)
                    .transactionType(TransactionType.IN)
                    .quantity(item.getQuantity())
                    .referenceType(ReferenceType.SALE_EXCHANGE)
                    .referenceId(order.getIdOrder())
                    .notes("Đổi hàng - nhập lại SP cũ (Return #" + orderReturn.getIdReturn() + ")")
                    .transactionDate(LocalDateTime.now())
                    .build();
            inventoryTransactionRepository.save(inTx);

            if (item.getExchangeProduct() != null) {
                Product newProduct = item.getExchangeProduct();
                int qtyToOut = item.getExchangeQuantity() != null
                        ? item.getExchangeQuantity()
                        : item.getQuantity();

                if (newProduct.getStockQuantity() < qtyToOut) {
                    throw new RuntimeException("Sản phẩm đổi không đủ tồn kho");
                }

                int newNewStock = newProduct.getStockQuantity() - qtyToOut;
                newProduct.setStockQuantity(newNewStock);
                if (newNewStock == 0) {
                    newProduct.setStatus(ProductStatus.OUT_OF_STOCK);
                }
                productRepository.save(newProduct);

                InventoryTransaction outTx = InventoryTransaction.builder()
                        .product(newProduct)
                        .transactionType(TransactionType.OUT)
                        .quantity(qtyToOut)
                        .referenceType(ReferenceType.SALE_EXCHANGE)
                        .referenceId(order.getIdOrder())
                        .notes("Đổi hàng - xuất SP mới (Return #" + orderReturn.getIdReturn() + ")")
                        .transactionDate(LocalDateTime.now())
                        .build();
                inventoryTransactionRepository.save(outTx);
            }
        }
    }

    @Override
    public OrderReturnDTO getOrderReturnById(Integer id) {
        OrderReturn orderReturn = orderReturnRepository.findByIdWithItems(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu đổi/trả với ID: " + id));
        return orderReturnMapper.toDTO(orderReturn);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderReturnDTO> getAllReturns(Pageable pageable, String status, String returnType) {
        log.info("Getting all return/exchange list for admin with status={}, returnType={}", status, returnType);
        
        Page<OrderReturn> page;
        
        // Parse status and returnType if provided
        OrderReturn.ReturnStatus statusEnum = null;
        OrderReturn.ReturnType typeEnum = null;
        
        if (status != null && !status.isEmpty()) {
            try {
                statusEnum = OrderReturn.ReturnStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", status);
            }
        }
        
        if (returnType != null && !returnType.isEmpty()) {
            try {
                typeEnum = OrderReturn.ReturnType.valueOf(returnType);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid returnType value: {}", returnType);
            }
        }
        
        // Apply filters
        if (statusEnum != null && typeEnum != null) {
            page = orderReturnRepository.findByStatusAndReturnTypeOrderByCreatedAtDesc(statusEnum, typeEnum, pageable);
        } else if (statusEnum != null) {
            page = orderReturnRepository.findByStatusOrderByCreatedAtDesc(statusEnum, pageable);
        } else if (typeEnum != null) {
            page = orderReturnRepository.findByReturnTypeOrderByCreatedAtDesc(typeEnum, pageable);
        } else {
            page = orderReturnRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        
        List<OrderReturnDTO> content = orderReturnMapper.toDTOList(page.getContent());
        return PageUtils.toPageResponse(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveReturnRequest(Integer orderId) {
        return orderReturnRepository.existsActiveReturnByOrderId(orderId);
    }

    /**
     * Validate return window using order's snapshot data (returnWindowDays, completedAt)
     * Formula: expireAt = baseTime + returnWindowDays
     * Where baseTime = completedAt || deliveredAt || orderDate
     * 
     * This ensures FE and BE use the same logic for calculating return deadline.
     */
    private void validateReturnWindow(Order order) {
        // ===== DEBUG LOGGING =====
        log.info("=== VALIDATE RETURN WINDOW FOR ORDER {} ===", order.getIdOrder());
        log.info("Order.completedAt = {}", order.getCompletedAt());
        log.info("Order.deliveredAt = {}", order.getDeliveredAt());
        log.info("Order.orderDate = {}", order.getOrderDate());
        log.info("Order.returnWindowDays = {}", order.getReturnWindowDays());
        
        // Lấy returnWindowDays từ snapshot trong order, KHÔNG dùng config toàn cục
        Integer returnWindowDays = order.getReturnWindowDays();
        
        // Nếu returnWindowDays = null → ĐƠN CŨ chưa có snapshot, cho phép đổi/trả
        // Nếu returnWindowDays = 0 → Không giới hạn thời gian
        if (returnWindowDays == null) {
            log.warn("Order {} has NULL returnWindowDays (old order without snapshot), ALLOWING return", 
                    order.getIdOrder());
            return; // Cho phép đổi/trả cho đơn cũ
        }
        
        if (returnWindowDays == 0) {
            log.info("Order {} has returnWindowDays=0 (no limit), ALLOWING return", order.getIdOrder());
            return;
        }
        
        // Lấy mốc thời gian: completedAt → deliveredAt → orderDate
        LocalDateTime baseTime = order.getCompletedAt();
        String baseTimeSource = "completedAt";
        
        if (baseTime == null) {
            baseTime = order.getDeliveredAt();
            baseTimeSource = "deliveredAt";
        }
        if (baseTime == null) {
            baseTime = order.getOrderDate();
            baseTimeSource = "orderDate";
        }
        
        log.info("BaseTime = {} (source: {})", baseTime, baseTimeSource);
        
        if (baseTime == null) {
            log.warn("Order {} has no baseTime (all dates null), ALLOWING return", order.getIdOrder());
            return;
        }
        
        // Tính deadline = baseTime + returnWindowDays
        LocalDateTime expireAt = baseTime.plusDays(returnWindowDays);
        LocalDateTime now = LocalDateTime.now();
        
        log.info("ExpireAt = {} (baseTime + {} days)", expireAt, returnWindowDays);
        log.info("Now = {}", now);
        log.info("Is expired? now.isAfter(expireAt) = {}", now.isAfter(expireAt));
        
        // So sánh: nếu now > expireAt thì quá hạn
        if (now.isAfter(expireAt)) {
            log.error("Order {} REJECTED - past return deadline. BaseTime: {}, ExpireAt: {}, Now: {}", 
                    order.getIdOrder(), baseTime, expireAt, now);
            throw new RuntimeException("Đơn hàng đã quá hạn đổi/trả (" + returnWindowDays + " ngày kể từ khi hoàn thành)");
        }
        
        log.info("Order {} ALLOWED - within return window. ExpireAt: {}", order.getIdOrder(), expireAt);
    }
}