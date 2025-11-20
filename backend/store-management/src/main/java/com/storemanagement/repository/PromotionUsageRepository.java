package com.storemanagement.repository;

import com.storemanagement.model.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Integer> {
    List<PromotionUsage> findByPromotionIdPromotion(Integer promotionId);

    List<PromotionUsage> findByCustomerIdCustomer(Integer customerId);

    List<PromotionUsage> findByOrderIdOrder(Integer orderId);

    @Query("SELECT COUNT(pu) FROM PromotionUsage pu WHERE pu.promotion.idPromotion = :promotionId")
    Long countByPromotionId(@Param("promotionId") Integer promotionId);
}