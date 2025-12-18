package com.storemanagement.repository.specification;

import com.storemanagement.model.InventoryTransaction;
import com.storemanagement.utils.ReferenceType;
import com.storemanagement.utils.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class InventoryTransactionSpecification {

    private InventoryTransactionSpecification() {

    }

    public static Specification<InventoryTransaction> hasTransactionType(TransactionType transactionType) {
        return (root, query, criteriaBuilder) -> {
            if (transactionType == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("transactionType"), transactionType);
        };
    }

    public static Specification<InventoryTransaction> hasReferenceType(ReferenceType referenceType) {
        return (root, query, criteriaBuilder) -> {
            if (referenceType == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("referenceType"), referenceType);
        };
    }

    public static Specification<InventoryTransaction> hasReferenceId(Integer referenceId) {
        return (root, query, criteriaBuilder) -> {
            if (referenceId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("referenceId"), referenceId);
        };
    }

    public static Specification<InventoryTransaction> hasProductId(Integer productId) {
        return (root, query, criteriaBuilder) -> {
            if (productId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("product").get("idProduct"), productId);
        };
    }

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

    public static Specification<InventoryTransaction> hasDateFrom(LocalDateTime fromDate) {
        return (root, query, criteriaBuilder) -> {
            if (fromDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("transactionDate"), fromDate);
        };
    }

    public static Specification<InventoryTransaction> hasDateTo(LocalDateTime toDate) {
        return (root, query, criteriaBuilder) -> {
            if (toDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("transactionDate"), toDate);
        };
    }

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
