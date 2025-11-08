package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho PayOS Payment Link Creation Response
 * 
 * Mục đích:
 * - Mapping response từ PayOS API khi tạo payment link thành công
 * - Chứa payment link URL và payment link ID
 * 
 * Cấu trúc response từ PayOS:
 * {
 *   "code": "00",
 *   "desc": "success",
 *   "data": {
 *     "bin": "...",
 *     "accountNumber": "...",
 *     "accountName": "...",
 *     "amount": 100000,
 *     "description": "...",
 *     "orderCode": 123456,
 *     "currency": "VND",
 *     "paymentLinkId": "abc123",
 *     "status": "PENDING",
 *     "checkoutUrl": "https://pay.payos.vn/web/...",
 *     "qrCode": "..."
 *   },
 *   "signature": "..."
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSPaymentResponseDto {
    
    /**
     * Response code từ PayOS
     * "00" = success, các mã khác = error
     */
    private String code;
    
    /**
     * Response description
     */
    private String desc;
    
    /**
     * Response data chứa payment link info
     */
    private PayOSPaymentDataDto data;
    
    /**
     * Signature để verify response
     * Optional - có thể không cần verify response
     */
    private String signature;
}







