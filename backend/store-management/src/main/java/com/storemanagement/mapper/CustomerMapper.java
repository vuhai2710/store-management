package com.storemanagement.mapper;

import com.storemanagement.dto.customer.CustomerDTO;
import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.model.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CustomerMapper {
    // RegisterDTO → Customer
    @Mapping(target = "idCustomer", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "customerType", constant = "REGULAR")
    Customer toEntity(RegisterDTO dto);

    // CustomerDTO → Customer
    @Mapping(target = "idCustomer", ignore = true)
    @Mapping(target = "user", ignore = true)
    Customer toEntity(CustomerDTO dto);

    // Customer → CustomerDTO
    @Mapping(target = "idCustomer", source = "idCustomer")
    @Mapping(target = "idUser", source = "user.idUser")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "isActive", source = "user.isActive")
    CustomerDTO toDTO(Customer entity);

    List<CustomerDTO> toDTOList(List<Customer> entities);
}
