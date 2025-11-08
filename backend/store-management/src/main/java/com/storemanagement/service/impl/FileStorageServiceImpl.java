package com.storemanagement.service.impl;

import com.storemanagement.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service implementation cho File Storage
 * 
 * Chức năng chính:
 * 1. Upload và lưu file ảnh vào thư mục uploads/
 * 2. Validate file type và size
 * 3. Generate unique filename để tránh conflict
 * 4. Xóa file ảnh khi cần
 * 
 * File Storage Structure:
 * - Base directory: uploads/ (từ application.yaml: file.upload.directory)
 * - Subfolders: products/, categories/, etc.
 * - Example: uploads/products/uuid-filename.jpg
 * 
 * URL Access:
 * - Files được serve qua WebMvcConfig: /uploads/** -> file:{uploadDirectory}/**
 * - Frontend có thể truy cập: http://localhost:8080/uploads/products/uuid-filename.jpg
 * 
 * @author Store Management Team
 */
@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    /**
     * Các loại file ảnh được phép upload
     */
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    /**
     * Kích thước file tối đa: 10MB
     * Config trong application.yaml: spring.servlet.multipart.max-file-size
     */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Thư mục upload files (từ application.yaml)
     * Default: "uploads" (trong project root)
     */
    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    /**
     * Context path của ứng dụng (thường là empty)
     */
    @Value("${server.servlet.context-path:}")
    private String contextPath;

    /**
     * Lưu file ảnh và trả về URL
     * 
     * Flow xử lý:
     * 1. Validate file không null và không empty
     * 2. Validate file type (chỉ cho phép image)
     * 3. Validate file size (max 10MB)
     * 4. Tạo thư mục nếu chưa tồn tại: uploads/{subfolder}/
     * 5. Generate unique filename (UUID + extension) để tránh conflict
     * 6. Lưu file vào disk
     * 7. Trả về URL: /uploads/{subfolder}/{filename}
     * 
     * Lưu ý:
     * - Filename được generate bằng UUID để đảm bảo unique
     * - Giữ nguyên extension từ original filename
     * - URL này được lưu vào database và dùng để truy cập file
     * 
     * @param file File ảnh cần lưu
     * @param subfolder Thư mục con (ví dụ: "products", "categories")
     * @return URL của file đã lưu (format: /uploads/{subfolder}/{filename})
     * @throws RuntimeException nếu validation fail hoặc lỗi khi lưu file
     */
    @Override
    public String saveImage(MultipartFile file, String subfolder) {
        // Validate file không null và không empty
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File ảnh không được để trống");
        }

        // Validate file type - chỉ cho phép image
        if (!isValidImageFile(file)) {
            throw new RuntimeException("File không phải là ảnh hợp lệ. Chỉ chấp nhận: JPEG, JPG, PNG, GIF, WEBP");
        }

        // Validate file size - max 10MB
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Kích thước file quá lớn. Tối đa 10MB");
        }

        try {
            // Tạo đường dẫn thư mục: uploads/{subfolder}
            // Ví dụ: uploads/products
            Path uploadPath = Paths.get(uploadDirectory, subfolder);
            
            // Tạo thư mục nếu chưa tồn tại
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created directory: {}", uploadPath);
            }

            // Generate unique filename để tránh conflict
            // Format: {UUID}.{extension}
            // Ví dụ: a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                // Lấy extension từ original filename
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            // UUID.randomUUID() tạo unique identifier
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Lưu file vào disk
            // StandardCopyOption.REPLACE_EXISTING: ghi đè nếu file đã tồn tại (không nên xảy ra với UUID)
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File saved successfully: {}", filePath);

            // Trả về URL để lưu vào database
            // URL format: /uploads/{subfolder}/{filename}
            // URL này sẽ được serve bởi WebMvcConfig
            String imageUrl = "/uploads/" + subfolder + "/" + uniqueFilename;
            return imageUrl;

        } catch (IOException e) {
            log.error("Error saving file: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lưu file ảnh: " + e.getMessage());
        }
    }

    @Override
    public boolean deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return false;
        }

        try {
            // Xóa prefix /uploads nếu có
            String relativePath = imageUrl.startsWith("/uploads/") 
                    ? imageUrl.substring("/uploads/".length())
                    : imageUrl;

            Path filePath = Paths.get(uploadDirectory, relativePath);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", filePath);
                return true;
            } else {
                log.warn("File not found: {}", filePath);
                return false;
            }
        } catch (IOException e) {
            log.error("Error deleting file: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean isValidImageFile(MultipartFile file) {
        if (file == null) {
            return false;
        }
        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }
        return ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase());
    }
}
