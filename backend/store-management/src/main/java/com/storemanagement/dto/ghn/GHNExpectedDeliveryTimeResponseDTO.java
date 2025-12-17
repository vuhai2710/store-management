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
public class GHNExpectedDeliveryTimeResponseDTO {
    @JsonProperty("leadtime")
    private String leadtime;

    @JsonProperty("order_date")
    private String orderDate;
}
