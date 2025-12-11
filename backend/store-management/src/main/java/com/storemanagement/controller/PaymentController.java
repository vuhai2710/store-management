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
import com.storemanagement.service.SystemSettingService;
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
    private final SystemSettingService systemSettingService;

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

        BigDecimal finalAmount = order.getFinalAmount() != null ? order.getFinalAmount() : BigDecimal.ZERO;

        if (finalAmount.compareTo(BigDecimal.ZERO) == 0) {
            log.info(
                    "Order ID {} có finalAmount = 0 (giảm 100%). Đánh dấu COMPLETED và bỏ qua gọi PayOS, redirect thẳng về payment/success.",
                    orderId);

            if (order.getStatus() == Order.OrderStatus.PENDING) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                order.setStatus(Order.OrderStatus.COMPLETED);
                order.setDeliveredAt(now);
                order.setCompletedAt(now); // Thời điểm hoàn thành dùng để tính hạn đổi trả
                // Snapshot returnWindowDays từ system settings
                int returnWindowDays = systemSettingService.getReturnWindowDays();
                order.setReturnWindowDays(returnWindowDays);
                log.info("Order COMPLETED: completedAt={}, returnWindowDays={} for order: {}", now, returnWindowDays, orderId);
                orderRepository.save(order);
            }

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
                            .referenceType(ReferenceType.SALE_ORDER)
                            .referenceId(order.getIdOrder())
                            .notes("Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)")
                            .build();

                    inventoryTransactionRepository.save(transaction);
                });
            }

            Map<String, Object> zeroAmountData = new HashMap<>();
            zeroAmountData.put("paymentLinkUrl", "http://localhost:3003/payment/success?orderId=" + orderId);
            zeroAmountData.put("paymentLinkId", null);
            zeroAmountData.put("orderId", orderId);

            return ResponseEntity
                    .ok(ApiResponse.success("Đơn hàng 0đ, không cần thanh toán PayOS", zeroAmountData));
        }

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

                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                order.setStatus(Order.OrderStatus.COMPLETED);
                order.setDeliveredAt(now);
                order.setCompletedAt(now); // Thời điểm hoàn thành dùng để tính hạn đổi trả
                // Snapshot returnWindowDays từ system settings
                int returnWindowDays = systemSettingService.getReturnWindowDays();
                order.setReturnWindowDays(returnWindowDays);
                log.info("Order COMPLETED: completedAt={}, returnWindowDays={} for order: {}", now, returnWindowDays, order.getIdOrder());
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
    public ResponseEntity<String> returnUrl(
            @RequestParam(required = false) Long orderCode,
            @RequestParam(required = false, name = "orderId") Integer orderId) {
        log.info("PayOS return URL called. orderCode: {}, orderId: {}", orderCode, orderId);

        Integer targetOrderId = orderId;
        if (targetOrderId == null && orderCode != null) {
            // Backward compatibility: khi trước đây orderCode trùng với idOrder
            targetOrderId = orderCode.intValue();
        }

        String redirectUrl = "http://localhost:3003/payment/success";
        if (targetOrderId != null) {
            redirectUrl += "?orderId=" + targetOrderId;
        }

        return ResponseEntity.status(302)
                .header("Location", redirectUrl)
                .body("Redirecting to payment success page...");
    }

    @GetMapping("/cancel")
    public ResponseEntity<String> cancelUrl(
            @RequestParam(required = false) Long orderCode,
            @RequestParam(required = false, name = "orderId") Integer orderId) {
        log.info("PayOS cancel URL called. orderCode: {}, orderId: {}", orderCode, orderId);

        Integer targetOrderId = orderId;
        if (targetOrderId == null && orderCode != null) {
            // Backward compatibility: khi trước đây orderCode trùng với idOrder
            targetOrderId = orderCode.intValue();
        }

        String redirectUrl = "http://localhost:3003/payment/cancel";
        if (targetOrderId != null) {
            redirectUrl += "?orderId=" + targetOrderId;
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

        if (order.getPaymentMethod() == Order.PaymentMethod.PAYOS
                && order.getStatus() == Order.OrderStatus.PENDING
                && order.getPaymentLinkId() != null) {
            try {
                PayOSPaymentResponseDTO payOSInfo = payOSService.getPaymentLinkInfo(order.getPaymentLinkId());

                if (payOSInfo != null && payOSInfo.getData() != null) {
                    String payOSStatus = payOSInfo.getData().getStatus();
                    log.info("PayOS payment link info for order ID {}: status={} (paymentLinkId={})",
                            orderId, payOSStatus, order.getPaymentLinkId());

                    if (payOSStatus != null) {
                        String normalized = payOSStatus.toUpperCase();

                        if (normalized.contains("PAID") || normalized.contains("SUCCESS")) {
                            if (order.getStatus() == Order.OrderStatus.PENDING) {
                                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                                order.setStatus(Order.OrderStatus.COMPLETED);
                                order.setDeliveredAt(now);
                                order.setCompletedAt(now); // Thời điểm hoàn thành dùng để tính hạn đổi trả
                                // Snapshot returnWindowDays từ system settings
                                int returnWindowDays = systemSettingService.getReturnWindowDays();
                                order.setReturnWindowDays(returnWindowDays);
                                log.info("Order COMPLETED: completedAt={}, returnWindowDays={} for order: {}", now, returnWindowDays, order.getIdOrder());
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
                                                .referenceType(ReferenceType.SALE_ORDER)
                                                .referenceId(order.getIdOrder())
                                                .notes("Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #" + order.getIdOrder())
                                                .build();

                                        inventoryTransactionRepository.save(transaction);
                                    });
                                }
                            }
                        } else if (normalized.contains("CANCEL")) {
                            if (order.getStatus() == Order.OrderStatus.PENDING) {
                                order.setStatus(Order.OrderStatus.CANCELED);
                                orderRepository.save(order);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error syncing PayOS status for order ID: {}", orderId, e);
            }
        }

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", orderId);
        data.put("status", order.getStatus().name());
        data.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null);
        data.put("paymentLinkId", order.getPaymentLinkId());
        data.put("finalAmount", order.getFinalAmount());

        return ResponseEntity.ok(ApiResponse.success("Lấy trạng thái thanh toán thành công", data));
    }
}
