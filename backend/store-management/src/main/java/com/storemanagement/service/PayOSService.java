package com.storemanagement.service;

import com.storemanagement.dto.payos.PayOSPaymentResponseDTO;
import com.storemanagement.model.Order;

public interface PayOSService {

    PayOSPaymentResponseDTO createPaymentLink(Order order);

    boolean verifyWebhookSignature(String data, String signature);

    PayOSPaymentResponseDTO getPaymentLinkInfo(String paymentLinkId);

    void cancelPaymentLink(String paymentLinkId);
}
