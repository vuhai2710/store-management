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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    // Role URL groups
    private static final String[] ADMIN_URLS = {
            "/api/v1/admin/**"
    };

    private static final String[] EMPLOYEE_URLS = {
            "/api/v1/orders/**",
            "/api/v1/inventory/**",
            "/api/v1/suppliers/**"
    };

    private static final String[] CUSTOMER_URLS = {
            "/api/v1/cart/**",
            "/api/v1/orders/checkout",
            "/api/v1/orders/buy-now",
            "/api/v1/orders/my-orders/**",
            "/api/v1/shipping-addresses/**",
            "/api/v1/customers/me/**"
    };

    private static final String[] EMPLOYEE_SELF_SERVICE_URLS = {
            "/api/v1/employees/me"
    };

    private static final String[] ADMIN_EMPLOYEE_MANAGEMENT_URLS = {
            "/api/v1/employees/**"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001", "http://localhost:3003"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationEntryPoint jwtEntryPoint,
                                                   CorsConfigurationSource corsConfigurationSource) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers(
                                "/api/v1/auth/**",
                                "/uploads/**",
                                "/api/v1/payments/payos/webhook",
                                "/api/v1/payos/register-webhook"
                        )
                )
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // --- PUBLIC ENDPOINTS (NO AUTH) ---
                        .requestMatchers("/api/v1/payos/**").permitAll()
                        .requestMatchers(
                                "/api/v1/payments/payos/webhook",
                                "/api/v1/payments/payos/return",
                                "/api/v1/payments/payos/cancel"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/test/**").permitAll() // Test endpoint
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        // --- PROTECTED ENDPOINTS ---
                        .requestMatchers(CUSTOMER_URLS).hasRole("CUSTOMER")
                        .requestMatchers(EMPLOYEE_SELF_SERVICE_URLS).hasRole("EMPLOYEE")
                        .requestMatchers(ADMIN_EMPLOYEE_MANAGEMENT_URLS).hasRole("ADMIN")
                        .requestMatchers("/api/v1/customers/**").hasAnyRole("ADMIN", "EMPLOYEE")
                        .requestMatchers("/api/v1/orders/checkout").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/orders/buy-now").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/orders/my-orders/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/orders/create-for-customer").hasAnyRole("ADMIN", "EMPLOYEE")
                        .requestMatchers(ADMIN_URLS).hasRole("ADMIN")
                        .requestMatchers(EMPLOYEE_URLS).hasAnyRole("ADMIN", "EMPLOYEE")

                        // --- OTHER ENDPOINTS ---
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtConverter())
                        )
                        .authenticationEntryPoint(jwtEntryPoint)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        authoritiesConverter.setAuthoritiesClaimName("role");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec secretKey = new SecretKeySpec(SIGNER_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint() {
        return new JwtAuthenticationEntryPoint();
    }
}