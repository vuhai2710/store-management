package com.storemanagement.repository;

import com.storemanagement.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    Optional<Supplier> findBySupplierName(String supplierName);
    Optional<Supplier> findByEmail(String email);
}

