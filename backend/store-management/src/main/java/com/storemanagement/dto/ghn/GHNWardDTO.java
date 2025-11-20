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
public class GHNWardDTO {

    @JsonProperty("WardCode")
    private String wardCode;

    @JsonProperty("DistrictID")
    private Integer districtId;

    @JsonProperty("WardName")
    private String wardName;
}
