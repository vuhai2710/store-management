package com.storemanagement.repository;

import com.storemanagement.model.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    @EntityGraph(attributePaths = {"cartItems", "cartItems.product"})
    Optional<Cart> findByCustomerIdCustomer(Integer customerId);
}

