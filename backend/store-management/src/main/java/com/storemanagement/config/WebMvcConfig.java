package com.storemanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Configuration class cho Web MVC
 * 
 * Chức năng chính:
 * - Cấu hình static resource handler để serve files từ thư mục uploads
 * - Cho phép truy cập file ảnh đã upload qua URL: /uploads/**
 * 
 * Lưu ý:
 * - Sử dụng external directory (không phải trong JAR) để có thể:
 *   + Ghi file mới sau khi build JAR
 *   + File tồn tại ngay cả sau khi rebuild/redeploy
 *   + Dễ dàng backup/restore files
 * 
 * @author Store Management Team
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * Đường dẫn thư mục upload files
     * Được lấy từ application.yaml: file.upload.directory
     * Default: "uploads" (trong thư mục project root)
     */
    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    /**
     * Cấu hình resource handler để serve static files
     * 
     * Mapping:
     * - URL: /uploads/** -> File system: {uploadDirectory}/**
     * 
     * Ví dụ:
     * - URL: /uploads/products/iphone.jpg
     * - File: {project_root}/uploads/products/iphone.jpg
     * 
     * Lý do sử dụng external directory:
     * - Khi build JAR, files trong resources sẽ bị đóng gói
     * - Không thể ghi file mới vào JAR
     * - External directory cho phép ghi file động
     * 
     * @param registry ResourceHandlerRegistry để đăng ký resource handlers
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Chuyển đường dẫn tương đối thành absolute path
        // Ví dụ: "uploads" -> "D:/project1/store_management/backend/store-management/uploads"
        String uploadPath = Paths.get(uploadDirectory).toAbsolutePath().toString();
        
        // Đăng ký resource handler
        // URL pattern: /uploads/**
        // File location: file:{absolute_path}/ (file: prefix để chỉ định file system)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
