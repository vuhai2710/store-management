package com.storemanagement.dto.shipment;

import com.storemanagement.dto.base.BaseDTO;
import com.storemanagement.validation.ValidPhone;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ShippingAddressDTO extends BaseDTO {
    private Integer idShippingAddress;

    private Integer idCustomer;

    @NotBlank(message = "Tên người nhận không được để trống")
    private String recipientName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @ValidPhone(message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    private Boolean isDefault;

    private Integer provinceId;

    private Integer districtId;

    private String wardCode;
}
