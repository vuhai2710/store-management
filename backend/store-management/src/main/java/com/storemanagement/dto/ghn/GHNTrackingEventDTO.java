package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho một sự kiện tracking từ GHN API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNTrackingEventDTO {
    
    @JsonProperty("time")
    private String time;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("location")
    private String location;
}







