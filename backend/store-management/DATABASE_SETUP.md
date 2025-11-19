# 🗄️ Hướng dẫn Setup Database và Tự động tạo bảng

## ✅ Bảng đã được định nghĩa sẵn

Các bảng `orders` và `order_details` đã được định nghĩa trong migration:
- **File:** `src/main/resources/db/migration/V1__Initial_schema.sql`
- **Bảng orders:** Dòng 178-202
- **Bảng order_details:** Dòng 208-224

## 🚀 Cách tự động tạo bảng

### Bước 1: Đảm bảo MySQL đang chạy

```bash
# Kiểm tra MySQL service
# Windows: Services → MySQL
# Hoặc: mysql -u root -p
```

### Bước 2: Tạo database (nếu chưa có)

```sql
CREATE DATABASE IF NOT EXISTS store_management;
```

### Bước 3: Cấu hình application.yaml

Đảm bảo file `src/main/resources/application.yaml` có:

```yaml
spring:
  flyway:
    enabled: true              # ✅ Bật Flyway
    baseline-on-migrate: true  # ✅ Tự động baseline
    locations: classpath:db/migration
```

### Bước 4: Chạy Spring Boot

```bash
mvn spring-boot:run
```

**Flyway sẽ tự động:**
1. ✅ Kiểm tra database
2. ✅ Chạy các migration files trong `src/main/resources/db/migration/`
3. ✅ Tạo tất cả bảng (orders, order_details, products, customers, ...)
4. ✅ Tạo indexes và foreign keys

## 📋 Kiểm tra bảng đã được tạo

Sau khi chạy Spring Boot, kiểm tra:

```sql
USE store_management;

-- Kiểm tra bảng orders
SHOW TABLES LIKE 'orders';
DESCRIBE orders;

-- Kiểm tra bảng order_details
SHOW TABLES LIKE 'order_details';
DESCRIBE order_details;

-- Kiểm tra Flyway đã chạy
SELECT * FROM flyway_schema_history;
```

## ⚠️ Lưu ý

1. **Flyway tự động chạy khi Spring Boot start** - Không cần chạy thủ công
2. **Migration chỉ chạy 1 lần** - Nếu bảng đã tồn tại, Flyway sẽ skip
3. **Nếu muốn reset:** Xóa database và tạo lại, hoặc xóa bảng `flyway_schema_history`

## 🔧 Troubleshooting

### Lỗi: "Table already exists"
- **Nguyên nhân:** Bảng đã được tạo trước đó
- **Giải pháp:** Bỏ qua, hoặc xóa bảng và chạy lại

### Lỗi: "Flyway migration failed"
- **Nguyên nhân:** SQL syntax error hoặc database connection issue
- **Giải pháp:** 
  1. Kiểm tra MySQL đang chạy
  2. Kiểm tra password trong `application.yaml`
  3. Kiểm tra database `store_management` đã tồn tại

### Lỗi: "Cannot find symbol: class List"
- **Đã sửa:** Thêm `import java.util.List;` vào `OrderRepository.java`

## ✅ Kết quả mong đợi

Sau khi chạy Spring Boot, bạn sẽ thấy trong console:
```
Flyway Community Edition ...
Successfully applied X migrations to schema `store_management`
```

Và các bảng sẽ được tạo tự động! 🎉


