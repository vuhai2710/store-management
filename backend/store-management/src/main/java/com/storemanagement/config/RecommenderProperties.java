package com.storemanagement.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConfigurationProperties(prefix = "recommender")
@Data
public class RecommenderProperties {
    private String baseUrl = "http://localhost:5000";

    @Bean(name = "recommenderRestTemplate")
    public RestTemplate recommenderRestTemplate() {
        return new RestTemplate();
    }
}

