package com.storemanagement.dto.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storemanagement.utils.SenderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ChatMessageDTO không kế thừa BaseDTO vì ChatMessage entity chỉ có created_at (không có updated_at)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
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
    
    @JsonProperty("senderRole")
    private String senderRole;  // Role của người gửi: ADMIN, EMPLOYEE, CUSTOMER
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
}
