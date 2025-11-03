package com.storemanagement.mapper;

import com.storemanagement.dto.ImportOrderDetailDto;
import com.storemanagement.dto.ImportOrderDto;
import com.storemanagement.model.ImportOrder;
import com.storemanagement.model.ImportOrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ImportOrderMapper {

    // ImportOrder → ImportOrderDto
    @Mapping(target = "idSupplier", source = "supplier.idSupplier")
    @Mapping(target = "supplierName", source = "supplier.supplierName")
    @Mapping(target = "supplierAddress", source = "supplier.address")
    @Mapping(target = "supplierPhone", source = "supplier.phoneNumber")
    @Mapping(target = "supplierEmail", source = "supplier.email")
    @Mapping(target = "idEmployee", source = "idEmployee")
    @Mapping(target = "employeeName", ignore = true)  // Sẽ set trong service
    ImportOrderDto toDto(ImportOrder entity);

    // ImportOrderDto → ImportOrder
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "idEmployee", source = "idEmployee")
    @Mapping(target = "importOrderDetails", ignore = true)
    ImportOrder toEntity(ImportOrderDto dto);

    // ImportOrderDetail → ImportOrderDetailDto
    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "subtotal", expression = "java(detail.getImportPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())))")
    ImportOrderDetailDto detailToDto(ImportOrderDetail detail);

    // ImportOrderDetailDto → ImportOrderDetail
    @Mapping(target = "importOrder", ignore = true)
    @Mapping(target = "product", ignore = true)
    ImportOrderDetail detailToEntity(ImportOrderDetailDto dto);

    List<ImportOrderDetailDto> detailListToDto(List<ImportOrderDetail> details);
    List<ImportOrderDto> toDtoList(List<ImportOrder> entities);
}


