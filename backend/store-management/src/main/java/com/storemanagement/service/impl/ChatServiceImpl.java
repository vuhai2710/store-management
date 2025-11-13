package com.storemanagement.service.impl;

import com.storemanagement.dto.chat.ChatMessageRequest;
import com.storemanagement.dto.chat.ChatConversationDTO;
import com.storemanagement.dto.chat.ChatMessageDTO;
import com.storemanagement.model.*;
import com.storemanagement.repository.*;
import com.storemanagement.service.ChatService;
import com.storemanagement.utils.ConversationStatus;
import com.storemanagement.utils.SecurityUtils;
import com.storemanagement.utils.SenderType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service implementation cho Chat System
 * <p>
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
    public ChatConversationDTO createConversation(Integer customerId) {
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
    public ChatMessageDTO sendMessage(ChatMessageRequest request) {
        log.info("Sending message from {} ID: {} to conversation ID: {}",
                request.getSenderType(), request.getSenderId(), request.getConversationId());

        // Validate conversation tồn tại
        ChatConversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + request.getConversationId()));

//        Optional<Integer> currentUserId = SecurityUtils.getCurrentUserId();
        // Thêm LOGGING để debug
//        log.info("DEBUG - request.getSenderId(): {}, currentUserId: {}",
//                request.getSenderId(), currentUserId.orElse(null));
        // Validate senderId - phải khớp với user hiện tại
//        if (currentUserId.isEmpty() || !currentUserId.get().equals(request.getSenderId())) {
//            log.error("Validation failed - currentUserId: {}, senderId: {}",
//                    currentUserId.orElse(null), request.getSenderId());
//            throw new AccessDeniedException("Sender ID không khớp với user hiện tại");
//        }

        // Validate conversation access - customer chỉ có thể gửi tin nhắn trong conversation của mình
        Optional<String> currentRole = SecurityUtils.getCurrentRole();
        if (currentRole.isPresent() && "ROLE_CUSTOMER".equals(currentRole.get())) {
            validateConversationAccess(conversation.getIdConversation());
        }

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
    public Page<ChatMessageDTO> getConversationMessages(Integer conversationId, Pageable pageable) {
        log.info("Getting messages for conversation ID: {}", conversationId);

        // Validate conversation tồn tại
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        // Validate conversation access - customer chỉ có thể xem conversation của mình
        Optional<String> currentRole = SecurityUtils.getCurrentRole();
        if (currentRole.isPresent() && "ROLE_CUSTOMER".equals(currentRole.get())) {
            validateConversationAccess(conversationId);
        }

        Page<ChatMessage> messages = messageRepository.findByConversation_IdConversationOrderByCreatedAtAsc(conversationId, pageable);
        return messages.map(this::toMessageDto);
    }

    @Override
    public ChatConversationDTO getOrCreateCustomerConversation(Integer customerId) {
        log.info("Getting or creating conversation for customer ID: {}", customerId);

        // Tìm conversation OPEN
        return conversationRepository.findByCustomer_IdCustomerAndStatus(customerId, ConversationStatus.OPEN)
                .map(this::toConversationDto)
                .orElseGet(() -> createConversation(customerId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChatConversationDTO> getAllConversations(Pageable pageable) {
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
    public ChatConversationDTO getConversationById(Integer conversationId) {
        log.info("Getting conversation by ID: {}", conversationId);

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        // Validate conversation access - customer chỉ có thể xem conversation của mình
        Optional<String> currentRole = SecurityUtils.getCurrentRole();
        if (currentRole.isPresent() && "ROLE_CUSTOMER".equals(currentRole.get())) {
            validateConversationAccess(conversationId);
        }

        return toConversationDto(conversation);
    }

    // ============================================================
    // PRIVATE HELPER METHODS
    // ============================================================

    /**
     * Validate conversation access - đảm bảo customer chỉ có thể truy cập conversation của mình
     * Admin và Employee có thể truy cập tất cả conversations
     */
    private void validateConversationAccess(Integer conversationId) {
        Optional<Integer> currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId.isEmpty()) {
            throw new AccessDeniedException("Không thể xác định user hiện tại");
        }

        // Lấy customerId từ userId
        Customer customer = customerRepository.findByUser_IdUser(currentUserId.get())
                .orElseThrow(() -> new AccessDeniedException("Không tìm thấy khách hàng với user ID: " + currentUserId.get()));

        // Kiểm tra conversation thuộc về customer này
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        if (!conversation.getCustomer().getIdCustomer().equals(customer.getIdCustomer())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập cuộc hội thoại này");
        }
    }

    private ChatConversationDTO toConversationDto(ChatConversation conversation) {
        // Lấy tin nhắn mới nhất
        ChatMessage lastMessage = messageRepository.findLatestMessageByConversationId(conversation.getIdConversation());

        // Tính unread count
        Long unreadCount = calculateUnreadCount(conversation.getIdConversation());

        return ChatConversationDTO.builder()
                .idConversation(conversation.getIdConversation())
                .idCustomer(conversation.getCustomer().getIdCustomer())
                .customerName(conversation.getCustomer().getCustomerName())
                .status(conversation.getStatus())
                .lastMessage(lastMessage != null ? lastMessage.getMessage() : null)
                .lastMessageTime(lastMessage != null ? lastMessage.getCreatedAt() : null)
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    /**
     * Tính số tin nhắn chưa đọc
     * Logic:
     * - Nếu là customer: đếm tin nhắn từ ADMIN/EMPLOYEE sau tin nhắn cuối cùng của customer
     * - Nếu là admin/employee: đếm tin nhắn từ CUSTOMER sau tin nhắn cuối cùng của admin/employee
     * - Nếu không xác định được user: trả về 0
     */
    private Long calculateUnreadCount(Integer conversationId) {
        Optional<Integer> currentUserId = SecurityUtils.getCurrentUserId();
        Optional<String> currentRole = SecurityUtils.getCurrentRole();

        if (currentUserId.isEmpty() || currentRole.isEmpty()) {
            return 0L;
        }

        try {
            // Lấy thời gian tin nhắn cuối cùng của user hiện tại
            LocalDateTime lastMessageTime = messageRepository.findLastMessageTimeBySender(
                    conversationId, currentUserId.get());

            if (lastMessageTime == null) {
                // Nếu user chưa gửi tin nhắn nào, đếm tất cả tin nhắn từ phía kia
                lastMessageTime = LocalDateTime.of(1970, 1, 1, 0, 0);
            }

            // Xác định sender type cần đếm (tin nhắn từ phía kia)
            if ("ROLE_CUSTOMER".equals(currentRole.get())) {
                // Customer đếm tin nhắn từ ADMIN/EMPLOYEE
                // Vì có thể có nhiều admin/employee, đếm tất cả tin nhắn không phải CUSTOMER
                // Nhưng để đơn giản, ta đếm tin nhắn từ EMPLOYEE và ADMIN
                // Thực tế, ta cần đếm tất cả tin nhắn không phải từ customer này
                // Tạm thời đếm tin nhắn từ EMPLOYEE hoặc ADMIN
                return messageRepository.countUnreadMessages(conversationId, SenderType.EMPLOYEE, lastMessageTime) +
                        messageRepository.countUnreadMessages(conversationId, SenderType.ADMIN, lastMessageTime);
            } else {
                // Admin/Employee đếm tin nhắn từ CUSTOMER
                return messageRepository.countUnreadMessages(conversationId, SenderType.CUSTOMER, lastMessageTime);
            }
        } catch (Exception e) {
            log.error("Error calculating unread count: {}", e.getMessage());
            return 0L;
        }
    }

    private ChatMessageDTO toMessageDto(ChatMessage message) {
        String senderName = getSenderName(message.getSenderId(), message.getSenderType());

        return ChatMessageDTO.builder()
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


