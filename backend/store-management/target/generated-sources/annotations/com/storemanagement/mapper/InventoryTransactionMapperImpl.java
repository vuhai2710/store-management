package com.storemanagement.mapper;

import com.storemanagement.dto.response.InventoryTransactionDto;
import com.storemanagement.model.InventoryTransaction;
import com.storemanagement.model.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:03+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class InventoryTransactionMapperImpl implements InventoryTransactionMapper {

    @Override
    public InventoryTransactionDto toDto(InventoryTransaction entity) {
        if ( entity == null ) {
            return null;
        }

        InventoryTransactionDto.InventoryTransactionDtoBuilder inventoryTransactionDto = InventoryTransactionDto.builder();

        inventoryTransactionDto.idProduct( entityProductIdProduct( entity ) );
        inventoryTransactionDto.productName( entityProductProductName( entity ) );
        inventoryTransactionDto.productCode( entityProductProductCode( entity ) );
        inventoryTransactionDto.sku( entityProductSku( entity ) );
        inventoryTransactionDto.idTransaction( entity.getIdTransaction() );
        inventoryTransactionDto.notes( entity.getNotes() );
        inventoryTransactionDto.quantity( entity.getQuantity() );
        inventoryTransactionDto.referenceId( entity.getReferenceId() );
        inventoryTransactionDto.referenceType( entity.getReferenceType() );
        inventoryTransactionDto.transactionDate( entity.getTransactionDate() );
        inventoryTransactionDto.transactionType( entity.getTransactionType() );

        inventoryTransactionDto.idEmployee( entity.getEmployee() != null ? entity.getEmployee().getIdEmployee() : null );
        inventoryTransactionDto.employeeName( entity.getEmployee() != null ? entity.getEmployee().getEmployeeName() : null );

        return inventoryTransactionDto.build();
    }

    @Override
    public InventoryTransaction toEntity(InventoryTransactionDto dto) {
        if ( dto == null ) {
            return null;
        }

        InventoryTransaction.InventoryTransactionBuilder inventoryTransaction = InventoryTransaction.builder();

        inventoryTransaction.idTransaction( dto.getIdTransaction() );
        inventoryTransaction.notes( dto.getNotes() );
        inventoryTransaction.quantity( dto.getQuantity() );
        inventoryTransaction.referenceId( dto.getReferenceId() );
        inventoryTransaction.referenceType( dto.getReferenceType() );
        inventoryTransaction.transactionDate( dto.getTransactionDate() );
        inventoryTransaction.transactionType( dto.getTransactionType() );

        return inventoryTransaction.build();
    }

    @Override
    public List<InventoryTransactionDto> toDtoList(List<InventoryTransaction> entities) {
        if ( entities == null ) {
            return null;
        }

        List<InventoryTransactionDto> list = new ArrayList<InventoryTransactionDto>( entities.size() );
        for ( InventoryTransaction inventoryTransaction : entities ) {
            list.add( toDto( inventoryTransaction ) );
        }

        return list;
    }

    private Integer entityProductIdProduct(InventoryTransaction inventoryTransaction) {
        Product product = inventoryTransaction.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getIdProduct();
    }

    private String entityProductProductName(InventoryTransaction inventoryTransaction) {
        Product product = inventoryTransaction.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getProductName();
    }

    private String entityProductProductCode(InventoryTransaction inventoryTransaction) {
        Product product = inventoryTransaction.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getProductCode();
    }

    private String entityProductSku(InventoryTransaction inventoryTransaction) {
        Product product = inventoryTransaction.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getSku();
    }
}
