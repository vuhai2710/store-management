package com.storemanagement.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storemanagement.utils.ConversationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO response cho conversation chat
 * Bao gồm thông tin khách hàng và tin nhắn mới nhất
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversationDto {
    
    @JsonProperty("idConversation")
    private Integer idConversation;
    
    @JsonProperty("idCustomer")
    private Integer idCustomer;
    
    @JsonProperty("customerName")
    private String customerName;
    
    @JsonProperty("status")
    private ConversationStatus status;
    
    @JsonProperty("lastMessage")
    private String lastMessage;  // Tin nhắn mới nhất
    
    @JsonProperty("lastMessageTime")
    private LocalDateTime lastMessageTime;  // Thời gian tin nhắn mới nhất
    
    @JsonProperty("unreadCount")
    private Long unreadCount;  // Số tin nhắn chưa đọc (có thể implement sau)
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}




