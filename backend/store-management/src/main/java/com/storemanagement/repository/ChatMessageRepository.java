package com.storemanagement.repository;

import com.storemanagement.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    
    /**
     * Lấy tất cả tin nhắn của conversation, có phân trang
     * Sắp xếp theo thời gian tạo (cũ nhất trước)
     */
    Page<ChatMessage> findByConversation_IdConversationOrderByCreatedAtAsc(Integer conversationId, Pageable pageable);
    
    /**
     * Lấy tin nhắn mới nhất của conversation
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.conversation.idConversation = :conversationId ORDER BY m.createdAt DESC LIMIT 1")
    ChatMessage findLatestMessageByConversationId(@Param("conversationId") Integer conversationId);
    
    /**
     * Đếm số lượng tin nhắn trong conversation
     */
    long countByConversation_IdConversation(Integer conversationId);
}




