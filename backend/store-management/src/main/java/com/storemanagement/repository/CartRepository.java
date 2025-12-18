package com.storemanagement.repository;

import com.storemanagement.model.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    @EntityGraph(attributePaths = {"cartItems", "cartItems.product"})
    Optional<Cart> findByCustomerIdCustomer(Integer customerId);

    @Query(value = "SELECT ci.id_product " +
           "FROM carts c " +
           "INNER JOIN cart_items ci ON c.id_cart = ci.id_cart " +
           "WHERE c.id_customer = :customerId", nativeQuery = true)
    List<Integer> findProductIdsInCartByCustomerId(@Param("customerId") Integer customerId);
}
