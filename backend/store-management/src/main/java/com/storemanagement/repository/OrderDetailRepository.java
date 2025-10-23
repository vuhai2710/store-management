package com.storemanagement.repository;

import com.storemanagement.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    
    List<OrderDetail> findByOrder_IdOrder(Integer idOrder);
    
    @Query("SELECT od FROM OrderDetail od WHERE od.product.idProduct = ?1")
    List<OrderDetail> findByProductId(Integer idProduct);
    
    @Query("SELECT od.product.idProduct, od.product.productName, SUM(od.quantity) as totalSold " +
           "FROM OrderDetail od " +
           "GROUP BY od.product.idProduct, od.product.productName " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProducts();
}
