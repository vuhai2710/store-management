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

        // ========== PHASE 1: VALIDATION ==========

        // Bước 1.1: Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        // Bước 1.2: Kiểm tra giỏ hàng không rỗng
        Cart cart = cartRepository.findByCustomerIdCustomer(customerId)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng trống"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        // Bước 1.3: Validate trạng thái và tồn kho của tất cả sản phẩm
        // Kiểm tra trước khi tạo order để tránh lỗi sau này
        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();

            // Không cho phép sản phẩm đã hết hàng hoặc ngừng kinh doanh
            if (product.getStatus() == ProductStatus.OUT_OF_STOCK ||
                    product.getStatus() == ProductStatus.DISCONTINUED) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không còn khả dụng");
            }

            // Kiểm tra tồn kho đủ không
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng. Còn lại: "
                        + product.getStockQuantity());
            }
        }

        ShippingAddress shippingAddress = null;
        String shippingAddressSnapshot = null;

        if (request.getShippingAddressId() != null) {
            // Nếu có chỉ định địa chỉ → Sử dụng địa chỉ đó
            shippingAddress = shippingAddressRepository
                    .findByIdShippingAddressAndCustomerIdCustomer(request.getShippingAddressId(), customerId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ giao hàng"));
            shippingAddressSnapshot = buildAddressSnapshot(shippingAddress);
        } else {
            // Nếu không chỉ định → Tìm địa chỉ mặc định
            shippingAddress = shippingAddressRepository
                    .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                    .orElse(null);

            if (shippingAddress != null) {
                // Có địa chỉ mặc định → Sử dụng
                shippingAddressSnapshot = buildAddressSnapshot(shippingAddress);
            } else if (customer.getAddress() != null && !customer.getAddress().isEmpty()) {
                // Không có địa chỉ mặc định → Fallback về địa chỉ trong customer profile
                shippingAddressSnapshot = customer.getCustomerName() + ", " + customer.getAddress() + ", "
                        + customer.getPhoneNumber();
            }
        }

        // Tính tổng tiền từ giá hiện tại của sản phẩm
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cart.getCartItems()) {
            BigDecimal itemTotal = item.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // Calculate discount using PromotionService
        String promotionCode = request.getPromotionCode();
        String customerType = customer.getCustomerType() != null ? customer.getCustomerType().name() : "REGULAR";
        BigDecimal discount = promotionService.calculateDiscountForOrder(totalAmount, promotionCode, customerType);

        // Get promotion and promotion rule if applicable
        Promotion promotion = null;
        PromotionRule promotionRule = null;

        if (promotionCode != null && !promotionCode.trim().isEmpty()) {
            // If promotion code was used, get the promotion
            promotion = promotionRepository.findByCodeAndIsActiveTrue(promotionCode.trim()).orElse(null);
        } else {
            // If no promotion code, check for automatic discount rule
            LocalDateTime now = LocalDateTime.now();
            List<PromotionRule> rules = promotionRuleRepository.findApplicableRules(now, totalAmount, customerType);
            if (!rules.isEmpty()) {
                promotionRule = rules.get(0); // Get first rule (highest priority)
            }
        }

        // Tạo order với status = PENDING (chờ xác nhận)
        Order order = Order.builder()
                .customer(customer)
                .employee(null) // Customer order, không có employee
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(discount) // Discount from promotion or rule
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(shippingAddress) // Reference đến shipping address
                .shippingAddressSnapshot(shippingAddressSnapshot) // Snapshot để bảo vệ
                .promotion(promotion) // Promotion if coupon code was used
                .promotionCode(promotionCode) // Promotion code
                .promotionRule(promotionRule) // Promotion rule if automatic discount was applied
                .shippingFee(request.getShippingFee()) // Phí giao hàng từ FE
                .orderDetails(new ArrayList<>())
                .build();

        // Với mỗi sản phẩm trong giỏ, tạo order detail với snapshot
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();

            // Lấy thông tin sản phẩm hiện tại để snapshot
            String productName = product.getProductName();
            String productCode = product.getProductCode();
            String productImage = product.getImageUrl();
            BigDecimal productPrice = product.getPrice();

            // Tạo order detail với snapshot
            // Snapshot này đảm bảo khi admin chỉnh sửa sản phẩm, đơn hàng vẫn giữ nguyên
            // thông tin
            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(product) // Vẫn giữ reference để có thể trace
                    .quantity(cartItem.getQuantity())
                    .price(productPrice) // Giá tại thời điểm mua
                    .productNameSnapshot(productName) // Snapshot tên sản phẩm
                    .productCodeSnapshot(productCode) // Snapshot mã sản phẩm
                    .productImageSnapshot(productImage) // Snapshot URL ảnh
                    .build();

            order.getOrderDetails().add(orderDetail);

            // Cập nhật tồn kho: Trừ số lượng đã bán
            // LƯU Ý: Nếu paymentMethod = PAYOS, KHÔNG trừ stock ngay
            // Stock sẽ được trừ khi webhook xác nhận thanh toán thành công
            if (request.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
                product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());

                // Nếu hết hàng → Cập nhật status
                if (product.getStockQuantity() == 0) {
                    product.setStatus(ProductStatus.OUT_OF_STOCK);
                }

                // Lưu product với số lượng mới
                productRepository.save(product);
            } else {
                log.info("Payment method is PAYOS. Stock will be deducted when payment is confirmed via webhook.");
            }
        }

        // Lưu order vào database (có cascade nên order details cũng được lưu)
        Order savedOrder = orderRepository.save(order);

        // Refresh entity để load finalAmount (generated column từ database)
        entityManager.refresh(savedOrder);

        // ========== PHASE 5.5: RECORD PROMOTION USAGE ==========

        // Record promotion usage if promotion code was used
        if (promotion != null && savedOrder.getIdOrder() != null) {
            try {
                promotionService.recordPromotionUsage(promotion.getIdPromotion(), savedOrder.getIdOrder(), customerId);
                log.info("Promotion usage recorded for order ID: {}, promotion ID: {}", savedOrder.getIdOrder(),
                        promotion.getIdPromotion());
            } catch (Exception e) {
                log.error("Error recording promotion usage for order ID: {}", savedOrder.getIdOrder(), e);
                // Don't fail the order creation if promotion usage recording fails
            }
        }
        // Tạo inventory transaction sau khi order được lưu (để có order ID)
        // Ghi lại lịch sử xuất kho để theo dõi
        // LƯU Ý: Nếu paymentMethod = PAYOS, KHÔNG tạo transaction ngay
        // Transaction sẽ được tạo khi webhook xác nhận thanh toán thành công
        if (request.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            for (OrderDetail orderDetail : savedOrder.getOrderDetails()) {
                InventoryTransaction transaction = InventoryTransaction.builder()
                        .product(orderDetail.getProduct())
                        .transactionType(TransactionType.OUT) // Xuất kho
                        .quantity(orderDetail.getQuantity())
                        .referenceType(ReferenceType.SALE_ORDER) // Reference đến đơn bán hàng
                        .referenceId(savedOrder.getIdOrder()) // ID của order
                        .notes("Đơn hàng từ khách hàng")
                        .transactionDate(LocalDateTime.now())
                        .build();
                inventoryTransactionRepository.save(transaction);
            }
        } else {
            log.info(
                    "Payment method is PAYOS. Inventory transactions will be created when payment is confirmed via webhook.");
        }

        // Tạo Shipment và tích hợp GHN (nếu có shipping address và GHN enabled)
        createShipmentAndIntegrateGHN(savedOrder, shippingAddress, totalAmount);

        // Xóa giỏ hàng sau khi tạo order thành công
        cartService.clearCart(customerId);

        log.info("Order created successfully: {}", savedOrder.getIdOrder());

        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public OrderDTO createOrderDirectly(Integer customerId, OrderDTO request) {
        log.info("Creating order directly (Buy Now) for customer: {}, product: {}, quantity: {}",
                customerId, request.getProductId(), request.getQuantity());

        // Bước 1.0: Validate input parameters
        if (request.getProductId() == null) {
            throw new IllegalArgumentException("Vui lòng chọn sản phẩm");
        }
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        // Bước 1.1: Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        // Bước 1.2: Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

        // Bước 1.3: Validate trạng thái sản phẩm
        if (product.getStatus() == ProductStatus.OUT_OF_STOCK ||
                product.getStatus() == ProductStatus.DISCONTINUED) {
            throw new RuntimeException("Sản phẩm " + product.getProductName() + " không còn khả dụng");
        }

        // Bước 1.4: Kiểm tra tồn kho đủ
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

        // Calculate discount using PromotionService
        String promotionCode = request.getPromotionCode();
        String customerType = customer.getCustomerType() != null ? customer.getCustomerType().name() : "REGULAR";
        BigDecimal discount = promotionService.calculateDiscountForOrder(totalAmount, promotionCode, customerType);

        // Get promotion and promotion rule if applicable
        Promotion promotion = null;
        PromotionRule promotionRule = null;

        if (promotionCode != null && !promotionCode.trim().isEmpty()) {
            // If promotion code was used, get the promotion
            promotion = promotionRepository.findByCodeAndIsActiveTrue(promotionCode.trim()).orElse(null);
        } else {
            // If no promotion code, check for automatic discount rule
            LocalDateTime now = LocalDateTime.now();
            List<PromotionRule> rules = promotionRuleRepository.findApplicableRules(now, totalAmount, customerType);
            if (!rules.isEmpty()) {
                promotionRule = rules.get(0); // Get first rule (highest priority)
            }
        }

        Order order = Order.builder()
                .customer(customer)
                .employee(null)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(discount) // Discount from promotion or rule
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(shippingAddress)
                .shippingAddressSnapshot(shippingAddressSnapshot)
                .promotion(promotion) // Promotion if coupon code was used
                .promotionCode(promotionCode) // Promotion code
                .promotionRule(promotionRule) // Promotion rule if automatic discount was applied
                .shippingFee(request.getShippingFee()) // Phí giao hàng từ FE
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

        // Cập nhật tồn kho
        // LƯU Ý: Nếu paymentMethod = PAYOS, KHÔNG trừ stock ngay
        // Stock sẽ được trừ khi webhook xác nhận thanh toán thành công
        if (request.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
            if (product.getStockQuantity() == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);
        } else {
            log.info("Payment method is PAYOS. Stock will be deducted when payment is confirmed via webhook.");
        }

        // Lưu order
        Order savedOrder = orderRepository.save(order);

        // Refresh entity để load finalAmount (generated column từ database)
        entityManager.refresh(savedOrder);

        // Record promotion usage if promotion code was used
        if (promotion != null && savedOrder.getIdOrder() != null) {
            try {
                promotionService.recordPromotionUsage(promotion.getIdPromotion(), savedOrder.getIdOrder(), customerId);
                log.info("Promotion usage recorded for order ID: {}, promotion ID: {}", savedOrder.getIdOrder(),
                        promotion.getIdPromotion());
            } catch (Exception e) {
                log.error("Error recording promotion usage for order ID: {}", savedOrder.getIdOrder(), e);
                // Don't fail the order creation if promotion usage recording fails
            }
        }

        // LƯU Ý: Nếu paymentMethod = PAYOS, KHÔNG tạo transaction ngay
        // Transaction sẽ được tạo khi webhook xác nhận thanh toán thành công
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

        // Tạo Shipment và tích hợp GHN (nếu có shipping address và GHN enabled)
        createShipmentAndIntegrateGHN(savedOrder, shippingAddress, totalAmount);

        log.info("Order created successfully (Buy Now): {}", savedOrder.getIdOrder());

        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderDTO> getMyOrders(Integer customerId, Order.OrderStatus status, Pageable pageable) {
        log.info("Getting orders for customer: {}, status filter: {}", customerId, status);

        Page<Order> orderPage;

        // Nếu có status filter → Gọi method filter theo status
        if (status != null) {
            orderPage = orderRepository.findByCustomerIdCustomerAndStatusOrderByOrderDateDesc(customerId, status,
                    pageable);
        } else {
            // Nếu không có status filter → Lấy tất cả đơn hàng
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

        // ========== PHASE 1: VALIDATION ==========

        // Bước 1.1: Kiểm tra đơn hàng tồn tại
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        // Bước 1.2: Kiểm tra quyền - Đơn hàng phải thuộc về customer hiện tại
        if (!order.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Không có quyền hủy đơn hàng này");
        }

        // Bước 1.3: Kiểm tra trạng thái - Chỉ cho phép hủy khi PENDING
        // Đơn hàng đã được xác nhận hoặc hoàn thành không thể hủy
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái PENDING");
        }

        // Hoàn trả hàng vào kho cho tất cả sản phẩm trong đơn hàng
        for (OrderDetail detail : order.getOrderDetails()) {
            Product product = detail.getProduct();

            // Cộng lại số lượng vào kho
            product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());

            // Nếu product đang OUT_OF_STOCK và có hàng lại → Cập nhật status = IN_STOCK
            if (product.getStatus() == ProductStatus.OUT_OF_STOCK && product.getStockQuantity() > 0) {
                product.setStatus(ProductStatus.IN_STOCK);
            }

            // Lưu product với số lượng mới
            productRepository.save(product);

            // Tạo inventory transaction (IN) để ghi lại lịch sử hoàn trả
            // Giúp theo dõi việc hàng được hoàn trả vào kho
            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(product)
                    .transactionType(TransactionType.IN) // Nhập kho (hoàn trả)
                    .quantity(detail.getQuantity())
                    .referenceType(ReferenceType.SALE_ORDER)
                    .referenceId(order.getIdOrder())
                    .notes("Hủy đơn hàng - hoàn trả hàng vào kho")
                    .transactionDate(LocalDateTime.now())
                    .build();
            inventoryTransactionRepository.save(transaction);
        }

        // Cập nhật trạng thái đơn hàng thành CANCELED
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
            // Trường hợp 1: Có customerId → Sử dụng customer có sẵn trong hệ thống
            // Customer này có thể có hoặc không có User account
            customer = customerRepository.findById(request.getIdCustomer())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy khách hàng với ID: " + request.getIdCustomer()));
        } else {
            // Trường hợp 2: Không có customerId → Tạo đơn cho walk-in customer (khách hàng
            // không có tài khoản)

            // Validate thông tin bắt buộc để tạo customer mới
            if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
                throw new RuntimeException("Tên khách hàng không được để trống");
            }
            if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
                throw new RuntimeException("Số điện thoại khách hàng không được để trống");
            }

            // Kiểm tra xem customer đã tồn tại với số điện thoại này chưa
            // Logic: Nếu khách hàng quay lại với cùng số điện thoại, sử dụng customer hiện
            // tại
            // Điều này giúp theo dõi lịch sử mua hàng của cùng một khách hàng
            customer = customerRepository.findByPhoneNumber(request.getCustomerPhone())
                    .orElse(null);

            if (customer == null) {
                // Customer chưa tồn tại → Tạo customer mới không có User account
                // Customer này sẽ có id_user = NULL, chỉ lưu thông tin cơ bản (tên, phone,
                // address)
                // Vẫn có thể theo dõi lịch sử mua hàng qua Customer record
                CustomerDTO newCustomerDTO = customerService.createCustomerWithoutUser(
                        request.getCustomerName(),
                        request.getCustomerPhone(),
                        request.getCustomerAddress());
                customer = customerRepository.findById(newCustomerDTO.getIdCustomer())
                        .orElseThrow(() -> new RuntimeException("Lỗi khi tạo khách hàng mới"));
                log.info("Tạo customer mới (walk-in) với ID: {}", customer.getIdCustomer());
            } else {
                // Customer đã tồn tại với số điện thoại này → Sử dụng customer hiện tại
                // Điều này đảm bảo lịch sử mua hàng được gộp lại cho cùng một khách hàng
                log.info("Customer đã tồn tại với số điện thoại: {}, sử dụng customer ID: {}",
                        request.getCustomerPhone(), customer.getIdCustomer());
            }
        }

        Employee employee = null;
        if (employeeId != null) { // Nếu employeeId = null -> employee = null -> ADMIN tạo đơn
            // Nếu có employeeId -> Lấy employee từ DB
            employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên với ID: " + employeeId));
        }

        // Validate danh sách sản phẩm phải có ít nhất 1 item
        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm không được để trống");
        }

        // Validate tất cả sản phẩm trong danh sách
        for (OrderDetailDTO item : request.getOrderItems()) {
            Integer productId = item.getProductId() != null ? item.getProductId() : item.getIdProduct();
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + productId));

            if (product.getStatus() == ProductStatus.OUT_OF_STOCK ||
                    product.getStatus() == ProductStatus.DISCONTINUED) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không còn khả dụng");
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng. Còn lại: "
                        + product.getStockQuantity());
            }
        }

        // Tính tổng tiền từ tất cả sản phẩm trong đơn hàng
        // totalAmount = sum(quantity × price) cho mỗi sản phẩm
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderDetailDTO item : request.getOrderItems()) {
            Integer productId = item.getProductId() != null ? item.getProductId() : item.getIdProduct();
            Product product = productRepository.findById(productId).orElseThrow();
            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // Xử lý discount (giảm giá)
        // - Nếu không có discount → mặc định = 0
        // - Discount không được âm
        // - Discount không được lớn hơn totalAmount (đảm bảo finalAmount >= 0)
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO; // Không cho phép discount âm
        }
        if (discount.compareTo(totalAmount) > 0) {
            discount = totalAmount; // Discount không được lớn hơn totalAmount
        }
        // finalAmount sẽ được tính tự động bởi database: finalAmount = totalAmount -
        // discount

        // Tạo shipping address snapshot từ customer info
        // Snapshot này đảm bảo địa chỉ không bị ảnh hưởng nếu customer thay đổi thông
        // tin sau này
        // Format: "Tên khách hàng, Địa chỉ, Số điện thoại"
        String shippingAddressSnapshot = customer.getCustomerName() + ", " +
                (customer.getAddress() != null ? customer.getAddress() : "") + ", " +
                customer.getPhoneNumber();

        // Tạo order với đầy đủ thông tin
        // - customer: Khách hàng (có thể là walk-in customer hoặc customer có tài
        // khoản)
        // - employee: Nhân viên tạo đơn (lấy từ JWT token)
        // - status: PENDING (chờ xác nhận)
        // - shippingAddress: null vì walk-in customers không có shipping address trong
        // hệ thống
        // - shippingAddressSnapshot: Lưu snapshot để hiển thị sau này
        Order order = Order.builder()
                .customer(customer)
                .employee(employee) // Nhân viên tạo đơn -> có thể null nếu ADMIN tạo đơn
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(discount)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(null) // Walk-in customers không có shipping address entity
                .shippingAddressSnapshot(shippingAddressSnapshot) // Snapshot để hiển thị
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

            // Cập nhật tồn kho
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            if (product.getStockQuantity() == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);
        }

        // Lưu order
        Order savedOrder = orderRepository.save(order);

        // Refresh entity để load finalAmount (generated column từ database)
        entityManager.refresh(savedOrder);

        // ========== PHASE 7: INVENTORY TRANSACTION ==========

        for (OrderDetail orderDetail : savedOrder.getOrderDetails()) {
            // Tạo notes phân biệt ADMIN và EMPLOYEE
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

        // Tạo Shipment và tích hợp GHN (nếu có shipping address và GHN enabled)
        // Note: createOrderForCustomer thường không có shippingAddress entity, nên skip
        // GHN
        // Chỉ tạo Shipment cơ bản nếu cần
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

        // ========== PHASE 1: VALIDATION ==========

        // Bước 1.1: Kiểm tra order tồn tại
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        // Bước 1.2: Kiểm tra quyền - Đơn hàng phải thuộc về customer hiện tại
        if (!order.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Không có quyền xác nhận đơn hàng này");
        }

        // Bước 1.3: Kiểm tra trạng thái - Chỉ cho phép confirm khi CONFIRMED
        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ có thể xác nhận nhận hàng khi đơn hàng ở trạng thái CONFIRMED");
        }

        // Bước 1.4: Tìm shipment theo orderId (nếu không có thì tạo mới)
        Shipment shipment = shipmentRepository.findByOrder_IdOrder(orderId)
                .orElseGet(() -> {
                    // Tạo shipment mới nếu chưa có (trường hợp đơn hàng cũ)
                    log.info("Creating new shipment for order: {}", orderId);
                    return Shipment.builder()
                            .order(order)
                            .shippingStatus(Shipment.ShippingStatus.PREPARING)
                            .build();
                });

        // ========== PHASE 2: UPDATE ORDER & SHIPMENT ==========

        // Bước 2.1: Cập nhật order.status = COMPLETED
        order.setStatus(Order.OrderStatus.COMPLETED);

        // Bước 2.2: Set order.deliveredAt = hiện tại
        order.setDeliveredAt(LocalDateTime.now());

        // Bước 2.3: Set order.completedAt = hiện tại (dùng để tính hạn đổi trả)
        order.setCompletedAt(LocalDateTime.now());

        // Bước 2.4: Snapshot returnWindowDays từ system settings tại thời điểm hoàn thành
        int returnWindowDays = systemSettingService.getReturnWindowDays();
        order.setReturnWindowDays(returnWindowDays);
        log.info("Order COMPLETED: completedAt={}, returnWindowDays={} for order: {}", order.getCompletedAt(), returnWindowDays, orderId);

        // Bước 2.4: Cập nhật shipment.shippingStatus = DELIVERED
        shipment.setShippingStatus(Shipment.ShippingStatus.DELIVERED);

        // Bước 2.5: Lưu cả order và shipment
        Order savedOrder = orderRepository.save(order);
        shipmentRepository.save(shipment);

        log.info("Delivery confirmed successfully for order: {}", orderId);

        // ========== PHASE 3: RETURN ==========

        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderDTO> getAllOrders(Order.OrderStatus status, Integer customerId, Pageable pageable) {
        log.info("Getting all orders with filters - status: {}, customerId: {}", status, customerId);

        Page<Order> orderPage;

        // Áp dụng filters
        if (customerId != null || status != null) {
            // Có ít nhất 1 filter
            orderPage = orderRepository.findByFilters(customerId, status, pageable);
        } else {
            // Không có filter → Lấy tất cả
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

        // Business rules validation
        if (currentStatus == Order.OrderStatus.CANCELED) {
            throw new RuntimeException("Không thể cập nhật đơn hàng đã bị hủy");
        }

        if (currentStatus == Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Không thể cập nhật đơn hàng đã hoàn thành");
        }

        // Không cho phép quay lại PENDING từ CONFIRMED/COMPLETED
        if (newStatus == Order.OrderStatus.PENDING &&
                (currentStatus == Order.OrderStatus.CONFIRMED || currentStatus == Order.OrderStatus.COMPLETED)) {
            throw new RuntimeException("Không thể chuyển đơn hàng từ " + currentStatus + " về PENDING");
        }

        // CANCELED chỉ được set từ PENDING
        if (newStatus == Order.OrderStatus.CANCELED && currentStatus != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái PENDING");
        }

        // Nếu chuyển sang CANCELED → Hoàn trả hàng vào kho
        if (newStatus == Order.OrderStatus.CANCELED) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = detail.getProduct();

                // Cộng lại số lượng vào kho
                product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());

                // Nếu product đang OUT_OF_STOCK và có hàng lại → Cập nhật status = IN_STOCK
                if (product.getStatus() == ProductStatus.OUT_OF_STOCK && product.getStockQuantity() > 0) {
                    product.setStatus(ProductStatus.IN_STOCK);
                }

                productRepository.save(product);

                // Tạo inventory transaction (IN) để ghi lại lịch sử hoàn trả
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

        // Cập nhật status
        order.setStatus(newStatus);
        
        // Nếu chuyển sang COMPLETED → Set deliveredAt, completedAt và snapshot returnWindowDays
        if (newStatus == Order.OrderStatus.COMPLETED) {
            LocalDateTime now = LocalDateTime.now();
            order.setDeliveredAt(now);
            order.setCompletedAt(now); // Thời điểm hoàn thành dùng để tính hạn đổi trả
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

        // Kiểm tra đã có shipment chưa (tránh tạo duplicate)
        if (shipmentRepository.findByOrder_IdOrder(order.getIdOrder()).isPresent()) {
            log.info("Shipment already exists for order ID: {}. Skipping.", order.getIdOrder());
            return;
        }

        // Tạo Shipment entity cơ bản
        Shipment shipment = Shipment.builder()
                .order(order)
                .shippingStatus(Shipment.ShippingStatus.PREPARING)
                .shippingMethod(Shipment.ShippingMethod.GHN) // Mặc định sử dụng GHN
                .build();

        // Nếu GHN enabled và có shipping address, thử tích hợp GHN
        if (ghnService.isEnabled() && shippingAddress != null) {
            try {
                // Kiểm tra có đủ thông tin để tích hợp GHN (districtId, wardCode)
                if (shippingAddress.getDistrictId() != null && shippingAddress.getWardCode() != null) {
                    log.info("GHN integration: Using districtId={}, wardCode={} from ShippingAddress",
                            shippingAddress.getDistrictId(), shippingAddress.getWardCode());

                    // TODO: Get shop district_id from config or shop information
                    // For now, we'll skip full GHN integration until shop district is configured
                    // This is a placeholder for future implementation
                    // You can add shopDistrictId to GHNConfig if needed

                    // Calculate shipping fee (if shop district is configured)
                    // GHNCalculateFeeRequestDTO feeRequest = GHNCalculateFeeRequestDTO.builder()
                    // .fromDistrictId(ghnConfig.getShopDistrictId()) // TODO: Add to GHNConfig
                    // .toDistrictId(shippingAddress.getDistrictId())
                    // .toWardCode(shippingAddress.getWardCode())
                    // .weight(calculateTotalWeight(order.getOrderDetails()))
                    // .insuranceValue(order.getFinalAmount().intValue())
                    // .codAmount(order.getFinalAmount().intValue())
                    // .build();
                    //
                    // GHNCalculateFeeResponseDTO feeResponse =
                    // ghnService.calculateShippingFee(feeRequest);
                    // shipment.setGhnShippingFee(feeResponse.getTotal());

                    log.info("GHN integration: ShippingAddress has districtId/wardCode. " +
                            "Full GHN integration can be implemented when shop district is configured.");
                } else {
                    log.info("GHN integration skipped: ShippingAddress does not have districtId/wardCode. " +
                            "Creating basic shipment only.");
                }
            } catch (Exception e) {
                log.error("Error integrating GHN for order ID: {}. Creating basic shipment only.",
                        order.getIdOrder(), e);
                // Tiếp tục tạo Shipment cơ bản nếu GHN integration fail
            }
        } else {
            if (!ghnService.isEnabled()) {
                log.info("GHN integration is disabled. Creating basic shipment only.");
            } else {
                log.info("No shipping address. Creating basic shipment only.");
            }
        }

        // Lưu Shipment
        shipmentRepository.save(shipment);
        log.info("Shipment created successfully for order ID: {}", order.getIdOrder());
    }
}