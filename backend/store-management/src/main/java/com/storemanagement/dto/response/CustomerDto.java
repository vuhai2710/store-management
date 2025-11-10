package com.storemanagement.dto.response;

import com.storemanagement.utils.CustomerType;
import com.storemanagement.validation.ValidPhone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    private Integer idCustomer;
    private Integer idUser;
    private String username;

    // Email: chỉ được set khi tạo user (create), không được phép cập nhật (update)
    // Validation email được thực hiện trong service khi create
    // Không dùng @ValidEmail ở đây vì DTO này dùng cho cả create và update
    // Khi update, email có thể là null và không cần validate
    private String email;

    private String customerName;

    @ValidPhone
    private String phoneNumber;

    private String address;
    private CustomerType customerType;
    private Boolean isActive;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}

























