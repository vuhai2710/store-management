package com.storemanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

//    Tam thoi tat security
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        .anyRequest().permitAll() // Cho phép tất cả requests
                )
                .csrf(csrf -> csrf.disable()) // Disable CSRF protection
                .formLogin(form -> form.disable()) // Disable form login
                .httpBasic(basic -> basic.disable()); // Disable basic auth

        return http.build();
    }
}