package com.storemanagement.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Optional;

/**
 * Utility class để lấy thông tin từ JWT token và SecurityContext
 * Tối ưu hóa bằng cách lấy trực tiếp từ JWT claims thay vì query database
 */
public class SecurityUtils {

    /**
     * Lấy employeeId từ JWT token
     * Trả về Optional.empty() nếu không phải employee hoặc không có trong token
     * 
     * @return Optional<Integer> employeeId
     */
    public static Optional<Integer> getCurrentEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !(authentication instanceof JwtAuthenticationToken)) {
            return Optional.empty();
        }
        
        JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
        Jwt jwt = jwtAuth.getToken();
        
        // Lấy employeeId từ JWT claims
        Object employeeIdClaim = jwt.getClaim("employeeId");
        if (employeeIdClaim == null) {
            return Optional.empty();
        }
        
        // Xử lý trường hợp employeeId là số (Integer hoặc Long)
        if (employeeIdClaim instanceof Integer) {
            return Optional.of((Integer) employeeIdClaim);
        } else if (employeeIdClaim instanceof Long) {
            return Optional.of(((Long) employeeIdClaim).intValue());
        } else if (employeeIdClaim instanceof Number) {
            return Optional.of(((Number) employeeIdClaim).intValue());
        }
        
        return Optional.empty();
    }

    /**
     * Lấy userId từ JWT token
     * 
     * @return Optional<Integer> userId
     */
    public static Optional<Integer> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !(authentication instanceof JwtAuthenticationToken)) {
            return Optional.empty();
        }
        
        JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
        Jwt jwt = jwtAuth.getToken();
        
        Object idUserClaim = jwt.getClaim("idUser");
        if (idUserClaim == null) {
            return Optional.empty();
        }
        
        if (idUserClaim instanceof Integer) {
            return Optional.of((Integer) idUserClaim);
        } else if (idUserClaim instanceof Long) {
            return Optional.of(((Long) idUserClaim).intValue());
        } else if (idUserClaim instanceof Number) {
            return Optional.of(((Number) idUserClaim).intValue());
        }
        
        return Optional.empty();
    }

    /**
     * Lấy username từ authentication
     * 
     * @return Optional<String> username
     */
    public static Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(authentication.getName());
    }

    /**
     * Lấy role từ JWT token
     * 
     * @return Optional<String> role
     */
    public static Optional<String> getCurrentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !(authentication instanceof JwtAuthenticationToken)) {
            return Optional.empty();
        }
        
        JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
        Jwt jwt = jwtAuth.getToken();
        
        Object roleClaim = jwt.getClaim("role");
        if (roleClaim == null) {
            return Optional.empty();
        }
        
        return Optional.of(roleClaim.toString());
    }
}















