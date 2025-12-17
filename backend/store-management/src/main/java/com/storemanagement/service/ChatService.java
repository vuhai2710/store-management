package com.storemanagement.service;

import com.storemanagement.dto.chat.ChatMessageRequest;
import com.storemanagement.dto.chat.ChatConversationDTO;
import com.storemanagement.dto.chat.ChatMessageDTO;

import java.security.Principal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatService {

    ChatConversationDTO createConversation(Integer customerId);

    Page<ChatMessageDTO> getConversationMessages(Integer conversationId, Pageable pageable);

    ChatConversationDTO getOrCreateCustomerConversation(Integer customerId);

    Page<ChatConversationDTO> getAllConversations(Pageable pageable);

    void closeConversation(Integer conversationId);

    ChatConversationDTO getConversationById(Integer conversationId);

    ChatMessageDTO sendMessage(ChatMessageRequest request, Principal principal);

    void markConversationAsViewed(Integer conversationId);

    ChatConversationDTO getOrCreateConversationForCustomer(Integer customerId);
}
