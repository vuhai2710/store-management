package com.storemanagement.config; // Nhớ sửa package cho đúng

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dpmptlswe"); // Thay vào đây
        config.put("api_key", "593827271151324");       // Thay vào đây
        config.put("api_secret", "QyB_JC8u02WFwwixGMqFKdkz0uI"); // Thay vào đây
        return new Cloudinary(config);
    }
}
