package com.storemanagement.utils;

import java.util.regex.Pattern;

/**
 * Validator cho product_code theo code_type
 */
public class ProductCodeValidator {
    
    // IMEI: 15 chữ số
    private static final Pattern IMEI_PATTERN = Pattern.compile("^\\d{15}$");
    
    // SERIAL: 8-20 ký tự alphanumeric
    private static final Pattern SERIAL_PATTERN = Pattern.compile("^[A-Z0-9]{8,20}$");
    
    // SKU: Tự sinh hoặc tự nhập (format: PREFIX-YYYYMMDD-XXXX hoặc custom)
    // Chấp nhận alphanumeric và dấu gạch ngang
    private static final Pattern SKU_PATTERN = Pattern.compile("^[A-Z0-9-]{3,50}$");
    
    // BARCODE: 8, 12, 13 hoặc 14 chữ số (EAN-8, UPC-A, EAN-13, ITF-14)
    private static final Pattern BARCODE_PATTERN = Pattern.compile("^\\d{8}$|^\\d{12}$|^\\d{13}$|^\\d{14}$");
    
    /**
     * Validate productCode theo codeType
     */
    public static void validate(String productCode, CodeType codeType) {
        if (productCode == null || productCode.trim().isEmpty()) {
            throw new RuntimeException("Mã sản phẩm không được để trống");
        }
        
        if (codeType == null) {
            throw new RuntimeException("Loại mã không hợp lệ");
        }
        
        String normalizedCode = productCode.trim().toUpperCase();
        
        switch (codeType) {
            case IMEI:
                if (!IMEI_PATTERN.matcher(normalizedCode).matches()) {
                    throw new RuntimeException("IMEI phải có 15 chữ số. Ví dụ: 123456789012345");
                }
                break;
                
            case SERIAL:
                if (!SERIAL_PATTERN.matcher(normalizedCode).matches()) {
                    throw new RuntimeException("SERIAL phải có 8-20 ký tự (chữ cái và số). Ví dụ: SN12345ABC");
                }
                break;
                
            case SKU:
                if (!SKU_PATTERN.matcher(normalizedCode).matches()) {
                    throw new RuntimeException("SKU phải có 3-50 ký tự (chữ cái, số và dấu gạch ngang). Ví dụ: LAPTOP-20241031-0001");
                }
                break;
                
            case BARCODE:
                if (!BARCODE_PATTERN.matcher(normalizedCode).matches()) {
                    throw new RuntimeException("BARCODE phải có 8, 12, 13 hoặc 14 chữ số. Ví dụ: 8901234567890");
                }
                break;
                
            default:
                throw new RuntimeException("Loại mã không hợp lệ");
        }
    }
    
    /**
     * Kiểm tra xem productCode có hợp lệ không (không throw exception)
     */
    public static boolean isValid(String productCode, CodeType codeType) {
        try {
            validate(productCode, codeType);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }
}

