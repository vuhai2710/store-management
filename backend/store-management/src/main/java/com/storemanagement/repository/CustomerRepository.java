package com.storemanagement.repository;

import com.storemanagement.model.Customer;
import com.storemanagement.model.User;
import com.storemanagement.utils.CustomerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByUser(User user);
    
    Optional<Customer> findByPhoneNumber(String phoneNumber);

    List<Customer> findByCustomerType(CustomerType customerType);

    Page<Customer> findByCustomerType(CustomerType customerType, Pageable pageable);

    @Query("""
            SELECT c FROM Customer c
            WHERE 
                (
                   (:name IS NOT NULL AND LOWER(c.customerName) LIKE LOWER(CONCAT('%', :name, '%')))
                   OR
                   (:phone IS NOT NULL AND c.phoneNumber LIKE CONCAT('%', :phone, '%'))
                )
            OR
                (:name IS NULL AND :phone IS NULL)
            """)
    Page<Customer> searchCustomers(@Param("name") String name, @Param("phone") String phone, Pageable pageable);
}
