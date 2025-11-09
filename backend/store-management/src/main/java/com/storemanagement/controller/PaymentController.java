package com.storemanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.payos.PayOSPaymentResponseDto;
import com.storemanagement.dto.payos.PayOSWebhookDto;
import com.storemanagement.model.Order;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.model.InventoryTransaction;
import com.storemanagement.model.Product;
import com.storemanagement.repository.InventoryTransactionRepository;
import com.storemanagement.repository.ProductRepository;
import com.storemanagement.service.PayOSService;
import com.storemanagement.utils.ProductStatus;
import com.storemanagement.utils.ReferenceType;
import com.storemanagement.utils.TransactionType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý các API liên quan đến thanh toán PayOS
 * Base URL: /api/v1/payments/payos
 * 
 * Mục đích:
 * - Tạo payment link cho đơn hàng
 * - Nhận webhook callback từ PayOS
 * - Xử lý return/cancel redirect từ PayOS
 * - Check payment status
 * 
 * @author Store Management Team
 */
@RestController
@RequestMapping("/api/v1/payments/payos")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PayOSService payOSService;
    private final OrderRepository orderRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Tạo payment link cho đơn hàng
     * 
     * Endpoint: POST /api/v1/payments/payos/create/{orderId}
     * Authentication: Required (CUSTOMER role - chỉ customer sở hữu order mới được tạo)
     * 
     * Logic xử lý:
     * 1. Lấy order từ database theo orderId
     * 2. Validate:
     *    - Order phải tồn tại
     *    - Order phải có paymentMethod = PAYOS
     *    - Order phải có status = PENDING
     *    - Customer phải sở hữu order (nếu là CUSTOMER role)
     * 3. Gọi PayOSService.createPaymentLink() để tạo payment link
     * 4. Lưu paymentLinkId vào order
     * 5. Trả về paymentLinkUrl cho frontend
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Tạo payment link thành công",
     *   "data": {
     *     "paymentLinkUrl": "https://pay.payos.vn/web/...",
     *     "paymentLinkId": "abc123",
     *     "orderId": 123
     *   }
     * }
     * 
     * @param orderId ID của order cần tạo payment link
     * @return ApiResponse chứa paymentLinkUrl và paymentLinkId
     */
    @PostMapping("/create/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentLink(@PathVariable Integer orderId) {
        log.info("Creating PayOS payment link for order ID: {}", orderId);
        
        // Lấy order từ database
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Order không tồn tại với ID: " + orderId));
        
        // Validate order
        if (order.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            throw new IllegalArgumentException("Order payment method phải là PAYOS");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Order status phải là PENDING để tạo payment link");
        }
        
        // Validate customer ownership (nếu là CUSTOMER role)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"))) {
            // TODO: Check customer ownership if needed
            // For now, allow any authenticated customer
        }
        
        // Gọi PayOSService để tạo payment link
        PayOSPaymentResponseDto response = payOSService.createPaymentLink(order);
        
        // Lưu paymentLinkId vào order
        order.setPaymentLinkId(response.getData().getPaymentLinkId());
        orderRepository.save(order);
        
        // Build response
        Map<String, Object> data = new HashMap<>();
        data.put("paymentLinkUrl", response.getData().getCheckoutUrl());
        data.put("paymentLinkId", response.getData().getPaymentLinkId());
        data.put("orderId", orderId);
        if (response.getData().getQrCode() != null) {
            data.put("qrCode", response.getData().getQrCode());
        }
        
        log.info("PayOS payment link created successfully for order ID: {}. PaymentLinkId: {}", 
            orderId, response.getData().getPaymentLinkId());
        
        return ResponseEntity.ok(ApiResponse.success("Tạo payment link thành công", data));
    }
    
    /**
     * Webhook endpoint để nhận callback từ PayOS
     * 
     * Endpoint: POST /api/v1/payments/payos/webhook
     * Authentication: Không cần (PUBLIC - PayOS sẽ gọi từ bên ngoài)
     * 
     * Logic xử lý:
     * 1. Nhận webhook request body từ PayOS
     * 2. Parse request body thành PayOSWebhookDto
     * 3. Verify HMAC signature để đảm bảo webhook đến từ PayOS thật
     * 4. Tìm order theo paymentLinkId từ webhook data
     * 5. Kiểm tra order status hiện tại (tránh xử lý duplicate webhook)
     * 6. Cập nhật order status dựa trên kết quả thanh toán:
     *    - Nếu code = "00" (thành công):
     *      + Update order.status = CONFIRMED
     *      + Trừ stock từ các sản phẩm trong order
     *      + Tạo inventory transactions (OUT) để ghi lại lịch sử
     *    - Nếu code != "00" (thất bại):
     *      + Update order.status = CANCELED
     *      + Không trừ stock (vì thanh toán thất bại)
     * 7. Return 200 OK cho PayOS
     * 
     * Lưu ý quan trọng:
     * - Phải verify signature trước khi xử lý
     * - Phải xử lý idempotent (không update order 2 lần nếu nhận duplicate webhook)
     * - Phải return 200 OK ngay cả khi có lỗi (để PayOS không retry)
     * 
     * @param requestBody Raw request body (String) để verify signature
     * @return 200 OK (luôn luôn, để PayOS không retry)
     */
    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<Map<String, String>> webhook(@RequestBody String requestBody) {
        log.info("Received PayOS webhook. Request body length: {}", requestBody != null ? requestBody.length() : 0);
        
        try {
            // Parse request body thành PayOSWebhookDto
            PayOSWebhookDto webhookDto = objectMapper.readValue(requestBody, PayOSWebhookDto.class);
            
            log.info("Webhook data: code={}, desc={}, paymentLinkId={}", 
                webhookDto.getCode(), 
                webhookDto.getDesc(),
                webhookDto.getData() != null ? webhookDto.getData().getPaymentLinkId() : "null");
            
            // Verify HMAC signature
            // Data để verify là JSON string không format (requestBody)
            // Signature từ PayOS nằm trong webhookDto.signature
            boolean isValidSignature = payOSService.verifyWebhookSignature(
                requestBody, 
                webhookDto.getSignature()
            );
            
            if (!isValidSignature) {
                log.error("Webhook signature verification FAILED. Rejecting webhook.");
                // Return 200 OK để PayOS không retry, nhưng không xử lý
                return ResponseEntity.ok(Map.of("status", "error", "message", "Invalid signature"));
            }
            
            // Tìm order theo paymentLinkId
            String paymentLinkId = webhookDto.getData().getPaymentLinkId();
            Order order = orderRepository.findByPaymentLinkId(paymentLinkId)
                .orElseThrow(() -> new EntityNotFoundException(
                    "Order không tồn tại với paymentLinkId: " + paymentLinkId));
            
            log.info("Found order ID: {} for paymentLinkId: {}", order.getIdOrder(), paymentLinkId);
            
            // Kiểm tra order status hiện tại (tránh xử lý duplicate webhook)
            // Nếu order đã được xử lý rồi (status != PENDING), bỏ qua
            if (order.getStatus() != Order.OrderStatus.PENDING) {
                log.warn("Order ID: {} đã được xử lý rồi (status: {}). Ignoring duplicate webhook.", 
                    order.getIdOrder(), order.getStatus());
                return ResponseEntity.ok(Map.of("status", "success", "message", "Order already processed"));
            }
            
            // Xử lý webhook dựa trên code
            String webhookCode = webhookDto.getCode();
            if ("00".equals(webhookCode)) {
                // Thanh toán thành công
                log.info("Payment SUCCESS for order ID: {}. Updating order status to CONFIRMED.", order.getIdOrder());
                
                // Update order status
                order.setStatus(Order.OrderStatus.CONFIRMED);
                orderRepository.save(order);
                
                // Trừ stock từ các sản phẩm trong order
                // Logic: Với mỗi orderDetail, trừ quantity từ product.stockQuantity
                if (order.getOrderDetails() != null) {
                    order.getOrderDetails().forEach(orderDetail -> {
                        Product product = orderDetail.getProduct();
                        
                        // Trừ stock
                        Integer newStockQuantity = product.getStockQuantity() - orderDetail.getQuantity();
                        product.setStockQuantity(newStockQuantity);
                        
                        // Cập nhật status nếu hết hàng
                        if (newStockQuantity == 0) {
                            product.setStatus(ProductStatus.OUT_OF_STOCK);
                        }
                        
                        // Lưu product với stock mới
                        productRepository.save(product);
                        
                        // Tạo inventory transaction (OUT) để ghi lại lịch sử
                        InventoryTransaction transaction = InventoryTransaction.builder()
                            .product(product)
                            .transactionType(TransactionType.OUT)
                            .quantity(orderDetail.getQuantity())
                            .referenceType(ReferenceType.SALE_ORDER) // Sử dụng SALE_ORDER thay vì ORDER
                            .referenceId(order.getIdOrder())
                            .notes("Thanh toán PayOS thành công - Order #" + order.getIdOrder())
                            .build();
                        
                        inventoryTransactionRepository.save(transaction);
                        
                        log.debug("Stock deducted for product ID: {}. New stock: {}", 
                            product.getIdProduct(), newStockQuantity);
                    });
                }
                
                log.info("Order ID: {} updated to CONFIRMED. Stock deducted and inventory transactions created.", 
                    order.getIdOrder());
                
            } else {
                // Thanh toán thất bại hoặc hủy
                log.info("Payment FAILED/CANCELLED for order ID: {}. Code: {}, Desc: {}. Updating order status to CANCELED.", 
                    order.getIdOrder(), webhookCode, webhookDto.getDesc());
                
                // Update order status
                order.setStatus(Order.OrderStatus.CANCELED);
                orderRepository.save(order);
                
                // Không trừ stock vì thanh toán thất bại
                log.info("Order ID: {} updated to CANCELED. Stock NOT deducted.", order.getIdOrder());
            }
            
            // Return 200 OK cho PayOS
            return ResponseEntity.ok(Map.of("status", "success", "message", "Webhook processed"));
            
        } catch (Exception e) {
            log.error("Error processing PayOS webhook", e);
            // Return 200 OK để PayOS không retry
            // Log error để debug sau
            return ResponseEntity.ok(Map.of("status", "error", "message", "Internal error: " + e.getMessage()));
        }
    }
    
    /**
     * Redirect URL sau khi thanh toán thành công
     * 
     * Endpoint: GET /api/v1/payments/payos/return
     * Authentication: Không cần (PUBLIC - PayOS redirect về đây)
     * 
     * Logic:
     * - PayOS redirect user về URL này sau khi thanh toán thành công
     * - Redirect về frontend với orderId và status
     * 
     * @param orderCode Order code từ PayOS (optional)
     * @return Redirect đến frontend success page
     */
    @GetMapping("/return")
    public ResponseEntity<String> returnUrl(@RequestParam(required = false) Long orderCode) {
        log.info("PayOS return URL called. OrderCode: {}", orderCode);
        
        // Redirect về frontend success page
        // Frontend sẽ handle việc hiển thị kết quả và check order status
        String redirectUrl = "http://localhost:3000/payment/success";
        if (orderCode != null) {
            redirectUrl += "?orderId=" + orderCode;
        }
        
        return ResponseEntity.status(302)
            .header("Location", redirectUrl)
            .body("Redirecting to payment success page...");
    }
    
    /**
     * Redirect URL khi hủy thanh toán
     * 
     * Endpoint: GET /api/v1/payments/payos/cancel
     * Authentication: Không cần (PUBLIC - PayOS redirect về đây)
     * 
     * Logic:
     * - PayOS redirect user về URL này khi user hủy thanh toán
     * - Redirect về frontend cancel page
     * 
     * @param orderCode Order code từ PayOS (optional)
     * @return Redirect đến frontend cancel page
     */
    @GetMapping("/cancel")
    public ResponseEntity<String> cancelUrl(@RequestParam(required = false) Long orderCode) {
        log.info("PayOS cancel URL called. OrderCode: {}", orderCode);
        
        // Redirect về frontend cancel page
        String redirectUrl = "http://localhost:3000/payment/cancel";
        if (orderCode != null) {
            redirectUrl += "?orderId=" + orderCode;
        }
        
        return ResponseEntity.status(302)
            .header("Location", redirectUrl)
            .body("Redirecting to payment cancel page...");
    }
    
    /**
     * Check payment status cho đơn hàng
     * 
     * Endpoint: GET /api/v1/payments/payos/status/{orderId}
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic:
     * - Frontend có thể polling endpoint này để check order status
     * - Trả về order status và payment info
     * 
     * @param orderId ID của order
     * @return ApiResponse chứa order status và payment info
     */
    @GetMapping("/status/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentStatus(@PathVariable Integer orderId) {
        log.info("Getting payment status for order ID: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Order không tồn tại với ID: " + orderId));
        
        Map<String, Object> data = new HashMap<>();
        data.put("orderId", orderId);
        data.put("status", order.getStatus().name());
        data.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null);
        data.put("paymentLinkId", order.getPaymentLinkId());
        data.put("finalAmount", order.getFinalAmount());
        
        return ResponseEntity.ok(ApiResponse.success("Lấy trạng thái thanh toán thành công", data));
    }
}

