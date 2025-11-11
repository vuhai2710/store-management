package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho PayOS Payment Link Creation Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSPaymentRequestDTO {
    
    private Long orderCode;
    
    private BigDecimal amount;
    
    private String description;
    
    private List<PayOSItemDTO> items;
    
    private String returnUrl;
    
    private String cancelUrl;
}
