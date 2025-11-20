# Hướng dẫn sửa lỗi Product Detail Page

## Các lỗi có thể xảy ra và cách sửa

### 1. Lỗi Database - Bảng product_view chưa tồn tại

**Triệu chứng**: Lỗi khi click vào product detail, có thể thấy error trong console về table không tồn tại.

**Giải pháp**:
1. Đảm bảo Spring Boot đã chạy migration V19
2. Kiểm tra database:
```sql
SHOW TABLES LIKE 'product_view';
```
3. Nếu không có, chạy migration thủ công:
```sql
CREATE TABLE product_view (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    session_id VARCHAR(100) NULL,
    product_id INT NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_view_user_created (user_id, created_at),
    INDEX idx_product_view_product_created (product_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. Lỗi khi log view

**Triệu chứng**: Product detail page load được nhưng có warning trong log.

**Giải pháp**: 
- Code đã được sửa để không block request nếu log view fail
- Kiểm tra log để xem lỗi cụ thể

### 3. Lỗi khi gọi API similar products

**Triệu chứng**: Product detail page load được nhưng không có similar products.

**Giải pháp**:
- Kiểm tra Python recommender service có đang chạy không
- Kiểm tra console log để xem error
- API sẽ trả về mảng rỗng nếu không có similar products (không phải lỗi)

### 4. Kiểm tra lỗi trong Browser Console

1. Mở Browser Console (F12)
2. Click vào product detail
3. Xem các error messages:
   - Network errors: Kiểm tra tab Network
   - JavaScript errors: Kiểm tra tab Console
   - API errors: Kiểm tra response trong Network tab

### 5. Test API trực tiếp

Test API getProductById:
```bash
curl -X GET "http://localhost:8080/api/v1/products/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Test API similar products:
```bash
curl -X GET "http://localhost:8080/api/v1/products/1/similar" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Các thay đổi đã thực hiện

1. ✅ Thêm error handling cho log view (không block request)
2. ✅ Thêm logging để debug dễ hơn
3. ✅ Error handling cho getSimilarProducts trong frontend

## Nếu vẫn còn lỗi

1. Kiểm tra Spring Boot logs để xem lỗi cụ thể
2. Kiểm tra Browser Console để xem JavaScript errors
3. Kiểm tra Network tab để xem API responses
4. Đảm bảo database migration đã chạy

