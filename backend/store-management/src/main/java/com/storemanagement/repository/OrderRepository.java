package com.storemanagement.repository;

import com.storemanagement.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

       Page<Order> findByCustomerIdCustomerAndStatusOrderByOrderDateDesc(Integer customerId, Order.OrderStatus status,
                     Pageable pageable);

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
        * Search orders with keyword (searches by order ID as string)
        */
       @Query("SELECT o FROM Order o WHERE " +
                     "(:customerId IS NULL OR o.customer.idCustomer = :customerId) AND " +
                     "(:status IS NULL OR o.status = :status) AND " +
                     "(:keyword IS NULL OR :keyword = '' OR CAST(o.idOrder AS string) LIKE CONCAT('%', :keyword, '%') OR "
                     +
                     "LOWER(o.customer.customerName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(o.customer.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                     "ORDER BY o.orderDate DESC")
       Page<Order> searchByFilters(@Param("customerId") Integer customerId,
                     @Param("status") Order.OrderStatus status,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       /**
        * Search customer orders with keyword
        */
       @Query("SELECT o FROM Order o WHERE " +
                     "o.customer.idCustomer = :customerId AND " +
                     "(:status IS NULL OR o.status = :status) AND " +
                     "(:keyword IS NULL OR :keyword = '' OR CAST(o.idOrder AS string) LIKE CONCAT('%', :keyword, '%')) "
                     +
                     "ORDER BY o.orderDate DESC")
       Page<Order> searchMyOrders(@Param("customerId") Integer customerId,
                     @Param("status") Order.OrderStatus status,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       /**
        * Lấy danh sách product IDs mà customer đã mua (từ order_details)
        */
       @Query(value = "SELECT DISTINCT od.id_product " +
                     "FROM orders o " +
                     "INNER JOIN order_details od ON o.id_order = od.id_order " +
                     "WHERE o.id_customer = :customerId", nativeQuery = true)
       List<Integer> findPurchasedProductIdsByCustomerId(@Param("customerId") Integer customerId);

       // ======= EMPLOYEE STATISTICS QUERIES =======

       /**
        * Count total orders handled by an employee
        */
       @Query("SELECT COUNT(o) FROM Order o WHERE o.employee.idEmployee = :employeeId")
       Long countOrdersByEmployeeId(@Param("employeeId") Integer employeeId);

       /**
        * Sum total amount of orders handled by an employee
        */
       @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.employee.idEmployee = :employeeId")
       java.math.BigDecimal sumOrderAmountByEmployeeId(@Param("employeeId") Integer employeeId);

       /**
        * Count orders by employee and status
        */
       @Query("SELECT COUNT(o) FROM Order o WHERE o.employee.idEmployee = :employeeId AND o.status = :status")
       Long countOrdersByEmployeeIdAndStatus(@Param("employeeId") Integer employeeId,
                     @Param("status") Order.OrderStatus status);

       /**
        * Find orders by employee ID with optional filters (status, dateFrom, dateTo)
        */
       @Query("SELECT o FROM Order o LEFT JOIN FETCH o.customer WHERE " +
                     "o.employee.idEmployee = :employeeId AND " +
                     "(:status IS NULL OR o.status = :status) AND " +
                     "(:dateFrom IS NULL OR o.orderDate >= :dateFrom) AND " +
                     "(:dateTo IS NULL OR o.orderDate <= :dateTo) " +
                     "ORDER BY o.orderDate DESC")
       Page<Order> findByEmployeeIdWithFilters(
                     @Param("employeeId") Integer employeeId,
                     @Param("status") Order.OrderStatus status,
                     @Param("dateFrom") LocalDateTime dateFrom,
                     @Param("dateTo") LocalDateTime dateTo,
                     Pageable pageable);
}