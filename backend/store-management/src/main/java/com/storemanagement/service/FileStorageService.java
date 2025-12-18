package com.storemanagement.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String saveImage(MultipartFile file, String subfolder);

    boolean deleteImage(String imageUrl);

    boolean isValidImageFile(MultipartFile file);
}
