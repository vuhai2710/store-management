package com.storemanagement.dto.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storemanagement.dto.base.BaseDTO;
import com.storemanagement.utils.ConversationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ChatConversationDTO extends BaseDTO {
    @JsonProperty("idConversation")
    private Integer idConversation;

    @JsonProperty("idCustomer")
    private Integer idCustomer;

    @JsonProperty("customerName")
    private String customerName;

    @JsonProperty("status")
    private ConversationStatus status;

    @JsonProperty("lastMessage")
    private String lastMessage;

    @JsonProperty("lastMessageTime")
    private LocalDateTime lastMessageTime;

    @JsonProperty("unreadCount")
    private Long unreadCount;
}
