package com.storemanagement.mapper;

import com.storemanagement.dto.supplier.SupplierDTO;
import com.storemanagement.model.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    // Supplier → SupplierDTO
    @Mapping(target = "idSupplier", source = "idSupplier")
    @Mapping(target = "createdAt", source = "createdAt")
    SupplierDTO toDTO(Supplier entity);

    // SupplierDTO → Supplier
    @Mapping(target = "idSupplier", ignore = true)
    Supplier toEntity(SupplierDTO dto);

    // List mapping
    List<SupplierDTO> toDTOList(List<Supplier> entities);
}