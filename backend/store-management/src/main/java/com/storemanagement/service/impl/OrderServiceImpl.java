package com.storemanagement.service.impl;

import com.storemanagement.dto.customer.CustomerDTO;
import com.storemanagement.dto.order.OrderDTO;
import com.storemanagement.dto.order.OrderDetailDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.OrderMapper;
import com.storemanagement.model.*;
import com.storemanagement.repository.*;
import com.storemanagement.service.CartService;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.GHNService;
import com.storemanagement.service.OrderService;
import com.storemanagement.service.PdfService;
import com.storemanagement.service.PromotionService;
import com.storemanagement.service.SystemSettingService;
import com.storemanagement.utils.PageUtils;
import com.storemanagement.utils.ProductStatus;
import com.storemanagement.utils.ReferenceType;
import com.storemanagement.utils.TransactionType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final PdfService pdfService;
    private final CartService cartService;
    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final CustomerService customerService;
    private final EmployeeRepository employeeRepository;
    private final ProductRepository productRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ShipmentRepository shipmentRepository;
    private final EntityManager entityManager;
    private final GHNService ghnService;
    private final PromotionService promotionService;
    private final PromotionRepository promotionRepository;
    private final PromotionRuleRepository promotionRuleRepository;
    private final SystemSettingService systemSettingService;

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Integer id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Đơn hàng không tồn tại với ID: " + id));

        return orderMapper.toDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportOrderToPdf(Integer id) {
        OrderDTO orderDto = getOrderById(id);
        return pdfService.generateInvoicePdf(orderDto);
    }

    @Override
    public OrderDTO createOrderFromCart(Integer customerId, OrderDTO request) {
        log.info("Creating order from cart for customer: {}", customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        Cart cart = cartRepository.findByCustomerIdCustomer(customerId)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng trống"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();

            if (product.getStatus() == ProductStatus.OUT_OF_STOCK ||
                    product.getStatus() == ProductStatus.DISCONTINUED ||
                    Boolean.TRUE.equals(product.getIsDelete())) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không còn khả dụng");
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng. Còn lại: "
                        + product.getStockQuantity());
            }
        }

        ShippingAddress shippingAddress = null;
        String shippingAddressSnapshot = null;

        if (request.getShippingAddressId() != null) {
            shippingAddress = shippingAddressRepository
                    .findByIdShippingAddressAndCustomerIdCustomer(request.getShippingAddressId(), customerId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ giao hàng"));
            shippingAddressSnapshot = buildAddressSnapshot(shippingAddress);
        } else {
            shippingAddress = shippingAddressRepository
                    .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                    .orElse(null);

            if (shippingAddress != null) {
                shippingAddressSnapshot = buildAddressSnapshot(shippingAddress);
            } else if (customer.getAddress() != null && !customer.getAddress().isEmpty()) {
                shippingAddressSnapshot = customer.getCustomerName() + ", " + customer.getAddress() + ", "
                        + customer.getPhoneNumber();
            }
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cart.getCartItems()) {
            BigDecimal itemTotal = item.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        String promotionCode = request.getPromotionCode();
        String customerType = customer.getCustomerType() != null ? customer.getCustomerType().name() : "REGULAR";
        BigDecimal discount = promotionService.calculateDiscountForOrder(totalAmount, promotionCode, customerType);

        Promotion promotion = null;
        PromotionRule promotionRule = null;

        if (promotionCode != null && !promotionCode.trim().isEmpty()) {
            promotion = promotionRepository.findByCodeAndIsActiveTrue(promotionCode.trim()).orElse(null);
        } else {
            LocalDateTime now = LocalDateTime.now();
            List<PromotionRule> rules = promotionRuleRepository.findApplicableRules(now, totalAmount, customerType);
            if (!rules.isEmpty()) {
                promotionRule = rules.get(0);
            }
        }

        Order order = Order.builder()
                .customer(customer)
                .employee(null)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(discount)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(shippingAddress)
                .shippingAddressSnapshot(shippingAddressSnapshot)
                .promotion(promotion)
                .promotionCode(promotionCode)
                .promotionRule(promotionRule)
                .shippingFee(request.getShippingFee())
                .orderDetails(new ArrayList<>())
                .build();

        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();

            String productName = product.getProductName();
            String productCode = product.getProductCode();
            String productImage = product.getImageUrl();
            BigDecimal productPrice = product.getPrice();

            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(productPrice)
                    .productNameSnapshot(productName)
                    .productCodeSnapshot(productCode)
                    .productImageSnapshot(productImage)
                    .build();

            order.getOrderDetails().add(orderDetail);

            if (request.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
                product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());

                if (product.getStockQuantity() == 0) {
                    product.setStatus(ProductStatus.OUT_OF_STOCK);
                }

                productRepository.save(product);
            } else {
                log.info("Payment method is PAYOS. Stock will be deducted when payment is confirmed via webhook.");
            }
        }

        Order savedOrder = orderRepository.save(order);

        entityManager.refresh(savedOrder);

        if (promotion != null && savedOrder.getIdOrder() != null) {
            try {
                promotionService.recordPromotionUsage(promotion.getIdPromotion(), savedOrder.getIdOrder(), customerId);
                log.info("Promotion usage recorded for order ID: {}, promotion ID: {}", savedOrder.getIdOrder(),
                        promotion.getIdPromotion());
            } catch (Exception e) {
                log.error("Error recording promotion usage for order ID: {}", savedOrder.getIdOrder(), e);
            }
        }

        if (request.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            for (OrderDetail orderDetail : savedOrder.getOrderDetails()) {
                InventoryTransaction transaction = InventoryTransaction.builder()
                        .product(orderDetail.getProduct())
                        .transactionType(TransactionType.OUT)
                        .quantity(orderDetail.getQuantity())
                        .referenceType(ReferenceType.SALE_ORDER)
                        .referenceId(savedOrder.getIdOrder())
                        .notes("Đơn hàng từ khách hàng")
                        .transactionDate(LocalDateTime.now())
                        .build();
                inventoryTransactionRepository.save(transaction);
            }
        } else {
            log.info(
                    "Payment method is PAYOS. Inventory transactions will be created when payment is confirmed via webhook.");
        }

        createShipmentAndIntegrateGHN(savedOrder, shippingAddress, totalAmount);

        cartService.clearCart(customerId);

        log.info("Order created successfully: {}", savedOrder.getIdOrder());

        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public OrderDTO createOrderDirectly(Integer customerId, OrderDTO request) {
        log.info("Creating order directly (Buy Now) for customer: {}, product: {}, quantity: {}, paymentMethod: {}",
                customerId, request.getProductId(), request.getQuantity(), request.getPaymentMethod());

        if (request.getProductId() == null) {
            throw new IllegalArgumentException("Vui lòng chọn sản phẩm");
        }
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        if (request.getPaymentMethod() == null) {
            throw new IllegalArgumentException("Vui lòng chọn phương thức thanh toán");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

        if (product.getStatus() == ProductStatus.OUT_OF_STOCK ||
                product.getStatus() == ProductStatus.DISCONTINUED ||
                Boolean.TRUE.equals(product.getIsDelete())) {
            throw new RuntimeException("Sản phẩm " + product.getProductName() + " không còn khả dụng");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng. Còn lại: "
                    + product.getStockQuantity());
        }

        ShippingAddress shippingAddress = null;
        String shippingAddressSnapshot = null;

        if (request.getShippingAddressId() != null) {
            shippingAddress = shippingAddressRepository
                    .findByIdShippingAddressAndCustomerIdCustomer(request.getShippingAddressId(), customerId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ giao hàng"));
            shippingAddressSnapshot = buildAddressSnapshot(shippingAddress);
        } else {
            shippingAddress = shippingAddressRepository
                    .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                    .orElse(null);

            if (shippingAddress != null) {
                shippingAddressSnapshot = buildAddressSnapshot(shippingAddress);
            } else if (customer.getAddress() != null && !customer.getAddress().isEmpty()) {
                shippingAddressSnapshot = customer.getCustomerName() + ", " + customer.getAddress() + ", "
                        + customer.getPhoneNumber();
            }
        }

        BigDecimal totalAmount = product.getPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        String promotionCode = request.getPromotionCode();
        String customerType = customer.getCustomerType() != null ? customer.getCustomerType().name() : "REGULAR";
        BigDecimal discount = promotionService.calculateDiscountForOrder(totalAmount, promotionCode, customerType);

        Promotion promotion = null;
        PromotionRule promotionRule = null;

        if (promotionCode != null && !promotionCode.trim().isEmpty()) {
            promotion = promotionRepository.findByCodeAndIsActiveTrue(promotionCode.trim()).orElse(null);
        } else {
            LocalDateTime now = LocalDateTime.now();
            List<PromotionRule> rules = promotionRuleRepository.findApplicableRules(now, totalAmount, customerType);
            if (!rules.isEmpty()) {
                promotionRule = rules.get(0);
            }
        }

        Order order = Order.builder()
                .customer(customer)
                .employee(null)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(discount)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(shippingAddress)
                .shippingAddressSnapshot(shippingAddressSnapshot)
                .promotion(promotion)
                .promotionCode(promotionCode)
                .promotionRule(promotionRule)
                .shippingFee(request.getShippingFee())
                .orderDetails(new ArrayList<>())
                .build();

        String productName = product.getProductName();
        String productCode = product.getProductCode();
        String productImage = product.getImageUrl();
        BigDecimal productPrice = product.getPrice();

        OrderDetail orderDetail = OrderDetail.builder()
                .order(order)
                .product(product)
                .quantity(request.getQuantity())
                .price(productPrice)
                .productNameSnapshot(productName)
                .productCodeSnapshot(productCode)
                .productImageSnapshot(productImage)
                .build();

        order.getOrderDetails().add(orderDetail);

        if (request.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
            if (product.getStockQuantity() == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);
        } else {
            log.info("Payment method is PAYOS. Stock will be deducted when payment is confirmed via webhook.");
        }

        Order savedOrder = orderRepository.save(order);

        entityManager.refresh(savedOrder);

        if (promotion != null && savedOrder.getIdOrder() != null) {
            try {
                promotionService.recordPromotionUsage(promotion.getIdPromotion(), savedOrder.getIdOrder(), customerId);
                log.info("Promotion usage recorded for order ID: {}, promotion ID: {}", savedOrder.getIdOrder(),
                        promotion.getIdPromotion());
            } catch (Exception e) {
                log.error("Error recording promotion usage for order ID: {}", savedOrder.getIdOrder(), e);
            }
        }

        if (request.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(product)
                    .transactionType(TransactionType.OUT)
                    .quantity(request.getQuantity())
                    .referenceType(ReferenceType.SALE_ORDER)
                    .referenceId(savedOrder.getIdOrder())
                    .notes("Đơn hàng từ khách hàng (Buy Now)")
                    .transactionDate(LocalDateTime.now())
                    .build();
            inventoryTransactionRepository.save(transaction);
        } else {
            log.info(
                    "Payment method is PAYOS. Inventory transactions will be created when payment is confirmed via webhook.");
        }

        createShipmentAndIntegrateGHN(savedOrder, shippingAddress, totalAmount);

        log.info("Order created successfully (Buy Now): {}", savedOrder.getIdOrder());

        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderDTO> getMyOrders(Integer customerId, Order.OrderStatus status, String keyword,
            Pageable pageable) {
        log.info("Getting orders for customer: {}, status filter: {}, keyword: {}", customerId, status, keyword);

        Page<Order> orderPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            orderPage = orderRepository.searchMyOrders(customerId, status, keyword.trim(), pageable);
        } else if (status != null) {
            orderPage = orderRepository.findByCustomerIdCustomerAndStatusOrderByOrderDateDesc(customerId, status,
                    pageable);
        } else {
            orderPage = orderRepository.findByCustomerIdCustomerOrderByOrderDateDesc(customerId, pageable);
        }

        return PageUtils.toPageResponse(orderPage, orderMapper.toDTOList(orderPage.getContent()));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getMyOrderById(Integer customerId, Integer orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Không có quyền xem đơn hàng này");
        }

        return orderMapper.toDTO(order);
    }

    @Override
    public OrderDTO cancelOrder(Integer customerId, Integer orderId) {
        log.info("Cancelling order {} for customer: {}", orderId, customerId);

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Không có quyền hủy đơn hàng này");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái PENDING");
        }

        for (OrderDetail detail : order.getOrderDetails()) {
            Product product = detail.getProduct();

            product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());

            if (product.getStatus() == ProductStatus.OUT_OF_STOCK && product.getStockQuantity() > 0) {
                product.setStatus(ProductStatus.IN_STOCK);
            }

            productRepository.save(product);

            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(product)
                    .transactionType(TransactionType.IN)
                    .quantity(detail.getQuantity())
                    .referenceType(ReferenceType.SALE_ORDER)
                    .referenceId(order.getIdOrder())
                    .notes("Hủy đơn hàng - hoàn trả hàng vào kho")
                    .transactionDate(LocalDateTime.now())
                    .build();
            inventoryTransactionRepository.save(transaction);
        }

        order.setStatus(Order.OrderStatus.CANCELED);
        Order savedOrder = orderRepository.save(order);

        log.info("Order cancelled successfully: {}", orderId);

        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public OrderDTO createOrderForCustomer(Integer employeeId, OrderDTO request) {
        log.info("Creating order for customer by {}, customerId: {}",
                employeeId != null ? "employee: " + employeeId : "admin",
                request.getIdCustomer());

        Customer customer;
        if (request.getIdCustomer() != null) {
            customer = customerRepository.findById(request.getIdCustomer())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy khách hàng với ID: " + request.getIdCustomer()));
        } else {
            if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
                throw new RuntimeException("Tên khách hàng không được để trống");
            }
            if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
                throw new RuntimeException("Số điện thoại khách hàng không được để trống");
            }

            customer = customerRepository.findByPhoneNumber(request.getCustomerPhone())
                    .orElse(null);

            if (customer == null) {
                CustomerDTO newCustomerDTO = customerService.createCustomerWithoutUser(
                        request.getCustomerName(),
                        request.getCustomerPhone(),
                        request.getCustomerAddress());
                customer = customerRepository.findById(newCustomerDTO.getIdCustomer())
                        .orElseThrow(() -> new RuntimeException("Lỗi khi tạo khách hàng mới"));
                log.info("Tạo customer mới (walk-in) với ID: {}", customer.getIdCustomer());
            } else {
                log.info("Customer đã tồn tại với số điện thoại: {}, sử dụng customer ID: {}",
                        request.getCustomerPhone(), customer.getIdCustomer());
            }
        }

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên với ID: " + employeeId));
        }

        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm không được để trống");
        }

        for (OrderDetailDTO item : request.getOrderItems()) {
            Integer productId = item.getProductId() != null ? item.getProductId() : item.getIdProduct();
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + productId));

            if (product.getStatus() == ProductStatus.OUT_OF_STOCK ||
                    product.getStatus() == ProductStatus.DISCONTINUED ||
                    Boolean.TRUE.equals(product.getIsDelete())) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không còn khả dụng");
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng. Còn lại: "
                        + product.getStockQuantity());
            }
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderDetailDTO item : request.getOrderItems()) {
            Integer productId = item.getProductId() != null ? item.getProductId() : item.getIdProduct();
            Product product = productRepository.findById(productId).orElseThrow();
            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO;
        }
        if (discount.compareTo(totalAmount) > 0) {
            discount = totalAmount;
        }

        String shippingAddressSnapshot = customer.getCustomerName() + ", " +
                (customer.getAddress() != null ? customer.getAddress() : "") + ", " +
                customer.getPhoneNumber();

        Order order = Order.builder()
                .customer(customer)
                .employee(employee)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(discount)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(null)
                .shippingAddressSnapshot(shippingAddressSnapshot)
                .orderDetails(new ArrayList<>())
                .build();

        for (OrderDetailDTO item : request.getOrderItems()) {
            Integer productId = item.getProductId() != null ? item.getProductId() : item.getIdProduct();
            Product product = productRepository.findById(productId).orElseThrow();

            String productName = product.getProductName();
            String productCode = product.getProductCode();
            String productImage = product.getImageUrl();
            BigDecimal productPrice = product.getPrice();

            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(productPrice)
                    .productNameSnapshot(productName)
                    .productCodeSnapshot(productCode)
                    .productImageSnapshot(productImage)
                    .build();

            order.getOrderDetails().add(orderDetail);

            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            if (product.getStockQuantity() == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);
        }

        Order savedOrder = orderRepository.save(order);

        entityManager.refresh(savedOrder);

        for (OrderDetail orderDetail : savedOrder.getOrderDetails()) {
            String transactionNote = employee != null
                    ? "Đơn hàng từ nhân viên cho khách hàng"
                    : "Đơn hàng từ admin cho khách hàng";

            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(orderDetail.getProduct())
                    .transactionType(TransactionType.OUT)
                    .quantity(orderDetail.getQuantity())
                    .referenceType(ReferenceType.SALE_ORDER)
                    .referenceId(savedOrder.getIdOrder())
                    .notes(transactionNote)
                    .transactionDate(LocalDateTime.now())
                    .build();
            inventoryTransactionRepository.save(transaction);
        }

        if (savedOrder.getShippingAddress() != null) {
            createShipmentAndIntegrateGHN(savedOrder, savedOrder.getShippingAddress(), totalAmount);
        }

        log.info("Order created successfully for customer by employee: {}", savedOrder.getIdOrder());

        return orderMapper.toDTO(savedOrder);
    }

    private String buildAddressSnapshot(ShippingAddress address) {
        return address.getRecipientName() + ", " + address.getAddress() + ", " + address.getPhoneNumber();
    }

    @Override
    public OrderDTO confirmDelivery(Integer customerId, Integer orderId) {
        log.info("Confirming delivery for order {} by customer: {}", orderId, customerId);

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Không có quyền xác nhận đơn hàng này");
        }

        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ có thể xác nhận nhận hàng khi đơn hàng ở trạng thái CONFIRMED");
        }

        Shipment shipment = shipmentRepository.findByOrder_IdOrder(orderId)
                .orElseGet(() -> {
                    log.info("Creating new shipment for order: {}", orderId);
                    return Shipment.builder()
                            .order(order)
                            .shippingStatus(Shipment.ShippingStatus.PREPARING)
                            .build();
                });

        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setDeliveredAt(LocalDateTime.now());
        order.setCompletedAt(LocalDateTime.now());

        int returnWindowDays = systemSettingService.getReturnWindowDays();
        order.setReturnWindowDays(returnWindowDays);
        log.info("Order COMPLETED: completedAt={}, returnWindowDays={} for order: {}", order.getCompletedAt(),
                returnWindowDays, orderId);

        shipment.setShippingStatus(Shipment.ShippingStatus.DELIVERED);

        Order savedOrder = orderRepository.save(order);
        shipmentRepository.save(shipment);

        log.info("Delivery confirmed successfully for order: {}", orderId);

        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderDTO> getAllOrders(Order.OrderStatus status, Integer customerId, String keyword,
            Pageable pageable) {
        log.info("Getting all orders with filters - status: {}, customerId: {}, keyword: {}", status, customerId,
                keyword);

        Page<Order> orderPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            orderPage = orderRepository.searchByFilters(customerId, status, keyword.trim(), pageable);
        } else if (customerId != null || status != null) {
            orderPage = orderRepository.findByFilters(customerId, status, pageable);
        } else {
            orderPage = orderRepository.findAllOrdersByOrderDateDesc(pageable);
        }

        return PageUtils.toPageResponse(orderPage, orderMapper.toDTOList(orderPage.getContent()));
    }

    @Override
    public OrderDTO updateOrderStatus(Integer orderId, Order.OrderStatus newStatus) {
        log.info("Updating order status: orderId={}, newStatus={}", orderId, newStatus);

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        Order.OrderStatus currentStatus = order.getStatus();

        if (currentStatus == Order.OrderStatus.CANCELED) {
            throw new RuntimeException("Không thể cập nhật đơn hàng đã bị hủy");
        }

        if (currentStatus == Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Không thể cập nhật đơn hàng đã hoàn thành");
        }

        if (newStatus == Order.OrderStatus.PENDING &&
                (currentStatus == Order.OrderStatus.CONFIRMED || currentStatus == Order.OrderStatus.COMPLETED)) {
            throw new RuntimeException("Không thể chuyển đơn hàng từ " + currentStatus + " về PENDING");
        }

        if (newStatus == Order.OrderStatus.CANCELED && currentStatus != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái PENDING");
        }

        if (newStatus == Order.OrderStatus.CANCELED) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = detail.getProduct();

                product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());

                if (product.getStatus() == ProductStatus.OUT_OF_STOCK && product.getStockQuantity() > 0) {
                    product.setStatus(ProductStatus.IN_STOCK);
                }

                productRepository.save(product);

                InventoryTransaction transaction = InventoryTransaction.builder()
                        .product(product)
                        .transactionType(TransactionType.IN)
                        .quantity(detail.getQuantity())
                        .referenceType(ReferenceType.SALE_ORDER)
                        .referenceId(order.getIdOrder())
                        .notes("Hủy đơn hàng bởi Admin/Employee - hoàn trả hàng vào kho")
                        .transactionDate(LocalDateTime.now())
                        .build();
                inventoryTransactionRepository.save(transaction);
            }
        }

        order.setStatus(newStatus);

        if (newStatus == Order.OrderStatus.COMPLETED) {
            LocalDateTime now = LocalDateTime.now();
            order.setDeliveredAt(now);
            order.setCompletedAt(now);
            int returnWindowDays = systemSettingService.getReturnWindowDays();
            order.setReturnWindowDays(returnWindowDays);
            log.info("Order COMPLETED: completedAt={}, returnWindowDays={} for order: {}",
                    now, returnWindowDays, orderId);
        }

        Order savedOrder = orderRepository.save(order);

        log.info("Order status updated successfully: orderId={}, oldStatus={}, newStatus={}",
                orderId, currentStatus, newStatus);

        return orderMapper.toDTO(savedOrder);
    }

    private void createShipmentAndIntegrateGHN(Order order, ShippingAddress shippingAddress,
            BigDecimal orderTotalAmount) {
        log.info("Creating shipment and integrating GHN for order ID: {}", order.getIdOrder());

        if (shipmentRepository.findByOrder_IdOrder(order.getIdOrder()).isPresent()) {
            log.info("Shipment already exists for order ID: {}. Skipping.", order.getIdOrder());
            return;
        }

        Shipment shipment = Shipment.builder()
                .order(order)
                .shippingStatus(Shipment.ShippingStatus.PREPARING)
                .shippingMethod(Shipment.ShippingMethod.GHN)
                .build();

        if (ghnService.isEnabled() && shippingAddress != null) {
            try {
                String ghnOrderCode = ghnService.createGHNOrder(order, shippingAddress);
                shipment.setTrackingNumber(ghnOrderCode);
                shipment.setShippingStatus(Shipment.ShippingStatus.PICKING_UP);
                log.info("GHN order created successfully: {}", ghnOrderCode);
            } catch (Exception e) {
                log.error("Failed to create GHN order for order ID: {}", order.getIdOrder(), e);
            }
        }

        shipmentRepository.save(shipment);
    }
}
