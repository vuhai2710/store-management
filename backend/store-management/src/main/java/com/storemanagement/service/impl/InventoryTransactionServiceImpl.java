package com.storemanagement.service.impl;

import com.storemanagement.dto.InventoryTransactionDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.InventoryTransactionMapper;
import com.storemanagement.model.InventoryTransaction;
import com.storemanagement.repository.InventoryTransactionRepository;
import com.storemanagement.service.InventoryTransactionService;
import com.storemanagement.utils.PageUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class InventoryTransactionServiceImpl implements InventoryTransactionService {

    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final InventoryTransactionMapper inventoryTransactionMapper;

    @Override
    public PageResponse<InventoryTransactionDto> getAllTransactions(Pageable pageable) {
        log.info("Getting all inventory transactions, page: {}, size: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        Page<InventoryTransaction> transactionPage = 
                inventoryTransactionRepository.findAllByOrderByTransactionDateDesc(pageable);
        
        return PageUtils.toPageResponse(transactionPage, 
                inventoryTransactionMapper.toDtoList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDto> getTransactionsByProduct(Integer productId, Pageable pageable) {
        log.info("Getting inventory transactions for product ID: {}", productId);
        
        Page<InventoryTransaction> transactionPage = 
                inventoryTransactionRepository.findByProduct_IdProduct(productId, pageable);
        
        return PageUtils.toPageResponse(transactionPage, 
                inventoryTransactionMapper.toDtoList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDto> getTransactionsByReference(
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Pageable pageable) {
        
        log.info("Getting inventory transactions for reference: {} #{}", referenceType, referenceId);
        
        Page<InventoryTransaction> transactionPage = 
                inventoryTransactionRepository.findByReferenceTypeAndReferenceId(referenceType, referenceId, pageable);
        
        return PageUtils.toPageResponse(transactionPage, 
                inventoryTransactionMapper.toDtoList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDto> getTransactionsByDateRange(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        
        log.info("Getting inventory transactions from {} to {}", startDate, endDate);
        
        Page<InventoryTransaction> transactionPage = 
                inventoryTransactionRepository.findByTransactionDateBetween(startDate, endDate, pageable);
        
        return PageUtils.toPageResponse(transactionPage, 
                inventoryTransactionMapper.toDtoList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDto> getTransactionsByProductAndDateRange(
            Integer productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        
        log.info("Getting inventory transactions for product {} from {} to {}", productId, startDate, endDate);
        
        Page<InventoryTransaction> transactionPage = 
                inventoryTransactionRepository.findByProductAndDateRange(productId, startDate, endDate, pageable);
        
        return PageUtils.toPageResponse(transactionPage, 
                inventoryTransactionMapper.toDtoList(transactionPage.getContent()));
    }
}















