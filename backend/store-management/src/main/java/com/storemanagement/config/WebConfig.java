package com.storemanagement.config; // <-- Kiểm tra dòng này cho đúng package của bạn

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Cho phép tất cả các đường dẫn
                .allowedOrigins(
                        "http://localhost:3000", // Cho phép Localhost (để bạn test máy nhà)
                        "https://store-admin-xi.vercel.app", // <-- QUAN TRỌNG: Link Vercel của bạn
                        "https://store-client-tu.vercel.app" // (Nếu bạn có link client thì điền luôn vào đây)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các hành động này
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
