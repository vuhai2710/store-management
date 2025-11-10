package com.storemanagement.dto.request;

import com.storemanagement.utils.SenderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO request để gửi tin nhắn chat
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageRequest {
    
    @NotNull(message = "ID conversation không được để trống")
    private Integer conversationId;
    
    @NotNull(message = "ID người gửi không được để trống")
    private Integer senderId;
    
    @NotNull(message = "Loại người gửi không được để trống")
    private SenderType senderType;
    
    @NotBlank(message = "Tin nhắn không được để trống")
    private String message;
}





