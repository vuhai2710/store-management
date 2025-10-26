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

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    private static final String[] PUBLIC_URLS = {
            "/api/v1/auth/**",
            "/api/v1/products/public/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/actuator/**"
    };

    private static final String[] ADMIN_URLS = {
            "/api/v1/admin/**",
            "/api/v1/employees/**",
            "/api/v1/customers/**"
    };

    private static final String[] EMPLOYEE_URLS = {
            "/api/v1/employees/**",
            "/api/v1/customers/**",
            "/api/v1/orders/**",
            "/api/v1/inventory/**",
            "/api/v1/suppliers/**"
    };

    private static final String[] CUSTOMER_URLS = {
            "/api/v1/cart/**",
            "/api/v1/orders/customer/**",
            "/api/v1/products/customer/**"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationEntryPoint jwtEntryPoint) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/public/**").permitAll()
                        .requestMatchers(ADMIN_URLS).hasRole("ADMIN")
                        .requestMatchers(EMPLOYEE_URLS).hasAnyRole("ADMIN", "EMPLOYEE")
                        .requestMatchers(CUSTOMER_URLS).hasRole("CUSTOMER")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtConverter())
                        )
                        .authenticationEntryPoint(jwtEntryPoint)  // SỬ DỤNG CUSTOM
                )
                .csrf(csrf -> csrf.disable())
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
        SecretKeySpec secretKey = new SecretKeySpec(
                SIGNER_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
        );
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint() {
        return new JwtAuthenticationEntryPoint();
    }
}