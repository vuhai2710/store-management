package com.storemanagement.mapper;

import com.storemanagement.dto.InventoryTransactionDto;
import com.storemanagement.model.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryTransactionMapper {

    // InventoryTransaction → InventoryTransactionDto
    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "idEmployee", expression = "java(entity.getEmployee() != null ? entity.getEmployee().getIdEmployee() : null)")
    @Mapping(target = "employeeName", expression = "java(entity.getEmployee() != null ? entity.getEmployee().getEmployeeName() : null)")
    InventoryTransactionDto toDto(InventoryTransaction entity);

    // InventoryTransactionDto → InventoryTransaction
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "employee", ignore = true)
    InventoryTransaction toEntity(InventoryTransactionDto dto);

    List<InventoryTransactionDto> toDtoList(List<InventoryTransaction> entities);
}

