package com.storemanagement.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storemanagement.utils.SenderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO response cho tin nhắn chat
 * Bao gồm thông tin người gửi để hiển thị trên frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    
    @JsonProperty("idMessage")
    private Integer idMessage;
    
    @JsonProperty("conversationId")
    private Integer conversationId;
    
    @JsonProperty("senderId")
    private Integer senderId;
    
    @JsonProperty("senderType")
    private SenderType senderType;
    
    @JsonProperty("senderName")
    private String senderName;  // Tên người gửi (lấy từ User/Customer/Employee)
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
}




