package com.storemanagement.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.dto.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final ObjectMapper objectMapper;

    // DUPLICATE KEY (DB constraint)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicate(DataIntegrityViolationException ex) {
        String message = "Dữ liệu đã tồn tại";
        String rootMsg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        if (rootMsg != null) {
            if (rootMsg.contains("username")) {
                message = "Tên đăng nhập đã tồn tại";
            } else if (rootMsg.contains("email")) {
                message = "Email đã được sử dụng";
            } else if (rootMsg.contains("phone_number") || rootMsg.toLowerCase().contains("phone")) {
                message = "Số điện thoại đã được sử dụng";
            }
        }

        ApiResponse<Void> response = ApiResponse.error(400, message);
        return ResponseEntity.badRequest().body(response);
    }

    // VALIDATION ERROR
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        ApiResponse<Void> response = ApiResponse.error(
                400,
                "Dữ liệu không hợp lệ",
                errors
        );
        return ResponseEntity.badRequest().body(response);
    }

    // BUSINESS EXCEPTION
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(RuntimeException ex) {
        ApiResponse<Void> response = ApiResponse.error(400, ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    // NOT FOUND
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        ApiResponse<Void> response = ApiResponse.error(404, ex.getMessage());
        return ResponseEntity.status(404).body(response);
    }
}
