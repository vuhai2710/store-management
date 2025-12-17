package com.storemanagement.repository;

import com.storemanagement.model.Promotion;
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
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
       Optional<Promotion> findByCode(String code);

       List<Promotion> findByIsActiveTrue();

       @Query("SELECT p FROM Promotion p WHERE p.isActive = true " +
                     "AND p.startDate <= :now AND p.endDate >= :now " +
                     "AND (p.usageLimit IS NULL OR p.usageCount < p.usageLimit)")
       List<Promotion> findActivePromotions(@Param("now") LocalDateTime now);

       Optional<Promotion> findByCodeAndIsActiveTrue(String code);

       /**
        * Search promotions by keyword (code)
        */
       @Query("SELECT p FROM Promotion p WHERE " +
                     "(:keyword IS NULL OR :keyword = '' OR " +
                     "LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       Page<Promotion> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

       /**
        * Search promotions by keyword and scope
        */
       @Query("SELECT p FROM Promotion p WHERE " +
                     "(:keyword IS NULL OR :keyword = '' OR LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                     "AND (:scope IS NULL OR p.scope = :scope)")
       Page<Promotion> searchByKeywordAndScope(@Param("keyword") String keyword,
                     @Param("scope") Promotion.PromotionScope scope,
                     Pageable pageable);

       /**
        * Find promotions by scope
        */
       Page<Promotion> findByScope(Promotion.PromotionScope scope, Pageable pageable);

       /**
        * Find active promotion by code and scope
        */
       @Query("SELECT p FROM Promotion p WHERE p.code = :code AND p.isActive = true AND p.scope = :scope")
       Optional<Promotion> findByCodeAndIsActiveTrueAndScope(@Param("code") String code,
                     @Param("scope") Promotion.PromotionScope scope);

       /**
        * Find all active PRODUCT-scope promotions that are currently valid.
        * Used for the Flash Sale slider.
        */
       @Query("SELECT DISTINCT p FROM Promotion p " +
                     "LEFT JOIN FETCH p.products pr " +
                     "WHERE p.scope = 'PRODUCT' " +
                     "AND p.isActive = true " +
                     "AND p.startDate <= :now AND p.endDate >= :now " +
                     "AND (p.usageLimit IS NULL OR p.usageCount < p.usageLimit)")
       List<Promotion> findActiveProductPromotions(@Param("now") LocalDateTime now);
}
