package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNWebhookDTO {
    
    @JsonProperty("order_code")
    private String orderCode;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("updated_at")
    private String updatedAt;
    
    @JsonProperty("note")
    private String note;
    
    @JsonProperty("client_order_code")
    private String clientOrderCode;
}
