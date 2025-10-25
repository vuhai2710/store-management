package com.storemanagement.mapper;

import com.storemanagement.dto.AuthDTO;
import com.storemanagement.model.Customer;
import com.storemanagement.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthMapper {
    // Map to Entity
    @Mapping(target = "role", constant = "CUSTOMER")
    User toUser(AuthDTO Dto);

    Customer toCustomer(AuthDTO Dto);

    // Map to DTO
    @Mapping(target = "password", ignore = true)
    AuthDTO toDto(User users, Customer customers);
}
