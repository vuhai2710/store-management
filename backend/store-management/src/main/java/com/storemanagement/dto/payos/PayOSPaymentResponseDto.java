package com.storemanagement.dto.payos;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSPaymentResponseDTO {
    private String code;
    private String desc;
    private PayOSPaymentDataDTO data;
    private String signature;
}