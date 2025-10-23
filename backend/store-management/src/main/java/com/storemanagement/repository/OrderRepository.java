package com.storemanagement.repository;

import com.storemanagement.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    
    List<Order> findByCustomer_IdCustomer(Integer idCustomer);
    
    List<Order> findByEmployee_IdEmployee(Integer idEmployee);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN ?1 AND ?2 ORDER BY o.orderDate DESC")
    List<Order> findOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE YEAR(o.orderDate) = ?1 AND MONTH(o.orderDate) = ?2")
    List<Order> findByYearAndMonth(int year, int month);
}
