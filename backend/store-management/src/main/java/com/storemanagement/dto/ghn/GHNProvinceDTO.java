package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho Tỉnh/Thành phố từ GHN API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNProvinceDTO {

    @JsonProperty("ProvinceID")
    private Integer provinceId;

    @JsonProperty("ProvinceName")
    private String provinceName;

    @JsonProperty("Code")
    private String code;
}
