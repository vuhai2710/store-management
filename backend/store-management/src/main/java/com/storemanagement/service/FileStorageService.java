package com.storemanagement.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Lưu file ảnh và trả về URL để truy cập
     * @param file File ảnh cần lưu
     * @param subfolder Thư mục con (ví dụ: "products", "categories")
     * @return URL của file đã lưu
     * @throws RuntimeException nếu có lỗi khi lưu file
     */
    String saveImage(MultipartFile file, String subfolder);
    
    /**
     * Xóa file ảnh theo URL
     * @param imageUrl URL của file cần xóa
     * @return true nếu xóa thành công, false nếu file không tồn tại
     */
    boolean deleteImage(String imageUrl);
    
    /**
     * Kiểm tra xem file có phải là ảnh hợp lệ không
     * @param file File cần kiểm tra
     * @return true nếu là ảnh hợp lệ
     */
    boolean isValidImageFile(MultipartFile file);
}











