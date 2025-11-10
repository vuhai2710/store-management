package com.storemanagement.service;

import com.storemanagement.dto.request.ChatMessageRequest;
import com.storemanagement.dto.response.ChatConversationDto;
import com.storemanagement.dto.response.ChatMessageDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface cho Chat System
 * 
 * Quản lý cuộc hội thoại và tin nhắn giữa Customer và Admin/Employee
 */
public interface ChatService {
    
    /**
     * Tạo cuộc hội thoại mới cho customer
     * Nếu customer đã có conversation đang OPEN, trả về conversation đó
     * 
     * @param customerId ID của customer
     * @return ChatConversationDto
     */
    ChatConversationDto createConversation(Integer customerId);
    
    /**
     * Gửi tin nhắn và lưu vào database
     * 
     * @param request ChatMessageRequest
     * @return ChatMessageDto đã được lưu
     */
    ChatMessageDto sendMessage(ChatMessageRequest request);
    
    /**
     * Lấy lịch sử tin nhắn của conversation (có phân trang)
     * 
     * @param conversationId ID của conversation
     * @param pageable Phân trang
     * @return Page<ChatMessageDto>
     */
    Page<ChatMessageDto> getConversationMessages(Integer conversationId, Pageable pageable);
    
    /**
     * Lấy hoặc tạo conversation của customer
     * Nếu chưa có conversation OPEN, tạo mới
     * 
     * @param customerId ID của customer
     * @return ChatConversationDto
     */
    ChatConversationDto getOrCreateCustomerConversation(Integer customerId);
    
    /**
     * Lấy tất cả conversations cho Admin/Employee (có phân trang)
     * 
     * @param pageable Phân trang
     * @return Page<ChatConversationDto>
     */
    Page<ChatConversationDto> getAllConversations(Pageable pageable);
    
    /**
     * Đóng conversation
     * 
     * @param conversationId ID của conversation
     */
    void closeConversation(Integer conversationId);
    
    /**
     * Lấy conversation theo ID
     * 
     * @param conversationId ID của conversation
     * @return ChatConversationDto
     */
    ChatConversationDto getConversationById(Integer conversationId);
}




