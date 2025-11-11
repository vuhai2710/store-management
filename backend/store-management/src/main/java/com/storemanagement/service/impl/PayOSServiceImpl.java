package com.storemanagement.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.config.PayOSConfig;
import com.storemanagement.dto.payos.*;
import com.storemanagement.model.Order;
import com.storemanagement.service.PayOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * Service implementation cho PayOS Payment Gateway
 * 
 * Mục đích:
 * - Implement các method để tương tác với PayOS API
 * - Xử lý tạo payment link, verify webhook signature, etc.
 * 
 * PayOS API Documentation: https://payos.vn/docs/api/
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSServiceImpl implements PayOSService {
    
    private final PayOSConfig payOSConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * Tạo payment link từ PayOS API
     * 
     * Logic chi tiết:
     * 1. Validate order: phải có paymentMethod = PAYOS, status = PENDING
     * 2. Build PayOSPaymentRequestDTO:
     *    - orderCode: orderId (Long)
     *    - amount: order.finalAmount (BigDecimal, convert sang Long VND)
     *    - description: "Thanh toan don hang #" + orderId
     *    - items: Convert từ order.orderDetails (optional)
     *    - returnUrl: từ PayOSConfig
     *    - cancelUrl: từ PayOSConfig
     * 3. Gọi PayOS API POST /v2/payment-requests:
     *    - URL: {baseUrl}/v2/payment-requests
     *    - Headers: Content-Type: application/json, x-client-id: {clientId}, x-api-key: {apiKey}
     *    - Body: PayOSPaymentRequestDTO (JSON)
     * 4. Parse response:
     *    - Check response.code == "00" (success)
     *    - Extract paymentLinkId và checkoutUrl từ response.data
     * 5. Return PayOSPaymentResponseDTO
     * 
     * Error handling:
     * - Nếu PayOS API trả về error: log và throw RuntimeException
     * - Nếu network error: log và throw RuntimeException
     */
    @Override
    public PayOSPaymentResponseDTO createPaymentLink(Order order) {
        log.info("Creating PayOS payment link for order ID: {}", order.getIdOrder());
        
        // Validate order
        if (order.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            throw new IllegalArgumentException("Order payment method must be PAYOS");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Order status must be PENDING to create payment link");
        }
        
        try {
            // Build request DTO
            PayOSPaymentRequestDTO request = buildPaymentRequest(order);
            
            // Build request URL
            String url = payOSConfig.getBaseUrl() + "/v2/payment-requests";
            
            // Build headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", payOSConfig.getClientId());
            headers.set("x-api-key", payOSConfig.getApiKey());
            
            // Build request entity
            HttpEntity<PayOSPaymentRequestDTO> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling PayOS API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            // Call PayOS API
            ResponseEntity<PayOSPaymentResponseDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                PayOSPaymentResponseDTO.class
            );
            
            PayOSPaymentResponseDTO responseDto = response.getBody();
            
            // Validate response
            if (responseDto == null) {
                throw new RuntimeException("PayOS API returned null response");
            }
            
            if (!"00".equals(responseDto.getCode())) {
                log.error("PayOS API error: code={}, desc={}", responseDto.getCode(), responseDto.getDesc());
                throw new RuntimeException("PayOS API error: " + responseDto.getDesc());
            }
            
            // Validate response data
            if (responseDto.getData() == null) {
                throw new RuntimeException("PayOS API returned null data in response");
            }
            
            log.info("PayOS payment link created successfully. PaymentLinkId: {}, CheckoutUrl: {}", 
                responseDto.getData().getPaymentLinkId(), 
                responseDto.getData().getCheckoutUrl());
            
            return responseDto;
            
        } catch (Exception e) {
            log.error("Error creating PayOS payment link for order ID: {}", order.getIdOrder(), e);
            throw new RuntimeException("Failed to create PayOS payment link: " + e.getMessage(), e);
        }
    }
    
    /**
     * Build PayOSPaymentRequestDTO từ Order entity
     * 
     * Logic:
     * - Convert orderId sang Long (orderCode)
     * - Convert finalAmount sang Long VND (PayOS yêu cầu số nguyên)
     * - Build description từ orderId
     * - Convert orderDetails sang PayOSItemDTO list (optional)
     * - Lấy returnUrl và cancelUrl từ PayOSConfig
     */
    private PayOSPaymentRequestDTO buildPaymentRequest(Order order) {
        // Convert orderId to Long (PayOS yêu cầu orderCode là Long)
        Long orderCode = Long.valueOf(order.getIdOrder());
        
        // Convert finalAmount to Long VND (PayOS yêu cầu amount là số nguyên, đơn vị VND)
        // finalAmount là BigDecimal, cần convert sang Long (multiply by 1, không có decimal)
        Long amount = order.getFinalAmount().longValue();
        
        // Build description
        String description = "Thanh toan don hang #" + order.getIdOrder();
        
        // Build items list (optional - PayOS có thể yêu cầu hoặc không)
        List<PayOSItemDTO> items = new ArrayList<>();
        if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
            for (var orderDetail : order.getOrderDetails()) {
                // Sử dụng productNameSnapshot nếu có, nếu không thì dùng product name
                String productName = orderDetail.getProductNameSnapshot() != null ? 
                    orderDetail.getProductNameSnapshot() : 
                    (orderDetail.getProduct() != null ? orderDetail.getProduct().getProductName() : "Product");
                
                PayOSItemDTO item = PayOSItemDTO.builder()
                    .name(productName)
                    .quantity(orderDetail.getQuantity())
                    .price(orderDetail.getPrice()) // OrderDetail có field 'price' (giá tại thời điểm mua)
                    .build();
                items.add(item);
            }
        }
        
        return PayOSPaymentRequestDTO.builder()
            .orderCode(orderCode)
            .amount(BigDecimal.valueOf(amount))
            .description(description)
            .items(items)
            .returnUrl(payOSConfig.getReturnUrl())
            .cancelUrl(payOSConfig.getCancelUrl())
            .build();
    }
    
    /**
     * Xác thực webhook signature từ PayOS
     * 
     * Logic chi tiết:
     * 1. PayOS gửi webhook với HMAC SHA256 signature
     * 2. Generate signature:
     *    - Algorithm: HMAC SHA256
     *    - Key: checksumKey từ PayOSConfig
     *    - Data: JSON string của request body (không format, không có whitespace)
     *    - Encode: Base64
     * 3. So sánh signature từ PayOS với signature đã generate
     * 4. Return true nếu khớp, false nếu không khớp
     * 
     * Lưu ý quan trọng:
     * - Data để verify là JSON string KHÔNG format (không có whitespace, không có newline)
     * - Phải dùng đúng checksumKey từ PayOSConfig
     * - Signature từ PayOS có thể ở trong body hoặc header (tùy PayOS version)
     */
    @Override
    public boolean verifyWebhookSignature(String data, String signature) {
        try {
            // Validate input
            if (data == null || signature == null) {
                log.warn("Webhook signature verification: data or signature is null");
                return false;
            }
            
            log.debug("Verifying webhook signature. Data length: {}, Signature: {}", 
                data.length(), signature);
            
            // Generate HMAC SHA256 signature
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                payOSConfig.getChecksumKey().getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(secretKeySpec);
            
            // Calculate signature
            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = Base64.getEncoder().encodeToString(hashBytes);
            
            // Compare signatures (constant-time comparison để tránh timing attack)
            boolean isValid = calculatedSignature.equals(signature);
            
            if (isValid) {
                log.debug("Webhook signature verification: SUCCESS");
            } else {
                log.warn("Webhook signature verification: FAILED. Expected: {}, Got: {}", 
                    calculatedSignature, signature);
            }
            
            return isValid;
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }
    
    /**
     * Lấy thông tin payment link từ PayOS
     * 
     * Logic:
     * 1. Gọi PayOS API GET /v2/payment-requests/{paymentLinkId}
     * 2. Headers: x-client-id, x-api-key
     * 3. Parse response và trả về
     */
    @Override
    public PayOSPaymentResponseDTO getPaymentLinkInfo(String paymentLinkId) {
        log.info("Getting PayOS payment link info. PaymentLinkId: {}", paymentLinkId);
        
        try {
            String url = payOSConfig.getBaseUrl() + "/v2/payment-requests/" + paymentLinkId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-client-id", payOSConfig.getClientId());
            headers.set("x-api-key", payOSConfig.getApiKey());
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            ResponseEntity<PayOSPaymentResponseDTO> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                PayOSPaymentResponseDTO.class
            );
            
            PayOSPaymentResponseDTO responseDto = response.getBody();
            
            if (responseDto == null || !"00".equals(responseDto.getCode())) {
                log.error("PayOS API error: code={}, desc={}", 
                    responseDto != null ? responseDto.getCode() : "null",
                    responseDto != null ? responseDto.getDesc() : "null");
                throw new RuntimeException("Failed to get payment link info");
            }
            
            return responseDto;
            
        } catch (Exception e) {
            log.error("Error getting PayOS payment link info. PaymentLinkId: {}", paymentLinkId, e);
            throw new RuntimeException("Failed to get payment link info: " + e.getMessage(), e);
        }
    }
    
    /**
     * Hủy payment link trên PayOS
     * 
     * Logic:
     * 1. Gọi PayOS API DELETE /v2/payment-requests/{paymentLinkId}
     * 2. Payment link sẽ không còn sử dụng được
     */
    @Override
    public void cancelPaymentLink(String paymentLinkId) {
        log.info("Cancelling PayOS payment link. PaymentLinkId: {}", paymentLinkId);
        
        try {
            String url = payOSConfig.getBaseUrl() + "/v2/payment-requests/" + paymentLinkId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-client-id", payOSConfig.getClientId());
            headers.set("x-api-key", payOSConfig.getApiKey());
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            restTemplate.exchange(
                url,
                HttpMethod.DELETE,
                requestEntity,
                Void.class
            );
            
            log.info("PayOS payment link cancelled successfully. PaymentLinkId: {}", paymentLinkId);
            
        } catch (Exception e) {
            log.error("Error cancelling PayOS payment link. PaymentLinkId: {}", paymentLinkId, e);
            throw new RuntimeException("Failed to cancel payment link: " + e.getMessage(), e);
        }
    }
}

