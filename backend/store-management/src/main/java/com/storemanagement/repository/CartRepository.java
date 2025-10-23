package com.storemanagement.repository;

import com.storemanagement.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    
    Optional<Cart> findByCustomer_IdCustomer(Integer idCustomer);
}
