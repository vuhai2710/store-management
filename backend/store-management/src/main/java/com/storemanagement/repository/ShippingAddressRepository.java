package com.storemanagement.repository;

import com.storemanagement.model.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Integer> {
    List<ShippingAddress> findByCustomerIdCustomerOrderByIsDefaultDesc(Integer customerId);
    
    Optional<ShippingAddress> findByCustomerIdCustomerAndIsDefaultTrue(Integer customerId);
    
    List<ShippingAddress> findByCustomerIdCustomer(Integer customerId);
    
    Optional<ShippingAddress> findByIdShippingAddressAndCustomerIdCustomer(Integer addressId, Integer customerId);
}







