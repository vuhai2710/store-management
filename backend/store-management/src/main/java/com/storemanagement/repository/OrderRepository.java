package com.storemanagement.repository;

import com.storemanagement.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.orderDetails od " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.employee " +
           "LEFT JOIN FETCH od.product " +
           "WHERE o.idOrder = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Integer id);

    Page<Order> findByCustomerIdCustomerOrderByOrderDateDesc(Integer customerId, Pageable pageable);

    Page<Order> findByCustomerIdCustomerAndStatusOrderByOrderDateDesc(Integer customerId, Order.OrderStatus status, Pageable pageable);

    Optional<Order> findByPaymentLinkId(String paymentLinkId);

    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    Page<Order> findAllOrdersByOrderDateDesc(Pageable pageable);

    Page<Order> findByStatusOrderByOrderDateDesc(Order.OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE " +
           "(:customerId IS NULL OR o.customer.idCustomer = :customerId) AND " +
           "(:status IS NULL OR o.status = :status) " +
           "ORDER BY o.orderDate DESC")
    Page<Order> findByFilters(@Param("customerId") Integer customerId,
                              @Param("status") Order.OrderStatus status,
                              Pageable pageable);
    
    /**
     * Lấy danh sách product IDs mà customer đã mua (từ order_details)
     */
    @Query(value = "SELECT DISTINCT od.id_product " +
           "FROM orders o " +
           "INNER JOIN order_details od ON o.id_order = od.id_order " +
           "WHERE o.id_customer = :customerId", nativeQuery = true)
    List<Integer> findPurchasedProductIdsByCustomerId(@Param("customerId") Integer customerId);
}