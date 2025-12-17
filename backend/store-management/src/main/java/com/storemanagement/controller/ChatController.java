package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.chat.ChatConversationDTO;
import com.storemanagement.dto.chat.ChatMessageDTO;
import com.storemanagement.model.Customer;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.service.ChatService;
import com.storemanagement.utils.SecurityUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final CustomerRepository customerRepository;

    @PostMapping("/conversations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ChatConversationDTO>> createConversation() {
        Integer userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Không thể xác định user hiện tại"));
        log.info("Creating conversation for user ID: {}", userId);

        Customer customer = customerRepository.findByUser_IdUser(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với user ID: " + userId));

        ChatConversationDTO conversation = chatService.createConversation(customer.getIdCustomer());
        return ResponseEntity.ok(ApiResponse.success("Tạo cuộc hội thoại thành công", conversation));
    }

    @GetMapping("/conversations/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ChatConversationDTO>> getMyConversation() {
        Integer userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Không thể xác định user hiện tại"));
        log.info("Getting conversation for user ID: {}", userId);

        Customer customer = customerRepository.findByUser_IdUser(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với user ID: " + userId));

        ChatConversationDTO conversation = chatService.getOrCreateCustomerConversation(customer.getIdCustomer());
        return ResponseEntity.ok(ApiResponse.success("Lấy cuộc hội thoại thành công", conversation));
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ChatConversationDTO>>> getAllConversations(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "20") Integer pageSize) {

        log.info("Getting all conversations, page: {}, size: {}", pageNo, pageSize);

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);
        Page<ChatConversationDTO> conversations = chatService.getAllConversations(pageable);

        PageResponse<ChatConversationDTO> response = PageResponse.<ChatConversationDTO>builder()
                .content(conversations.getContent())
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(conversations.getTotalElements())
                .totalPages(conversations.getTotalPages())
                .isFirst(conversations.isFirst())
                .isLast(conversations.isLast())
                .hasNext(conversations.hasNext())
                .hasPrevious(conversations.hasPrevious())
                .isEmpty(conversations.isEmpty())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách cuộc hội thoại thành công", response));
    }

    @GetMapping("/conversations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ChatConversationDTO>> getConversationById(@PathVariable Integer id) {
        log.info("Getting conversation ID: {}", id);

        ChatConversationDTO conversation = chatService.getConversationById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin cuộc hội thoại thành công", conversation));
    }

    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ChatMessageDTO>>> getConversationMessages(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "50") Integer pageSize) {

        log.info("Getting messages for conversation ID: {}, page: {}, size: {}", id, pageNo, pageSize);

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);
        Page<ChatMessageDTO> messages = chatService.getConversationMessages(id, pageable);

        PageResponse<ChatMessageDTO> response = PageResponse.<ChatMessageDTO>builder()
                .content(messages.getContent())
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(messages.getTotalElements())
                .totalPages(messages.getTotalPages())
                .isFirst(messages.isFirst())
                .isLast(messages.isLast())
                .hasNext(messages.hasNext())
                .hasPrevious(messages.hasPrevious())
                .isEmpty(messages.isEmpty())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử tin nhắn thành công", response));
    }

    @PutMapping("/conversations/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> closeConversation(@PathVariable Integer id) {
        log.info("Closing conversation ID: {}", id);

        chatService.closeConversation(id);
        return ResponseEntity.ok(ApiResponse.success("Đóng cuộc hội thoại thành công", null));
    }

    @PutMapping("/conversations/{id}/mark-viewed")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> markConversationAsViewed(@PathVariable Integer id) {
        log.info("Marking conversation ID: {} as viewed", id);

        chatService.markConversationAsViewed(id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu cuộc hội thoại đã xem", null));
    }

    @PostMapping("/conversations/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ChatConversationDTO>> getOrCreateConversationForCustomer(
            @PathVariable Integer customerId) {
        log.info("Admin/Employee getting or creating conversation for customer ID: {}", customerId);

        ChatConversationDTO conversation = chatService.getOrCreateConversationForCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Lấy hoặc tạo cuộc hội thoại thành công", conversation));
    }
}
