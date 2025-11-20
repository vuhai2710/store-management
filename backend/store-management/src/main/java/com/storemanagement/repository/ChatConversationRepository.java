package com.storemanagement.repository;

import com.storemanagement.model.ChatConversation;
import com.storemanagement.utils.ConversationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Integer> {

    Optional<ChatConversation> findByCustomer_IdCustomerAndStatus(Integer customerId, ConversationStatus status);

    Page<ChatConversation> findByCustomer_IdCustomer(Integer customerId, Pageable pageable);

    @Query("SELECT c FROM ChatConversation c WHERE c.status = :status ORDER BY c.updatedAt DESC")
    Page<ChatConversation> findByStatusOrderByUpdatedAtDesc(@Param("status") ConversationStatus status, Pageable pageable);

    @Query("SELECT c FROM ChatConversation c ORDER BY c.updatedAt DESC")
    Page<ChatConversation> findAllOrderByUpdatedAtDesc(Pageable pageable);
}
