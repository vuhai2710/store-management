package com.storemanagement.service.impl;

import com.storemanagement.config.PayOSConfig;
import com.storemanagement.dto.payos.*;
import com.storemanagement.model.Order;
import com.storemanagement.service.PayOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
// PayOS SDK imports
// Lưu ý: Sau khi Maven download dependency, cần verify package names và class names
// Có thể cần điều chỉnh imports dựa trên PayOS SDK documentation
// Xem PAYOS_SDK_REFACTOR_NOTES.md để biết cách verify
import vn.payos.PayOS;
// TODO: Uncomment và verify sau khi download SDK
// import vn.payos.model.CheckoutResponseData;
// import vn.payos.model.ItemData;
// import vn.payos.model.PaymentData;
// import vn.payos.model.Webhook;

import java.util.ArrayList;
import java.util.List;

/**
 * Service implementation cho PayOS Payment Gateway
 *
 * Mục đích:
 * - Implement các method để tương tác với PayOS API sử dụng PayOS Java SDK
 * - Xử lý tạo payment link, verify webhook signature, etc.
 *
 * PayOS API Documentation: https://payos.vn/docs/api/
 * PayOS Java SDK: https://payos.vn/docs/sdks/back-end/java/
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSServiceImpl implements PayOSService {

    private final PayOSConfig payOSConfig;
    private final PayOS payOS;

    /**
     * Tạo payment link từ PayOS API sử dụng PayOS Java SDK
     *
     * Logic chi tiết:
     * 1. Validate order: phải có paymentMethod = PAYOS, status = PENDING
     * 2. Build PaymentData từ Order entity:
     *    - orderCode: orderId (Long)
     *    - amount: order.finalAmount (Long VND)
     *    - description: "Thanh toan don hang #" + orderId
     *    - items: Convert từ order.orderDetails
     *    - returnUrl: từ PayOSConfig
     *    - cancelUrl: từ PayOSConfig
     * 3. Gọi PayOS SDK createPaymentLink():
     *    - SDK tự động xử lý authentication, request/response
     *    - SDK tự động detect sandbox/production từ credentials
     * 4. Convert SDK response sang PayOSPaymentResponseDTO
     * 5. Return PayOSPaymentResponseDTO
     *
     * Error handling:
     * - Nếu PayOS API trả về error: SDK sẽ throw exception
     * - Nếu network error: SDK sẽ throw exception
     */
    @Override
    public PayOSPaymentResponseDTO createPaymentLink(Order order) {
        log.info("Creating PayOS payment link for order ID: {} using PayOS SDK", order.getIdOrder());

        // Validate order
        if (order.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            throw new IllegalArgumentException("Order payment method must be PAYOS");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Order status must be PENDING to create payment link");
        }

        try {
            // Build PaymentData từ Order entity
            // TODO: Uncomment sau khi verify PayOS SDK imports
            // PaymentData paymentData = buildPaymentData(order);

            // Temporary: Sử dụng reflection hoặc Object để tránh compile error
            // Sau khi download SDK, uncomment code trên và remove code dưới
            Object paymentData = buildPaymentData(order);

            log.debug("Calling PayOS SDK createPaymentLink for orderCode: {}",
                getOrderCodeFromPaymentData(paymentData));

            // Gọi PayOS SDK để tạo payment link
            // SDK tự động xử lý authentication, request/response, error handling
            // TODO: Uncomment sau khi verify PayOS SDK method name
            // CheckoutResponseData checkoutResponse = payOS.createPaymentLink(paymentData);
            Object checkoutResponse = callPayOSCreatePaymentLink(paymentData);

            // Convert SDK response sang DTO
            PayOSPaymentResponseDTO responseDto = convertToResponseDTO(checkoutResponse);

            log.info("PayOS payment link created successfully using SDK. PaymentLinkId: {}, CheckoutUrl: {}",
                responseDto.getData().getPaymentLinkId(),
                responseDto.getData().getCheckoutUrl());

            return responseDto;

        } catch (Exception e) {
            log.error("Error creating PayOS payment link for order ID: {} using SDK", order.getIdOrder(), e);
            throw new RuntimeException("Failed to create PayOS payment link: " + e.getMessage(), e);
        }
    }

    /**
     * Build PaymentData từ Order entity để sử dụng với PayOS SDK
     *
     * Logic:
     * - Convert orderId sang Long (orderCode)
     * - Convert finalAmount sang Long VND (PayOS SDK yêu cầu số nguyên)
     * - Build description từ orderId
     * - Convert orderDetails sang ItemData list
     * - Lấy returnUrl và cancelUrl từ PayOSConfig
     *
     * TODO: Return type sẽ là PaymentData sau khi uncomment imports
     */
    private Object buildPaymentData(Order order) {
        // Convert orderId to Long (PayOS yêu cầu orderCode là Long)
        Long orderCode = Long.valueOf(order.getIdOrder());

        // Convert finalAmount to Long VND (PayOS SDK yêu cầu amount là số nguyên, đơn vị VND)
        // finalAmount là BigDecimal, cần convert sang Long
        Long amount = order.getFinalAmount().longValue();

        // Build description
        String description = "Thanh toan don hang #" + order.getIdOrder();

        // Build items list
        // TODO: Uncomment sau khi verify PayOS SDK ItemData class
        // List<ItemData> items = new ArrayList<>();
        List<Object> items = new ArrayList<>();
        if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
            for (var orderDetail : order.getOrderDetails()) {
                // Sử dụng productNameSnapshot nếu có, nếu không thì dùng product name
                String productName = orderDetail.getProductNameSnapshot() != null ?
                    orderDetail.getProductNameSnapshot() :
                    (orderDetail.getProduct() != null ? orderDetail.getProduct().getProductName() : "Product");

                // PayOS SDK ItemData yêu cầu: name, quantity, price (Long VND)
                Long itemPrice = orderDetail.getPrice().longValue();

                // PayOS SDK ItemData sử dụng constructor hoặc setter methods
                // TODO: Uncomment sau khi verify PayOS SDK ItemData
                // ItemData item = new ItemData();
                // item.setName(productName);
                // item.setQuantity(orderDetail.getQuantity());
                // item.setPrice(itemPrice);
                // items.add(item);

                // Temporary: Sử dụng reflection để tạo ItemData
                try {
                    Class<?> itemDataClass = Class.forName("vn.payos.model.ItemData");
                    Object item = itemDataClass.getDeclaredConstructor().newInstance();
                    itemDataClass.getMethod("setName", String.class).invoke(item, productName);
                    itemDataClass.getMethod("setQuantity", Integer.class).invoke(item, orderDetail.getQuantity());
                    itemDataClass.getMethod("setPrice", Long.class).invoke(item, itemPrice);
                    items.add(item);
                } catch (Exception e) {
                    log.error("Error creating ItemData using reflection. Please verify PayOS SDK imports.", e);
                    throw new RuntimeException("PayOS SDK classes not found. Please run 'mvn clean install' to download dependencies.", e);
                }
            }
        }

        // Build PaymentData sử dụng PayOS SDK setter methods
        // TODO: Uncomment sau khi verify PayOS SDK PaymentData class
        // PaymentData paymentData = new PaymentData();
        // paymentData.setOrderCode(orderCode);
        // paymentData.setAmount(amount);
        // paymentData.setDescription(description);
        // paymentData.setItems(items);
        // paymentData.setReturnUrl(payOSConfig.getReturnUrl());
        // paymentData.setCancelUrl(payOSConfig.getCancelUrl());
        // return paymentData;

        // Temporary: Sử dụng reflection để tạo PaymentData
        try {
            Class<?> paymentDataClass = Class.forName("vn.payos.model.PaymentData");
            Object paymentData = paymentDataClass.getDeclaredConstructor().newInstance();
            paymentDataClass.getMethod("setOrderCode", Long.class).invoke(paymentData, orderCode);
            paymentDataClass.getMethod("setAmount", Long.class).invoke(paymentData, amount);
            paymentDataClass.getMethod("setDescription", String.class).invoke(paymentData, description);
            paymentDataClass.getMethod("setItems", List.class).invoke(paymentData, items);
            paymentDataClass.getMethod("setReturnUrl", String.class).invoke(paymentData, payOSConfig.getReturnUrl());
            paymentDataClass.getMethod("setCancelUrl", String.class).invoke(paymentData, payOSConfig.getCancelUrl());
            return paymentData;
        } catch (Exception e) {
            log.error("Error creating PaymentData using reflection. Please verify PayOS SDK imports.", e);
            throw new RuntimeException("PayOS SDK classes not found. Please run 'mvn clean install' to download dependencies.", e);
        }
    }

    /**
     * Convert PayOS SDK CheckoutResponseData sang PayOSPaymentResponseDTO
     *
     * @param checkoutResponse SDK response từ PayOS (Object type để tránh compile error)
     * @return PayOSPaymentResponseDTO
     */
    private PayOSPaymentResponseDTO convertToResponseDTO(Object checkoutResponse) {
        try {
            // Build PaymentDataDTO từ SDK response sử dụng reflection
            // TODO: Uncomment sau khi verify PayOS SDK CheckoutResponseData
            // String paymentLinkId = checkoutResponse.getPaymentLinkId();
            // String checkoutUrl = checkoutResponse.getCheckoutUrl();
            // String qrCode = checkoutResponse.getQrCode();

            Class<?> responseClass = checkoutResponse.getClass();
            String paymentLinkId = (String) responseClass.getMethod("getPaymentLinkId").invoke(checkoutResponse);
            String checkoutUrl = (String) responseClass.getMethod("getCheckoutUrl").invoke(checkoutResponse);
            String qrCode = (String) responseClass.getMethod("getQrCode").invoke(checkoutResponse);

            PayOSPaymentDataDTO dataDto = PayOSPaymentDataDTO.builder()
                    .paymentLinkId(paymentLinkId)
                    .checkoutUrl(checkoutUrl)
                    .qrCode(qrCode)
                    .build();

            // Build response DTO
            return PayOSPaymentResponseDTO.builder()
                    .code("00") // SDK thành công sẽ không throw exception
                    .desc("success")
                    .data(dataDto)
                    .build();
        } catch (Exception e) {
            log.error("Error converting PayOS SDK response to DTO", e);
            throw new RuntimeException("Failed to convert PayOS SDK response: " + e.getMessage(), e);
        }
    }

    /**
     * Helper method để get orderCode từ PaymentData object (sử dụng reflection)
     */
    private Long getOrderCodeFromPaymentData(Object paymentData) {
        try {
            return (Long) paymentData.getClass().getMethod("getOrderCode").invoke(paymentData);
        } catch (Exception e) {
            log.warn("Error getting orderCode from PaymentData", e);
            return 0L;
        }
    }

    /**
     * Helper method để gọi PayOS SDK createPaymentLink (sử dụng reflection)
     */
    private Object callPayOSCreatePaymentLink(Object paymentData) {
        try {
            // Gọi payOS.createPaymentLink(paymentData) sử dụng reflection
            return payOS.getClass().getMethod("createPaymentLink", paymentData.getClass()).invoke(payOS, paymentData);
        } catch (Exception e) {
            log.error("Error calling PayOS SDK createPaymentLink. Please verify method name.", e);
            throw new RuntimeException("PayOS SDK method not found. Please verify PayOS SDK API documentation.", e);
        }
    }

    /**
     * Xác thực webhook signature từ PayOS sử dụng PayOS SDK
     *
     * Logic chi tiết:
     * 1. PayOS gửi webhook với HMAC SHA256 signature
     * 2. Sử dụng PayOS SDK verifyPaymentWebhookData() method
     * 3. SDK tự động xử lý:
     *    - Algorithm: HMAC SHA256
     *    - Key: checksumKey từ PayOSConfig (đã được set trong PayOS instance)
     *    - Data: JSON string của request body
     *    - Encode: Base64
     * 4. Return true nếu webhook.isSuccess() == true, false nếu không
     *
     * Lưu ý quan trọng:
     * - PayOS SDK sử dụng method verifyPaymentWebhookData() và trả về Webhook object
     * - Data để verify là JSON string của request body
     * - SDK sử dụng checksumKey đã được set trong PayOS instance
     */
    @Override
    public boolean verifyWebhookSignature(String data, String signature) {
        try {
            // Validate input
            if (data == null || signature == null) {
                log.warn("Webhook signature verification: data or signature is null");
                return false;
            }

            log.debug("Verifying webhook signature using PayOS SDK. Data length: {}, Signature: {}",
                data.length(), signature);

            // Sử dụng PayOS SDK để verify signature
            // SDK method: verifyPaymentWebhookData(requestBody, signature) trả về Webhook object
            // SDK tự động sử dụng checksumKey đã được set trong PayOS instance
            // TODO: Uncomment sau khi verify PayOS SDK method name
            // Webhook webhook = payOS.verifyPaymentWebhookData(data, signature);
            // boolean isValid = webhook != null && webhook.isSuccess();

            // Temporary: Sử dụng reflection để gọi SDK method
            Object webhook;
            try {
                // Thử verifyPaymentWebhookData trước
                webhook = payOS.getClass().getMethod("verifyPaymentWebhookData", String.class, String.class)
                    .invoke(payOS, data, signature);
            } catch (NoSuchMethodException e) {
                // Thử verifyWebhookSignature nếu method name khác
                try {
                    Boolean result = (Boolean) payOS.getClass().getMethod("verifyWebhookSignature", String.class, String.class)
                        .invoke(payOS, data, signature);
                    return result != null && result;
                } catch (Exception e2) {
                    log.error("PayOS SDK webhook verification method not found. Please verify SDK documentation.", e2);
                    throw new RuntimeException("PayOS SDK webhook verification method not found.", e2);
                }
            }

            boolean isValid = webhook != null && (Boolean) webhook.getClass().getMethod("isSuccess").invoke(webhook);

            if (isValid) {
                log.debug("Webhook signature verification: SUCCESS (using PayOS SDK)");
            } else {
                log.warn("Webhook signature verification: FAILED (using PayOS SDK)");
            }

            return isValid;

        } catch (Exception e) {
            log.error("Error verifying webhook signature using PayOS SDK", e);
            return false;
        }
    }

    /**
     * Lấy thông tin payment link từ PayOS sử dụng PayOS SDK
     *
     * Logic:
     * 1. Gọi PayOS SDK getPaymentLinkInformation(paymentLinkId)
     * 2. SDK tự động xử lý authentication và request/response
     * 3. Convert SDK response sang DTO
     *
     * Lưu ý: PayOS SDK có thể có method name khác, cần kiểm tra documentation
     */
    @Override
    public PayOSPaymentResponseDTO getPaymentLinkInfo(String paymentLinkId) {
        log.info("Getting PayOS payment link info using SDK. PaymentLinkId: {}", paymentLinkId);

        try {
            // Gọi PayOS SDK để lấy thông tin payment link
            // Method name có thể là: getPaymentLinkInformation() hoặc getPaymentLinkInfo()
            // SDK tự động xử lý authentication, request/response
            // TODO: Uncomment sau khi verify PayOS SDK method name
            // CheckoutResponseData checkoutResponse = payOS.getPaymentLinkInformation(paymentLinkId);

            // Temporary: Sử dụng reflection để gọi SDK method
            Object checkoutResponse;
            try {
                checkoutResponse = payOS.getClass().getMethod("getPaymentLinkInformation", String.class)
                    .invoke(payOS, paymentLinkId);
            } catch (NoSuchMethodException e) {
                // Thử getPaymentLinkInfo nếu method name khác
                checkoutResponse = payOS.getClass().getMethod("getPaymentLinkInfo", String.class)
                    .invoke(payOS, paymentLinkId);
            }

            // Convert SDK response sang DTO
            PayOSPaymentResponseDTO responseDto = convertToResponseDTO(checkoutResponse);

            log.info("Successfully got payment link info using SDK. PaymentLinkId: {}", paymentLinkId);

            return responseDto;

        } catch (Exception e) {
            log.error("Error getting PayOS payment link info using SDK. PaymentLinkId: {}", paymentLinkId, e);
            throw new RuntimeException("Failed to get payment link info: " + e.getMessage(), e);
        }
    }

    /**
     * Hủy payment link trên PayOS sử dụng PayOS SDK
     *
     * Logic:
     * 1. Gọi PayOS SDK cancelPaymentLink(paymentLinkId)
     * 2. SDK tự động xử lý authentication và request
     * 3. Payment link sẽ không còn sử dụng được
     *
     * Lưu ý: PayOS SDK có thể có method name khác, cần kiểm tra documentation
     */
    @Override
    public void cancelPaymentLink(String paymentLinkId) {
        log.info("Cancelling PayOS payment link using SDK. PaymentLinkId: {}", paymentLinkId);

        try {
            // Gọi PayOS SDK để hủy payment link
            // Method name có thể là: cancelPaymentLink() hoặc cancelPaymentLinkInformation()
            // SDK tự động xử lý authentication và request
            // TODO: Uncomment sau khi verify PayOS SDK method name
            // payOS.cancelPaymentLink(paymentLinkId);

            // Temporary: Sử dụng reflection để gọi SDK method
            try {
                payOS.getClass().getMethod("cancelPaymentLink", String.class)
                    .invoke(payOS, paymentLinkId);
            } catch (NoSuchMethodException e) {
                // Thử cancelPaymentLinkInformation nếu method name khác
                payOS.getClass().getMethod("cancelPaymentLinkInformation", String.class)
                    .invoke(payOS, paymentLinkId);
            }

            log.info("PayOS payment link cancelled successfully using SDK. PaymentLinkId: {}", paymentLinkId);

        } catch (Exception e) {
            log.error("Error cancelling PayOS payment link using SDK. PaymentLinkId: {}", paymentLinkId, e);
            throw new RuntimeException("Failed to cancel payment link: " + e.getMessage(), e);
        }
    }
}

