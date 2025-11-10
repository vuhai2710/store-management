package com.storemanagement.service.impl;

import com.storemanagement.dto.request.ChatMessageRequest;
import com.storemanagement.dto.response.ChatConversationDto;
import com.storemanagement.dto.response.ChatMessageDto;
import com.storemanagement.model.*;
import com.storemanagement.repository.*;
import com.storemanagement.service.ChatService;
import com.storemanagement.utils.ConversationStatus;
import com.storemanagement.utils.SenderType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation cho Chat System
 * 
 * Business Logic:
 * - Mỗi customer có thể có nhiều conversations (nhưng chỉ 1 OPEN tại một thời điểm)
 * - Admin và Employee có thể xem và trả lời tất cả conversations
 * - Tin nhắn được lưu vào database để có thể xem lại lịch sử
 * - Khi gửi tin nhắn, conversation.updatedAt được cập nhật tự động
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChatServiceImpl implements ChatService {
    
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    
    @Override
    public ChatConversationDto createConversation(Integer customerId) {
        log.info("Creating conversation for customer ID: {}", customerId);
        
        // Validate customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Khách hàng không tồn tại với ID: " + customerId));
        
        // Kiểm tra xem customer đã có conversation OPEN chưa
        return conversationRepository.findByCustomer_IdCustomerAndStatus(customerId, ConversationStatus.OPEN)
                .map(this::toConversationDto)
                .orElseGet(() -> {
                    // Tạo conversation mới
                    ChatConversation conversation = ChatConversation.builder()
                            .customer(customer)
                            .status(ConversationStatus.OPEN)
                            .build();
                    
                    ChatConversation saved = conversationRepository.save(conversation);
                    log.info("Created new conversation ID: {}", saved.getIdConversation());
                    return toConversationDto(saved);
                });
    }
    
    @Override
    public ChatMessageDto sendMessage(ChatMessageRequest request) {
        log.info("Sending message from {} ID: {} to conversation ID: {}", 
                request.getSenderType(), request.getSenderId(), request.getConversationId());
        
        // Validate conversation tồn tại
        ChatConversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + request.getConversationId()));
        
        // Tạo message entity
        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .senderId(request.getSenderId())
                .senderType(request.getSenderType())
                .message(request.getMessage())
                .build();
        
        ChatMessage saved = messageRepository.save(message);
        
        // Cập nhật conversation.updatedAt (tự động bởi @PreUpdate trong BaseEntity)
        conversation.setStatus(conversation.getStatus()); // Trigger update
        conversationRepository.save(conversation);
        
        log.info("Message sent successfully, ID: {}", saved.getIdMessage());
        return toMessageDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getConversationMessages(Integer conversationId, Pageable pageable) {
        log.info("Getting messages for conversation ID: {}", conversationId);
        
        // Validate conversation tồn tại
        if (!conversationRepository.existsById(conversationId)) {
            throw new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId);
        }
        
        Page<ChatMessage> messages = messageRepository.findByConversation_IdConversationOrderByCreatedAtAsc(conversationId, pageable);
        return messages.map(this::toMessageDto);
    }
    
    @Override
    public ChatConversationDto getOrCreateCustomerConversation(Integer customerId) {
        log.info("Getting or creating conversation for customer ID: {}", customerId);
        
        // Tìm conversation OPEN
        return conversationRepository.findByCustomer_IdCustomerAndStatus(customerId, ConversationStatus.OPEN)
                .map(this::toConversationDto)
                .orElseGet(() -> createConversation(customerId));
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ChatConversationDto> getAllConversations(Pageable pageable) {
        log.info("Getting all conversations");
        
        Page<ChatConversation> conversations = conversationRepository.findAllOrderByUpdatedAtDesc(pageable);
        return conversations.map(this::toConversationDto);
    }
    
    @Override
    public void closeConversation(Integer conversationId) {
        log.info("Closing conversation ID: {}", conversationId);
        
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));
        
        conversation.setStatus(ConversationStatus.CLOSED);
        conversationRepository.save(conversation);
        
        log.info("Conversation closed successfully");
    }
    
    @Override
    @Transactional(readOnly = true)
    public ChatConversationDto getConversationById(Integer conversationId) {
        log.info("Getting conversation by ID: {}", conversationId);
        
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));
        
        return toConversationDto(conversation);
    }
    
    // ============================================================
    // PRIVATE HELPER METHODS
    // ============================================================
    
    private ChatConversationDto toConversationDto(ChatConversation conversation) {
        // Lấy tin nhắn mới nhất
        ChatMessage lastMessage = messageRepository.findLatestMessageByConversationId(conversation.getIdConversation());
        
        return ChatConversationDto.builder()
                .idConversation(conversation.getIdConversation())
                .idCustomer(conversation.getCustomer().getIdCustomer())
                .customerName(conversation.getCustomer().getCustomerName())
                .status(conversation.getStatus())
                .lastMessage(lastMessage != null ? lastMessage.getMessage() : null)
                .lastMessageTime(lastMessage != null ? lastMessage.getCreatedAt() : null)
                .unreadCount(0L) // TODO: Implement unread count if needed
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }
    
    private ChatMessageDto toMessageDto(ChatMessage message) {
        String senderName = getSenderName(message.getSenderId(), message.getSenderType());
        
        return ChatMessageDto.builder()
                .idMessage(message.getIdMessage())
                .conversationId(message.getConversation().getIdConversation())
                .senderId(message.getSenderId())
                .senderType(message.getSenderType())
                .senderName(senderName)
                .message(message.getMessage())
                .createdAt(message.getCreatedAt())
                .build();
    }
    
    private String getSenderName(Integer senderId, SenderType senderType) {
        try {
            User user = userRepository.findById(senderId).orElse(null);
            if (user == null) {
                return "Unknown";
            }
            
            // Lấy tên từ bảng tương ứng
            if (senderType == SenderType.CUSTOMER) {
                return customerRepository.findByUser_IdUser(senderId)
                        .map(Customer::getCustomerName)
                        .orElse(user.getUsername());
            } else if (senderType == SenderType.EMPLOYEE || senderType == SenderType.ADMIN) {
                return employeeRepository.findByUser_IdUser(senderId)
                        .map(Employee::getEmployeeName)
                        .orElse(user.getUsername());
            }
            
            return user.getUsername();
        } catch (Exception e) {
            log.error("Error getting sender name: {}", e.getMessage());
            return "Unknown";
        }
    }
}


