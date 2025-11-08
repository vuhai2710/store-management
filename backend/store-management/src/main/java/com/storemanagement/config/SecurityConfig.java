package com.storemanagement.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * Configuration class cho Spring Security
 * 
 * Chức năng chính:
 * 1. Cấu hình JWT authentication cho tất cả API endpoints
 * 2. Phân quyền theo role (ADMIN, EMPLOYEE, CUSTOMER)
 * 3. Cấu hình CORS để frontend có thể gọi API
 * 4. Cấu hình password encoder (BCrypt)
 * 
 * Authentication flow:
 * - Client gửi username/password để login
 * - Server trả về JWT token
 * - Client gửi token trong header: Authorization: Bearer {token}
 * - Server validate token và extract role từ token
 * 
 * @author Store Management Team
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * Secret key để sign và verify JWT token
     * Được lấy từ application.yaml: jwt.signerKey
     * QUAN TRỌNG: Key này phải được giữ bí mật, không commit lên git
     */
    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    /**
     * Các URL công khai - không cần authentication
     * Bao gồm:
     * - /api/v1/auth/**: Đăng ký, đăng nhập (public)
     * - /api/v1/products/public/**: Xem sản phẩm công khai (nếu có)
     * - /swagger-ui/**, /v3/api-docs/**: API documentation
     * - /uploads/**: Truy cập file ảnh đã upload (public)
     */
    private static final String[] PUBLIC_URLS = {
            "/api/v1/auth/**",
            "/api/v1/products/public/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/actuator/**",
            "/uploads/**"  // Allow public access to uploaded images
    };

    /**
     * Các URL chỉ dành cho ADMIN
     */
    private static final String[] ADMIN_URLS = {
            "/api/v1/admin/**"
    };

    /**
     * Các URL dành cho ADMIN và EMPLOYEE
     */
    private static final String[] EMPLOYEE_URLS = {
            "/api/v1/orders/**",
            "/api/v1/inventory/**",
            "/api/v1/suppliers/**"
    };

    /**
     * Các URL chỉ dành cho CUSTOMER
     */
    private static final String[] CUSTOMER_URLS = {
            "/api/v1/cart/**",
            "/api/v1/orders/checkout",
            "/api/v1/orders/buy-now",
            "/api/v1/orders/my-orders/**",
            "/api/v1/shipping-addresses/**",
            "/api/v1/customers/me/**"
    };

    /**
     * Các URL cho EMPLOYEE xem/sửa thông tin của chính mình
     * Lưu ý: Endpoint này phải được kiểm tra trước ADMIN_EMPLOYEE_MANAGEMENT_URLS
     */
    private static final String[] EMPLOYEE_SELF_SERVICE_URLS = {
            "/api/v1/employees/me"
    };

    /**
     * Các URL quản lý employee - chỉ ADMIN
     */
    private static final String[] ADMIN_EMPLOYEE_MANAGEMENT_URLS = {
            "/api/v1/employees/**"
    };

    /**
     * Bean để encode password khi lưu vào database
     * 
     * Sử dụng BCrypt với strength = 12 (mức độ bảo mật cao)
     * - Password được hash trước khi lưu
     * - Khi login, dùng matches() để so sánh password plain text với hash
     * 
     * @return BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Cấu hình CORS (Cross-Origin Resource Sharing)
     * 
     * Cho phép frontend từ origin khác (ví dụ: localhost:3000) có thể gọi API
     * 
     * Cấu hình:
     * - Allowed Origins: http://localhost:3000 (frontend URL)
     * - Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
     * - Allowed Headers: Tất cả headers
     * - Allow Credentials: true (cho phép gửi cookies, authorization headers)
     * - Max Age: 3600 giây (cache preflight requests)
     * 
     * @return CorsConfigurationSource instance
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Cấu hình Security Filter Chain - xác định luồng xử lý security
     * 
     * Flow xử lý:
     * 1. Kiểm tra request có match với PUBLIC_URLS không -> cho phép
     * 2. Kiểm tra request có match với role-specific URLs không -> kiểm tra role
     * 3. Nếu không match -> yêu cầu authenticated (có token)
     * 4. Validate JWT token từ header Authorization: Bearer {token}
     * 5. Extract role từ token và kiểm tra quyền truy cập
     * 
     * Thứ tự kiểm tra quan trọng:
     * - CUSTOMER_URLS phải đặt trước (để EMPLOYEE không thể truy cập)
     * - EMPLOYEE_SELF_SERVICE_URLS phải đặt trước ADMIN_EMPLOYEE_MANAGEMENT_URLS
     * - Specific URLs phải đặt trước general URLs
     * 
     * @param http HttpSecurity để cấu hình
     * @param jwtEntryPoint Custom entry point để xử lý lỗi authentication
     * @param corsConfigurationSource CORS configuration
     * @return SecurityFilterChain đã được cấu hình
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationEntryPoint jwtEntryPoint,
                                                   CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                // Bật CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // Cấu hình authorization rules
                .authorizeHttpRequests(authz -> authz
                        // OPTIONS requests (preflight) - luôn cho phép
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public endpoints - không cần authentication
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()  // Allow public access to uploaded images
                        // Customer-specific endpoints (phải đặt trước để EMPLOYEE không thể truy cập)
                        .requestMatchers(CUSTOMER_URLS).hasRole("CUSTOMER")
                        // Employee self-service endpoints (employee xem/sửa thông tin của chính mình)
                        .requestMatchers(EMPLOYEE_SELF_SERVICE_URLS).hasRole("EMPLOYEE")
                        // Admin employee management endpoints (admin quản lý nhân viên)
                        .requestMatchers(ADMIN_EMPLOYEE_MANAGEMENT_URLS).hasRole("ADMIN")
                        // Admin & Employee endpoints cho /api/v1/customers/** (trừ /me/**)
                        .requestMatchers("/api/v1/customers/**").hasAnyRole("ADMIN", "EMPLOYEE")
                        // Customer endpoints cho orders
                        .requestMatchers("/api/v1/orders/checkout").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/orders/buy-now").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/orders/my-orders/**").hasRole("CUSTOMER")
                        // Admin/Employee endpoints cho orders
                        .requestMatchers("/api/v1/orders/create-for-customer").hasAnyRole("ADMIN", "EMPLOYEE")
                        .requestMatchers(ADMIN_URLS).hasRole("ADMIN")
                        .requestMatchers(EMPLOYEE_URLS).hasAnyRole("ADMIN", "EMPLOYEE")
                        // Tất cả request khác đều cần authenticated
                        .anyRequest().authenticated()
                )
                // Cấu hình JWT authentication
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                // Decoder để decode JWT token
                                .decoder(jwtDecoder())
                                // Converter để extract role từ token
                                .jwtAuthenticationConverter(jwtConverter())
                        )
                        // Custom entry point để trả về lỗi authentication đúng format
                        .authenticationEntryPoint(jwtEntryPoint)
                )
                // Tắt CSRF vì sử dụng JWT (stateless)
                .csrf(csrf -> csrf.disable())
                // Stateless session - không lưu session trên server
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    /**
     * Converter để extract role từ JWT token
     * 
     * JWT token chứa claim "role" với giá trị: ADMIN, EMPLOYEE, hoặc CUSTOMER
     * Converter này sẽ:
     * 1. Đọc claim "role" từ token
     * 2. Thêm prefix "ROLE_" (Spring Security yêu cầu)
     * 3. Tạo GrantedAuthority để Spring Security kiểm tra quyền
     * 
     * Ví dụ: token có role="ADMIN" -> tạo authority "ROLE_ADMIN"
     * 
     * @return JwtAuthenticationConverter instance
     */
    @Bean
    public JwtAuthenticationConverter jwtConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // Prefix "ROLE_" là bắt buộc cho Spring Security
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        // Claim name trong JWT token chứa role
        authoritiesConverter.setAuthoritiesClaimName("role");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }

    /**
     * JWT Decoder để decode và verify JWT token
     * 
     * Sử dụng HMAC SHA256 algorithm với secret key
     * 
     * Quá trình:
     * 1. Client gửi token trong header: Authorization: Bearer {token}
     * 2. Decoder verify signature bằng secret key
     * 3. Nếu valid, decode token và extract claims (username, role, etc.)
     * 4. Nếu invalid (expired, tampered), throw exception
     * 
     * @return JwtDecoder instance
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        // Tạo secret key từ SIGNER_KEY string
        SecretKeySpec secretKey = new SecretKeySpec(
                SIGNER_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
        );
        // Tạo decoder với HMAC SHA256 algorithm
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint() {
        return new JwtAuthenticationEntryPoint();
    }
}