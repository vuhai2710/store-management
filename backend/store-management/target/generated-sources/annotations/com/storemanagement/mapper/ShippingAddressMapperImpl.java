package com.storemanagement.mapper;

import com.storemanagement.dto.shipment.ShippingAddressDTO;
import com.storemanagement.model.Customer;
import com.storemanagement.model.ShippingAddress;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class ShippingAddressMapperImpl implements ShippingAddressMapper {

    @Override
    public ShippingAddressDTO toDTO(ShippingAddress entity) {
        if ( entity == null ) {
            return null;
        }

        ShippingAddressDTO.ShippingAddressDTOBuilder<?, ?> shippingAddressDTO = ShippingAddressDTO.builder();

        shippingAddressDTO.idShippingAddress( entity.getIdShippingAddress() );
        shippingAddressDTO.idCustomer( entityCustomerIdCustomer( entity ) );
        shippingAddressDTO.createdAt( entity.getCreatedAt() );
        shippingAddressDTO.updatedAt( entity.getUpdatedAt() );
        shippingAddressDTO.recipientName( entity.getRecipientName() );
        shippingAddressDTO.phoneNumber( entity.getPhoneNumber() );
        shippingAddressDTO.address( entity.getAddress() );
        shippingAddressDTO.isDefault( entity.getIsDefault() );
        shippingAddressDTO.provinceId( entity.getProvinceId() );
        shippingAddressDTO.districtId( entity.getDistrictId() );
        shippingAddressDTO.wardCode( entity.getWardCode() );

        return shippingAddressDTO.build();
    }

    @Override
    public List<ShippingAddressDTO> toDTOList(List<ShippingAddress> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ShippingAddressDTO> list = new ArrayList<ShippingAddressDTO>( entities.size() );
        for ( ShippingAddress shippingAddress : entities ) {
            list.add( toDTO( shippingAddress ) );
        }

        return list;
    }

    @Override
    public ShippingAddress toEntity(ShippingAddressDTO dto) {
        if ( dto == null ) {
            return null;
        }

        ShippingAddress.ShippingAddressBuilder shippingAddress = ShippingAddress.builder();

        shippingAddress.recipientName( dto.getRecipientName() );
        shippingAddress.phoneNumber( dto.getPhoneNumber() );
        shippingAddress.address( dto.getAddress() );
        shippingAddress.isDefault( dto.getIsDefault() );
        shippingAddress.provinceId( dto.getProvinceId() );
        shippingAddress.districtId( dto.getDistrictId() );
        shippingAddress.wardCode( dto.getWardCode() );

        return shippingAddress.build();
    }

    @Override
    public void updateEntityFromDto(ShippingAddressDTO dto, ShippingAddress entity) {
        if ( dto == null ) {
            return;
        }

        entity.setCreatedAt( dto.getCreatedAt() );
        entity.setUpdatedAt( dto.getUpdatedAt() );
        entity.setRecipientName( dto.getRecipientName() );
        entity.setPhoneNumber( dto.getPhoneNumber() );
        entity.setAddress( dto.getAddress() );
        entity.setIsDefault( dto.getIsDefault() );
        entity.setProvinceId( dto.getProvinceId() );
        entity.setDistrictId( dto.getDistrictId() );
        entity.setWardCode( dto.getWardCode() );
    }

    private Integer entityCustomerIdCustomer(ShippingAddress shippingAddress) {
        Customer customer = shippingAddress.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getIdCustomer();
    }
}
