# Hướng dẫn sử dụng Script SQL Test Data

## Tổng quan

File `V3__Insert_test_data.sql` chứa dữ liệu mẫu để test các chức năng trong project. Script này được chạy tự động bởi Flyway khi ứng dụng khởi động.

## Cấu trúc dữ liệu mẫu

### 1. Users (8 users)
- **Admin:** `admin` / `123456`
- **Employees (3):** `employee1`, `employee2`, `employee3` / `123456`
- **Customers (4):** `customer1`, `customer2`, `customer3`, `customer_vip` / `123456`

### 2. Employees (3 nhân viên)
- Nguyễn Văn A (employee1)
- Trần Thị B (employee2)
- Lê Văn C (employee3)

### 3. Customers (4 khách hàng)
- Phạm Văn D (REGULAR)
- Hoàng Thị E (REGULAR)
- Võ Văn F (REGULAR)
- Đặng Thị G (VIP)

### 4. Categories (5 danh mục)
- Đã được seed trong V2
- ID: 1=Điện thoại, 2=Laptop, 3=Tablet, 4=Phụ kiện, 5=Đồng hồ thông minh

### 5. Suppliers (5 nhà cung cấp)
- Đã được seed trong V2
- ID: 1=Apple, 2=Samsung, 3=Xiaomi, 4=HP, 5=Dell

### 6. Products (22 sản phẩm)
- **Điện thoại (6):** iPhone 15 Pro, iPhone 14, Galaxy S24 Ultra, Galaxy A54, Xiaomi 14 Pro, Redmi Note 13
- **Laptop (6):** HP Pavilion 15, HP EliteBook, Dell XPS 13, Dell Inspiron, MacBook Pro 14, MacBook Air M2
- **Tablet (3):** iPad Pro 12.9, iPad Air, Galaxy Tab S9
- **Phụ kiện (4):** AirPods Pro 2, Galaxy Buds2 Pro, Ốp lưng, Cáp sạc
- **Đồng hồ (2):** Apple Watch Series 9, Galaxy Watch 6
- **Hết hàng (1):** iPhone 13 Pro (stock = 0, status = OUT_OF_STOCK)

### 7. Purchase Orders (5 đơn nhập hàng)
- Đơn #1: Từ Apple (employee1) - 500 triệu
- Đơn #2: Từ Samsung (employee1) - 320 triệu
- Đơn #3: Từ Apple (employee2) - 750 triệu
- Đơn #4: Từ Xiaomi (employee2) - 150 triệu
- Đơn #5: Từ HP (employee3) - 450 triệu

### 8. Inventory Transactions
- Tất cả transactions là type IN (nhập kho)
- Reference type: PURCHASE_ORDER
- Tổng số: ~20 transactions

## Cách chạy script

### Tự động (khuyến nghị)
Script sẽ tự động chạy khi ứng dụng khởi động (Flyway migration).

### Thủ công
Nếu muốn chạy thủ công:

```sql
-- 1. Kết nối database
USE store_management;

-- 2. Chạy script
SOURCE src/main/resources/db/migration/V3__Insert_test_data.sql;
```

Hoặc sử dụng MySQL Workbench, phpMyAdmin, hoặc command line:

```bash
mysql -u root -p store_management < src/main/resources/db/migration/V3__Insert_test_data.sql
```

## Lưu ý quan trọng

### Password BCrypt Hash
- Tất cả users có password: **"123456"**
- Password được hash bằng BCrypt với strength 12
- Hash trong script: `$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW`

**Nếu hash không hoạt động**, có thể generate hash mới:

**Cách 1: Java code**
```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hash = encoder.encode("123456");
System.out.println(hash);
```

**Cách 2: Online tool**
- Truy cập: https://bcrypt-generator.com/
- Rounds: 12
- Plain text: 123456
- Copy hash và thay thế trong script

### ON DUPLICATE KEY UPDATE
Script sử dụng `ON DUPLICATE KEY UPDATE` để tránh lỗi khi chạy lại. Nếu muốn reset dữ liệu:

```sql
-- Xóa dữ liệu test (cẩn thận!)
DELETE FROM inventory_transactions WHERE reference_type = 'PURCHASE_ORDER';
DELETE FROM purchase_order_details;
DELETE FROM purchase_orders;
DELETE FROM products WHERE id_product > 0;
DELETE FROM customers WHERE id_customer > 0;
DELETE FROM employees WHERE id_employee > 0;
DELETE FROM users WHERE username IN ('employee1', 'employee2', 'employee3', 'customer1', 'customer2', 'customer3', 'customer_vip');
```

## Test các chức năng

### 1. Authentication
- **Login Admin:** `admin` / `123456`
- **Login Employee:** `employee1` / `123456`
- **Login Customer:** `customer1` / `123456`

### 2. Product Management
- **Lấy danh sách sản phẩm:** Có 22 sản phẩm
- **Filter theo category:** Test với categoryId = 1, 2, 3, 4, 5
- **Filter theo brand:** Test với brand = "Apple", "Samsung", "Xiaomi"
- **Filter theo supplier:** Test với supplierId = 1, 2, 3, 4, 5
- **Filter theo price:** Test với minPrice/maxPrice
- **Filter theo status:** Test với status = "IN_STOCK", "OUT_OF_STOCK"
- **Tìm kiếm:** Test với tên sản phẩm

### 3. Import Order Management
- **Lấy danh sách đơn nhập hàng:** Có 5 đơn
- **Lấy đơn theo supplier:** Test với supplierId = 1, 2, 3, 4, 5
- **Lấy đơn theo thời gian:** Test với startDate/endDate
- **Xem chi tiết đơn:** Test với idImportOrder = 1, 2, 3, 4, 5
- **Xuất PDF:** Test với idImportOrder = 1

### 4. Inventory Transaction
- **Lấy lịch sử:** Có ~20 transactions
- **Lấy theo product:** Test với productId = 1, 2, 3, ...
- **Lấy theo reference:** Test với referenceType = PURCHASE_ORDER, referenceId = 1, 2, 3, ...
- **Lấy theo thời gian:** Test với startDate/endDate

### 5. Customer Management
- **Lấy danh sách:** Có 4 customers
- **Filter theo type:** Test với type = "REGULAR", "VIP"
- **Tìm kiếm:** Test với name, phone

### 6. Employee Management
- **Lấy danh sách:** Có 3 employees
- **Xem chi tiết:** Test với employeeId = 1, 2, 3
- **Employee self-service:** Test với `/me` endpoints

### 7. Supplier Management
- **Lấy danh sách:** Có 5 suppliers
- **Tìm kiếm:** Test với name

## Test Cases mẫu

### Test Case 1: Tạo đơn nhập hàng mới
1. Login với `employee1` / `123456`
2. Tạo đơn nhập hàng từ supplier ID 1 (Apple)
3. Thêm sản phẩm: iPhone 15 Pro (quantity: 10, importPrice: 20000000)
4. Kiểm tra:
   - Đơn nhập hàng được tạo
   - Stock quantity của iPhone 15 Pro tăng thêm 10
   - Inventory transaction được tạo (type: IN)

### Test Case 2: Filter sản phẩm
1. Login với `admin` / `123456`
2. Lấy danh sách sản phẩm với filter:
   - categoryId = 1 (Điện thoại)
   - brand = "Apple"
   - minPrice = 10000000
   - maxPrice = 30000000
3. Kiểm tra kết quả: Chỉ có iPhone 15 Pro và iPhone 14

### Test Case 3: Xem lịch sử nhập hàng
1. Login với `employee1` / `123456`
2. Lấy lịch sử nhập hàng:
   - supplierId = 1 (Apple)
   - startDate = 2025-01-01T00:00:00
   - endDate = 2025-01-31T23:59:59
3. Kiểm tra kết quả: Có 2 đơn nhập hàng từ Apple (#1 và #3)

### Test Case 4: Lấy inventory transactions
1. Login với `admin` / `123456`
2. Lấy transactions của product ID 1 (iPhone 15 Pro)
3. Kiểm tra kết quả: Có 2 transactions (từ đơn #1 và #3)

### Test Case 5: Customer VIP upgrade
1. Login với `admin` / `123456`
2. Nâng cấp customer ID 4 (customer_vip) lên VIP
3. Kiểm tra: customer_type = "VIP"

## Troubleshooting

### Issue: Password không đúng
**Nguyên nhân:** BCrypt hash không đúng hoặc không match với password encoder config.

**Giải pháp:**
1. Generate hash mới bằng Java code hoặc online tool
2. Hoặc đăng ký user mới qua API `/api/v1/auth/register`

### Issue: Foreign key constraint fails
**Nguyên nhân:** Thứ tự insert không đúng (ví dụ: insert product trước khi có category).

**Giải pháp:** Script đã được sắp xếp đúng thứ tự. Nếu vẫn lỗi, kiểm tra:
1. V1 và V2 đã chạy thành công
2. Categories và Suppliers đã tồn tại

### Issue: Duplicate key error
**Nguyên nhân:** Dữ liệu đã tồn tại.

**Giải pháp:** Script sử dụng `ON DUPLICATE KEY UPDATE` nên sẽ không lỗi. Nếu muốn reset, xóa dữ liệu trước khi chạy lại.

### Issue: Stock quantity không đúng
**Nguyên nhân:** Script cập nhật stock quantity từ inventory transactions, nhưng có thể có dữ liệu cũ.

**Giải pháp:** 
1. Xóa và chạy lại script
2. Hoặc chạy lại query cập nhật stock quantity ở cuối script

## Lưu ý Production

⚠️ **KHÔNG chạy script này trong production!**

Script này chỉ dành cho:
- Development environment
- Testing environment
- Local development

Trong production:
- Sử dụng dữ liệu thực tế
- Không commit dữ liệu test vào production database
- Sử dụng migration scripts riêng cho production data

## Liên hệ

Nếu có vấn đề với script hoặc cần thêm dữ liệu test, vui lòng liên hệ team Backend.










