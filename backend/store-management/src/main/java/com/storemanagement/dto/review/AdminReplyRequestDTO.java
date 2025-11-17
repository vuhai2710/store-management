package com.storemanagement.dto.review;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReplyRequestDTO {
    @NotBlank(message = "Admin reply không được để trống")
    private String adminReply;
}
