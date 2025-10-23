package com.storemanagement.repository;

import com.storemanagement.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    
    Optional<Supplier> findBySupplierName(String supplierName);
    
    List<Supplier> findBySupplierNameContainingIgnoreCase(String supplierName);
}
