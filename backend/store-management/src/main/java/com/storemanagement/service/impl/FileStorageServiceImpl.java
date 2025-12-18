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

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Override
    public String saveImage(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File ảnh không được để trống");
        }

        if (!isValidImageFile(file)) {
            throw new RuntimeException("File không phải là ảnh hợp lệ. Chỉ chấp nhận: JPEG, JPG, PNG, GIF, WEBP");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Kích thước file quá lớn. Tối đa 10MB");
        }

        try {
            Path uploadPath = Paths.get(uploadDirectory, subfolder);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created directory: {}", uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File saved successfully: {}", filePath);

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
