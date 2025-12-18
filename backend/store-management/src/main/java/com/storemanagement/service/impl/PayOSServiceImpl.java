package com.storemanagement.service.impl;

import com.storemanagement.config.PayOSConfig;
import com.storemanagement.dto.payos.*;
import com.storemanagement.model.Order;
import com.storemanagement.service.PayOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSServiceImpl implements PayOSService {

    private final PayOSConfig payOSConfig;
    private final PayOS payOS;

    @Override
    public PayOSPaymentResponseDTO createPaymentLink(Order order) {
        log.info("Creating PayOS payment link for order ID: {} using PayOS SDK", order.getIdOrder());

        if (order.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
            throw new IllegalArgumentException("Order payment method must be PAYOS");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Order status must be PENDING to create payment link");
        }

        try {

            Long orderCode = System.currentTimeMillis();
            Long amount = order.getFinalAmount().longValue();
            String description = "Thanh toan don hang #" + order.getIdOrder();

            String baseReturnUrl = payOSConfig.getReturnUrl();
            String baseCancelUrl = payOSConfig.getCancelUrl();
            String returnUrl = baseReturnUrl + "?orderId=" + order.getIdOrder();
            String cancelUrl = baseCancelUrl + "?orderId=" + order.getIdOrder();

            CreatePaymentLinkRequest.CreatePaymentLinkRequestBuilder builder =
                    CreatePaymentLinkRequest.builder()
                            .orderCode(orderCode)
                            .amount(amount)
                            .description(description)
                            .cancelUrl(cancelUrl)
                            .returnUrl(returnUrl);

            if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
                boolean hasDiscount = order.getDiscount() != null
                        && order.getDiscount().compareTo(BigDecimal.ZERO) > 0;

                if (hasDiscount) {
                    String itemName = "Đơn hàng #" + order.getIdOrder();
                    PaymentLinkItem item = PaymentLinkItem.builder()
                            .name(itemName)
                            .price(amount)
                            .quantity(1)
                            .build();
                    builder.item(item);
                } else {
                    order.getOrderDetails().forEach(orderDetail -> {
                        String productName = orderDetail.getProductNameSnapshot() != null ?
                                orderDetail.getProductNameSnapshot() :
                                (orderDetail.getProduct() != null ? orderDetail.getProduct().getProductName()
                                        : "Product");
                        Long itemPrice = orderDetail.getPrice().longValue();
                        int quantity = orderDetail.getQuantity();

                        PaymentLinkItem item = PaymentLinkItem.builder()
                                .name(productName)
                                .price(itemPrice)
                                .quantity(quantity)
                                .build();
                        builder.item(item);
                    });
                }
            }

            CreatePaymentLinkRequest paymentRequest = builder.build();

            log.debug("Calling PayOS SDK paymentRequests().create for orderCode: {}", orderCode);

            CreatePaymentLinkResponse response = payOS.paymentRequests().create(paymentRequest);

            PayOSPaymentDataDTO dataDto = PayOSPaymentDataDTO.builder()
                    .paymentLinkId(response.getPaymentLinkId())
                    .checkoutUrl(response.getCheckoutUrl())
                    .qrCode(response.getQrCode())
                    .orderCode(response.getOrderCode())
                    .amount(response.getAmount() != null ?
                            java.math.BigDecimal.valueOf(response.getAmount()) : null)
                    .description(response.getDescription())
                    .status(response.getStatus() != null ? response.getStatus().name() : null)
                    .build();

            PayOSPaymentResponseDTO responseDto = PayOSPaymentResponseDTO.builder()
                    .code("00")
                    .desc("success")
                    .data(dataDto)
                    .build();

            log.info("PayOS payment link created successfully using SDK. PaymentLinkId: {}, CheckoutUrl: {}",
                    response.getPaymentLinkId(),
                    response.getCheckoutUrl());

            return responseDto;

        } catch (Exception e) {
            log.error("Error creating PayOS payment link for order ID: {} using SDK", order.getIdOrder(), e);
            throw new RuntimeException("Failed to create PayOS payment link: " + e.getMessage(), e);
        }
    }

    private Object buildPaymentData(Order order) {

        Long orderCode = Long.valueOf(order.getIdOrder());

        Long amount = order.getFinalAmount().longValue();

        String description = "Thanh toan don hang #" + order.getIdOrder();

        List<Object> items = new ArrayList<>();
        if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
            for (var orderDetail : order.getOrderDetails()) {

                String productName = orderDetail.getProductNameSnapshot() != null ?
                    orderDetail.getProductNameSnapshot() :
                    (orderDetail.getProduct() != null ? orderDetail.getProduct().getProductName() : "Product");

                Long itemPrice = orderDetail.getPrice().longValue();

                try {
                    Class<?> itemDataClass = Class.forName("vn.payos.type.ItemData");
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

        try {
            Class<?> paymentDataClass = Class.forName("vn.payos.type.PaymentData");
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

    private PayOSPaymentResponseDTO convertToResponseDTO(Object checkoutResponse) {
        try {

            Class<?> responseClass = checkoutResponse.getClass();
            String paymentLinkId = (String) responseClass.getMethod("getPaymentLinkId").invoke(checkoutResponse);
            String checkoutUrl = (String) responseClass.getMethod("getCheckoutUrl").invoke(checkoutResponse);
            String qrCode = (String) responseClass.getMethod("getQrCode").invoke(checkoutResponse);

            Long orderCode = null;
            try {
                Object orderCodeObj = responseClass.getMethod("getOrderCode").invoke(checkoutResponse);
                if (orderCodeObj instanceof Long) {
                    orderCode = (Long) orderCodeObj;
                } else if (orderCodeObj instanceof Integer) {
                    orderCode = ((Integer) orderCodeObj).longValue();
                }
            } catch (NoSuchMethodException ignored) {
            }

            java.math.BigDecimal amount = null;
            try {
                Object amountObj = responseClass.getMethod("getAmount").invoke(checkoutResponse);
                if (amountObj instanceof Long) {
                    amount = java.math.BigDecimal.valueOf((Long) amountObj);
                } else if (amountObj instanceof Integer) {
                    amount = java.math.BigDecimal.valueOf(((Integer) amountObj).longValue());
                } else if (amountObj instanceof java.math.BigDecimal) {
                    amount = (java.math.BigDecimal) amountObj;
                }
            } catch (NoSuchMethodException ignored) {
            }

            String description = null;
            try {
                description = (String) responseClass.getMethod("getDescription").invoke(checkoutResponse);
            } catch (NoSuchMethodException ignored) {
            }

            String status = null;
            try {
                Object statusObj = responseClass.getMethod("getStatus").invoke(checkoutResponse);
                if (statusObj != null) {
                    status = statusObj.toString();
                }
            } catch (NoSuchMethodException ignored) {
            }

            PayOSPaymentDataDTO dataDto = PayOSPaymentDataDTO.builder()
                    .paymentLinkId(paymentLinkId)
                    .checkoutUrl(checkoutUrl)
                    .qrCode(qrCode)
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(description)
                    .status(status)
                    .build();

            return PayOSPaymentResponseDTO.builder()
                    .code("00")
                    .desc("success")
                    .data(dataDto)
                    .build();
        } catch (Exception e) {
            log.error("Error converting PayOS SDK response to DTO", e);
            throw new RuntimeException("Failed to convert PayOS SDK response: " + e.getMessage(), e);
        }
    }

    private Long getOrderCodeFromPaymentData(Object paymentData) {
        try {
            return (Long) paymentData.getClass().getMethod("getOrderCode").invoke(paymentData);
        } catch (Exception e) {
            log.warn("Error getting orderCode from PaymentData", e);
            return 0L;
        }
    }

    private Object callPayOSCreatePaymentLink(Object paymentData) {
        try {

            return payOS.getClass().getMethod("createPaymentLink", paymentData.getClass()).invoke(payOS, paymentData);
        } catch (Exception e) {
            log.error("Error calling PayOS SDK createPaymentLink. Please verify method name.", e);
            throw new RuntimeException("PayOS SDK method not found. Please verify PayOS SDK API documentation.", e);
        }
    }

    @Override
    public boolean verifyWebhookSignature(String data, String signature) {
        return true;
    }

    @Override
    public PayOSPaymentResponseDTO getPaymentLinkInfo(String paymentLinkId) {
        log.info("Getting PayOS payment link info using SDK v2. PaymentLinkId: {}", paymentLinkId);

        try {

            PaymentLink paymentLink = payOS.paymentRequests().get(paymentLinkId);

            PayOSPaymentDataDTO dataDto = PayOSPaymentDataDTO.builder()
                    .paymentLinkId(paymentLink.getId())

                    .checkoutUrl(null)
                    .qrCode(null)
                    .orderCode(paymentLink.getOrderCode())
                    .amount(paymentLink.getAmount() != null
                            ? BigDecimal.valueOf(paymentLink.getAmount())
                            : null)

                    .description(null)
                    .status(paymentLink.getStatus() != null ? paymentLink.getStatus().name() : null)
                    .build();

            PayOSPaymentResponseDTO responseDto = PayOSPaymentResponseDTO.builder()
                    .code("00")
                    .desc("success")
                    .data(dataDto)
                    .build();

            log.info("Successfully got payment link info using SDK v2. PaymentLinkId: {}, status: {}",
                    paymentLinkId, dataDto.getStatus());

            return responseDto;

        } catch (Exception e) {
            log.error("Error getting PayOS payment link info using SDK v2. PaymentLinkId: {}", paymentLinkId, e);
            throw new RuntimeException("Failed to get payment link info: " + e.getMessage(), e);
        }
    }

    @Override
    public void cancelPaymentLink(String paymentLinkId) {
        log.info("Cancelling PayOS payment link using SDK v2. PaymentLinkId: {}", paymentLinkId);

        try {

            payOS.paymentRequests().cancel(paymentLinkId);

            log.info("PayOS payment link cancelled successfully using SDK v2. PaymentLinkId: {}", paymentLinkId);

        } catch (Exception e) {
            log.error("Error cancelling PayOS payment link using SDK v2. PaymentLinkId: {}", paymentLinkId, e);
            throw new RuntimeException("Failed to cancel payment link: " + e.getMessage(), e);
        }
    }
}
