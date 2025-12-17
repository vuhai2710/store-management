package com.storemanagement.mapper;

import com.storemanagement.dto.supplier.SupplierDTO;
import com.storemanagement.model.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "idSupplier", source = "idSupplier")
    @Mapping(target = "createdAt", source = "createdAt")
    SupplierDTO toDTO(Supplier entity);

    @Mapping(target = "idSupplier", ignore = true)
    Supplier toEntity(SupplierDTO dto);

    List<SupplierDTO> toDTOList(List<Supplier> entities);
}
