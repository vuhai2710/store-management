package com.storemanagement.repository;

import com.storemanagement.model.OrderReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderReturnItemRepository extends JpaRepository<OrderReturnItem, Integer> {
    List<OrderReturnItem> findByOrderReturn_IdReturn(Integer idReturn);
}