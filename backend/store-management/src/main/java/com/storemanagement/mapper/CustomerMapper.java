package com.storemanagement.mapper;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.response.CustomerDto;
import com.storemanagement.model.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * CustomerMapper - MapStruct mapper cho Customer entity
 *
 * Note: Date formatting được xử lý tự động bởi JacksonConfig (global config)
 * Không cần custom formatDate method nữa
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CustomerMapper {
    // AuthenticationDto → Customer
    @Mapping(target = "customerType", constant = "REGULAR")
    Customer toEntity(AuthenticationRequestDto dto);

    // Customer → CustomerDto
    @Mapping(target = "idUser", source = "user.idUser")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "isActive", source = "user.isActive")
    // createdAt và updatedAt được map tự động từ BaseEntity của Customer
    CustomerDto toDto(Customer entity);

    List<CustomerDto> toDtoList(List<Customer> entities);
}
