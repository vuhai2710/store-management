package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO từ GHN API khi tạo đơn hàng thành công
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNCreateOrderResponseDTO {
    
    @JsonProperty("order_code")
    private String orderCode;
    
    @JsonProperty("sort_code")
    private String sortCode;
    
    @JsonProperty("trans_type")
    private String transType;
    
    @JsonProperty("ward_encode")
    private String wardEncode;
    
    @JsonProperty("district_encode")
    private String districtEncode;
    
    @JsonProperty("expected_delivery_time")
    private String expectedDeliveryTime;
    
    @JsonProperty("client_order_code")
    private String clientOrderCode;
}
