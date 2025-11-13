# Design Document - Reviews, Discounts & Module Improvements

## Overview

This design document outlines the technical implementation for adding Product Reviews and Discount/Promotion features to the Store Management System, along with bug fixes and module verifications.

### Key Design Principles

1. **Simplicity First**: Reviews are published immediately without approval workflow
2. **Data Integrity**: Use database constraints to prevent duplicate reviews
3. **Verified Purchases**: Track which reviews come from actual purchases
4. **Extensibility**: Design allows future enhancements (e.g., review moderation if needed)
5. **Consistency**: Follow existing project patterns (Entity → Repository → Service → Controller)

### Technology Stack

- **Framework**: Spring Boot 3.5.5
- **Database**: MySQL 8.0 with Flyway migrations
- **ORM**: JPA/Hibernate
- **Mapping**: MapStruct
- **Security**: Spring Security with JWT
- **Validation**: Jakarta Validation

---

## Architecture

### Module Structure

```
src/main/java/com/storemanagement/
├── model/
│   ├── ProductReview.java
│   ├── ReviewReply.java
│   └── Discount.java
├── repository/
│   ├── ProductReviewRepository.java
│   ├── ReviewReplyRepository.java
│   └── DiscountRepository.java
├── service/
│   ├── ProductReviewService.java
│   └── DiscountService.java
├── service/impl/
│   ├── ProductReviewServiceImpl.java
│   └── DiscountServiceImpl.java
├── controller/
│   ├── ProductReviewController.java
│   └── DiscountController.java
├── dto/review/
│   ├── ProductReviewDTO.java
│   ├── CreateReviewRequestDto.java
│   ├── UpdateReviewRequestDto.java
│   ├── ReviewReplyDTO.java
│   └── CreateReplyRequestDto.java
└── dto/discount/
    ├── DiscountDTO.java
    ├── CreateDiscountRequestDto.java
    └── ValidateDiscountRequestDto.java
```

---

## Components and Interfaces

### 1. Product Reviews Module

#### 1.1 Entity Models

**ProductReview Entity**

```java
@Entity
@Table(name = "product_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReview extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idReview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_customer", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order")
    private Order order;

    @Column(nullable = false)
    @Min(1) @Max(5)
    private Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean isVerifiedPurchase = false;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL)
    private List<ReviewReply> replies = new ArrayList<>();
}
```

**ReviewReply Entity**

```java
@Entity
@Table(name = "review_replies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReply extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idReply;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_review", nullable = false)
    private ProductReview review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String replyText;
}
```

#### 1.2 Repository Layer

**ProductReviewRepository**

```java
public interface ProductReviewRepository extends JpaRepository<ProductReview, Integer> {
    // Tìm review theo product (có phân trang)
    Page<ProductReview> findByProduct_IdProductOrderByCreatedAtDesc(
        Integer productId, Pageable pageable);

    // Tìm review của customer
    Page<ProductReview> findByCustomer_IdCustomerOrderByCreatedAtDesc(
        Integer customerId, Pageable pageable);

    // Kiểm tra customer đã review product chưa
    boolean existsByCustomer_IdCustomerAndProduct_IdProduct(
        Integer customerId, Integer productId);

    // Tính rating trung bình
    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.idProduct = :productId")
    Double calculateAverageRating(@Param("productId") Integer productId);

    // Đếm số lượng review theo product
    long countByProduct_IdProduct(Integer productId);
}
```

**ReviewReplyRepository**

```java
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Integer> {
    // Lấy replies theo review
    List<ReviewReply> findByReview_IdReviewOrderByCreatedAtAsc(Integer reviewId);

    // Đếm số replies
    long countByReview_IdReview(Integer reviewId);
}
```

#### 1.3 Service Layer

**ProductReviewService Interface**

```java
public interface ProductReviewService {
    // Customer APIs
    ProductReviewDTO createReview(Integer customerId, CreateReviewRequestDto request);
    Page<ProductReviewDTO> getProductReviews(Integer productId, Pageable pageable);
    Page<ProductReviewDTO> getMyReviews(Integer customerId, Pageable pageable);
    ProductReviewDTO updateReview(Integer customerId, Integer reviewId, UpdateReviewRequestDto request);
    void deleteReview(Integer customerId, Integer reviewId);

    // Admin APIs
    ReviewReplyDTO replyToReview(Integer userId, Integer reviewId, CreateReplyRequestDto request);
    List<ReviewReplyDTO> getReviewReplies(Integer reviewId);
    void deleteReply(Integer replyId);

    // Utility methods
    Double getAverageRating(Integer productId);
    long getReviewCount(Integer productId);
}
```

#### 1.4 Business Logic Details

**Create Review Logic**

```
1. Validate customer exists
2. Validate product exists
3. Check if customer already reviewed this product (UNIQUE constraint)
4. Verify customer has purchased this product:
   - Query orders where:
     * id_customer = customerId
     * status = COMPLETED
     * order_details contains id_product = productId
5. If purchased:
   - Set is_verified_purchase = true
   - Set id_order = order.idOrder
6. Save review (published immediately)
7. Return ProductReviewDTO
```

**Update Review Logic**

```
1. Validate review exists and belongs to customer
2. Check if within 24 hours of creation:
   - Calculate: now - review.createdAt <= 24 hours
3. If not within 24h: throw exception
4. Update rating and comment
5. Save and return updated DTO
```

**Delete Review Logic**

```
1. Validate review exists and belongs to customer
2. Check if within 24 hours of creation
3. If not within 24h: throw exception
4. Delete review (cascade deletes replies)
```

**Reply to Review Logic**

```
1. Validate review exists
2. Validate user is Admin or Employee
3. Create ReviewReply entity
4. Save and return ReviewReplyDTO
```

#### 1.5 Controller Layer

**ProductReviewController**

```java
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ProductReviewController {
    private final ProductReviewService reviewService;

    // Customer endpoints
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<ProductReviewDTO> createReview(@RequestBody CreateReviewRequestDto request);

    @GetMapping("/product/{productId}")
    public ApiResponse<PageResponse<ProductReviewDTO>> getProductReviews(
        @PathVariable Integer productId, Pageable pageable);

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PageResponse<ProductReviewDTO>> getMyReviews(Pageable pageable);

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<ProductReviewDTO> updateReview(
        @PathVariable Integer reviewId, @RequestBody UpdateReviewRequestDto request);

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<Void> deleteReview(@PathVariable Integer reviewId);

    // Admin/Employee endpoints
    @PostMapping("/{reviewId}/reply")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ApiResponse<ReviewReplyDTO> replyToReview(
        @PathVariable Integer reviewId, @RequestBody CreateReplyRequestDto request);

    @GetMapping("/{reviewId}/replies")
    public ApiResponse<List<ReviewReplyDTO>> getReviewReplies(@PathVariable Integer reviewId);

    @DeleteMapping("/replies/{replyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteReply(@PathVariable Integer replyId);
}
```

---

## 2. Discount/Promotion Module

### 2.1 Entity Models

**Discount Entity**

```java
@Entity
@Table(name = "discounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Discount extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDiscount;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENT, FIXED

    @Column(nullable = false)
    private BigDecimal value;

    @Column
    private BigDecimal maxDiscountAmount; // For PERCENT type

    @Column(nullable = false)
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    @Column
    private Integer usageLimit; // null = unlimited

    @Column(nullable = false)
    private Integer usageLimitPerCustomer = 1;

    @Column(nullable = false)
    private Integer usedCount = 0;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicableTo applicableTo = ApplicableTo.ALL; // ALL, CATEGORY, PRODUCT
}
```

**DiscountUsage Entity**

```java
@Entity
@Table(name = "discount_usages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_discount", nullable = false)
    private Discount discount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_customer", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", nullable = false)
    private Order order;

    @Column(nullable = false)
    private BigDecimal discountAmount;

    @Column(nullable = false)
    private LocalDateTime usedAt = LocalDateTime.now();
}
```

### 2.2 Repository Layer

**DiscountRepository**

```java
public interface DiscountRepository extends JpaRepository<Discount, Integer> {
    Optional<Discount> findByCodeAndIsActiveTrue(String code);

    @Query("SELECT d FROM Discount d WHERE d.isActive = true " +
           "AND d.startDate <= :now AND d.endDate >= :now")
    Page<Discount> findActiveDiscounts(@Param("now") LocalDateTime now, Pageable pageable);
}
```

**DiscountUsageRepository**

```java
public interface DiscountUsageRepository extends JpaRepository<DiscountUsage, Integer> {
    long countByDiscount_IdDiscountAndCustomer_IdCustomer(Integer discountId, Integer customerId);

    List<DiscountUsage> findByDiscount_IdDiscountOrderByUsedAtDesc(Integer discountId);
}
```

### 2.3 Service Layer

**DiscountService Interface**

```java
public interface DiscountService {
    // Admin APIs
    DiscountDTO createDiscount(CreateDiscountRequestDto request);
    DiscountDTO updateDiscount(Integer discountId, CreateDiscountRequestDto request);
    void deleteDiscount(Integer discountId);
    Page<DiscountDTO> getAllDiscounts(Pageable pageable);
    DiscountDTO getDiscountById(Integer discountId);
    List<DiscountUsageDTO> getDiscountUsages(Integer discountId);

    // Customer APIs
    DiscountDTO validateDiscount(String code, BigDecimal orderAmount, Integer customerId);
    Page<DiscountDTO> getAvailableDiscounts(Integer customerId, Pageable pageable);

    // Internal use (called by OrderService)
    BigDecimal applyDiscount(String code, Integer customerId, Integer orderId,
                             BigDecimal orderAmount, List<Integer> productIds);
}
```

### 2.4 Discount Validation Logic

**Validate Discount Code**

```
1. Find discount by code where is_active = true
2. Check if discount exists
3. Validate time range:
   - now >= start_date AND now <= end_date
4. Validate usage limit (total):
   - If usage_limit != null: used_count < usage_limit
5. Validate usage limit per customer:
   - Count usages by this customer
   - customer_usage_count < usage_limit_per_customer
6. Validate minimum order value:
   - order_amount >= min_order_value
7. Validate applicable_to:
   - If ALL: always valid
   - If CATEGORY: check if any product in cart belongs to applicable categories
   - If PRODUCT: check if any product in cart is in applicable products
8. Return validated discount or throw exception
```

**Calculate Discount Amount**

```
1. If discount_type = PERCENT:
   - amount = order_amount * (value / 100)
   - If max_discount_amount != null:
     - amount = min(amount, max_discount_amount)
2. If discount_type = FIXED:
   - amount = value
3. Ensure amount <= order_amount (cannot be negative)
4. Return discount_amount
```

### 2.5 Integration with OrderService

**Modified OrderService.checkout() Logic**

```java
public OrderDTO checkout(Integer customerId, CreateOrderRequestDto request) {
    // ... existing validation logic ...

    // NEW: Apply discount if provided
    BigDecimal discountAmount = BigDecimal.ZERO;
    Discount appliedDiscount = null;

    if (request.getDiscountCode() != null && !request.getDiscountCode().isEmpty()) {
        // Validate and calculate discount
        List<Integer> productIds = cartItems.stream()
            .map(item -> item.getProduct().getIdProduct())
            .collect(Collectors.toList());

        discountAmount = discountService.applyDiscount(
            request.getDiscountCode(),
            customerId,
            null, // orderId not yet created
            totalAmount,
            productIds
        );

        appliedDiscount = discountRepository.findByCodeAndIsActiveTrue(request.getDiscountCode())
            .orElseThrow();
    }

    // Create order with discount
    Order order = Order.builder()
        .customer(customer)
        .totalAmount(totalAmount)
        .discount(discountAmount)
        .discountCode(request.getDiscountCode())
        .idDiscount(appliedDiscount != null ? appliedDiscount.getIdDiscount() : null)
        // ... other fields ...
        .build();

    Order savedOrder = orderRepository.save(order);

    // NEW: Record discount usage
    if (appliedDiscount != null) {
        DiscountUsage usage = DiscountUsage.builder()
            .discount(appliedDiscount)
            .customer(customer)
            .order(savedOrder)
            .discountAmount(discountAmount)
            .build();
        discountUsageRepository.save(usage);

        // Update used count
        appliedDiscount.setUsedCount(appliedDiscount.getUsedCount() + 1);
        discountRepository.save(appliedDiscount);
    }

    // ... rest of checkout logic ...
}
```

---

## 3. Cart Module Bug Fix

### Problem Analysis

The `removeCartItem` method in `CartServiceImpl` correctly calls `cartItemRepository.delete(cartItem)`, but the issue might be:

1. Transaction not committed immediately
2. JPA cache not cleared
3. Frontend not refreshing properly

### Solution

**Updated CartServiceImpl.removeCartItem()**

```java
@Override
@Transactional
public CartDTO removeCartItem(Integer customerId, Integer itemId) {
    Cart cart = getOrCreateCart(customerId);

    CartItem cartItem = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

    if (!cartItem.getCart().getIdCart().equals(cart.getIdCart())) {
        throw new RuntimeException("Không có quyền xóa sản phẩm này");
    }

    // Delete cart item
    cartItemRepository.delete(cartItem);

    // Force flush to database immediately
    cartItemRepository.flush();

    // Refresh cart from database to get updated state
    cart = cartRepository.findById(cart.getIdCart())
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giỏ hàng"));

    return cartMapper.toDTO(cart);
}
```

**Key Changes:**

1. Added `cartItemRepository.flush()` to force immediate database write
2. Re-fetch cart from database after delete to ensure fresh data
3. Ensure `@Transactional` annotation is present

---

## Data Models

### Database Schema Changes

**New Tables:**

1. `product_reviews` - Stores customer reviews
2. `review_replies` - Stores admin/employee replies to reviews
3. `discounts` - Stores discount codes and rules
4. `discount_usages` - Tracks discount usage history

**Modified Tables:**

1. `orders` - Add columns:
   - `id_discount` (FK to discounts)
   - `discount_code` (VARCHAR(50), snapshot)

### Entity Relationships

```
Product 1---* ProductReview *---1 Customer
ProductReview 1---* ReviewReply *---1 User
ProductReview *---1 Order

Discount 1---* DiscountUsage *---1 Customer
Discount 1---* DiscountUsage *---1 Order
```

---

## Error Handling

### Review Module Errors

| Error Code | HTTP Status | Message                             | Scenario              |
| ---------- | ----------- | ----------------------------------- | --------------------- |
| REVIEW_001 | 400         | Bạn đã đánh giá sản phẩm này rồi    | Duplicate review      |
| REVIEW_002 | 403         | Bạn chưa mua sản phẩm này           | Not purchased         |
| REVIEW_003 | 403         | Chỉ có thể sửa/xóa review trong 24h | Edit/delete after 24h |
| REVIEW_004 | 404         | Không tìm thấy review               | Review not found      |
| REVIEW_005 | 403         | Không có quyền sửa/xóa review này   | Wrong owner           |

### Discount Module Errors

| Error Code   | HTTP Status | Message                            | Scenario              |
| ------------ | ----------- | ---------------------------------- | --------------------- |
| DISCOUNT_001 | 404         | Mã giảm giá không tồn tại          | Code not found        |
| DISCOUNT_002 | 400         | Mã giảm giá đã hết hạn             | Expired               |
| DISCOUNT_003 | 400         | Mã giảm giá đã hết lượt sử dụng    | Usage limit reached   |
| DISCOUNT_004 | 400         | Bạn đã sử dụng mã này rồi          | Per-customer limit    |
| DISCOUNT_005 | 400         | Đơn hàng chưa đủ giá trị tối thiểu | Below min order value |
| DISCOUNT_006 | 400         | Mã không áp dụng cho sản phẩm này  | Not applicable        |

### Cart Module Errors

| Error Code | HTTP Status | Message                           | Scenario       |
| ---------- | ----------- | --------------------------------- | -------------- |
| CART_001   | 404         | Không tìm thấy sản phẩm trong giỏ | Item not found |
| CART_002   | 403         | Không có quyền xóa sản phẩm này   | Wrong owner    |

---

## Testing Strategy

### Unit Tests

**ProductReviewServiceImpl Tests**

```java
@Test
void createReview_WhenCustomerPurchasedProduct_ShouldCreateVerifiedReview()

@Test
void createReview_WhenCustomerNotPurchased_ShouldThrowException()

@Test
void createReview_WhenDuplicateReview_ShouldThrowException()

@Test
void updateReview_WhenWithin24Hours_ShouldUpdate()

@Test
void updateReview_WhenAfter24Hours_ShouldThrowException()

@Test
void deleteReview_WhenWithin24Hours_ShouldDelete()

@Test
void replyToReview_WhenAdminUser_ShouldCreateReply()
```

**DiscountServiceImpl Tests**

```java
@Test
void validateDiscount_WhenValidCode_ShouldReturnDiscount()

@Test
void validateDiscount_WhenExpired_ShouldThrowException()

@Test
void validateDiscount_WhenUsageLimitReached_ShouldThrowException()

@Test
void applyDiscount_WhenPercentType_ShouldCalculateCorrectly()

@Test
void applyDiscount_WhenFixedType_ShouldCalculateCorrectly()

@Test
void applyDiscount_WhenMaxDiscountSet_ShouldCapAmount()
```

**CartServiceImpl Tests**

```java
@Test
void removeCartItem_WhenValidItem_ShouldRemoveAndReturnUpdatedCart()

@Test
void removeCartItem_WhenWrongOwner_ShouldThrowException()
```

### Integration Tests

**Review API Tests**

```java
@Test
void POST_reviews_WhenValidRequest_ShouldReturn200()

@Test
void GET_reviews_product_ShouldReturnPaginatedReviews()

@Test
void PUT_reviews_WhenAfter24Hours_ShouldReturn403()

@Test
void POST_reviews_reply_WhenAdmin_ShouldReturn200()
```

**Discount API Tests**

```java
@Test
void POST_discounts_WhenAdmin_ShouldCreateDiscount()

@Test
void POST_discounts_validate_WhenValidCode_ShouldReturn200()

@Test
void POST_orders_checkout_WithDiscount_ShouldApplyCorrectly()
```

### Manual Testing Checklist

**Reviews Module:**

- [ ] Customer can create review for purchased product
- [ ] Customer cannot review product not purchased
- [ ] Customer cannot create duplicate review
- [ ] Customer can edit review within 24h
- [ ] Customer cannot edit review after 24h
- [ ] Admin can reply to any review
- [ ] Verified purchase badge shows correctly
- [ ] Average rating calculates correctly

**Discount Module:**

- [ ] Admin can create discount with all types
- [ ] Customer can validate discount code
- [ ] Discount applies correctly at checkout (PERCENT)
- [ ] Discount applies correctly at checkout (FIXED)
- [ ] Max discount cap works for PERCENT type
- [ ] Usage limit enforced correctly
- [ ] Per-customer limit enforced correctly
- [ ] Expired discounts rejected
- [ ] Min order value validated

**Cart Bug Fix:**

- [ ] Remove item from cart works correctly
- [ ] Cart updates immediately after removal
- [ ] Total amount recalculates correctly
- [ ] Cannot remove item from another customer's cart

---

## Security Considerations

### Authentication & Authorization

**Reviews:**

- Create/Update/Delete: Requires CUSTOMER role
- Reply: Requires ADMIN or EMPLOYEE role
- View: Public (no authentication required)

**Discounts:**

- Create/Update/Delete: Requires ADMIN role
- Validate/View: Requires CUSTOMER role

**Cart:**

- All operations: Requires CUSTOMER role
- Validate ownership before any modification

### Data Validation

**Reviews:**

- Rating: Must be 1-5
- Comment: Required, max 2000 characters
- Image URL: Optional, max 500 characters
- Sanitize HTML in comments to prevent XSS

**Discounts:**

- Code: Required, unique, alphanumeric only
- Value: Must be > 0
- Dates: start_date < end_date
- Usage limits: Must be >= 0 or null

### SQL Injection Prevention

- Use JPA/Hibernate parameterized queries
- Never concatenate user input into queries
- Use `@Query` with named parameters

---

## Performance Considerations

### Database Indexes

**product_reviews table:**

- Index on `id_product` for fast product review lookup
- Index on `id_customer` for fast customer review lookup
- Index on `is_verified_purchase` for filtering
- Composite unique index on `(id_customer, id_product)`

**discounts table:**

- Unique index on `code` for fast lookup
- Index on `is_active` for filtering
- Composite index on `(start_date, end_date)` for date range queries

**discount_usages table:**

- Index on `id_discount` for usage count queries
- Index on `id_customer` for per-customer limit checks

### Query Optimization

**Reviews:**

- Use pagination for product reviews (default 10 per page)
- Fetch reviews with JOIN FETCH for replies to avoid N+1
- Cache average rating calculation (consider Redis)

**Discounts:**

- Cache active discounts list (TTL: 5 minutes)
- Use database-level COUNT for usage validation
- Batch update used_count to reduce writes

### Caching Strategy

**Reviews:**

- Cache product average rating (invalidate on new review)
- Cache review count per product
- No caching for review list (real-time updates important)

**Discounts:**

- Cache discount validation results (TTL: 1 minute)
- Cache available discounts list (TTL: 5 minutes)
- Invalidate cache on discount create/update/delete

---

## Migration Strategy

### Phase 1: Database Migration

1. Run Flyway migration V13 (product_reviews tables)
2. Run Flyway migration V14 (discounts tables)
3. Verify tables created successfully

### Phase 2: Code Deployment

1. Deploy new entities and repositories
2. Deploy services and controllers
3. Verify endpoints accessible

### Phase 3: Testing

1. Run unit tests
2. Run integration tests
3. Perform manual testing

### Phase 4: Monitoring

1. Monitor error logs for exceptions
2. Monitor database performance
3. Monitor API response times

### Rollback Plan

If issues occur:

1. Revert code deployment
2. Keep database tables (data preserved)
3. Disable new endpoints via feature flag
4. Investigate and fix issues
5. Redeploy when ready

---

## Future Enhancements

### Reviews Module

- Image upload for reviews (currently only URL)
- Review moderation/approval workflow (if spam becomes issue)
- Helpful/Not helpful voting on reviews
- Review sorting (most helpful, newest, highest/lowest rating)
- Review filtering (verified purchases only, rating range)

### Discount Module

- Discount stacking (multiple codes per order)
- Auto-apply best discount
- Discount categories (first-time customer, loyalty, seasonal)
- Scheduled discount activation
- A/B testing for discount effectiveness

### General

- Email notifications for review replies
- Push notifications for discount expiry
- Analytics dashboard for reviews and discounts
- Export discount usage reports
