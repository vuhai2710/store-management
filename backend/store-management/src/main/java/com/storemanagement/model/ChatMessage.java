package com.storemanagement.model;

import com.storemanagement.utils.SenderType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity cho ChatMessage (Tin nhắn chat)
 * 
 * Mỗi tin nhắn thuộc về một conversation
 * sender_id và sender_type xác định người gửi (Customer/Admin/Employee)
 * 
 * Business Rules:
 * - sender_id là ID của user trong bảng users
 * - sender_type xác định loại người gửi (CUSTOMER, ADMIN, EMPLOYEE)
 * - Tin nhắn được sắp xếp theo thời gian tạo (created_at)
 */
@Entity
@Table(name = "chat_messages")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_message")
    private Integer idMessage;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_conversation", nullable = false)
    private ChatConversation conversation;
    
    @Column(name = "sender_id", nullable = false)
    private Integer senderId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false)
    private SenderType senderType;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
}










