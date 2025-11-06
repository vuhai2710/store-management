package com.storemanagement.repository;

import com.storemanagement.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    Optional<CartItem> findByCartIdCartAndProductIdProduct(Integer cartId, Integer productId);
    
    void deleteByCartIdCart(Integer cartId);
}







