package com.storemanagement.repository;

import com.storemanagement.model.OrderReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderReturnRepository extends JpaRepository<OrderReturn, Integer>, JpaSpecificationExecutor<OrderReturn> {

    Page<OrderReturn> findByCreatedByCustomer_IdCustomerOrderByCreatedAtDesc(Integer idCustomer, Pageable pageable);

    @Query("SELECT r FROM OrderReturn r LEFT JOIN FETCH r.items WHERE r.idReturn = :id")
    Optional<OrderReturn> findByIdWithItems(@Param("id") Integer id);

    Page<OrderReturn> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Filter by status only
    Page<OrderReturn> findByStatusOrderByCreatedAtDesc(OrderReturn.ReturnStatus status, Pageable pageable);

    // Filter by returnType only
    Page<OrderReturn> findByReturnTypeOrderByCreatedAtDesc(OrderReturn.ReturnType returnType, Pageable pageable);

    // Filter by both status and returnType
    Page<OrderReturn> findByStatusAndReturnTypeOrderByCreatedAtDesc(
            OrderReturn.ReturnStatus status,
            OrderReturn.ReturnType returnType,
            Pageable pageable);

    @Query("SELECT COUNT(r) > 0 FROM OrderReturn r WHERE r.order.idOrder = :orderId AND r.status NOT IN ('REJECTED', 'COMPLETED', 'CANCELED')")
    boolean existsActiveReturnByOrderId(@Param("orderId") Integer orderId);

    // ======= DYNAMIC SEARCH QUERY =======
    
    /**
     * Advanced search with all filters: keyword (idReturn/orderId), customerKeyword (name/id), status, returnType
     */
    @Query("SELECT r FROM OrderReturn r " +
           "LEFT JOIN r.order o " +
           "LEFT JOIN r.createdByCustomer c " +
           "WHERE (:status IS NULL OR r.status = :status) " +
           "AND (:returnType IS NULL OR r.returnType = :returnType) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     CAST(r.idReturn AS string) LIKE CONCAT('%', :keyword, '%') OR " +
           "     CAST(o.idOrder AS string) LIKE CONCAT('%', :keyword, '%')) " +
           "AND (:customerKeyword IS NULL OR :customerKeyword = '' OR " +
           "     LOWER(c.customerName) LIKE LOWER(CONCAT('%', :customerKeyword, '%')) OR " +
           "     CAST(c.idCustomer AS string) LIKE CONCAT('%', :customerKeyword, '%')) " +
           "ORDER BY r.createdAt DESC")
    Page<OrderReturn> searchAdvanced(
            @Param("status") OrderReturn.ReturnStatus status,
            @Param("returnType") OrderReturn.ReturnType returnType,
            @Param("keyword") String keyword,
            @Param("customerKeyword") String customerKeyword,
            Pageable pageable);

}

