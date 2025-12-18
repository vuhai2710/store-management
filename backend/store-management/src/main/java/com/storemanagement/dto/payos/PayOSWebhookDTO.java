package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSWebhookDTO {

    private String code;

    private String desc;

    private PayOSWebhookDataDTO data;

    private String signature;
}
