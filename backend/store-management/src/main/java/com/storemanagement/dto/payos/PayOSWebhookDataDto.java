package com.storemanagement.dto.payos;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSWebhookDataDTO {
    private String paymentLinkId;
    private Long orderCode;
    private BigDecimal amount;
    private String description;
    private String accountNumber;
    private String reference;
    private LocalDateTime transactionDateTime;
    private String currency;
    private String code;
    private String desc;
}