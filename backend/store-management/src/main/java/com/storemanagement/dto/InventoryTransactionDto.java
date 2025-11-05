package com.storemanagement.dto;

import com.storemanagement.utils.ReferenceType;
import com.storemanagement.utils.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransactionDto {
    private Integer idTransaction;
    
    private Integer idProduct;
    private String productName;
    private String productCode;
    private String sku;
    
    private TransactionType transactionType;
    private Integer quantity;
    
    private ReferenceType referenceType;
    private Integer referenceId;
    
    private LocalDateTime transactionDate;
    
    private Integer idEmployee;
    private String employeeName;
    
    private String notes;
}
















