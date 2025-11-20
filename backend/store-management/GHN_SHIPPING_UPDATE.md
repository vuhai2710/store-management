# GHN Shipping Update (Cập nhật GHN Shipping)

## Tổng quan

Cập nhật ShippingAddress để hỗ trợ tích hợp GHN API đầy đủ bằng cách thêm `provinceId`, `districtId`, và `wardCode`.

## Yêu cầu đã implement

- **Option a: Thêm districtId và wardCode vào ShippingAddress**
- Frontend UI chọn tỉnh/quận/phường khi tạo địa chỉ
- Backend sử dụng districtId và wardCode để tính phí và tạo đơn GHN

## Database Schema

### Cập nhật bảng shipping_addresses

```sql
ALTER TABLE shipping_addresses
ADD COLUMN province_id INT NULL COMMENT 'ID tỉnh/thành phố từ GHN API',
ADD COLUMN district_id INT NULL COMMENT 'ID quận/huyện từ GHN API',
ADD COLUMN ward_code VARCHAR(50) NULL COMMENT 'Code phường/xã từ GHN API';
```

## Business Logic

### 1. Tạo/Cập nhật địa chỉ

- Lưu province_id, district_id, ward_code từ GHN API
- Các trường này là optional (có thể để null nếu không có thông tin từ GHN)

### 2. Tính phí vận chuyển

- Sử dụng district_id và ward_code từ ShippingAddress
- Gọi GHN API để tính phí
- Hiển thị phí vận chuyển trước khi checkout

### 3. Tạo đơn hàng GHN

- Khi order status chuyển sang CONFIRMED
- Tự động tạo đơn hàng GHN (nếu có đủ thông tin)
- Lưu ghn_order_code vào Shipment

## API Endpoints

### Customer Endpoints

#### 1. Tạo địa chỉ với GHN fields

**Endpoint:** `POST /api/v1/shipping-addresses`

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "recipientName": "Nguyen Van A",
  "phoneNumber": "0123456789",
  "address": "123 ABC Street",
  "provinceId": 1,
  "districtId": 1,
  "wardCode": "12345",
  "isDefault": false
}
```

#### 2. Cập nhật địa chỉ với GHN fields

**Endpoint:** `PUT /api/v1/shipping-addresses/{id}`

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "recipientName": "Nguyen Van A",
  "phoneNumber": "0123456789",
  "address": "123 ABC Street",
  "provinceId": 1,
  "districtId": 1,
  "wardCode": "12345"
}
```

#### 3. Checkout với GHN fields

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

**Note:** Nếu shipping address có districtId và wardCode, hệ thống sẽ sử dụng để tính phí GHN (khi shop district được cấu hình).

### GHN Endpoints (đã có)

#### 1. Lấy danh sách tỉnh/thành phố

**Endpoint:** `GET /api/v1/ghn/provinces`

**Authentication:** Required (CUSTOMER, ADMIN, EMPLOYEE)

#### 2. Lấy danh sách quận/huyện

**Endpoint:** `GET /api/v1/ghn/districts?provinceId={id}`

**Authentication:** Required (CUSTOMER, ADMIN, EMPLOYEE)

#### 3. Lấy danh sách phường/xã

**Endpoint:** `GET /api/v1/ghn/wards?districtId={id}`

**Authentication:** Required (CUSTOMER, ADMIN, EMPLOYEE)

#### 4. Tính phí vận chuyển

**Endpoint:** `POST /api/v1/ghn/calculate-fee`

**Authentication:** Required (CUSTOMER, ADMIN, EMPLOYEE)

**Request Body:**
```json
{
  "fromDistrictId": 1,
  "toDistrictId": 1,
  "toWardCode": "12345",
  "weight": 1000,
  "length": 20,
  "width": 20,
  "height": 20
}
```

## Files đã cập nhật

- Migration: `V15__Add_GHN_fields_to_shipping_addresses.sql`
- Model: `ShippingAddress.java` - Thêm provinceId, districtId, wardCode
- DTOs: `ShippingAddressDTO.java`, `CreateShippingAddressRequestDTO.java`, `UpdateShippingAddressRequestDTO.java` - Thêm provinceId, districtId, wardCode
- Service: `ShippingAddressServiceImpl.java` - Cập nhật logic tạo/cập nhật địa chỉ
- Service: `OrderServiceImpl.java` - Cập nhật logic kiểm tra districtId/wardCode trong createShipmentAndIntegrateGHN

## Lưu ý

### Shop District Configuration

Để tích hợp GHN đầy đủ, cần cấu hình `shopDistrictId` và `shopWardCode` trong `GHNConfig`:

```yaml
ghn:
  token: "${GHN_TOKEN:}"
  shop-id: ${GHN_SHOP_ID:0}
  shop-district-id: ${GHN_SHOP_DISTRICT_ID:0}  # TODO: Add to config
  shop-ward-code: "${GHN_SHOP_WARD_CODE:}"  # TODO: Add to config
  base-url: "https://dev-online-gateway.ghn.vn"
  enabled: false
```

Sau khi cấu hình shop district, có thể:
1. Tính phí vận chuyển khi checkout
2. Tự động tạo đơn hàng GHN khi order confirmed
3. Tracking đơn hàng qua GHN API

## Testing

### Test Cases

1. **Tạo địa chỉ với GHN fields:**
   - Test với provinceId, districtId, wardCode
   - Test không có GHN fields (should still work)

2. **Cập nhật địa chỉ với GHN fields:**
   - Test cập nhật provinceId, districtId, wardCode
   - Test cập nhật một phần GHN fields

3. **Checkout với GHN fields:**
   - Test checkout với shipping address có districtId/wardCode
   - Test checkout với shipping address không có districtId/wardCode (should still work)

4. **GHN Integration:**
   - Test tính phí vận chuyển (khi shop district được cấu hình)
   - Test tạo đơn hàng GHN (khi shop district được cấu hình)

