package com.storemanagement.service;

import com.storemanagement.dto.chat.ChatMessageRequest;
import com.storemanagement.dto.chat.ChatConversationDTO;
import com.storemanagement.dto.chat.ChatMessageDTO;

import java.security.Principal;

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
     * @return ChatConversationDTO
     */
    ChatConversationDTO createConversation(Integer customerId);
    
    /**
     * Gửi tin nhắn và lưu vào database
     * 
     * @param request ChatMessageRequest
     * @return ChatMessageDTO đã được lưu
     */
//    ChatMessageDTO sendMessage(ChatMessageRequest request);
    
    /**
     * Lấy lịch sử tin nhắn của conversation (có phân trang)
     * 
     * @param conversationId ID của conversation
     * @param pageable Phân trang
     * @return Page<ChatMessageDTO>
     */
    Page<ChatMessageDTO> getConversationMessages(Integer conversationId, Pageable pageable);
    
    /**
     * Lấy hoặc tạo conversation của customer
     * Nếu chưa có conversation OPEN, tạo mới
     * 
     * @param customerId ID của customer
     * @return ChatConversationDTO
     */
    ChatConversationDTO getOrCreateCustomerConversation(Integer customerId);
    
    /**
     * Lấy tất cả conversations cho Admin/Employee (có phân trang)
     * 
     * @param pageable Phân trang
     * @return Page<ChatConversationDTO>
     */
    Page<ChatConversationDTO> getAllConversations(Pageable pageable);
    
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
     * @return ChatConversationDTO
     */
    ChatConversationDTO getConversationById(Integer conversationId);

    // Thêm Principal parameter
    ChatMessageDTO sendMessage(ChatMessageRequest request, Principal principal);
    
    /**
     * Đánh dấu conversation đã được xem bởi user hiện tại
     * Cập nhật lastViewedByAdminAt hoặc lastViewedByCustomerAt
     * 
     * @param conversationId ID của conversation
     */
    void markConversationAsViewed(Integer conversationId);
}











