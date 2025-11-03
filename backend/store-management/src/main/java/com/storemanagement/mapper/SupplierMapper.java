package com.storemanagement.mapper;

import com.storemanagement.dto.SupplierDto;
import com.storemanagement.model.Supplier;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    // Supplier → SupplierDto
    SupplierDto toDto(Supplier entity);

    // SupplierDto → Supplier
    Supplier toEntity(SupplierDto dto);

    // List mapping
    List<SupplierDto> toDtoList(List<Supplier> entities);
}














