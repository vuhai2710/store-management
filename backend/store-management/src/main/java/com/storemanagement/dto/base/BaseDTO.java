package com.storemanagement.dto.base;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Base DTO class với các field chung: createdAt, updatedAt
 * 
 * Lưu ý: Mỗi DTO sẽ có field id riêng (idProduct, idCustomer, etc.)
 * vì tên field khác nhau giữa các entity
 */
@Data
@NoArgsConstructor
@SuperBuilder
public abstract class BaseDTO {
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
}
