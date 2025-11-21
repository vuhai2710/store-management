package com.storemanagement.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConfigurationProperties(prefix = "ghn")
@Data
public class GHNConfig {

    @Bean(name = "ghnRestTemplate")
    public RestTemplate ghnRestTemplate() {
        return new RestTemplate();
    }
    private String token;
    private Integer shopId;
    private Integer fromDistrictId;
    private String baseUrl;
    private String webhookUrl;
    private Boolean enabled = true;
    private String environment = "sandbox";
}
