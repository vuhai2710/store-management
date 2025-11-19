package com.storemanagement.repository;

import com.storemanagement.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    // Lấy đơn hàng với đầy đủ chi tiết (JOIN FETCH)
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.orderDetails od " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.employee " +
           "LEFT JOIN FETCH od.product " +
           "WHERE o.idOrder = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Integer id);
    
    // Lấy danh sách đơn hàng của customer
    Page<Order> findByCustomerIdCustomerOrderByOrderDateDesc(Integer customerId, Pageable pageable);
    
    // Lấy danh sách đơn hàng của customer theo status
    Page<Order> findByCustomerIdCustomerAndStatusOrderByOrderDateDesc(Integer customerId, Order.OrderStatus status, Pageable pageable);
    
    /**
     * Tìm order theo PayOS payment link ID
     * Sử dụng khi nhận webhook từ PayOS
     * PayOS webhook gửi payment_link_id, cần tìm order tương ứng
     */
    Optional<Order> findByPaymentLinkId(String paymentLinkId);

    // Admin/Employee: Lấy tất cả đơn hàng
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    Page<Order> findAllOrdersByOrderDateDesc(Pageable pageable);

    // Admin/Employee: Lấy đơn hàng theo status
    Page<Order> findByStatusOrderByOrderDateDesc(Order.OrderStatus status, Pageable pageable);

    // Admin/Employee: Lấy đơn hàng theo customerId và status
    @Query("SELECT o FROM Order o WHERE " +
           "(:customerId IS NULL OR o.customer.idCustomer = :customerId) AND " +
           "(:status IS NULL OR o.status = :status) " +
           "ORDER BY o.orderDate DESC")
    Page<Order> findByFilters(@Param("customerId") Integer customerId,
                              @Param("status") Order.OrderStatus status,
                              Pageable pageable);

    /**
     * Lấy danh sách product IDs mà customer đã mua gần đây
     * Sắp xếp theo order_date DESC (mới nhất trước)
     * 
     * @param customerId ID của customer
     * @param limit Số lượng sản phẩm cần lấy
     * @return Danh sách product IDs (distinct)
     */
    @Query(value = """
            SELECT DISTINCT od.id_product
            FROM order_details od
            INNER JOIN orders o ON od.id_order = o.id_order
            WHERE o.id_customer = :customerId
            ORDER BY o.order_date DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Integer> findRecentlyPurchasedProductIds(@Param("customerId") Integer customerId, 
                                                   @Param("limit") int limit);
}




