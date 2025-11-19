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
public class GHNOrderInfoDTO {
    
    @JsonProperty("order_code")
    private String orderCode;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("to_name")
    private String toName;
    
    @JsonProperty("to_phone")
    private String toPhone;
    
    @JsonProperty("to_address")
    private String toAddress;
    
    @JsonProperty("expected_delivery_time")
    private String expectedDeliveryTime;
    
    @JsonProperty("note")
    private String note;
    
    @JsonProperty("total_fee")
    private Integer totalFee;
    
    @JsonProperty("cod_amount")
    private Integer codAmount;
}
