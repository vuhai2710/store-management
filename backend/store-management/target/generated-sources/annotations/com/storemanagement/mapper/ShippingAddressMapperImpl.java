package com.storemanagement.mapper;

import com.storemanagement.dto.request.CreateShippingAddressRequestDto;
import com.storemanagement.dto.request.UpdateShippingAddressRequestDto;
import com.storemanagement.dto.response.ShippingAddressDto;
import com.storemanagement.model.Customer;
import com.storemanagement.model.ShippingAddress;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:03+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ShippingAddressMapperImpl implements ShippingAddressMapper {

    @Override
    public ShippingAddressDto toDto(ShippingAddress entity) {
        if ( entity == null ) {
            return null;
        }

        ShippingAddressDto.ShippingAddressDtoBuilder shippingAddressDto = ShippingAddressDto.builder();

        shippingAddressDto.idCustomer( entityCustomerIdCustomer( entity ) );
        shippingAddressDto.address( entity.getAddress() );
        shippingAddressDto.createdAt( entity.getCreatedAt() );
        shippingAddressDto.idShippingAddress( entity.getIdShippingAddress() );
        shippingAddressDto.isDefault( entity.getIsDefault() );
        shippingAddressDto.phoneNumber( entity.getPhoneNumber() );
        shippingAddressDto.recipientName( entity.getRecipientName() );
        shippingAddressDto.updatedAt( entity.getUpdatedAt() );

        return shippingAddressDto.build();
    }

    @Override
    public List<ShippingAddressDto> toDtoList(List<ShippingAddress> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ShippingAddressDto> list = new ArrayList<ShippingAddressDto>( entities.size() );
        for ( ShippingAddress shippingAddress : entities ) {
            list.add( toDto( shippingAddress ) );
        }

        return list;
    }

    @Override
    public ShippingAddress toEntity(CreateShippingAddressRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        ShippingAddress.ShippingAddressBuilder shippingAddress = ShippingAddress.builder();

        shippingAddress.address( dto.getAddress() );
        shippingAddress.isDefault( dto.getIsDefault() );
        shippingAddress.phoneNumber( dto.getPhoneNumber() );
        shippingAddress.recipientName( dto.getRecipientName() );

        return shippingAddress.build();
    }

    @Override
    public void updateEntityFromDto(UpdateShippingAddressRequestDto dto, ShippingAddress entity) {
        if ( dto == null ) {
            return;
        }

        entity.setAddress( dto.getAddress() );
        entity.setPhoneNumber( dto.getPhoneNumber() );
        entity.setRecipientName( dto.getRecipientName() );
    }

    private Integer entityCustomerIdCustomer(ShippingAddress shippingAddress) {
        Customer customer = shippingAddress.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getIdCustomer();
    }
}
