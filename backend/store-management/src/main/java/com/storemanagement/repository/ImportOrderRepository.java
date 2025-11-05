package com.storemanagement.repository;

import com.storemanagement.model.ImportOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ImportOrderRepository extends JpaRepository<ImportOrder, Integer> {

    // Lấy danh sách đơn nhập hàng theo supplier
    Page<ImportOrder> findBySupplier_IdSupplier(Integer supplierId, Pageable pageable);

    // Lấy danh sách đơn nhập hàng trong khoảng thời gian
    Page<ImportOrder> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Lấy danh sách đơn nhập hàng theo supplier và khoảng thời gian
    @Query("SELECT io FROM ImportOrder io WHERE io.supplier.idSupplier = :supplierId " +
           "AND io.orderDate BETWEEN :startDate AND :endDate")
    Page<ImportOrder> findBySupplierAndDateRange(
            @Param("supplierId") Integer supplierId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    // Lấy đơn nhập hàng với chi tiết (JOIN FETCH)
    @Query("SELECT io FROM ImportOrder io " +
           "LEFT JOIN FETCH io.importOrderDetails " +
           "LEFT JOIN FETCH io.supplier " +
           "WHERE io.idImportOrder = :id")
    ImportOrder findByIdWithDetails(@Param("id") Integer id);
}






















