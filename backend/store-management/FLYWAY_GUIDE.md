# Hướng dẫn sử dụng Flyway Database Migration

## Tổng quan

Flyway là công cụ quản lý database migration giúp:
- **Version control cho database schema**: Mọi thay đổi database được quản lý qua các file migration
- **Tự động sync**: Khi pull code về, chỉ cần chạy ứng dụng, Flyway sẽ tự động apply các migration mới
- **Giữ lại dữ liệu**: Không cần drop và recreate database, dữ liệu được giữ nguyên
- **Đồng bộ team**: Tất cả thành viên có cùng schema version

## Cách hoạt động

1. **Migration files** được lưu trong `src/main/resources/db/migration/`
2. **Naming convention**: `V{số_version}__{tên_mô_tả}.sql`
   - Ví dụ: `V1__Initial_schema.sql`, `V2__Add_user_avatar.sql`
3. Khi ứng dụng khởi động, Flyway sẽ:
   - Kiểm tra các migration đã chạy (lưu trong bảng `flyway_schema_history`)
   - Chạy các migration mới chưa được apply
   - Báo lỗi nếu có migration đã chỉnh sửa (để đảm bảo tính nhất quán)

## Quy trình làm việc

### Khi cần thay đổi database schema

**Ví dụ: Thêm cột `avatar_url` vào bảng `users`**

1. **Tạo file migration mới**:
   - Tạo file: `src/main/resources/db/migration/V2__Add_user_avatar.sql`
   - Nội dung:
   ```sql
   ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL AFTER email;
   ```

2. **Commit và push code**:
   ```bash
   git add src/main/resources/db/migration/V2__Add_user_avatar.sql
   git commit -m "Add avatar_url column to users table"
   git push
   ```

3. **Các thành viên khác**:
   - Pull code về
   - Chạy ứng dụng
   - Flyway tự động chạy migration V2
   - **Dữ liệu được giữ nguyên**, chỉ thêm cột mới

### Khi cần sửa dữ liệu (data migration)

**Ví dụ: Cập nhật giá trị mặc định cho các bản ghi cũ**

1. Tạo file: `V3__Update_default_phone_numbers.sql`
   ```sql
   UPDATE customers 
   SET phone_number = CONCAT('+84', phone_number) 
   WHERE phone_number NOT LIKE '+84%' AND phone_number IS NOT NULL;
   ```

### Khi cần thêm dữ liệu seed

**Ví dụ: Thêm dữ liệu mẫu cho development**

1. Tạo file: `V4__Seed_initial_data.sql`
   ```sql
   INSERT INTO categories (category_name, code_prefix) VALUES
   ('Điện thoại', 'DT'),
   ('Laptop', 'LT'),
   ('Phụ kiện', 'PK')
   ON DUPLICATE KEY UPDATE category_name = category_name;
   ```

## Lưu ý quan trọng

### ✅ NÊN LÀM

1. **Luôn tạo file migration mới** khi thay đổi schema
2. **Đặt tên file rõ ràng** theo format `V{số}__{mô_tả}.sql`
3. **Số version tăng dần** (V1, V2, V3, ...)
4. **Test migration trên local** trước khi commit
5. **Viết migration có thể chạy lại** (idempotent) nếu có thể:
   ```sql
   -- Tốt: Sử dụng IF NOT EXISTS
   CREATE TABLE IF NOT EXISTS new_table (...);
   
   -- Hoặc kiểm tra trước khi thêm cột
   SET @column_exists = (
     SELECT COUNT(*) 
     FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'avatar_url'
   );
   
   SET @sql = IF(@column_exists = 0,
     'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)',
     'SELECT 1'
   );
   PREPARE stmt FROM @sql;
   EXECUTE stmt;
   ```

### ❌ KHÔNG NÊN LÀM

1. **KHÔNG sửa file migration đã commit** - Nếu đã push lên git, không được sửa lại
2. **KHÔNG dùng DROP DATABASE** trong migration
3. **KHÔNG dùng DROP TABLE** trừ khi thực sự cần (có thể mất dữ liệu)
4. **KHÔNG tạo migration với số version đã tồn tại**

## Cấu hình

Cấu hình Flyway trong `application.yaml`:

```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true  # Tự động baseline nếu DB đã có dữ liệu
    locations: classpath:db/migration
    baseline-version: 0
    validate-on-migrate: true  # Kiểm tra tính toàn vẹn của migrations
```

## Troubleshooting

### Lỗi: "Migration checksum mismatch"

**Nguyên nhân**: File migration đã bị sửa sau khi đã chạy

**Giải pháp**: 
- Nếu đang ở local development, có thể xóa bảng `flyway_schema_history` và chạy lại
- Nếu đã push lên git, tạo migration mới để sửa lỗi thay vì sửa file cũ

### Lỗi: "Migration version already exists"

**Nguyên nhân**: Đã có migration với số version đó

**Giải pháp**: Tăng số version lên (ví dụ: V2, V3, ...)

### Database đã có dữ liệu từ trước

**Giải pháp**: Flyway sẽ tự động baseline với `baseline-on-migrate: true`. Các migration mới sẽ được chạy bình thường.

## Ví dụ workflow hoàn chỉnh

**Scenario**: Thêm field `tax_code` vào bảng `suppliers`

1. Tạo file migration:
   ```bash
   # Tạo file: src/main/resources/db/migration/V2__Add_tax_code_to_suppliers.sql
   ```

2. Nội dung file:
   ```sql
   ALTER TABLE suppliers 
   ADD COLUMN tax_code VARCHAR(50) DEFAULT NULL 
   AFTER email;
   
   CREATE INDEX idx_suppliers_tax_code ON suppliers(tax_code);
   ```

3. Test locally:
   ```bash
   mvn spring-boot:run
   # Kiểm tra log xem migration có chạy thành công
   ```

4. Commit:
   ```bash
   git add src/main/resources/db/migration/V2__Add_tax_code_to_suppliers.sql
   git commit -m "feat: Add tax_code field to suppliers table"
   git push
   ```

5. Team members pull và chạy:
   ```bash
   git pull
   mvn spring-boot:run
   # Migration tự động chạy, dữ liệu được giữ nguyên
   ```

## Tài liệu tham khảo

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Spring Boot Flyway Integration](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)



