package com.storemanagement.mapper;

import com.storemanagement.dto.purchase.PurchaseOrderDTO;
import com.storemanagement.dto.purchase.PurchaseOrderDetailDTO;
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
    date = "2025-11-19T16:52:01+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class ImportOrderMapperImpl implements ImportOrderMapper {

    @Override
    public PurchaseOrderDTO toDTO(ImportOrder entity) {
        if ( entity == null ) {
            return null;
        }

        PurchaseOrderDTO.PurchaseOrderDTOBuilder purchaseOrderDTO = PurchaseOrderDTO.builder();

        purchaseOrderDTO.idImportOrder( entity.getIdImportOrder() );
        purchaseOrderDTO.idSupplier( entitySupplierIdSupplier( entity ) );
        purchaseOrderDTO.supplierName( entitySupplierSupplierName( entity ) );
        purchaseOrderDTO.supplierAddress( entitySupplierAddress( entity ) );
        purchaseOrderDTO.supplierPhone( entitySupplierPhoneNumber( entity ) );
        purchaseOrderDTO.supplierEmail( entitySupplierEmail( entity ) );
        purchaseOrderDTO.idEmployee( entity.getIdEmployee() );
        purchaseOrderDTO.importOrderDetails( detailListToDTO( entity.getImportOrderDetails() ) );
        purchaseOrderDTO.orderDate( entity.getOrderDate() );
        purchaseOrderDTO.totalAmount( entity.getTotalAmount() );

        return purchaseOrderDTO.build();
    }

    @Override
    public ImportOrder toEntity(PurchaseOrderDTO dto) {
        if ( dto == null ) {
            return null;
        }

        ImportOrder.ImportOrderBuilder importOrder = ImportOrder.builder();

        importOrder.idEmployee( dto.getIdEmployee() );
        importOrder.totalAmount( dto.getTotalAmount() );

        return importOrder.build();
    }

    @Override
    public PurchaseOrderDetailDTO detailToDTO(ImportOrderDetail detail) {
        if ( detail == null ) {
            return null;
        }

        PurchaseOrderDetailDTO.PurchaseOrderDetailDTOBuilder purchaseOrderDetailDTO = PurchaseOrderDetailDTO.builder();

        purchaseOrderDetailDTO.idImportOrderDetail( detail.getIdImportOrderDetail() );
        purchaseOrderDetailDTO.idProduct( detailProductIdProduct( detail ) );
        purchaseOrderDetailDTO.productName( detailProductProductName( detail ) );
        purchaseOrderDetailDTO.productCode( detailProductProductCode( detail ) );
        purchaseOrderDetailDTO.sku( detailProductSku( detail ) );
        purchaseOrderDetailDTO.quantity( detail.getQuantity() );
        purchaseOrderDetailDTO.importPrice( detail.getImportPrice() );

        purchaseOrderDetailDTO.subtotal( detail.getImportPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())) );

        return purchaseOrderDetailDTO.build();
    }

    @Override
    public ImportOrderDetail detailToEntity(PurchaseOrderDetailDTO dto) {
        if ( dto == null ) {
            return null;
        }

        ImportOrderDetail.ImportOrderDetailBuilder importOrderDetail = ImportOrderDetail.builder();

        importOrderDetail.quantity( dto.getQuantity() );
        importOrderDetail.importPrice( dto.getImportPrice() );

        return importOrderDetail.build();
    }

    @Override
    public List<PurchaseOrderDetailDTO> detailListToDTO(List<ImportOrderDetail> details) {
        if ( details == null ) {
            return null;
        }

        List<PurchaseOrderDetailDTO> list = new ArrayList<PurchaseOrderDetailDTO>( details.size() );
        for ( ImportOrderDetail importOrderDetail : details ) {
            list.add( detailToDTO( importOrderDetail ) );
        }

        return list;
    }

    @Override
    public List<PurchaseOrderDTO> toDTOList(List<ImportOrder> entities) {
        if ( entities == null ) {
            return null;
        }

        List<PurchaseOrderDTO> list = new ArrayList<PurchaseOrderDTO>( entities.size() );
        for ( ImportOrder importOrder : entities ) {
            list.add( toDTO( importOrder ) );
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
