# Product Reviews Module (Đánh giá sản phẩm)

## Tổng quan

Module đánh giá sản phẩm cho phép khách hàng đánh giá sản phẩm đã mua và giao hàng thành công. Admin/Employee có thể xem và quản lý đánh giá.

## Yêu cầu đã implement

- **Option b: Đơn giản (chỉ rating + comment)**
- Khách hàng chỉ đánh giá được sản phẩm đã mua và giao hàng thành công
- Admin/Employee có thể xem được đánh giá
- Rating 1-5 (bắt buộc)
- Comment text (bắt buộc)
- Hiển thị tên khách hàng
- Chỉnh sửa/xóa trong 24h

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
- Chỉ customer tạo review mới được chỉnh sửa/xóa
- Admin/Employee có thể xóa bất kỳ review nào

## API Endpoints

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

## Files đã tạo

- Migration: `V13__Add_product_reviews_table.sql`
- Model: `ProductReview.java`
- Repository: `ProductReviewRepository.java`
- DTOs: `ProductReviewDTO.java`, `CreateReviewRequestDTO.java`, `UpdateReviewRequestDTO.java`
- Service: `ProductReviewService.java`, `ProductReviewServiceImpl.java`
- Controller: `ProductReviewController.java`
- Mapper: `ProductReviewMapper.java`

## Testing

### Test Cases

1. **Tạo review cho sản phẩm đã mua:**
   - Test với order status = COMPLETED và delivered_at != null
   - Test với order status != COMPLETED (should fail)
   - Test với order không có delivered_at (should fail)

2. **Validation:**
   - Test mỗi order detail chỉ được review 1 lần
   - Test rating phải từ 1-5
   - Test comment không được rỗng

3. **Chỉnh sửa/xóa trong 24h:**
   - Test chỉnh sửa trong 24h (should succeed)
   - Test chỉnh sửa sau 24h (should fail)
   - Test xóa trong 24h (should succeed)
   - Test xóa sau 24h (should fail)

4. **Admin/Employee:**
   - Test admin/employee xem tất cả reviews
   - Test admin/employee xóa review (bất kỳ lúc nào)


