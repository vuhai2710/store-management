package com.storemanagement.service.impl;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.security.Principal;

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

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Khách hàng không tồn tại với ID: " + customerId));

        return conversationRepository.findByCustomer_IdCustomerAndStatus(customerId, ConversationStatus.OPEN)
                .map(this::toConversationDto)
                .orElseGet(() -> {

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
    public ChatMessageDTO sendMessage(ChatMessageRequest request, Principal principal) {
        log.info("Sending message from {} ID: {} to conversation ID: {}",
                request.getSenderType(), request.getSenderId(), request.getConversationId());

        ChatConversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Cuộc hội thoại không tồn tại với ID: " + request.getConversationId()));

        Integer currentUserId = extractUserIdFromPrincipal(principal);
        if (currentUserId == null || !currentUserId.equals(request.getSenderId())) {
            log.warn("Access denied: principal userId={}, request senderId={}",
                    currentUserId, request.getSenderId());
            throw new AccessDeniedException("Sender ID không khớp với user hiện tại");
        }

        Optional<String> currentRole = SecurityUtils.getCurrentRole();
        if (currentRole.isPresent() && "ROLE_CUSTOMER".equals(currentRole.get())) {
            validateConversationAccess(conversation.getIdConversation());
        }

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .senderId(request.getSenderId())
                .senderType(request.getSenderType())
                .message(request.getMessage())
                .build();

        ChatMessage saved = messageRepository.save(message);

        conversation.setStatus(conversation.getStatus());
        conversationRepository.save(conversation);

        log.info("Message sent successfully, ID: {}", saved.getIdMessage());
        return toMessageDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChatMessageDTO> getConversationMessages(Integer conversationId, Pageable pageable) {
        log.info("Getting messages for conversation ID: {}", conversationId);

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(
                        () -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        Optional<String> currentRole = SecurityUtils.getCurrentRole();
        if (currentRole.isPresent() && "ROLE_CUSTOMER".equals(currentRole.get())) {
            validateConversationAccess(conversationId);
        }

        Page<ChatMessage> messages = messageRepository
                .findByConversation_IdConversationOrderByCreatedAtDesc(conversationId, pageable);

        java.util.List<ChatMessageDTO> dtoList = messages.getContent().stream()
                .map(this::toMessageDto)
                .collect(java.util.stream.Collectors.toList());
        java.util.Collections.reverse(dtoList);

        return new org.springframework.data.domain.PageImpl<>(dtoList, pageable, messages.getTotalElements());
    }

    @Override
    public ChatConversationDTO getOrCreateCustomerConversation(Integer customerId) {
        log.info("Getting or creating conversation for customer ID: {}", customerId);

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
                .orElseThrow(
                        () -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        conversation.setStatus(ConversationStatus.CLOSED);
        conversationRepository.save(conversation);

        log.info("Conversation closed successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ChatConversationDTO getConversationById(Integer conversationId) {
        log.info("Getting conversation by ID: {}", conversationId);

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(
                        () -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        Optional<String> currentRole = SecurityUtils.getCurrentRole();
        if (currentRole.isPresent() && "ROLE_CUSTOMER".equals(currentRole.get())) {
            validateConversationAccess(conversationId);
        }

        return toConversationDto(conversation);
    }

    private Integer extractUserIdFromPrincipal(Principal principal) {
        if (principal instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) principal;
            Jwt jwt = jwtAuth.getToken();
            Object idUserClaim = jwt.getClaim("idUser");

            if (idUserClaim instanceof Number) {
                return ((Number) idUserClaim).intValue();
            }
        }
        log.error("Cannot extract userId from principal: {}",
                principal != null ? principal.getClass() : "null");
        return null;
    }

    private Optional<String> extractRoleFromPrincipal(Principal principal) {
        if (principal instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) principal;
            Jwt jwt = jwtAuth.getToken();
            String role = jwt.getClaim("role");
            return Optional.ofNullable(role != null ? "ROLE_" + role : null);
        }
        return Optional.empty();
    }

    private void validateConversationAccess(Integer conversationId, Integer userId) {

        Customer customer = customerRepository.findByUser_IdUser(userId)
                .orElseThrow(() -> new AccessDeniedException("Không tìm thấy khách hàng với user ID: " + userId));

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(
                        () -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        if (!conversation.getCustomer().getIdCustomer().equals(customer.getIdCustomer())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập cuộc hội thoại này");
        }
    }

    private void validateConversationAccess(Integer conversationId) {
        Optional<Integer> currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId.isEmpty()) {
            throw new AccessDeniedException("Không thể xác định user hiện tại");
        }

        Customer customer = customerRepository.findByUser_IdUser(currentUserId.get())
                .orElseThrow(() -> new AccessDeniedException(
                        "Không tìm thấy khách hàng với user ID: " + currentUserId.get()));

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(
                        () -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        if (!conversation.getCustomer().getIdCustomer().equals(customer.getIdCustomer())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập cuộc hội thoại này");
        }
    }

    private ChatConversationDTO toConversationDto(ChatConversation conversation) {

        ChatMessage lastMessage = messageRepository.findLatestMessageByConversationId(conversation.getIdConversation());

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

    private Long calculateUnreadCount(Integer conversationId) {
        Optional<Integer> currentUserId = SecurityUtils.getCurrentUserId();
        Optional<String> currentRole = SecurityUtils.getCurrentRole();

        if (currentUserId.isEmpty() || currentRole.isEmpty()) {
            return 0L;
        }

        try {
            ChatConversation conversation = conversationRepository.findById(conversationId)
                    .orElse(null);

            if (conversation == null) {
                return 0L;
            }

            LocalDateTime lastViewedTime;

            if ("ROLE_CUSTOMER".equals(currentRole.get())) {

                lastViewedTime = conversation.getLastViewedByCustomerAt();
                if (lastViewedTime == null) {

                    lastViewedTime = LocalDateTime.of(1970, 1, 1, 0, 0);
                }
                return messageRepository.countUnreadMessages(conversationId, SenderType.EMPLOYEE, lastViewedTime) +
                        messageRepository.countUnreadMessages(conversationId, SenderType.ADMIN, lastViewedTime);
            } else {

                lastViewedTime = conversation.getLastViewedByAdminAt();
                if (lastViewedTime == null) {

                    lastViewedTime = LocalDateTime.of(1970, 1, 1, 0, 0);
                }
                return messageRepository.countUnreadMessages(conversationId, SenderType.CUSTOMER, lastViewedTime);
            }
        } catch (Exception e) {
            log.error("Error calculating unread count: {}", e.getMessage());
            return 0L;
        }
    }

    private ChatMessageDTO toMessageDto(ChatMessage message) {
        String senderName = getSenderName(message.getSenderId(), message.getSenderType());
        String senderRole = getSenderRole(message.getSenderId(), message.getSenderType());

        return ChatMessageDTO.builder()
                .idMessage(message.getIdMessage())
                .conversationId(message.getConversation().getIdConversation())
                .senderId(message.getSenderId())
                .senderType(message.getSenderType())
                .senderName(senderName)
                .senderRole(senderRole)
                .message(message.getMessage())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private String getSenderRole(Integer senderId, SenderType senderType) {
        try {
            if (senderType == SenderType.CUSTOMER) {
                return "CUSTOMER";
            }

            User user = userRepository.findById(senderId).orElse(null);
            if (user != null && user.getRole() != null) {
                return user.getRole().name();
            }

            return senderType.name();
        } catch (Exception e) {
            log.error("Error getting sender role: {}", e.getMessage());
            return senderType.name();
        }
    }

    private String getSenderName(Integer senderId, SenderType senderType) {
        try {
            User user = userRepository.findById(senderId).orElse(null);
            if (user == null) {
                return "Unknown";
            }

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

    @Override
    @Transactional
    public void markConversationAsViewed(Integer conversationId) {
        log.info("Marking conversation {} as viewed", conversationId);

        Optional<Integer> currentUserId = SecurityUtils.getCurrentUserId();
        Optional<String> currentRole = SecurityUtils.getCurrentRole();

        if (currentUserId.isEmpty() || currentRole.isEmpty()) {
            throw new AccessDeniedException("Chưa đăng nhập");
        }

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(
                        () -> new EntityNotFoundException("Cuộc hội thoại không tồn tại với ID: " + conversationId));

        LocalDateTime now = LocalDateTime.now();

        if ("ROLE_CUSTOMER".equals(currentRole.get())) {

            validateConversationAccess(conversationId);
            conversation.setLastViewedByCustomerAt(now);
        } else {

            conversation.setLastViewedByAdminAt(now);
        }

        conversationRepository.save(conversation);
        log.info("Conversation {} marked as viewed by user {} at {}", conversationId, currentUserId.get(), now);
    }

    @Override
    public ChatConversationDTO getOrCreateConversationForCustomer(Integer customerId) {
        log.info("Admin/Employee getting or creating conversation for customer ID: {}", customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Khách hàng không tồn tại với ID: " + customerId));

        return conversationRepository.findByCustomer_IdCustomerAndStatus(customerId, ConversationStatus.OPEN)
                .map(this::toConversationDto)
                .orElseGet(() -> {

                    ChatConversation conversation = ChatConversation.builder()
                            .customer(customer)
                            .status(ConversationStatus.OPEN)
                            .build();

                    ChatConversation saved = conversationRepository.save(conversation);
                    log.info("Created new conversation ID: {} for customer ID: {}", saved.getIdConversation(),
                            customerId);
                    return toConversationDto(saved);
                });
    }
}
