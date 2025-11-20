package com.storemanagement.model;

import com.storemanagement.utils.ConversationStatus;
import jakarta.persistence.*;
import lombok.*;

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
    
    @Column(name = "last_viewed_by_admin_at")
    private java.time.LocalDateTime lastViewedByAdminAt;
    
    @Column(name = "last_viewed_by_customer_at")
    private java.time.LocalDateTime lastViewedByCustomerAt;
}