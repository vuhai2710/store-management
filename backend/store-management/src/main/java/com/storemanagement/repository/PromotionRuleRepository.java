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

       /**
        * Find applicable ORDER promotion rules for auto-apply product discounts
        * Only returns ORDER scope rules (not SHIPPING)
        */
       @Query("SELECT pr FROM PromotionRule pr WHERE pr.isActive = true " +
                     "AND pr.startDate <= :now AND pr.endDate >= :now " +
                     "AND pr.scope = 'ORDER' " +
                     "AND pr.minOrderAmount <= :totalAmount " +
                     "AND (pr.customerType = :customerType OR pr.customerType = 'ALL') " +
                     "ORDER BY pr.priority DESC")
       List<PromotionRule> findApplicableRules(
                     @Param("now") LocalDateTime now,
                     @Param("totalAmount") BigDecimal totalAmount,
                     @Param("customerType") String customerType);

       Optional<PromotionRule> findByIdRule(Integer idRule);

       /**
        * Find applicable shipping promotion rules for auto-apply
        * Only returns SHIPPING scope rules that are active and within valid date range
        */
       @Query("SELECT pr FROM PromotionRule pr WHERE pr.isActive = true " +
                     "AND pr.startDate <= :now AND pr.endDate >= :now " +
                     "AND pr.scope = 'SHIPPING' " +
                     "AND pr.minOrderAmount <= :totalAmount " +
                     "AND (pr.customerType = :customerType OR pr.customerType = 'ALL') " +
                     "ORDER BY pr.priority DESC")
       List<PromotionRule> findApplicableShippingRules(
                     @Param("now") LocalDateTime now,
                     @Param("totalAmount") BigDecimal totalAmount,
                     @Param("customerType") String customerType);
}
