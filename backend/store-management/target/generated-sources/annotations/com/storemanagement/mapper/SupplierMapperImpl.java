package com.storemanagement.mapper;

import com.storemanagement.dto.supplier.SupplierDTO;
import com.storemanagement.model.Supplier;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:01+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class SupplierMapperImpl implements SupplierMapper {

    @Override
    public SupplierDTO toDTO(Supplier entity) {
        if ( entity == null ) {
            return null;
        }

        SupplierDTO.SupplierDTOBuilder supplierDTO = SupplierDTO.builder();

        supplierDTO.idSupplier( entity.getIdSupplier() );
        supplierDTO.createdAt( entity.getCreatedAt() );
        supplierDTO.supplierName( entity.getSupplierName() );
        supplierDTO.address( entity.getAddress() );
        supplierDTO.phoneNumber( entity.getPhoneNumber() );
        supplierDTO.email( entity.getEmail() );

        return supplierDTO.build();
    }

    @Override
    public Supplier toEntity(SupplierDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Supplier.SupplierBuilder supplier = Supplier.builder();

        supplier.supplierName( dto.getSupplierName() );
        supplier.address( dto.getAddress() );
        supplier.phoneNumber( dto.getPhoneNumber() );
        supplier.email( dto.getEmail() );
        supplier.createdAt( dto.getCreatedAt() );

        return supplier.build();
    }

    @Override
    public List<SupplierDTO> toDTOList(List<Supplier> entities) {
        if ( entities == null ) {
            return null;
        }

        List<SupplierDTO> list = new ArrayList<SupplierDTO>( entities.size() );
        for ( Supplier supplier : entities ) {
            list.add( toDTO( supplier ) );
        }

        return list;
    }
}
