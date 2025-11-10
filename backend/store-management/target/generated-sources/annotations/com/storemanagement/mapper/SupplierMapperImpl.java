package com.storemanagement.mapper;

import com.storemanagement.dto.response.SupplierDto;
import com.storemanagement.model.Supplier;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class SupplierMapperImpl implements SupplierMapper {

    @Override
    public SupplierDto toDto(Supplier entity) {
        if ( entity == null ) {
            return null;
        }

        SupplierDto.SupplierDtoBuilder supplierDto = SupplierDto.builder();

        supplierDto.address( entity.getAddress() );
        supplierDto.createdAt( entity.getCreatedAt() );
        supplierDto.email( entity.getEmail() );
        supplierDto.idSupplier( entity.getIdSupplier() );
        supplierDto.phoneNumber( entity.getPhoneNumber() );
        supplierDto.supplierName( entity.getSupplierName() );

        return supplierDto.build();
    }

    @Override
    public Supplier toEntity(SupplierDto dto) {
        if ( dto == null ) {
            return null;
        }

        Supplier.SupplierBuilder supplier = Supplier.builder();

        supplier.address( dto.getAddress() );
        supplier.createdAt( dto.getCreatedAt() );
        supplier.email( dto.getEmail() );
        supplier.idSupplier( dto.getIdSupplier() );
        supplier.phoneNumber( dto.getPhoneNumber() );
        supplier.supplierName( dto.getSupplierName() );

        return supplier.build();
    }

    @Override
    public List<SupplierDto> toDtoList(List<Supplier> entities) {
        if ( entities == null ) {
            return null;
        }

        List<SupplierDto> list = new ArrayList<SupplierDto>( entities.size() );
        for ( Supplier supplier : entities ) {
            list.add( toDto( supplier ) );
        }

        return list;
    }
}
