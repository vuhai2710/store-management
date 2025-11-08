package com.storemanagement.repository;

import com.storemanagement.model.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    Optional<Supplier> findBySupplierName(String supplierName);
    Optional<Supplier> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<Supplier> findBySupplierNameContainingIgnoreCase(String name, Pageable pageable);
}

