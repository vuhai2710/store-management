package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Base Response DTO cho GHN API
 * 
 * GHN API trả về response với format:
 * {
 *   "code": 200,
 *   "message": "Success",
 *   "data": {...}
 * }
 * 
 * Tất cả các response từ GHN đều follow format này
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNBaseResponseDto<T> {
    
    /**
     * Mã code từ GHN API
     * - 200: Thành công
     * - Các mã khác: Lỗi
     */
    @JsonProperty("code")
    private Integer code;
    
    /**
     * Thông báo từ GHN API
     */
    @JsonProperty("message")
    private String message;
    
    /**
     * Dữ liệu trả về (generic type)
     * Tùy theo endpoint, data sẽ có cấu trúc khác nhau
     */
    @JsonProperty("data")
    private T data;
}





