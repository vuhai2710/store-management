package com.storemanagement.repository.specification;

import com.storemanagement.model.InventoryTransaction;
import com.storemanagement.utils.ReferenceType;
import com.storemanagement.utils.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

/**
 * Specification class for dynamic filtering of InventoryTransaction entities.
 * Follows JPA Criteria API pattern for type-safe, composable queries.
 * 
 * Supports filtering by:
 * - transactionType (IN/OUT)
 * - referenceType (PURCHASE_ORDER, SALE_ORDER, ADJUSTMENT, SALE_RETURN, SALE_EXCHANGE)
 * - referenceId (specific reference ID)
 * - productId
 * - productName (partial match, case-insensitive)
 * - sku (partial match, case-insensitive)
 * - dateRange (fromDate, toDate)
 */
public class InventoryTransactionSpecification {

    private InventoryTransactionSpecification() {
        // Private constructor to prevent instantiation
    }

    /**
     * Filter by transaction type (IN or OUT)
     */
    public static Specification<InventoryTransaction> hasTransactionType(TransactionType transactionType) {
        return (root, query, criteriaBuilder) -> {
            if (transactionType == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("transactionType"), transactionType);
        };
    }

    /**
     * Filter by reference type
     */
    public static Specification<InventoryTransaction> hasReferenceType(ReferenceType referenceType) {
        return (root, query, criteriaBuilder) -> {
            if (referenceType == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("referenceType"), referenceType);
        };
    }

    /**
     * Filter by reference ID
     */
    public static Specification<InventoryTransaction> hasReferenceId(Integer referenceId) {
        return (root, query, criteriaBuilder) -> {
            if (referenceId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("referenceId"), referenceId);
        };
    }

    /**
     * Filter by product ID
     */
    public static Specification<InventoryTransaction> hasProductId(Integer productId) {
        return (root, query, criteriaBuilder) -> {
            if (productId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("product").get("idProduct"), productId);
        };
    }

    /**
     * Filter by product name (partial match, case-insensitive)
     */
    public static Specification<InventoryTransaction> hasProductNameLike(String productName) {
        return (root, query, criteriaBuilder) -> {
            if (productName == null || productName.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("product").get("productName")),
                "%" + productName.toLowerCase().trim() + "%"
            );
        };
    }

    /**
     * Filter by SKU (partial match, case-insensitive)
     */
    public static Specification<InventoryTransaction> hasSkuLike(String sku) {
        return (root, query, criteriaBuilder) -> {
            if (sku == null || sku.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("product").get("sku")),
                "%" + sku.toLowerCase().trim() + "%"
            );
        };
    }

    /**
     * Filter by brand (exact match, case-insensitive)
     */
    public static Specification<InventoryTransaction> hasBrand(String brand) {
        return (root, query, criteriaBuilder) -> {
            if (brand == null || brand.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("product").get("brand")),
                brand.toLowerCase().trim()
            );
        };
    }

    /**
     * Filter by transaction date >= fromDate
     */
    public static Specification<InventoryTransaction> hasDateFrom(LocalDateTime fromDate) {
        return (root, query, criteriaBuilder) -> {
            if (fromDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("transactionDate"), fromDate);
        };
    }

    /**
     * Filter by transaction date <= toDate
     */
    public static Specification<InventoryTransaction> hasDateTo(LocalDateTime toDate) {
        return (root, query, criteriaBuilder) -> {
            if (toDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("transactionDate"), toDate);
        };
    }

    /**
     * Combine all filters into a single specification.
     * All filters are optional and combined with AND logic.
     */
    public static Specification<InventoryTransaction> buildSpecification(
            TransactionType transactionType,
            ReferenceType referenceType,
            Integer referenceId,
            Integer productId,
            String productName,
            String sku,
            String brand,
            LocalDateTime fromDate,
            LocalDateTime toDate) {
        
        Specification<InventoryTransaction> spec = hasTransactionType(transactionType);
        spec = spec.and(hasReferenceType(referenceType));
        spec = spec.and(hasReferenceId(referenceId));
        spec = spec.and(hasProductId(productId));
        spec = spec.and(hasProductNameLike(productName));
        spec = spec.and(hasSkuLike(sku));
        spec = spec.and(hasBrand(brand));
        spec = spec.and(hasDateFrom(fromDate));
        spec = spec.and(hasDateTo(toDate));
        
        return spec;
    }
}
