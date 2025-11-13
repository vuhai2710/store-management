package com.storemanagement.model;

import com.storemanagement.utils.ConversationStatus;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity cho ChatConversation (Hội thoại chat)
 * 
 * Mỗi khách hàng có thể có một hoặc nhiều cuộc hội thoại
 * Admin và Employee có thể xem và trả lời tất cả cuộc hội thoại
 * 
 * Business Rules:
 * - Một customer có thể có nhiều conversations (lịch sử chat)
 * - Status OPEN: đang hoạt động, CLOSED: đã kết thúc
 * - updated_at tự động cập nhật khi có tin nhắn mới
 */
@Entity
@Table(name = "chat_conversations")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversation extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conversation")
    private Integer idConversation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_customer", nullable = false)
    private Customer customer;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ConversationStatus status = ConversationStatus.OPEN;
}

























