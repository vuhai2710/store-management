package com.storemanagement.mapper;

import com.storemanagement.dto.response.ImportOrderDetailDto;
import com.storemanagement.dto.response.ImportOrderDto;
import com.storemanagement.model.ImportOrder;
import com.storemanagement.model.ImportOrderDetail;
import com.storemanagement.model.Product;
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
public class ImportOrderMapperImpl implements ImportOrderMapper {

    @Override
    public ImportOrderDto toDto(ImportOrder entity) {
        if ( entity == null ) {
            return null;
        }

        ImportOrderDto.ImportOrderDtoBuilder importOrderDto = ImportOrderDto.builder();

        importOrderDto.idSupplier( entitySupplierIdSupplier( entity ) );
        importOrderDto.supplierName( entitySupplierSupplierName( entity ) );
        importOrderDto.supplierAddress( entitySupplierAddress( entity ) );
        importOrderDto.supplierPhone( entitySupplierPhoneNumber( entity ) );
        importOrderDto.supplierEmail( entitySupplierEmail( entity ) );
        importOrderDto.idEmployee( entity.getIdEmployee() );
        importOrderDto.idImportOrder( entity.getIdImportOrder() );
        importOrderDto.importOrderDetails( detailListToDto( entity.getImportOrderDetails() ) );
        importOrderDto.orderDate( entity.getOrderDate() );
        importOrderDto.totalAmount( entity.getTotalAmount() );

        return importOrderDto.build();
    }

    @Override
    public ImportOrder toEntity(ImportOrderDto dto) {
        if ( dto == null ) {
            return null;
        }

        ImportOrder.ImportOrderBuilder importOrder = ImportOrder.builder();

        importOrder.idEmployee( dto.getIdEmployee() );
        importOrder.idImportOrder( dto.getIdImportOrder() );
        importOrder.orderDate( dto.getOrderDate() );
        importOrder.totalAmount( dto.getTotalAmount() );

        return importOrder.build();
    }

    @Override
    public ImportOrderDetailDto detailToDto(ImportOrderDetail detail) {
        if ( detail == null ) {
            return null;
        }

        ImportOrderDetailDto.ImportOrderDetailDtoBuilder importOrderDetailDto = ImportOrderDetailDto.builder();

        importOrderDetailDto.idProduct( detailProductIdProduct( detail ) );
        importOrderDetailDto.productName( detailProductProductName( detail ) );
        importOrderDetailDto.productCode( detailProductProductCode( detail ) );
        importOrderDetailDto.sku( detailProductSku( detail ) );
        importOrderDetailDto.idImportOrderDetail( detail.getIdImportOrderDetail() );
        importOrderDetailDto.importPrice( detail.getImportPrice() );
        importOrderDetailDto.quantity( detail.getQuantity() );

        importOrderDetailDto.subtotal( detail.getImportPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())) );

        return importOrderDetailDto.build();
    }

    @Override
    public ImportOrderDetail detailToEntity(ImportOrderDetailDto dto) {
        if ( dto == null ) {
            return null;
        }

        ImportOrderDetail.ImportOrderDetailBuilder importOrderDetail = ImportOrderDetail.builder();

        importOrderDetail.idImportOrderDetail( dto.getIdImportOrderDetail() );
        importOrderDetail.importPrice( dto.getImportPrice() );
        importOrderDetail.quantity( dto.getQuantity() );

        return importOrderDetail.build();
    }

    @Override
    public List<ImportOrderDetailDto> detailListToDto(List<ImportOrderDetail> details) {
        if ( details == null ) {
            return null;
        }

        List<ImportOrderDetailDto> list = new ArrayList<ImportOrderDetailDto>( details.size() );
        for ( ImportOrderDetail importOrderDetail : details ) {
            list.add( detailToDto( importOrderDetail ) );
        }

        return list;
    }

    @Override
    public List<ImportOrderDto> toDtoList(List<ImportOrder> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ImportOrderDto> list = new ArrayList<ImportOrderDto>( entities.size() );
        for ( ImportOrder importOrder : entities ) {
            list.add( toDto( importOrder ) );
        }

        return list;
    }

    private Integer entitySupplierIdSupplier(ImportOrder importOrder) {
        Supplier supplier = importOrder.getSupplier();
        if ( supplier == null ) {
            return null;
        }
        return supplier.getIdSupplier();
    }

    private String entitySupplierSupplierName(ImportOrder importOrder) {
        Supplier supplier = importOrder.getSupplier();
        if ( supplier == null ) {
            return null;
        }
        return supplier.getSupplierName();
    }

    private String entitySupplierAddress(ImportOrder importOrder) {
        Supplier supplier = importOrder.getSupplier();
        if ( supplier == null ) {
            return null;
        }
        return supplier.getAddress();
    }

    private String entitySupplierPhoneNumber(ImportOrder importOrder) {
        Supplier supplier = importOrder.getSupplier();
        if ( supplier == null ) {
            return null;
        }
        return supplier.getPhoneNumber();
    }

    private String entitySupplierEmail(ImportOrder importOrder) {
        Supplier supplier = importOrder.getSupplier();
        if ( supplier == null ) {
            return null;
        }
        return supplier.getEmail();
    }

    private Integer detailProductIdProduct(ImportOrderDetail importOrderDetail) {
        Product product = importOrderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getIdProduct();
    }

    private String detailProductProductName(ImportOrderDetail importOrderDetail) {
        Product product = importOrderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getProductName();
    }

    private String detailProductProductCode(ImportOrderDetail importOrderDetail) {
        Product product = importOrderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getProductCode();
    }

    private String detailProductSku(ImportOrderDetail importOrderDetail) {
        Product product = importOrderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getSku();
    }
}
