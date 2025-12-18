package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNCalculateFeeResponseDTO {

    @JsonProperty("total")
    private BigDecimal total;

    @JsonProperty("service_fee")
    private BigDecimal serviceFee;

    @JsonProperty("insurance_fee")
    private BigDecimal insuranceFee;

    @JsonProperty("pick_station_fee")
    private BigDecimal pickStationFee;

    @JsonProperty("courier_station_fee")
    private BigDecimal courierStationFee;

    @JsonProperty("cod_fee")
    private BigDecimal codFee;

    @JsonProperty("return_fee")
    private BigDecimal returnFee;

    @JsonProperty("r2s_fee")
    private BigDecimal r2sFee;
}
