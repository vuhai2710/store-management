package com.storemanagement.mapper;

import com.storemanagement.dto.inventory.InventoryTransactionDTO;
import com.storemanagement.model.InventoryTransaction;
import com.storemanagement.model.Product;
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
public class InventoryTransactionMapperImpl implements InventoryTransactionMapper {

    @Override
    public InventoryTransactionDTO toDTO(InventoryTransaction entity) {
        if ( entity == null ) {
            return null;
        }

        InventoryTransactionDTO.InventoryTransactionDTOBuilder inventoryTransactionDTO = InventoryTransactionDTO.builder();

        inventoryTransactionDTO.idTransaction( entity.getIdTransaction() );
        inventoryTransactionDTO.idProduct( entityProductIdProduct( entity ) );
        inventoryTransactionDTO.productName( entityProductProductName( entity ) );
        inventoryTransactionDTO.productCode( entityProductProductCode( entity ) );
        inventoryTransactionDTO.sku( entityProductSku( entity ) );
        inventoryTransactionDTO.transactionType( entity.getTransactionType() );
        inventoryTransactionDTO.quantity( entity.getQuantity() );
        inventoryTransactionDTO.referenceType( entity.getReferenceType() );
        inventoryTransactionDTO.referenceId( entity.getReferenceId() );
        inventoryTransactionDTO.transactionDate( entity.getTransactionDate() );
        inventoryTransactionDTO.notes( entity.getNotes() );

        inventoryTransactionDTO.idEmployee( entity.getEmployee() != null ? entity.getEmployee().getIdEmployee() : null );
        inventoryTransactionDTO.employeeName( entity.getEmployee() != null ? entity.getEmployee().getEmployeeName() : null );

        return inventoryTransactionDTO.build();
    }

    @Override
    public InventoryTransaction toEntity(InventoryTransactionDTO dto) {
        if ( dto == null ) {
            return null;
        }

        InventoryTransaction.InventoryTransactionBuilder inventoryTransaction = InventoryTransaction.builder();

        inventoryTransaction.transactionType( dto.getTransactionType() );
        inventoryTransaction.quantity( dto.getQuantity() );
        inventoryTransaction.referenceType( dto.getReferenceType() );
        inventoryTransaction.referenceId( dto.getReferenceId() );
        inventoryTransaction.notes( dto.getNotes() );

        return inventoryTransaction.build();
    }

    @Override
    public List<InventoryTransactionDTO> toDTOList(List<InventoryTransaction> entities) {
        if ( entities == null ) {
            return null;
        }

        List<InventoryTransactionDTO> list = new ArrayList<InventoryTransactionDTO>( entities.size() );
        for ( InventoryTransaction inventoryTransaction : entities ) {
            list.add( toDTO( inventoryTransaction ) );
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
