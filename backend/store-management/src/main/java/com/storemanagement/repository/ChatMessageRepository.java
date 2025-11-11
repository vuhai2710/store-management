package com.storemanagement.repository;

import com.storemanagement.model.ChatMessage;
import com.storemanagement.utils.SenderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

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
    
    /**
     * Đếm số tin nhắn chưa đọc từ một sender type sau một thời điểm
     * Dùng để tính unread count: đếm tin nhắn từ phía kia sau tin nhắn cuối cùng của user hiện tại
     */
    @Query("SELECT COUNT(m) FROM ChatMessage m " +
           "WHERE m.conversation.idConversation = :conversationId " +
           "AND m.senderType = :senderType " +
           "AND m.createdAt > :afterTime")
    long countUnreadMessages(
            @Param("conversationId") Integer conversationId,
            @Param("senderType") SenderType senderType,
            @Param("afterTime") LocalDateTime afterTime
    );
    
    /**
     * Lấy thời gian tin nhắn cuối cùng của một sender type trong conversation
     */
    @Query("SELECT MAX(m.createdAt) FROM ChatMessage m " +
           "WHERE m.conversation.idConversation = :conversationId " +
           "AND m.senderId = :senderId")
    LocalDateTime findLastMessageTimeBySender(
            @Param("conversationId") Integer conversationId,
            @Param("senderId") Integer senderId
    );
}














