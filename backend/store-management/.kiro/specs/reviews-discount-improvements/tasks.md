# Implementation Plan - Reviews, Discounts & Module Improvements

## Overview

This implementation plan breaks down the development into discrete, manageable tasks. Each task builds incrementally on previous tasks and includes specific requirements references.

---

## Task List

- [ ] 1. Database Migrations
- [ ] 1.1 Create product_reviews and review_replies tables migration

  - Create V13\_\_Add_product_reviews_table.sql
  - Add indexes for performance
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 1.2 Create discounts and related tables migration

  - Create V14\_\_Add_discounts_tables.sql
  - Create discount_usages table
  - Alter orders table to add discount columns
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 2. Product Reviews Module - Core Implementation
- [ ] 2.1 Create entity models

  - Create ProductReview entity with BaseEntity
  - Create ReviewReply entity
  - Add enums if needed
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2.2 Create repository interfaces

  - Create ProductReviewRepository with custom queries
  - Create ReviewReplyRepository
  - Add methods for finding, counting, and calculating ratings
  - _Requirements: 1.1, 1.4, 1.5, 1.6_

- [ ] 2.3 Create DTOs and mappers

  - Create ProductReviewDTO, CreateReviewRequestDto, UpdateReviewRequestDto
  - Create ReviewReplyDTO, CreateReplyRequestDto
  - Create ProductReviewMapper with MapStruct
  - _Requirements: 1.1, 1.2, 1.3, 1.8_

- [ ] 2.4 Implement ProductReviewService

  - Create ProductReviewService interface
  - Implement createReview with purchase verification logic
  - Implement getProductReviews with pagination
  - Implement getMyReviews for customer
  - Implement updateReview with 24h validation
  - Implement deleteReview with 24h validation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.9_

- [ ] 2.5 Implement review reply functionality

  - Implement replyToReview for admin/employee
  - Implement getReviewReplies
  - Implement deleteReply for admin
  - _Requirements: 1.8_

- [ ] 2.6 Create ProductReviewController

  - Implement POST /api/v1/reviews (customer)
  - Implement GET /api/v1/reviews/product/{id} (public)
  - Implement GET /api/v1/reviews/my-reviews (customer)
  - Implement PUT /api/v1/reviews/{id} (customer)
  - Implement DELETE /api/v1/reviews/{id} (customer)
  - Implement POST /api/v1/reviews/{id}/reply (admin/employee)
  - Implement GET /api/v1/reviews/{id}/replies (public)
  - Implement DELETE /api/v1/reviews/replies/{replyId} (admin)
  - Add proper security annotations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [ ] 3. Discount/Promotion Module - Core Implementation
- [ ] 3.1 Create entity models

  - Create Discount entity with all fields
  - Create DiscountUsage entity
  - Create DiscountType and ApplicableTo enums
  - _Requirements: 2.1, 2.2_

- [ ] 3.2 Create repository interfaces

  - Create DiscountRepository with custom queries
  - Create DiscountUsageRepository
  - Add methods for finding active discounts and counting usages
  - _Requirements: 2.1, 2.4, 2.5_

- [ ] 3.3 Create DTOs and mappers

  - Create DiscountDTO, CreateDiscountRequestDto, ValidateDiscountRequestDto
  - Create DiscountUsageDTO
  - Create DiscountMapper with MapStruct
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.4 Implement DiscountService - Admin functions

  - Create DiscountService interface
  - Implement createDiscount
  - Implement updateDiscount
  - Implement deleteDiscount
  - Implement getAllDiscounts with pagination
  - Implement getDiscountById
  - Implement getDiscountUsages
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.5 Implement DiscountService - Customer functions

  - Implement validateDiscount with all validation rules
  - Implement getAvailableDiscounts
  - Implement applyDiscount for internal use
  - Add discount calculation logic (PERCENT vs FIXED)
  - Add max discount cap logic
  - _Requirements: 2.4, 2.5, 2.6, 2.7_

- [ ] 3.6 Create DiscountController

  - Implement POST /api/v1/discounts (admin)
  - Implement GET /api/v1/discounts (admin)
  - Implement GET /api/v1/discounts/{id} (admin)
  - Implement PUT /api/v1/discounts/{id} (admin)
  - Implement DELETE /api/v1/discounts/{id} (admin)
  - Implement GET /api/v1/discounts/{id}/usages (admin)
  - Implement POST /api/v1/discounts/validate (customer)
  - Implement GET /api/v1/discounts/available (customer)
  - Add proper security annotations
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3.7 Integrate discount with OrderService

  - Modify OrderService.checkout() to accept discount code
  - Add discount validation before order creation
  - Calculate and apply discount amount
  - Save discount usage record
  - Update discount used_count
  - Save discount info in order (id_discount, discount_code)
  - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 4. Cart Module Bug Fix
- [ ] 4.1 Fix removeCartItem method

  - Add cartItemRepository.flush() after delete
  - Re-fetch cart from database after deletion
  - Verify @Transactional annotation present
  - Test that cart updates correctly
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Module Verifications and Testing
- [ ] 5.1 Verify PayOS integration

  - Test POST /api/v1/payment/create-payment-link
  - Test webhook signature verification
  - Test payment callback handling
  - Verify order status updates correctly
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5.2 Verify GHN integration

  - Test GET /api/v1/ghn/provinces
  - Test GET /api/v1/ghn/districts
  - Test GET /api/v1/ghn/wards
  - Test POST /api/v1/ghn/calculate-fee
  - Test POST /api/v1/ghn/create-order
  - Test webhook handling
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5.3 Verify Chat module

  - Test WebSocket connection
  - Test sending messages
  - Test conversation creation
  - Test message history retrieval
  - Test unread count calculation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]\* 6. Documentation and Testing
- [ ]\* 6.1 Create API documentation

  - Document all review endpoints with examples
  - Document all discount endpoints with examples
  - Update Postman collection
  - _Requirements: All_

- [ ]\* 6.2 Write unit tests

  - Write tests for ProductReviewServiceImpl
  - Write tests for DiscountServiceImpl
  - Write tests for CartServiceImpl bug fix
  - _Requirements: All_

- [ ]\* 6.3 Write integration tests

  - Write API tests for review endpoints
  - Write API tests for discount endpoints
  - Write API tests for cart fix
  - _Requirements: All_

- [ ]\* 6.4 Create module documentation
  - Create REVIEW_MODULE.md with usage guide
  - Create DISCOUNT_MODULE.md with usage guide
  - Update existing documentation if needed
  - _Requirements: All_

---

## Task Execution Notes

### Prerequisites

- Java 17+ installed
- MySQL 8.0+ running
- Maven dependencies downloaded
- Development environment configured

### Execution Order

1. Start with database migrations (Task 1)
2. Implement Reviews module completely (Task 2)
3. Implement Discount module completely (Task 3)
4. Fix Cart bug (Task 4)
5. Verify existing modules (Task 5)
6. Documentation and testing (Task 6 - optional)

### Testing Strategy

- Run unit tests after each service implementation
- Run integration tests after each controller implementation
- Perform manual testing using Postman
- Verify database state after each operation

### Rollback Plan

- Keep database migrations separate
- Test each module independently
- Use feature flags if needed
- Maintain backward compatibility

---

## Estimated Time

| Task                       | Estimated Time       |
| -------------------------- | -------------------- |
| 1. Database Migrations     | 1 hour               |
| 2. Reviews Module          | 4-6 hours            |
| 3. Discount Module         | 6-8 hours            |
| 4. Cart Bug Fix            | 30 minutes           |
| 5. Module Verifications    | 3-4 hours            |
| 6. Documentation & Testing | 4-6 hours (optional) |
| **Total**                  | **18-25 hours**      |

---

## Success Criteria

### Reviews Module

- [x] Customer can create review for purchased products only
- [x] Reviews display immediately without approval
- [x] Customer can edit/delete within 24 hours
- [x] Admin can reply to reviews
- [x] Verified purchase badge shows correctly
- [x] Average rating calculates correctly

### Discount Module

- [x] Admin can create/manage discounts
- [x] Customer can validate discount codes
- [x] Discounts apply correctly at checkout
- [x] Usage limits enforced
- [x] Min order value validated
- [x] Discount usage tracked

### Cart Bug Fix

- [x] Remove item works correctly
- [x] Cart updates immediately
- [x] Total recalculates correctly

### Module Verifications

- [x] PayOS integration working
- [x] GHN integration working
- [x] Chat module working
