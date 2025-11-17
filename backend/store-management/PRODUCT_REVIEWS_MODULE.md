# Product Reviews Module (Đánh giá sản phẩm)

## Tổng quan

Module đánh giá sản phẩm cho phép khách hàng đánh giá sản phẩm đã mua và giao hàng thành công. Admin/Employee có thể xem và quản lý đánh giá.

**Base URL:** `/api/v1`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

## Yêu cầu đã implement

- **Khách hàng chỉ đánh giá được sản phẩm đã mua và giao hàng thành công**
- Admin/Employee có thể xem, trả lời và xóa đánh giá
- Rating 1-5 (bắt buộc)
- Comment text (bắt buộc)
- Hiển thị tên khách hàng
- **Chỉnh sửa 1 lần duy nhất trong 24h**
- **Xóa trong 24h**
- **Admin/Employee trả lời review**
- **Lọc review theo rating (làm tròn xuống: 4.1 → 4)**

## Database Schema

### Bảng product_reviews

```sql
CREATE TABLE product_reviews (
  id_review INT PRIMARY KEY AUTO_INCREMENT,
  id_product INT NOT NULL,
  id_customer INT NOT NULL,
  id_order INT NULL,
  id_order_detail INT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  admin_reply TEXT NULL COMMENT 'Câu trả lời từ admin/employee',
  edit_count INT NOT NULL DEFAULT 0 COMMENT 'Số lần đã chỉnh sửa (tối đa 1 lần)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE CASCADE,
  FOREIGN KEY (id_customer) REFERENCES customers(id_customer) ON DELETE CASCADE,
  FOREIGN KEY (id_order) REFERENCES orders(id_order) ON DELETE SET NULL,
  FOREIGN KEY (id_order_detail) REFERENCES order_details(id_order_detail) ON DELETE SET NULL,
  UNIQUE KEY uq_review_order_detail (id_order_detail)
);
```

## Business Logic

### 1. Validation khi tạo review

- Customer phải đã mua sản phẩm (có order với status = COMPLETED)
- Order phải có delivered_at (đã giao hàng thành công)
- Mỗi order detail chỉ được review 1 lần
- Rating phải từ 1-5
- Comment không được rỗng

### 2. Chỉnh sửa/xóa trong 24h

- Kiểm tra `created_at` + 24h >= current time
- **Chỉ cho phép chỉnh sửa 1 lần duy nhất (editCount < 1)**
- Chỉ customer tạo review mới được chỉnh sửa/xóa
- Admin/Employee có thể xóa và trả lời bất kỳ review nào

### 3. Rating Filter

- Khi filter theo rating, hệ thống làm tròn xuống (floor function)
- Ví dụ: rating=4 sẽ lấy tất cả reviews có rating = 4
- Do rating là integer (1-5) nên không có số thập phân

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| POST | `/api/v1/products/{productId}/reviews` | CUSTOMER | Tạo đánh giá sản phẩm |
| GET | `/api/v1/products/{productId}/reviews` | CUSTOMER, ADMIN, EMPLOYEE | Lấy danh sách đánh giá của sản phẩm (có filter rating) |
| GET | `/api/v1/reviews/my-reviews` | CUSTOMER | Lấy đánh giá của tôi |
| PUT | `/api/v1/reviews/{reviewId}` | CUSTOMER | Chỉnh sửa đánh giá (24h, 1 lần) |
| DELETE | `/api/v1/reviews/{reviewId}` | CUSTOMER | Xóa đánh giá (24h) |
| GET | `/api/v1/admin/reviews` | ADMIN, EMPLOYEE | Xem tất cả đánh giá |
| GET | `/api/v1/admin/reviews/{reviewId}` | ADMIN, EMPLOYEE | Xem chi tiết đánh giá |
| POST | `/api/v1/admin/reviews/{reviewId}/reply` | ADMIN, EMPLOYEE | Trả lời đánh giá |
| DELETE | `/api/v1/admin/reviews/{reviewId}` | ADMIN, EMPLOYEE | Xóa đánh giá (bất kỳ lúc nào) |

---

---

## Chi tiết Endpoints

### Customer Endpoints

#### 1. Tạo đánh giá

**Endpoint:** `POST /api/v1/products/{productId}/reviews`

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "orderDetailId": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Tạo đánh giá thành công",
  "data": {
    "idReview": 1,
    "idProduct": 1,
    "productName": "iPhone 15 Pro",
    "idCustomer": 1,
    "customerName": "Nguyen Van A",
    "idOrder": 1,
    "idOrderDetail": 1,
    "rating": 5,
    "comment": "Sản phẩm rất tốt, giao hàng nhanh",
    "createdAt": "01/01/2025 10:00:00",
    "updatedAt": "01/01/2025 10:00:00"
  }
}
```

#### 2. Lấy danh sách đánh giá của sản phẩm

**Endpoint:** `GET /api/v1/products/{productId}/reviews`

**Authentication:** Required (CUSTOMER, ADMIN, EMPLOYEE)

**Query Parameters:**
- `pageNo` (optional, default: 1)
- `pageSize` (optional, default: 10)
- `sortBy` (optional, default: "createdAt")
- `sortDirection` (optional, default: "DESC")
- **`rating` (optional): Lọc theo rating (1-5)**

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách đánh giá thành công",
  "data": {
    "content": [
      {
        "idReview": 1,
        "idProduct": 1,
        "productName": "iPhone 15 Pro",
        "idCustomer": 1,
        "customerName": "Nguyen Van A",
        "rating": 5,
        "comment": "Sản phẩm rất tốt",
        "createdAt": "01/01/2025 10:00:00"
      }
    ],
    "pageNo": 1,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### 3. Lấy danh sách đánh giá của customer hiện tại

**Endpoint:** `GET /api/v1/reviews/my-reviews`

**Authentication:** Required (CUSTOMER role)

**Query Parameters:** Same as above

#### 4. Chỉnh sửa đánh giá (trong 24h)

**Endpoint:** `PUT /api/v1/reviews/{reviewId}`

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Sản phẩm tốt nhưng giao hàng hơi chậm"
}
```

#### 5. Xóa đánh giá (trong 24h)

**Endpoint:** `DELETE /api/v1/reviews/{reviewId}`

**Authentication:** Required (CUSTOMER role)

### Admin/Employee Endpoints

#### 1. Xem tất cả đánh giá

**Endpoint:** `GET /api/v1/admin/reviews`

**Authentication:** Required (ADMIN, EMPLOYEE)

**Query Parameters:** Same as above

#### 2. Xem chi tiết đánh giá

**Endpoint:** `GET /api/v1/admin/reviews/{reviewId}`

**Authentication:** Required (ADMIN, EMPLOYEE)

#### 3. Xóa đánh giá (bất kỳ lúc nào)

**Endpoint:** `DELETE /api/v1/admin/reviews/{reviewId}`

**Authentication:** Required (ADMIN, EMPLOYEE)

**Response:**
```json
{
  "code": 200,
  "message": "Xóa đánh giá thành công",
  "data": null
}
```

#### 4. Trả lời đánh giá

**Endpoint:** `POST /api/v1/admin/reviews/{reviewId}/reply`

**Authentication:** Required (ADMIN, EMPLOYEE)

**Request Body:**
```json
{
  "adminReply": "Cảm ơn bạn đã đánh giá. Chúng tôi rất vui khi bạn hài lòng với sản phẩm!"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Trả lời đánh giá thành công",
  "data": {
    "idReview": 1,
    "idProduct": 1,
    "productName": "iPhone 15 Pro",
    "idCustomer": 1,
    "customerName": "Nguyen Van A",
    "rating": 5,
    "comment": "Sản phẩm rất tốt",
    "adminReply": "Cảm ơn bạn đã đánh giá. Chúng tôi rất vui khi bạn hài lòng với sản phẩm!",
    "editCount": 0,
    "createdAt": "01/01/2025 10:00:00",
    "updatedAt": "01/01/2025 10:30:00"
  }
}
```

---

## Files đã tạo

- Migrations: 
  - `V13__Add_product_reviews_table.sql`
  - `V18__Add_admin_reply_and_edit_count_to_reviews.sql`
- Model: `ProductReview.java`
- Repository: `ProductReviewRepository.java`
- DTOs: `ProductReviewDTO.java`, `CreateReviewRequestDTO.java`, `UpdateReviewRequestDTO.java`, `AdminReplyRequestDTO.java`
- Service: `ProductReviewService.java`, `ProductReviewServiceImpl.java`
- Controller: `ProductReviewController.java`
- Mapper: `ProductReviewMapper.java`

---

## Testing Guide

### Test Cases

1. **Tạo review cho sản phẩm đã mua:**
   - Test với order status = COMPLETED và delivered_at != null ✅
   - Test với order status != COMPLETED (should fail) ❌
   - Test với order không có delivered_at (should fail) ❌

2. **Validation:**
   - Test mỗi order detail chỉ được review 1 lần ✅
   - Test rating phải từ 1-5 ✅
   - Test comment không được rỗng ✅

3. **Chỉnh sửa/xóa trong 24h:**
   - Test chỉnh sửa trong 24h lần đầu (should succeed) ✅
   - Test chỉnh sửa lần thứ 2 (should fail - chỉ được 1 lần) ❌
   - Test chỉnh sửa sau 24h (should fail) ❌
   - Test xóa trong 24h (should succeed) ✅
   - Test xóa sau 24h (should fail) ❌

4. **Admin/Employee:**
   - Test admin/employee xem tất cả reviews ✅
   - Test admin/employee trả lời review ✅
   - Test admin/employee xóa review (bất kỳ lúc nào) ✅

5. **Rating Filter:**
   - Test filter với rating=4 (chỉ lấy reviews có rating=4) ✅
   - Test không có filter (lấy tất cả) ✅

---

## Error Handling

| Status Code | Error Message |
|-------------|---------------|
| 404 | "Không tìm thấy sản phẩm" |
| 404 | "Không tìm thấy khách hàng" |
| 404 | "Không tìm thấy chi tiết đơn hàng" |
| 404 | "Không tìm thấy đánh giá" |
| 400 | "Chỉ có thể đánh giá sản phẩm từ đơn hàng đã hoàn thành" |
| 400 | "Chỉ có thể đánh giá sản phẩm đã được giao hàng thành công" |
| 400 | "Đơn hàng này đã được đánh giá" |
| 400 | "Rating phải từ 1 đến 5" |
| 400 | "Comment không được để trống" |
| 400 | "Chỉ có thể chỉnh sửa đánh giá trong vòng 24 giờ sau khi tạo" |
| 400 | "Chỉ được phép chỉnh sửa đánh giá 1 lần" |
| 403 | "Không có quyền chỉnh sửa/xóa đánh giá này" |

---

## Tips và Best Practices

1. **Validation Business Rules:**
   - Luôn validate order status = COMPLETED
   - Luôn validate delivered_at != null
   - Kiểm tra unique constraint trên order_detail

2. **Edit Count Tracking:**
   - editCount được tăng lên sau mỗi lần update
   - Giới hạn editCount < 1 để chỉ cho phép edit 1 lần
   - Admin reply không tính vào editCount

3. **Time-based Restrictions:**
   - Sử dụng `ChronoUnit.HOURS.between()` để tính chính xác
   - 24h window áp dụng cho cả edit và delete
   - Admin/Employee không bị giới hạn thời gian

4. **Rating System:**
   - Rating là integer (1-5) nên tự động làm tròn
   - Filter rating exact match, không có range

5. **Performance:**
   - Sử dụng pagination cho tất cả list endpoints
   - Index trên (id_product, rating) để optimize filter queries
   - Eager fetch customer/product khi cần hiển thị tên

---

## Contact & Support

Nếu có câu hỏi hoặc phát hiện bug, vui lòng liên hệ team phát triển.



