package com.storemanagement.mapper;

import com.storemanagement.dto.purchase.PurchaseOrderDTO;
import com.storemanagement.dto.purchase.PurchaseOrderDetailDTO;
import com.storemanagement.model.ImportOrder;
import com.storemanagement.model.ImportOrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ImportOrderMapper {

    @Mapping(target = "idImportOrder", source = "idImportOrder")
    @Mapping(target = "idSupplier", source = "supplier.idSupplier")
    @Mapping(target = "supplierName", source = "supplier.supplierName")
    @Mapping(target = "supplierAddress", source = "supplier.address")
    @Mapping(target = "supplierPhone", source = "supplier.phoneNumber")
    @Mapping(target = "supplierEmail", source = "supplier.email")
    @Mapping(target = "idEmployee", source = "idEmployee")
    @Mapping(target = "employeeName", ignore = true)
    @Mapping(target = "importOrderDetails", source = "importOrderDetails")
    PurchaseOrderDTO toDTO(ImportOrder entity);

    @Mapping(target = "idImportOrder", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "idEmployee", source = "idEmployee")
    @Mapping(target = "importOrderDetails", ignore = true)
    @Mapping(target = "orderDate", ignore = true)
    ImportOrder toEntity(PurchaseOrderDTO dto);

    @Mapping(target = "idImportOrderDetail", source = "idImportOrderDetail")
    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "subtotal", expression = "java(detail.getImportPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())))")
    PurchaseOrderDetailDTO detailToDTO(ImportOrderDetail detail);

    @Mapping(target = "idImportOrderDetail", ignore = true)
    @Mapping(target = "importOrder", ignore = true)
    @Mapping(target = "product", ignore = true)
    ImportOrderDetail detailToEntity(PurchaseOrderDetailDTO dto);

    List<PurchaseOrderDetailDTO> detailListToDTO(List<ImportOrderDetail> details);
    List<PurchaseOrderDTO> toDTOList(List<ImportOrder> entities);
}
