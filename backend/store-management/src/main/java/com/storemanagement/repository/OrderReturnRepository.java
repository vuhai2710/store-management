package com.storemanagement.repository;

import com.storemanagement.model.OrderReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderReturnRepository extends JpaRepository<OrderReturn, Integer> {

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

    @Query("SELECT COUNT(r) > 0 FROM OrderReturn r WHERE r.order.idOrder = :orderId AND r.status NOT IN ('REJECTED', 'COMPLETED')")
    boolean existsActiveReturnByOrderId(@Param("orderId") Integer orderId);

}

