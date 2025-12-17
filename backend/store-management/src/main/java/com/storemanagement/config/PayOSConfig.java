package com.storemanagement.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
@ConfigurationProperties(prefix = "payos")
@Data
public class PayOSConfig {
    @Bean
    public PayOS payOS() {
        if (clientId == null || apiKey == null || checksumKey == null) {
            throw new IllegalStateException(
                    "PayOS credentials are not configured. Please set payos.client-id, payos.api-key, and payos.checksum-key in application.yaml");
        }

        return new PayOS(clientId, apiKey, checksumKey);
    }

    private String clientId;
    private String apiKey;
    private String checksumKey;
    private String webhookUrl;
    private String returnUrl;
    private String cancelUrl;
    private String environment;
    private String baseUrl;
}
