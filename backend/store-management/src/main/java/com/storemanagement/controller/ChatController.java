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

/**
 * REST Controller cho Chat System
 * 
 * Cung cấp các endpoint để:
 * - Tạo và quản lý conversations
 * - Lấy lịch sử tin nhắn
 * - Đóng conversations
 * 
 * Lưu ý: Gửi tin nhắn realtime được xử lý qua WebSocket (ChatWebSocketController)
 */
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final ChatService chatService;
    private final CustomerRepository customerRepository;
    
    /**
     * Tạo conversation mới cho customer
     * POST /api/v1/chat/conversations
     * 
     * Customer tự tạo conversation khi muốn chat với admin/employee
     */
    @PostMapping("/conversations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ChatConversationDTO>> createConversation() {
        Integer userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Không thể xác định user hiện tại"));
        log.info("Creating conversation for user ID: {}", userId);
        
        // Lấy customerId từ userId
        Customer customer = customerRepository.findByUser_IdUser(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với user ID: " + userId));
        
        ChatConversationDTO conversation = chatService.createConversation(customer.getIdCustomer());
        return ResponseEntity.ok(ApiResponse.success("Tạo cuộc hội thoại thành công", conversation));
    }
    
    /**
     * Lấy conversation của customer hiện tại
     * GET /api/v1/chat/conversations/my
     * 
     * Trả về conversation OPEN của customer, hoặc tạo mới nếu chưa có
     */
    @GetMapping("/conversations/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ChatConversationDTO>> getMyConversation() {
        Integer userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Không thể xác định user hiện tại"));
        log.info("Getting conversation for user ID: {}", userId);
        
        // Lấy customerId từ userId
        Customer customer = customerRepository.findByUser_IdUser(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với user ID: " + userId));
        
        ChatConversationDTO conversation = chatService.getOrCreateCustomerConversation(customer.getIdCustomer());
        return ResponseEntity.ok(ApiResponse.success("Lấy cuộc hội thoại thành công", conversation));
    }
    
    /**
     * Lấy tất cả conversations (cho Admin/Employee)
     * GET /api/v1/chat/conversations
     * 
     * Phân trang, sắp xếp theo updatedAt DESC (mới nhất trước)
     */
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
    
    /**
     * Lấy chi tiết conversation theo ID
     * GET /api/v1/chat/conversations/{id}
     */
    @GetMapping("/conversations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ChatConversationDTO>> getConversationById(@PathVariable Integer id) {
        log.info("Getting conversation ID: {}", id);
        
        ChatConversationDTO conversation = chatService.getConversationById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin cuộc hội thoại thành công", conversation));
    }
    
    /**
     * Lấy lịch sử tin nhắn của conversation
     * GET /api/v1/chat/conversations/{id}/messages
     * 
     * Phân trang, sắp xếp theo createdAt ASC (cũ nhất trước)
     */
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
    
    /**
     * Đóng conversation
     * PUT /api/v1/chat/conversations/{id}/close
     * 
     * Chỉ Admin và Employee mới có quyền đóng conversation
     */
    @PutMapping("/conversations/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> closeConversation(@PathVariable Integer id) {
        log.info("Closing conversation ID: {}", id);
        
        chatService.closeConversation(id);
        return ResponseEntity.ok(ApiResponse.success("Đóng cuộc hội thoại thành công", null));
    }
    
    /**
     * Đánh dấu conversation đã được xem
     * PUT /api/v1/chat/conversations/{id}/mark-viewed
     * 
     * Cập nhật lastViewedByAdminAt hoặc lastViewedByCustomerAt
     * Điều này giúp tính unread count chính xác hơn
     */
    @PutMapping("/conversations/{id}/mark-viewed")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> markConversationAsViewed(@PathVariable Integer id) {
        log.info("Marking conversation ID: {} as viewed", id);
        
        chatService.markConversationAsViewed(id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu cuộc hội thoại đã xem", null));
    }
}


