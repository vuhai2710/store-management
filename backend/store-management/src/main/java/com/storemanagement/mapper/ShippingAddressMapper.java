package com.storemanagement.mapper;

import com.storemanagement.dto.shipment.ShippingAddressDTO;
import com.storemanagement.model.ShippingAddress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ShippingAddressMapper {
    // ShippingAddress → ShippingAddressDTO
    @Mapping(target = "idShippingAddress", source = "idShippingAddress")
    @Mapping(target = "idCustomer", source = "customer.idCustomer")
    ShippingAddressDTO toDTO(ShippingAddress entity);
    
    List<ShippingAddressDTO> toDTOList(List<ShippingAddress> entities);
    
    // ShippingAddressDTO → ShippingAddress (for create/update)
    @Mapping(target = "idShippingAddress", ignore = true)
    @Mapping(target = "customer", ignore = true)
    // createdAt and updatedAt are inherited from BaseEntity and managed by JPA/Hibernate
    ShippingAddress toEntity(ShippingAddressDTO dto);
    
    // Update ShippingAddress from ShippingAddressDTO
    @Mapping(target = "idShippingAddress", ignore = true)
    @Mapping(target = "customer", ignore = true)
    // createdAt and updatedAt are inherited from BaseEntity and managed by JPA/Hibernate
    void updateEntityFromDto(ShippingAddressDTO dto, @org.mapstruct.MappingTarget ShippingAddress entity);
}

