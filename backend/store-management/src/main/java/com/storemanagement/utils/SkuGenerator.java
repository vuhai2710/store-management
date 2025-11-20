package com.storemanagement.utils;

import com.storemanagement.model.Category;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class SkuGenerator {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    public static String generateSku(Category category, int sequenceNumber) {
        if (category == null) {
            throw new RuntimeException("Danh mục không tồn tại");
        }
        
        String prefix = category.getCodePrefix();
        if (prefix == null || prefix.trim().isEmpty()) {
            throw new RuntimeException("Danh mục '" + category.getCategoryName() + "' chưa có mã tiền tố (code_prefix)");
        }
        
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        String sequence = String.format("%04d", sequenceNumber);
        
        return prefix.trim().toUpperCase() + "-" + dateStr + "-" + sequence;
    }

    public static String generateSku(Category category) {
        // Sử dụng timestamp milliseconds cuối 4 chữ số làm sequence
        long timestamp = System.currentTimeMillis();
        int sequence = (int) (timestamp % 10000);
        return generateSku(category, sequence);
    }

    public static int parseSequenceNumber(String sku) {
        if (sku == null || sku.trim().isEmpty()) {
            return -1;
        }
        
        try {
            String[] parts = sku.split("-");
            if (parts.length >= 3) {
                return Integer.parseInt(parts[parts.length - 1]);
            }
        } catch (NumberFormatException e) {}
        
        return -1;
    }

    public static boolean isValidFormat(String sku) {
        if (sku == null || sku.trim().isEmpty()) {
            return false;
        }
        
        String[] parts = sku.split("-");
        if (parts.length != 3) {
            return false;
        }
        
        // Kiểm tra date part (8 chữ số)
        if (!parts[1].matches("\\d{8}")) {
            return false;
        }
        
        // Kiểm tra sequence part (4 chữ số)
        if (!parts[2].matches("\\d{4}")) {
            return false;
        }
        
        return true;
    }
}

