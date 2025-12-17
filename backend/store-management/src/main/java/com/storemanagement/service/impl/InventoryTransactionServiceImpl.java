package com.storemanagement.service.impl;

import com.storemanagement.dto.inventory.InventoryTransactionDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.InventoryTransactionMapper;
import com.storemanagement.model.InventoryTransaction;
import com.storemanagement.repository.InventoryTransactionRepository;
import com.storemanagement.repository.specification.InventoryTransactionSpecification;
import com.storemanagement.service.InventoryTransactionService;
import com.storemanagement.utils.PageUtils;
import com.storemanagement.utils.TransactionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    public PageResponse<InventoryTransactionDTO> getAllTransactions(Pageable pageable) {
        log.info("Getting all inventory transactions, page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<InventoryTransaction> transactionPage =
                inventoryTransactionRepository.findAllByOrderByTransactionDateDesc(pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDTO> getTransactionsByProduct(Integer productId, Pageable pageable) {
        log.info("Getting inventory transactions for product ID: {}", productId);

        Page<InventoryTransaction> transactionPage =
                inventoryTransactionRepository.findByProduct_IdProduct(productId, pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDTO> getTransactionsByReference(
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Pageable pageable) {

        log.info("Getting inventory transactions for reference: {} #{}", referenceType, referenceId);

        Page<InventoryTransaction> transactionPage =
                inventoryTransactionRepository.findByReferenceTypeAndReferenceId(referenceType, referenceId, pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDTO> getTransactionsByDateRange(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        log.info("Getting inventory transactions from {} to {}", startDate, endDate);

        Page<InventoryTransaction> transactionPage =
                inventoryTransactionRepository.findByTransactionDateBetween(startDate, endDate, pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDTO> getTransactionsByProductAndDateRange(
            Integer productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        log.info("Getting inventory transactions for product {} from {} to {}", productId, startDate, endDate);

        Page<InventoryTransaction> transactionPage =
                inventoryTransactionRepository.findByProductAndDateRange(productId, startDate, endDate, pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDTO> getTransactionsByType(
            TransactionType transactionType,
            Pageable pageable) {

        log.info("Getting inventory transactions by type: {}", transactionType);

        Page<InventoryTransaction> transactionPage =
                inventoryTransactionRepository.findByTransactionType(transactionType, pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDTO> getTransactionsByMultipleCriteria(
            TransactionType transactionType,
            Integer productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        log.info("Getting inventory transactions by multiple criteria - type: {}, productId: {}, from: {} to: {}",
                transactionType, productId, startDate, endDate);

        Page<InventoryTransaction> transactionPage =
                inventoryTransactionRepository.findByMultipleCriteria(
                        transactionType, productId, startDate, endDate, pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDTO> getTransactionsByAdvancedCriteria(
            TransactionType transactionType,
            com.storemanagement.utils.ReferenceType referenceType,
            Integer productId,
            String productName,
            String sku,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        log.info("Getting inventory transactions by advanced criteria - type: {}, refType: {}, productId: {}, productName: {}, sku: {}, from: {} to: {}",
                transactionType, referenceType, productId, productName, sku, startDate, endDate);

        Page<InventoryTransaction> transactionPage =
                inventoryTransactionRepository.findByAdvancedCriteria(
                        transactionType, referenceType, productId, productName, sku, startDate, endDate, pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }

    @Override
    public PageResponse<InventoryTransactionDTO> filterTransactions(
            TransactionType transactionType,
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Integer productId,
            String productName,
            String sku,
            String brand,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable) {

        log.info("Filtering inventory transactions using Specification - type: {}, refType: {}, refId: {}, productId: {}, productName: {}, sku: {}, brand: {}, from: {} to: {}",
                transactionType, referenceType, referenceId, productId, productName, sku, brand, fromDate, toDate);

        Specification<InventoryTransaction> spec = InventoryTransactionSpecification.buildSpecification(
                transactionType, referenceType, referenceId, productId, productName, sku, brand, fromDate, toDate);

        Page<InventoryTransaction> transactionPage = inventoryTransactionRepository.findAll(spec, pageable);

        return PageUtils.toPageResponse(transactionPage,
                inventoryTransactionMapper.toDTOList(transactionPage.getContent()));
    }
}
