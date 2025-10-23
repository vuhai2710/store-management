package com.storemanagement.repository;

import com.storemanagement.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    
    Optional<Customer> findByUser_IdUser(Integer idUser);
    
    List<Customer> findByCustomerNameContainingIgnoreCase(String name);
    
    List<Customer> findByPhoneNumberContaining(String phoneNumber);
    
    List<Customer> findByCustomerType(Customer.CustomerType customerType);
    
    @Query("SELECT c FROM Customer c WHERE c.customerName LIKE %?1% OR c.phoneNumber LIKE %?1%")
    List<Customer> searchCustomers(String keyword);
}
