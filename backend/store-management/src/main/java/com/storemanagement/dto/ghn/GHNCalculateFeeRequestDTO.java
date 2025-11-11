package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để tính phí vận chuyển từ GHN API
 * 
 * Endpoint: POST /shiip/public-api/v2/shipping-order/fee
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNCalculateFeeRequestDTO {
    
    @JsonProperty("from_district_id")
    private Integer fromDistrictId;
    
    @JsonProperty("to_district_id")
    private Integer toDistrictId;
    
    @JsonProperty("to_ward_code")
    private String toWardCode;
    
    @JsonProperty("weight")
    @Builder.Default
    private Integer weight = 1000;
    
    @JsonProperty("length")
    @Builder.Default
    private Integer length = 20;
    
    @JsonProperty("width")
    @Builder.Default
    private Integer width = 20;
    
    @JsonProperty("height")
    @Builder.Default
    private Integer height = 20;
    
    @JsonProperty("service_id")
    private Integer serviceId;
    
    @JsonProperty("insurance_value")
    private Integer insuranceValue;
    
    @JsonProperty("cod_amount")
    private Integer codAmount;
}
