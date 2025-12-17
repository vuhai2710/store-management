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

        Page<ChatMessage> findByConversation_IdConversationOrderByCreatedAtAsc(Integer conversationId,
                        Pageable pageable);

        // Get messages in DESC order (newest first) for pagination to get latest
        // messages
        Page<ChatMessage> findByConversation_IdConversationOrderByCreatedAtDesc(Integer conversationId,
                        Pageable pageable);

        @Query("SELECT m FROM ChatMessage m WHERE m.conversation.idConversation = :conversationId ORDER BY m.createdAt DESC LIMIT 1")
        ChatMessage findLatestMessageByConversationId(@Param("conversationId") Integer conversationId);

        long countByConversation_IdConversation(Integer conversationId);

        @Query("SELECT COUNT(m) FROM ChatMessage m " +
                        "WHERE m.conversation.idConversation = :conversationId " +
                        "AND m.senderType = :senderType " +
                        "AND m.createdAt > :afterTime")
        long countUnreadMessages(
                        @Param("conversationId") Integer conversationId,
                        @Param("senderType") SenderType senderType,
                        @Param("afterTime") LocalDateTime afterTime);

        @Query("SELECT MAX(m.createdAt) FROM ChatMessage m " +
                        "WHERE m.conversation.idConversation = :conversationId " +
                        "AND m.senderId = :senderId")
        LocalDateTime findLastMessageTimeBySender(
                        @Param("conversationId") Integer conversationId,
                        @Param("senderId") Integer senderId);
}