package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNTrackingDTO {

    @JsonProperty("order_code")
    private String orderCode;

    @JsonProperty("status")
    private String status;

    @JsonProperty("tracking")
    private List<GHNTrackingEventDTO> tracking;
}
