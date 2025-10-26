package com.storemanagement.mapper;

import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.CustomerDto;
import com.storemanagement.model.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CustomerMapper {
    // AuthenticationDto → Customer
    @Mapping(target = "customerType", constant = "REGULAR")
    Customer toEntity(AuthenticationRequestDto dto);

    // Customer → CustomerDto
    CustomerDto toDto(Customer entity);

    List<CustomerDto> toDtoList(List<Customer> entities);
}
