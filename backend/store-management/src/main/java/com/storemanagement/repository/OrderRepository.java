package com.storemanagement.repository;

import com.storemanagement.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    // Lấy đơn hàng với đầy đủ chi tiết (JOIN FETCH)
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.orderDetails od " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.employee " +
           "LEFT JOIN FETCH od.product " +
           "WHERE o.idOrder = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Integer id);
    
    // Lấy danh sách đơn hàng của customer
    Page<Order> findByCustomerIdCustomerOrderByOrderDateDesc(Integer customerId, Pageable pageable);
    
    // Lấy danh sách đơn hàng của customer theo status
    Page<Order> findByCustomerIdCustomerAndStatusOrderByOrderDateDesc(Integer customerId, Order.OrderStatus status, Pageable pageable);
}




