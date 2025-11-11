package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO để tạo đơn hàng GHN
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNCreateOrderRequestDTO {
    
    @JsonProperty("from_district_id")
    private Integer fromDistrictId;
    
    @JsonProperty("from_ward_code")
    private String fromWardCode;
    
    @JsonProperty("to_district_id")
    private Integer toDistrictId;
    
    @JsonProperty("to_ward_code")
    private String toWardCode;
    
    @JsonProperty("to_name")
    private String toName;
    
    @JsonProperty("to_phone")
    private String toPhone;
    
    @JsonProperty("to_address")
    private String toAddress;
    
    @JsonProperty("weight")
    private Integer weight;
    
    @JsonProperty("length")
    private Integer length;
    
    @JsonProperty("width")
    private Integer width;
    
    @JsonProperty("height")
    private Integer height;
    
    @JsonProperty("service_id")
    private Integer serviceId;
    
    @JsonProperty("insurance_value")
    private Integer insuranceValue;
    
    @JsonProperty("cod_amount")
    private Integer codAmount;
    
    @JsonProperty("note")
    private String note;
    
    @JsonProperty("items")
    private List<GHNOrderItemDTO> items;
    
    @JsonProperty("client_order_code")
    private String clientOrderCode;
}
