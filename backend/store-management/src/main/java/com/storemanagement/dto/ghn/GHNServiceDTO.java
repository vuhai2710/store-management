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
public class GHNServiceDTO {

    @JsonProperty("service_id")
    private Integer serviceId;

    @JsonProperty("short_name")
    private String shortName;

    @JsonProperty("service_type_id")
    private Integer serviceTypeId;
}
