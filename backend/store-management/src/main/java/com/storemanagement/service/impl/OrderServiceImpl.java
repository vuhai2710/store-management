package com.storemanagement.service.impl;

import com.storemanagement.dto.request.BuyNowRequestDto;
import com.storemanagement.dto.request.CreateOrderForCustomerRequestDto;
import com.storemanagement.dto.request.CreateOrderRequestDto;
import com.storemanagement.dto.response.CustomerDto;
import com.storemanagement.dto.response.OrderDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.OrderMapper;
import com.storemanagement.model.*;
import com.storemanagement.repository.*;
import com.storemanagement.service.CartService;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.OrderService;
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
import java.time.LocalDateTime;
import java.util.ArrayList;

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

    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Integer id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Đơn hàng không tồn tại với ID: " + id));

        OrderDto dto = orderMapper.toDto(order);

        // Set employee name nếu có (đã có trong mapper, nhưng để đảm bảo)
        if (order.getEmployee() != null && dto.getEmployeeName() == null) {
            dto.setEmployeeName(order.getEmployee().getEmployeeName());
        }

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportOrderToPdf(Integer id) {
        OrderDto orderDto = getOrderById(id);
        return pdfService.generateInvoicePdf(orderDto);
    }

    /**
     * Tạo đơn hàng từ giỏ hàng (Checkout)
     * 
     * Logic xử lý chi tiết:
     * 
     * 1. VALIDATION PHASE:
     *    - Kiểm tra customer tồn tại
     *    - Kiểm tra giỏ hàng không rỗng
     *    - Validate trạng thái và tồn kho của tất cả sản phẩm trong giỏ
     * 
     * 2. SHIPPING ADDRESS PHASE:
     *    - Nếu có shippingAddressId → Sử dụng địa chỉ đó
     *    - Nếu không có → Tìm địa chỉ mặc định
     *    - Nếu không có địa chỉ mặc định → Sử dụng địa chỉ trong customer profile
     *    - Tạo snapshot của địa chỉ để lưu vào order (bảo vệ khỏi việc địa chỉ bị xóa)
     * 
     * 3. CALCULATION PHASE:
     *    - Tính tổng tiền từ giá hiện tại của sản phẩm
     * 
     * 4. ORDER CREATION PHASE:
     *    - Tạo order với status = PENDING
     *    - Lưu shipping address và snapshot
     * 
     * 5. ORDER DETAILS CREATION PHASE (VỚI SNAPSHOT):
     *    - Với mỗi sản phẩm trong giỏ:
     *      - Lấy thông tin hiện tại (name, code, image, price)
     *      - Lưu snapshot vào OrderDetail để đảm bảo không bị ảnh hưởng khi admin chỉnh sửa
     *      - Trừ số lượng từ product.stockQuantity
     *      - Cập nhật product status nếu hết hàng
     * 
     * 6. INVENTORY TRANSACTION PHASE:
     *    - Tạo inventory transaction (OUT) để ghi lại lịch sử xuất kho
     *    - Reference đến order ID để trace
     * 
     * 7. CLEANUP PHASE:
     *    - Xóa giỏ hàng sau khi tạo order thành công
     * 
     * SNAPSHOT PROTECTION:
     * - Snapshot tất cả thông tin sản phẩm tại thời điểm mua
     * - Đảm bảo khi admin chỉnh sửa sản phẩm, đơn hàng đã đặt vẫn giữ nguyên thông tin
     * - Snapshot địa chỉ để đảm bảo không bị ảnh hưởng nếu địa chỉ bị xóa
     */
    @Override
    public OrderDto createOrderFromCart(Integer customerId, CreateOrderRequestDto request) {
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
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng. Còn lại: " + product.getStockQuantity());
            }
        }
        
        // ========== PHASE 2: SHIPPING ADDRESS ==========
        
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
                shippingAddressSnapshot = customer.getCustomerName() + ", " + customer.getAddress() + ", " + customer.getPhoneNumber();
            }
        }
        
        // ========== PHASE 3: CALCULATION ==========
        
        // Tính tổng tiền từ giá hiện tại của sản phẩm
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cart.getCartItems()) {
            BigDecimal itemTotal = BigDecimal.valueOf(item.getProduct().getPrice())
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        
        // ========== PHASE 4: ORDER CREATION ==========
        
        // Tạo order với status = PENDING (chờ xác nhận)
        Order order = Order.builder()
                .customer(customer)
                .employee(null) // Customer order, không có employee
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(BigDecimal.ZERO) // Chưa có discount
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(shippingAddress) // Reference đến shipping address
                .shippingAddressSnapshot(shippingAddressSnapshot) // Snapshot để bảo vệ
                .orderDetails(new ArrayList<>())
                .build();
        
        // ========== PHASE 5: ORDER DETAILS CREATION (VỚI SNAPSHOT) ==========
        
        // Với mỗi sản phẩm trong giỏ, tạo order detail với snapshot
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            
            // Lấy thông tin sản phẩm hiện tại để snapshot
            String productName = product.getProductName();
            String productCode = product.getProductCode();
            String productImage = product.getImageUrl();
            Double productPrice = product.getPrice();
            
            // Tạo order detail với snapshot
            // Snapshot này đảm bảo khi admin chỉnh sửa sản phẩm, đơn hàng vẫn giữ nguyên thông tin
            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(product) // Vẫn giữ reference để có thể trace
                    .quantity(cartItem.getQuantity())
                    .price(BigDecimal.valueOf(productPrice)) // Giá tại thời điểm mua
                    .productNameSnapshot(productName) // Snapshot tên sản phẩm
                    .productCodeSnapshot(productCode) // Snapshot mã sản phẩm
                    .productImageSnapshot(productImage) // Snapshot URL ảnh
                    .build();
            
            order.getOrderDetails().add(orderDetail);
            
            // Cập nhật tồn kho: Trừ số lượng đã bán
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            
            // Nếu hết hàng → Cập nhật status
            if (product.getStockQuantity() == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            
            // Lưu product với số lượng mới
            productRepository.save(product);
        }
        
        // Lưu order vào database (có cascade nên order details cũng được lưu)
        Order savedOrder = orderRepository.save(order);
        
        // ========== PHASE 6: INVENTORY TRANSACTION ==========
        
        // Tạo inventory transaction sau khi order được lưu (để có order ID)
        // Ghi lại lịch sử xuất kho để theo dõi
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
        
        // ========== PHASE 7: CLEANUP ==========
        
        // Xóa giỏ hàng sau khi tạo order thành công
        cartService.clearCart(customerId);
        
        log.info("Order created successfully: {}", savedOrder.getIdOrder());
        
        return orderMapper.toDto(savedOrder);
    }

    /**
     * Tạo đơn hàng trực tiếp từ sản phẩm (Buy Now)
     * 
     * Logic tương tự createOrderFromCart nhưng chỉ xử lý 1 sản phẩm:
     * 
     * 1. VALIDATION PHASE:
     *    - Kiểm tra customer tồn tại
     *    - Kiểm tra sản phẩm tồn tại và còn khả dụng
     *    - Validate tồn kho đủ
     * 
     * 2. SHIPPING ADDRESS PHASE:
     *    - Tương tự createOrderFromCart
     * 
     * 3. CALCULATION PHASE:
     *    - Tính tổng tiền từ giá sản phẩm × quantity
     * 
     * 4. ORDER CREATION PHASE:
     *    - Tạo order với 1 order detail
     *    - Lưu snapshot sản phẩm
     * 
     * 5. INVENTORY TRANSACTION PHASE:
     *    - Trừ tồn kho và tạo inventory transaction
     * 
     * Lưu ý: Không xóa giỏ hàng vì không sử dụng giỏ hàng
     */
    @Override
    public OrderDto createOrderDirectly(Integer customerId, BuyNowRequestDto request) {
        log.info("Creating order directly (Buy Now) for customer: {}, product: {}, quantity: {}", 
                customerId, request.getProductId(), request.getQuantity());
        
        // ========== PHASE 1: VALIDATION ==========
        
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
            throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng. Còn lại: " + product.getStockQuantity());
        }
        
        // ========== PHASE 2: SHIPPING ADDRESS ==========
        
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
                shippingAddressSnapshot = customer.getCustomerName() + ", " + customer.getAddress() + ", " + customer.getPhoneNumber();
            }
        }
        
        // ========== PHASE 3: CALCULATION ==========
        
        BigDecimal totalAmount = BigDecimal.valueOf(product.getPrice())
                .multiply(BigDecimal.valueOf(request.getQuantity()));
        
        // ========== PHASE 4: ORDER CREATION ==========
        
        Order order = Order.builder()
                .customer(customer)
                .employee(null)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(BigDecimal.ZERO)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(shippingAddress)
                .shippingAddressSnapshot(shippingAddressSnapshot)
                .orderDetails(new ArrayList<>())
                .build();
        
        // ========== PHASE 5: ORDER DETAIL CREATION (VỚI SNAPSHOT) ==========
        
        String productName = product.getProductName();
        String productCode = product.getProductCode();
        String productImage = product.getImageUrl();
        Double productPrice = product.getPrice();
        
        OrderDetail orderDetail = OrderDetail.builder()
                .order(order)
                .product(product)
                .quantity(request.getQuantity())
                .price(BigDecimal.valueOf(productPrice))
                .productNameSnapshot(productName)
                .productCodeSnapshot(productCode)
                .productImageSnapshot(productImage)
                .build();
        
        order.getOrderDetails().add(orderDetail);
        
        // Cập nhật tồn kho
        product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
        if (product.getStockQuantity() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }
        productRepository.save(product);
        
        // Lưu order
        Order savedOrder = orderRepository.save(order);
        
        // ========== PHASE 6: INVENTORY TRANSACTION ==========
        
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
        
        log.info("Order created successfully (Buy Now): {}", savedOrder.getIdOrder());
        
        return orderMapper.toDto(savedOrder);
    }

    /**
     * Lấy danh sách đơn hàng của customer (có thể filter theo status)
     * 
     * Logic xử lý:
     * - Nếu status != null → Filter đơn hàng theo status cụ thể
     * - Nếu status == null → Lấy tất cả đơn hàng (không filter)
     * - Sắp xếp mặc định theo orderDate DESC (mới nhất trước)
     * - Có phân trang
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderDto> getMyOrders(Integer customerId, Order.OrderStatus status, Pageable pageable) {
        log.info("Getting orders for customer: {}, status filter: {}", customerId, status);
        
        Page<Order> orderPage;
        
        // Nếu có status filter → Gọi method filter theo status
        if (status != null) {
            orderPage = orderRepository.findByCustomerIdCustomerAndStatusOrderByOrderDateDesc(customerId, status, pageable);
        } else {
            // Nếu không có status filter → Lấy tất cả đơn hàng
            orderPage = orderRepository.findByCustomerIdCustomerOrderByOrderDateDesc(customerId, pageable);
        }
        
        return PageUtils.toPageResponse(orderPage, orderMapper.toDtoList(orderPage.getContent()));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getMyOrderById(Integer customerId, Integer orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));
        
        if (!order.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Không có quyền xem đơn hàng này");
        }
        
        return orderMapper.toDto(order);
    }

    /**
     * Hủy đơn hàng (chỉ khi status = PENDING)
     * 
     * Logic xử lý chi tiết:
     * 
     * 1. VALIDATION PHASE:
     *    - Kiểm tra đơn hàng tồn tại
     *    - Kiểm tra quyền: Đơn hàng phải thuộc về customer hiện tại
     *    - Kiểm tra trạng thái: Chỉ cho phép hủy khi status = PENDING
     * 
     * 2. STOCK RESTORATION PHASE:
     *    - Với mỗi sản phẩm trong đơn hàng:
     *      - Cộng lại số lượng vào product.stockQuantity
     *      - Nếu product đang OUT_OF_STOCK và có hàng lại → Cập nhật status = IN_STOCK
     *      - Tạo InventoryTransaction (IN) để ghi lại lịch sử hoàn trả
     * 
     * 3. STATUS UPDATE PHASE:
     *    - Cập nhật order status = CANCELED
     * 
     * Lưu ý:
     * - Chỉ hủy được khi PENDING để tránh rối loạn khi đơn đã được xác nhận/hoàn thành
     * - Hàng được tự động hoàn trả vào kho
     * - Ghi lại lịch sử inventory transaction để theo dõi
     */
    @Override
    public OrderDto cancelOrder(Integer customerId, Integer orderId) {
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
        
        // ========== PHASE 2: STOCK RESTORATION ==========
        
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
        
        // ========== PHASE 3: STATUS UPDATE ==========
        
        // Cập nhật trạng thái đơn hàng thành CANCELED
        order.setStatus(Order.OrderStatus.CANCELED);
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order cancelled successfully: {}", orderId);
        
        return orderMapper.toDto(savedOrder);
    }
    
    /**
     * Tạo đơn hàng cho khách hàng (Admin/Employee)
     * 
     * Logic xử lý:
     * 
     * 1. CUSTOMER PHASE:
     *    - Nếu có customerId → Sử dụng customer có sẵn
     *    - Nếu không có customerId → Tạo Customer mới không có User (walk-in customer)
     * 
     * 2. EMPLOYEE PHASE:
     *    - Lấy employee từ employeeId
     * 
     * 3. VALIDATION PHASE:
     *    - Validate tất cả sản phẩm trong danh sách
     *    - Kiểm tra tồn kho và trạng thái
     * 
     * 4. CALCULATION PHASE:
     *    - Tính tổng tiền từ giá sản phẩm
     *    - Áp dụng discount nếu có
     * 
     * 5. ORDER CREATION PHASE:
     *    - Tạo order với employee và customer
     *    - Tạo order details với snapshot
     * 
     * 6. INVENTORY TRANSACTION PHASE:
     *    - Trừ tồn kho và tạo inventory transactions
     */
    @Override
    public OrderDto createOrderForCustomer(Integer employeeId, CreateOrderForCustomerRequestDto request) {
        log.info("Creating order for customer by employee: {}, customerId: {}", employeeId, request.getCustomerId());
        
        // ========== PHASE 1: CUSTOMER ==========
        
        Customer customer;
        if (request.getCustomerId() != null) {
            // Trường hợp 1: Có customerId → Sử dụng customer có sẵn trong hệ thống
            // Customer này có thể có hoặc không có User account
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với ID: " + request.getCustomerId()));
        } else {
            // Trường hợp 2: Không có customerId → Tạo đơn cho walk-in customer (khách hàng không có tài khoản)
            
            // Validate thông tin bắt buộc để tạo customer mới
            if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
                throw new RuntimeException("Tên khách hàng không được để trống");
            }
            if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
                throw new RuntimeException("Số điện thoại khách hàng không được để trống");
            }
            
            // Kiểm tra xem customer đã tồn tại với số điện thoại này chưa
            // Logic: Nếu khách hàng quay lại với cùng số điện thoại, sử dụng customer hiện tại
            // Điều này giúp theo dõi lịch sử mua hàng của cùng một khách hàng
            customer = customerRepository.findByPhoneNumber(request.getCustomerPhone())
                    .orElse(null);
            
            if (customer == null) {
                // Customer chưa tồn tại → Tạo customer mới không có User account
                // Customer này sẽ có id_user = NULL, chỉ lưu thông tin cơ bản (tên, phone, address)
                // Vẫn có thể theo dõi lịch sử mua hàng qua Customer record
                CustomerDto newCustomerDto = customerService.createCustomerWithoutUser(
                        request.getCustomerName(),
                        request.getCustomerPhone(),
                        request.getCustomerAddress()
                );
                customer = customerRepository.findById(newCustomerDto.getIdCustomer())
                        .orElseThrow(() -> new RuntimeException("Lỗi khi tạo khách hàng mới"));
                log.info("Tạo customer mới (walk-in) với ID: {}", customer.getIdCustomer());
            } else {
                // Customer đã tồn tại với số điện thoại này → Sử dụng customer hiện tại
                // Điều này đảm bảo lịch sử mua hàng được gộp lại cho cùng một khách hàng
                log.info("Customer đã tồn tại với số điện thoại: {}, sử dụng customer ID: {}", 
                        request.getCustomerPhone(), customer.getIdCustomer());
            }
        }
        
        // ========== PHASE 2: EMPLOYEE ==========
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên với ID: " + employeeId));
        
        // ========== PHASE 3: VALIDATION ==========
        
        // Validate tất cả sản phẩm trong danh sách
        for (com.storemanagement.dto.request.OrderItemDto item : request.getOrderItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + item.getProductId()));
            
            if (product.getStatus() == ProductStatus.OUT_OF_STOCK || 
                product.getStatus() == ProductStatus.DISCONTINUED) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không còn khả dụng");
            }
            
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng. Còn lại: " + product.getStockQuantity());
            }
        }
        
        // ========== PHASE 4: CALCULATION ==========
        
        // Tính tổng tiền từ tất cả sản phẩm trong đơn hàng
        // totalAmount = sum(quantity × price) cho mỗi sản phẩm
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (com.storemanagement.dto.request.OrderItemDto item : request.getOrderItems()) {
            Product product = productRepository.findById(item.getProductId()).orElseThrow();
            BigDecimal itemTotal = BigDecimal.valueOf(product.getPrice())
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
        // finalAmount sẽ được tính tự động bởi database: finalAmount = totalAmount - discount
        
        // ========== PHASE 5: ORDER CREATION ==========
        
        // Tạo shipping address snapshot từ customer info
        // Snapshot này đảm bảo địa chỉ không bị ảnh hưởng nếu customer thay đổi thông tin sau này
        // Format: "Tên khách hàng, Địa chỉ, Số điện thoại"
        String shippingAddressSnapshot = customer.getCustomerName() + ", " + 
                (customer.getAddress() != null ? customer.getAddress() : "") + ", " + 
                customer.getPhoneNumber();
        
        // Tạo order với đầy đủ thông tin
        // - customer: Khách hàng (có thể là walk-in customer hoặc customer có tài khoản)
        // - employee: Nhân viên tạo đơn (lấy từ JWT token)
        // - status: PENDING (chờ xác nhận)
        // - shippingAddress: null vì walk-in customers không có shipping address trong hệ thống
        // - shippingAddressSnapshot: Lưu snapshot để hiển thị sau này
        Order order = Order.builder()
                .customer(customer)
                .employee(employee) // Nhân viên tạo đơn
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .discount(discount)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingAddress(null) // Walk-in customers không có shipping address entity
                .shippingAddressSnapshot(shippingAddressSnapshot) // Snapshot để hiển thị
                .orderDetails(new ArrayList<>())
                .build();
        
        // ========== PHASE 6: ORDER DETAILS CREATION (VỚI SNAPSHOT) ==========
        
        for (com.storemanagement.dto.request.OrderItemDto item : request.getOrderItems()) {
            Product product = productRepository.findById(item.getProductId()).orElseThrow();
            
            String productName = product.getProductName();
            String productCode = product.getProductCode();
            String productImage = product.getImageUrl();
            Double productPrice = product.getPrice();
            
            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(BigDecimal.valueOf(productPrice))
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
        
        // ========== PHASE 7: INVENTORY TRANSACTION ==========
        
        for (OrderDetail orderDetail : savedOrder.getOrderDetails()) {
            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(orderDetail.getProduct())
                    .transactionType(TransactionType.OUT)
                    .quantity(orderDetail.getQuantity())
                    .referenceType(ReferenceType.SALE_ORDER)
                    .referenceId(savedOrder.getIdOrder())
                    .notes("Đơn hàng từ nhân viên cho khách hàng")
                    .transactionDate(LocalDateTime.now())
                    .build();
            inventoryTransactionRepository.save(transaction);
        }
        
        log.info("Order created successfully for customer by employee: {}", savedOrder.getIdOrder());
        
        return orderMapper.toDto(savedOrder);
    }
    
    /**
     * Tạo snapshot của địa chỉ giao hàng
     * 
     * Format: "Tên người nhận, Địa chỉ, Số điện thoại"
     * 
     * Mục đích: Lưu snapshot để đảm bảo không bị ảnh hưởng nếu địa chỉ bị xóa sau này
     */
    private String buildAddressSnapshot(ShippingAddress address) {
        return address.getRecipientName() + ", " + address.getAddress() + ", " + address.getPhoneNumber();
    }

    /**
     * Customer xác nhận đã nhận hàng
     * 
     * Logic xử lý chi tiết:
     * 
     * 1. VALIDATION PHASE:
     *    - Kiểm tra order tồn tại và thuộc về customer hiện tại
     *    - Kiểm tra order status phải là CONFIRMED (chỉ cho phép confirm khi CONFIRMED)
     *    - Tìm shipment theo orderId (nếu không có thì tạo mới với status PREPARING)
     * 
     * 2. UPDATE PHASE:
     *    - Cập nhật order.status = COMPLETED (từ CONFIRMED)
     *    - Set order.deliveredAt = LocalDateTime.now()
     *    - Cập nhật shipment.shippingStatus = DELIVERED
     *    - Lưu cả order và shipment
     * 
     * 3. RETURN PHASE:
     *    - Trả về OrderDto đã được cập nhật
     * 
     * Lưu ý:
     * - Chỉ cho phép confirm khi order.status = CONFIRMED
     * - Tự động tạo shipment nếu chưa có (trường hợp đơn hàng cũ)
     * - Cập nhật cả Order và Shipment để đồng bộ trạng thái
     */
    @Override
    public OrderDto confirmDelivery(Integer customerId, Integer orderId) {
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
        
        // Bước 2.3: Cập nhật shipment.shippingStatus = DELIVERED
        shipment.setShippingStatus(Shipment.ShippingStatus.DELIVERED);
        
        // Bước 2.4: Lưu cả order và shipment
        Order savedOrder = orderRepository.save(order);
        shipmentRepository.save(shipment);
        
        log.info("Delivery confirmed successfully for order: {}", orderId);
        
        // ========== PHASE 3: RETURN ==========
        
        return orderMapper.toDto(savedOrder);
    }
}

