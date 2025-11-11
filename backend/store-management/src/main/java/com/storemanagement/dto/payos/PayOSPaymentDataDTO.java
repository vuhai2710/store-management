package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho PayOS Payment Data (phần data trong response)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSPaymentDataDTO {
    
    private String paymentLinkId;
    
    private String checkoutUrl;
    
    private String qrCode;
    
    private Long orderCode;
    
    private BigDecimal amount;
    
    private String description;
    
    private String status;
}
