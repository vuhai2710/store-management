package com.storemanagement.repository;

import com.storemanagement.model.Customer;
import com.storemanagement.model.User;
import com.storemanagement.utility.CustomerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByUser(User user);
    List<Customer> findByCustomerType(CustomerType customerType);
}
