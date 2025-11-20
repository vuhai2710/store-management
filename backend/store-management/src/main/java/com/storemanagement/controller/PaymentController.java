package com.storemanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.payos.PayOSPaymentResponseDTO;
import com.storemanagement.dto.payos.PayOSWebhookDTO;
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

    @PostMapping("/create/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentLink(@PathVariable Integer orderId) {
        log.info("Creating PayOS payment link for order ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order không tồn tại với ID: " + orderId));

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
        }

        PayOSPaymentResponseDTO response = payOSService.createPaymentLink(order);

        order.setPaymentLinkId(response.getData().getPaymentLinkId());
        orderRepository.save(order);

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

    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<Map<String, String>> webhook(@RequestBody String requestBody) {
        log.info("Received PayOS webhook. Request body length: {}", requestBody != null ? requestBody.length() : 0);

        try {
            PayOSWebhookDTO webhookDto = objectMapper.readValue(requestBody, PayOSWebhookDTO.class);

            log.info("Webhook data: code={}, desc={}, paymentLinkId={}",
                    webhookDto.getCode(),
                    webhookDto.getDesc(),
                    webhookDto.getData() != null ? webhookDto.getData().getPaymentLinkId() : "null");

            boolean isValidSignature = payOSService.verifyWebhookSignature(
                    requestBody,
                    webhookDto.getSignature());

            if (!isValidSignature) {
                log.error("Webhook signature verification FAILED. Rejecting webhook.");
                return ResponseEntity.ok(Map.of("status", "error", "message", "Invalid signature"));
            }

            String paymentLinkId = webhookDto.getData().getPaymentLinkId();
            Order order = orderRepository.findByPaymentLinkId(paymentLinkId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Order không tồn tại với paymentLinkId: " + paymentLinkId));

            log.info("Found order ID: {} for paymentLinkId: {}", order.getIdOrder(), paymentLinkId);

            if (order.getStatus() != Order.OrderStatus.PENDING) {
                log.warn("Order ID: {} đã được xử lý rồi (status: {}). Ignoring duplicate webhook.",
                        order.getIdOrder(), order.getStatus());
                return ResponseEntity.ok(Map.of("status", "success", "message", "Order already processed"));
            }

            String webhookCode = webhookDto.getCode();
            if ("00".equals(webhookCode)) {
                log.info("Payment SUCCESS for order ID: {}. Updating order status to COMPLETED.", order.getIdOrder());

                order.setStatus(Order.OrderStatus.COMPLETED);
                orderRepository.save(order);

                if (order.getOrderDetails() != null) {
                    order.getOrderDetails().forEach(orderDetail -> {
                        Product product = orderDetail.getProduct();

                        Integer newStockQuantity = product.getStockQuantity() - orderDetail.getQuantity();
                        product.setStockQuantity(newStockQuantity);

                        if (newStockQuantity == 0) {
                            product.setStatus(ProductStatus.OUT_OF_STOCK);
                        }

                        productRepository.save(product);

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
                log.info(
                        "Payment FAILED/CANCELLED for order ID: {}. Code: {}, Desc: {}. Updating order status to CANCELED.",
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
