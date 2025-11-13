# Requirements Document - Reviews, Discounts & Module Improvements

## Introduction

Dự án Store Management System cần bổ sung các tính năng mới và cải thiện các module hiện có để nâng cao trải nghiệm người dùng và tính năng quản lý. Các tính năng chính bao gồm:

1. **Reviews Module**: Cho phép khách hàng đánh giá sản phẩm đã mua
2. **Discount/Promotion Module**: Hệ thống mã giảm giá linh hoạt
3. **Cart Module Bug Fix**: Sửa lỗi xóa sản phẩm khỏi giỏ hàng
4. **Module Verification**: Kiểm tra và cải thiện PayOS, GHN, Chat modules

## Glossary

- **System**: Store Management System backend application
- **Customer**: Khách hàng đã đăng ký tài khoản và có thể mua hàng
- **Admin**: Quản trị viên hệ thống với quyền cao nhất
- **Employee**: Nhân viên với quyền quản lý hạn chế
- **Review**: Đánh giá sản phẩm từ khách hàng
- **Discount Code**: Mã giảm giá có thể áp dụng khi checkout
- **Verified Purchase**: Đánh giá từ khách hàng đã mua và nhận hàng thành công
- **PayOS**: Cổng thanh toán trực tuyến
- **GHN**: Giao Hàng Nhanh - dịch vụ vận chuyển
- **Cart Item**: Sản phẩm trong giỏ hàng

## Requirements

### Requirement 1: Product Reviews System

**User Story:** As a Customer, I want to review products I have purchased, so that I can share my experience with other customers.

#### Acceptance Criteria

1. WHEN a Customer has received an order with status COMPLETED, THE System SHALL allow the Customer to create a review for products in that order
2. WHEN a Customer creates a review, THE System SHALL require rating between 1 and 5 stars and comment text
3. WHEN a Customer creates a review, THE System SHALL mark the review as verified purchase if the Customer has completed an order containing that product
4. WHEN a Customer creates a review, THE System SHALL prevent duplicate reviews for the same product from the same Customer
5. WHEN a Customer creates a review, THE System SHALL immediately publish the review without requiring approval
6. WHEN a Customer views a product, THE System SHALL display all reviews with verified purchase badges
7. WHEN an Admin views reviews for a product, THE System SHALL display all reviews with Customer information
8. WHEN an Admin replies to a review, THE System SHALL save the reply and display it under the review
9. WHEN a Customer edits or deletes a review, THE System SHALL only allow the action within 24 hours of creation

### Requirement 2: Discount and Promotion System

**User Story:** As an Admin, I want to create discount codes with flexible rules, so that I can run promotional campaigns effectively.

#### Acceptance Criteria

1. WHEN an Admin creates a discount code, THE System SHALL require code, discount type (PERCENT or FIXED), value, and validity period
2. WHEN an Admin creates a discount code, THE System SHALL allow setting minimum order value, usage limit, and per-customer usage limit
3. WHEN an Admin creates a discount code, THE System SHALL allow specifying applicable categories or products
4. WHEN a Customer applies a discount code at checkout, THE System SHALL validate the code is active, not expired, and usage limits not exceeded
5. WHEN a Customer applies a PERCENT discount, THE System SHALL calculate discount amount and apply maximum discount cap if configured
6. WHEN a Customer applies a discount code, THE System SHALL verify the order meets minimum order value requirement
7. WHEN a Customer applies a discount code, THE System SHALL verify the code is applicable to products in the cart
8. WHEN an order is completed with a discount code, THE System SHALL record the discount usage and update usage count

### Requirement 3: Cart Module Bug Fix

**User Story:** As a Customer, I want to remove items from my cart successfully, so that I can manage my shopping cart properly.

#### Acceptance Criteria

1. WHEN a Customer removes an item from cart, THE System SHALL delete the cart item from database
2. WHEN a Customer removes an item from cart, THE System SHALL return updated cart with correct item count and total amount
3. WHEN a Customer removes an item from cart, THE System SHALL verify the item belongs to the Customer's cart before deletion
4. WHEN a Customer removes the last item from cart, THE System SHALL return an empty cart with zero total amount

### Requirement 4: PayOS Integration Verification

**User Story:** As a Developer, I want to verify PayOS integration is working correctly, so that customers can make online payments successfully.

#### Acceptance Criteria

1. WHEN the System creates a PayOS payment link, THE System SHALL use PayOS SDK with correct credentials
2. WHEN the System receives a PayOS webhook, THE System SHALL verify the webhook signature using PayOS SDK
3. WHEN a payment is successful, THE System SHALL update order status and payment status accordingly
4. WHEN PayOS SDK methods are called, THE System SHALL handle exceptions and log errors appropriately

### Requirement 5: GHN Integration Verification

**User Story:** As a Developer, I want to verify GHN integration is complete and working, so that shipping features function correctly.

#### Acceptance Criteria

1. WHEN the System calculates shipping fee, THE System SHALL call GHN API with correct parameters and return fee amount
2. WHEN the System creates a GHN order, THE System SHALL store the GHN order code in shipments table
3. WHEN the System receives a GHN webhook, THE System SHALL update shipment status based on GHN status
4. WHEN GHN integration is disabled, THE System SHALL return default shipping fee or throw appropriate exception

### Requirement 6: Chat Module Verification

**User Story:** As a Developer, I want to verify Chat module is ready for production use, so that customers can communicate with support staff.

#### Acceptance Criteria

1. WHEN a Customer sends a chat message, THE System SHALL create or use existing open conversation
2. WHEN an Admin or Employee sends a message, THE System SHALL deliver the message to the correct conversation
3. WHEN a Customer views chat history, THE System SHALL only show messages from their own conversations
4. WHEN an Admin views all conversations, THE System SHALL display conversations ordered by most recent activity
5. WHEN a conversation is closed, THE System SHALL update the conversation status to CLOSED
