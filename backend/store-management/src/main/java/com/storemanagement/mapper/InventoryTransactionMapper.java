package com.storemanagement.mapper;

import com.storemanagement.dto.inventory.InventoryTransactionDTO;
import com.storemanagement.model.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryTransactionMapper {

    @Mapping(target = "idTransaction", source = "idTransaction")
    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "idEmployee", expression = "java(entity.getEmployee() != null ? entity.getEmployee().getIdEmployee() : null)")
    @Mapping(target = "employeeName", expression = "java(entity.getEmployee() != null ? entity.getEmployee().getEmployeeName() : null)")
    InventoryTransactionDTO toDTO(InventoryTransaction entity);

    @Mapping(target = "idTransaction", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "transactionDate", ignore = true)
    InventoryTransaction toEntity(InventoryTransactionDTO dto);

    List<InventoryTransactionDTO> toDTOList(List<InventoryTransaction> entities);
}

