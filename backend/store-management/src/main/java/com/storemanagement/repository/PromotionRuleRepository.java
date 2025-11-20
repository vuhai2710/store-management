package com.storemanagement.repository;

import com.storemanagement.model.PromotionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRuleRepository extends JpaRepository<PromotionRule, Integer> {
       List<PromotionRule> findByIsActiveTrue();

       @Query("SELECT pr FROM PromotionRule pr WHERE pr.isActive = true " +
                     "AND pr.startDate <= :now AND pr.endDate >= :now " +
                     "AND pr.minOrderAmount <= :totalAmount " +
                     "AND (pr.customerType = :customerType OR pr.customerType = 'ALL') " +
                     "ORDER BY pr.priority DESC")
       List<PromotionRule> findApplicableRules(
                     @Param("now") LocalDateTime now,
                     @Param("totalAmount") BigDecimal totalAmount,
                     @Param("customerType") String customerType);

       Optional<PromotionRule> findByIdRule(Integer idRule);
}
