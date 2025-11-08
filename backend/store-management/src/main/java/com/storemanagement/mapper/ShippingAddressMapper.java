package com.storemanagement.mapper;

import com.storemanagement.dto.request.CreateShippingAddressRequestDto;
import com.storemanagement.dto.response.ShippingAddressDto;
import com.storemanagement.dto.request.UpdateShippingAddressRequestDto;
import com.storemanagement.model.ShippingAddress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ShippingAddressMapper {
    @Mapping(target = "idCustomer", source = "customer.idCustomer")
    ShippingAddressDto toDto(ShippingAddress entity);
    
    List<ShippingAddressDto> toDtoList(List<ShippingAddress> entities);
    
    @Mapping(target = "idShippingAddress", ignore = true)
    @Mapping(target = "customer", ignore = true)
    ShippingAddress toEntity(CreateShippingAddressRequestDto dto);
    
    @Mapping(target = "idShippingAddress", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "isDefault", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(UpdateShippingAddressRequestDto dto, @org.mapstruct.MappingTarget ShippingAddress entity);
}

