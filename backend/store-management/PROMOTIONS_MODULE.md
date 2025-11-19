# Promotions Module (Giảm giá/Khuyến mãi)

## Tổng quan

Module giảm giá/khuyến mãi hỗ trợ cả hai hệ thống:
1. **Coupon Code (Mã giảm giá):** Customer nhập mã khi checkout
2. **Automatic Discount (Giảm giá tự động):** Tự động áp dụng theo điều kiện

Logic: Ưu tiên mã giảm giá, nếu không có thì áp dụng discount tự động.

## Yêu cầu đã implement

- **Option c: Cả hai (Coupon Code + Tự động)**
- Customer có thể dùng mã giảm giá HOẶC nhận discount tự động
- Logic: Ưu tiên mã giảm giá, nếu không có thì áp dụng discount tự động

## Database Schema

### Bảng promotions (Mã giảm giá)

```sql
CREATE TABLE promotions (
  id_promotion INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(15,2) DEFAULT 0,
  usage_limit INT DEFAULT NULL,
  usage_count INT DEFAULT 0,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bảng promotion_usage (Lịch sử sử dụng)

```sql
CREATE TABLE promotion_usage (
  id_usage INT PRIMARY KEY AUTO_INCREMENT,
  id_promotion INT NOT NULL,
  id_order INT NOT NULL,
  id_customer INT NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_promotion) REFERENCES promotions(id_promotion),
  FOREIGN KEY (id_order) REFERENCES orders(id_order),
  FOREIGN KEY (id_customer) REFERENCES customers(id_customer)
);
```

### Bảng promotion_rules (Quy tắc giảm giá tự động)

```sql
CREATE TABLE promotion_rules (
  id_rule INT PRIMARY KEY AUTO_INCREMENT,
  rule_name VARCHAR(255) NOT NULL,
  discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(15,2) DEFAULT 0,
  customer_type ENUM('VIP', 'REGULAR', 'ALL') DEFAULT 'ALL',
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  priority INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Cập nhật bảng orders

```sql
ALTER TABLE orders
ADD COLUMN id_promotion INT NULL,
ADD COLUMN promotion_code VARCHAR(50) NULL,
ADD COLUMN id_promotion_rule INT NULL,
ADD FOREIGN KEY (id_promotion) REFERENCES promotions(id_promotion),
ADD FOREIGN KEY (id_promotion_rule) REFERENCES promotion_rules(id_rule);
```

## Business Logic

### 1. Coupon Code Validation

1. Kiểm tra code tồn tại và active
2. Kiểm tra hạn sử dụng (start_date <= now <= end_date)
3. Kiểm tra số lần sử dụng (usage_count < usage_limit)
4. Kiểm tra giá trị đơn tối thiểu (total_amount >= min_order_amount)

### 2. Automatic Discount Calculation

1. Lấy tất cả rules active và trong thời gian hiệu lực
2. Lọc theo điều kiện:
   - min_order_amount <= total_amount
   - customer_type = customer.type OR customer_type = 'ALL'
3. Sắp xếp theo priority (ưu tiên cao nhất)
4. Áp dụng rule đầu tiên (nếu có)

### 3. Checkout Logic

1. Nếu có coupon code → Validate và áp dụng coupon
2. Nếu không có coupon code → Tính automatic discount
3. Nếu cả hai đều không có → discount = 0
4. Tính final_amount = total_amount - discount

## API Endpoints

### Customer Endpoints

#### 1. Validate coupon code

**Endpoint:** `POST /api/v1/promotions/validate`

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "code": "PROMO2024",
  "totalAmount": 500000
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Validate promotion code",
  "data": {
    "valid": true,
    "message": "Mã giảm giá hợp lệ",
    "discount": 50000,
    "discountType": "FIXED_AMOUNT",
    "code": "PROMO2024"
  }
}
```

#### 2. Calculate automatic discount

**Endpoint:** `POST /api/v1/promotions/calculate`

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "totalAmount": 500000,
  "customerType": "REGULAR"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Calculate automatic discount",
  "data": {
    "applicable": true,
    "discount": 50000,
    "discountType": "PERCENTAGE",
    "ruleName": "Giảm 10% cho đơn > 500k",
    "ruleId": 1
  }
}
```

#### 3. Checkout với promotion

**Endpoint:** `POST /api/v1/orders/checkout`

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "shippingAddressId": 1,
  "paymentMethod": "CASH",
  "promotionCode": "PROMO2024"
}
```

### Admin/Employee Endpoints

#### 1. Tạo mã giảm giá

**Endpoint:** `POST /api/v1/admin/promotions`

**Authentication:** Required (ADMIN, EMPLOYEE)

**Request Body:**
```json
{
  "code": "PROMO2024",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 50000,
  "minOrderAmount": 500000,
  "usageLimit": 100,
  "startDate": "2025-01-01T00:00:00",
  "endDate": "2025-12-31T23:59:59",
  "isActive": true
}
```

#### 2. Xem danh sách mã giảm giá

**Endpoint:** `GET /api/v1/admin/promotions`

**Authentication:** Required (ADMIN, EMPLOYEE)

#### 3. Cập nhật mã giảm giá

**Endpoint:** `PUT /api/v1/admin/promotions/{id}`

**Authentication:** Required (ADMIN, EMPLOYEE)

#### 4. Xóa mã giảm giá

**Endpoint:** `DELETE /api/v1/admin/promotions/{id}`

**Authentication:** Required (ADMIN, EMPLOYEE)

#### 5. Tạo quy tắc giảm giá tự động

**Endpoint:** `POST /api/v1/admin/promotion-rules`

**Authentication:** Required (ADMIN, EMPLOYEE)

**Request Body:**
```json
{
  "ruleName": "Giảm 10% cho đơn > 500k",
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "minOrderAmount": 500000,
  "customerType": "ALL",
  "startDate": "2025-01-01T00:00:00",
  "endDate": "2025-12-31T23:59:59",
  "isActive": true,
  "priority": 1
}
```

#### 6. Xem danh sách quy tắc

**Endpoint:** `GET /api/v1/admin/promotion-rules`

**Authentication:** Required (ADMIN, EMPLOYEE)

#### 7. Cập nhật quy tắc

**Endpoint:** `PUT /api/v1/admin/promotion-rules/{id}`

**Authentication:** Required (ADMIN, EMPLOYEE)

#### 8. Xóa quy tắc

**Endpoint:** `DELETE /api/v1/admin/promotion-rules/{id}`

**Authentication:** Required (ADMIN, EMPLOYEE)

## Files đã tạo

- Migration: `V14__Add_promotions_and_rules_tables.sql`
- Models: `Promotion.java`, `PromotionUsage.java`, `PromotionRule.java`
- Repositories: `PromotionRepository.java`, `PromotionUsageRepository.java`, `PromotionRuleRepository.java`
- DTOs: `PromotionDTO.java`, `PromotionRuleDTO.java`, `ValidatePromotionRequestDTO.java`, `ValidatePromotionResponseDTO.java`, `CalculateDiscountRequestDTO.java`, `CalculateDiscountResponseDTO.java`
- Service: `PromotionService.java`, `PromotionServiceImpl.java`
- Controller: `PromotionController.java`, `AdminPromotionController.java`
- Mapper: `PromotionMapper.java`, `PromotionRuleMapper.java`
- Update: `OrderServiceImpl.java` - Thêm logic tính discount

## Testing

### Test Cases

1. **Validate coupon code:**
   - Test với code hợp lệ
   - Test với code không tồn tại
   - Test với code đã hết hạn
   - Test với code đã hết lượt sử dụng
   - Test với totalAmount < min_order_amount

2. **Calculate automatic discount:**
   - Test với rule hợp lệ
   - Test với không có rule nào hợp lệ
   - Test với rule có priority cao nhất

3. **Checkout với promotion:**
   - Test checkout với coupon code
   - Test checkout với automatic discount
   - Test checkout không có promotion
   - Test ưu tiên coupon code over automatic discount

4. **Admin/Employee:**
   - Test tạo mã giảm giá
   - Test tạo quy tắc giảm giá tự động
   - Test cập nhật và xóa promotion/rule

