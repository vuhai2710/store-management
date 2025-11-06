# Shipping Address Module - Hướng dẫn API

## Tổng quan

Module quản lý địa chỉ giao hàng cho khách hàng. Mỗi khách hàng có thể có nhiều địa chỉ giao hàng, trong đó một địa chỉ được đánh dấu là mặc định.

**Base URL:** `/api/v1/shipping-addresses`

**Authentication:** Required (CUSTOMER role)
```
Authorization: Bearer {JWT_TOKEN}
```

**Đặc điểm:**
- Mỗi customer có thể có nhiều địa chỉ giao hàng
- Chỉ có một địa chỉ được đánh dấu là mặc định (isDefault = true)
- Địa chỉ mặc định được sử dụng khi checkout nếu không chỉ định địa chỉ khác
- Địa chỉ trong customer profile có thể được sử dụng làm địa chỉ mặc định

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/shipping-addresses` | CUSTOMER | Lấy danh sách địa chỉ của tôi |
| GET | `/api/v1/shipping-addresses/default` | CUSTOMER | Lấy địa chỉ mặc định |
| POST | `/api/v1/shipping-addresses` | CUSTOMER | Tạo địa chỉ mới |
| PUT | `/api/v1/shipping-addresses/{addressId}` | CUSTOMER | Cập nhật địa chỉ |
| PUT | `/api/v1/shipping-addresses/{addressId}/set-default` | CUSTOMER | Đặt địa chỉ làm mặc định |
| DELETE | `/api/v1/shipping-addresses/{addressId}` | CUSTOMER | Xóa địa chỉ |

---

## 1. Lấy danh sách địa chỉ

### Thông tin Endpoint

- **URL:** `GET /api/v1/shipping-addresses`
- **Authentication:** Required (CUSTOMER)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách địa chỉ thành công",
  "data": [
    {
      "idShippingAddress": 1,
      "idCustomer": 1,
      "recipientName": "Nguyễn Văn A",
      "phoneNumber": "0912345678",
      "address": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
      "isDefault": true,
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-01-01T00:00:00"
    },
    {
      "idShippingAddress": 2,
      "idCustomer": 1,
      "recipientName": "Nguyễn Văn A",
      "phoneNumber": "0912345678",
      "address": "456 Đường DEF, Phường UVW, Quận 2, TP.HCM",
      "isDefault": false,
      "createdAt": "2025-01-02T00:00:00",
      "updatedAt": "2025-01-02T00:00:00"
    }
  ]
}
```

### Lưu ý

- Danh sách được sắp xếp: địa chỉ mặc định (isDefault = true) lên đầu
- Customer chỉ có thể xem địa chỉ của chính mình

---

## 2. Lấy địa chỉ mặc định

### Thông tin Endpoint

- **URL:** `GET /api/v1/shipping-addresses/default`
- **Authentication:** Required (CUSTOMER)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy địa chỉ mặc định thành công",
  "data": {
    "idShippingAddress": 1,
    "idCustomer": 1,
    "recipientName": "Nguyễn Văn A",
    "phoneNumber": "0912345678",
    "address": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    "isDefault": true,
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-01T00:00:00"
  }
}
```

### Lỗi có thể xảy ra

- **404 Not Found:** Customer chưa có địa chỉ mặc định

---

## 3. Tạo địa chỉ mới

### Thông tin Endpoint

- **URL:** `POST /api/v1/shipping-addresses`
- **Authentication:** Required (CUSTOMER)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "recipientName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "address": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  "isDefault": false
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| recipientName | String | Yes | Tên người nhận |
| phoneNumber | String | Yes | Số điện thoại người nhận |
| address | String | Yes | Địa chỉ đầy đủ |
| isDefault | Boolean | No | Có phải địa chỉ mặc định không (default: false) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Tạo địa chỉ thành công",
  "data": {
    "idShippingAddress": 3,
    "idCustomer": 1,
    "recipientName": "Nguyễn Văn A",
    "phoneNumber": "0912345678",
    "address": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    "isDefault": false,
    "createdAt": "2025-01-03T00:00:00",
    "updatedAt": "2025-01-03T00:00:00"
  }
}
```

### Logic xử lý

1. **Validate dữ liệu:** Kiểm tra các field required
2. **Xử lý isDefault:**
   - Nếu `isDefault = true` → Unset tất cả địa chỉ mặc định khác
   - Nếu `isDefault = false` hoặc không gửi → Giữ nguyên các địa chỉ mặc định hiện tại
3. **Tạo địa chỉ mới:** Lưu vào database

### Ví dụ Request

```json
POST /api/v1/shipping-addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "address": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  "isDefault": true
}
```

---

## 4. Cập nhật địa chỉ

### Thông tin Endpoint

- **URL:** `PUT /api/v1/shipping-addresses/{addressId}`
- **Authentication:** Required (CUSTOMER)
- **Content-Type:** `application/json`

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| addressId | Integer | Yes | ID của địa chỉ cần cập nhật |

### Request Body

```json
{
  "recipientName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "address": "456 Đường DEF, Phường UVW, Quận 2, TP.HCM"
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| recipientName | String | Yes | Tên người nhận |
| phoneNumber | String | Yes | Số điện thoại người nhận |
| address | String | Yes | Địa chỉ đầy đủ |

**Lưu ý:** Không thể cập nhật `isDefault` qua endpoint này, phải dùng endpoint `/set-default`

### Response

**Status Code:** `200 OK`

Trả về ShippingAddressDto đã được cập nhật.

### Logic xử lý

1. **Kiểm tra địa chỉ tồn tại:** Nếu không tìm thấy → 404 Not Found
2. **Kiểm tra quyền:** Địa chỉ phải thuộc về customer hiện tại
3. **Cập nhật thông tin:** Cập nhật recipientName, phoneNumber, address
4. **Giữ nguyên isDefault:** Không thay đổi trạng thái mặc định

---

## 5. Đặt địa chỉ làm mặc định

### Thông tin Endpoint

- **URL:** `PUT /api/v1/shipping-addresses/{addressId}/set-default`
- **Authentication:** Required (CUSTOMER)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| addressId | Integer | Yes | ID của địa chỉ muốn đặt làm mặc định |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Đặt địa chỉ mặc định thành công",
  "data": {
    "idShippingAddress": 2,
    "isDefault": true,
    /* ... các field khác */
  }
}
```

### Logic xử lý

1. **Kiểm tra địa chỉ tồn tại:** Nếu không tìm thấy → 404 Not Found
2. **Kiểm tra quyền:** Địa chỉ phải thuộc về customer hiện tại
3. **Unset các địa chỉ mặc định khác:** Tất cả địa chỉ mặc định khác → `isDefault = false`
4. **Set địa chỉ này làm mặc định:** `isDefault = true`

### Lưu ý

- Chỉ có một địa chỉ được đánh dấu là mặc định tại một thời điểm
- Khi set địa chỉ mới làm mặc định, địa chỉ mặc định cũ sẽ tự động bị unset

---

## 6. Xóa địa chỉ

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/shipping-addresses/{addressId}`
- **Authentication:** Required (CUSTOMER)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| addressId | Integer | Yes | ID của địa chỉ cần xóa |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa địa chỉ thành công",
  "data": null
}
```

### Logic xử lý

1. **Kiểm tra địa chỉ tồn tại:** Nếu không tìm thấy → 404 Not Found
2. **Kiểm tra quyền:** Địa chỉ phải thuộc về customer hiện tại
3. **Kiểm tra địa chỉ mặc định:**
   - Nếu là địa chỉ mặc định duy nhất → Không cho phép xóa
   - Nếu có nhiều địa chỉ mặc định → Cho phép xóa
4. **Xóa địa chỉ:** Xóa khỏi database

### Lỗi có thể xảy ra

- **400 Bad Request:** Không thể xóa địa chỉ mặc định duy nhất

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Lấy danh sách địa chỉ

**Request:**
- Method: `GET`
- URL: `{{base_url}}/shipping-addresses`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.length > 0) {
        pm.environment.set("address_id", jsonData.data[0].idShippingAddress);
        console.log("Address ID saved:", jsonData.data[0].idShippingAddress);
    }
}
```

### Bước 2: Test Lấy địa chỉ mặc định

**Request:**
- Method: `GET`
- URL: `{{base_url}}/shipping-addresses/default`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

### Bước 3: Test Tạo địa chỉ mới

**Request:**
- Method: `POST`
- URL: `{{base_url}}/shipping-addresses`
- Headers:
  - `Authorization: Bearer {{customer_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "recipientName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "address": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  "isDefault": false
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("new_address_id", jsonData.data.idShippingAddress);
    console.log("New address created:", jsonData.data.idShippingAddress);
}
```

### Bước 4: Test Cập nhật địa chỉ

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/shipping-addresses/{{address_id}}`
- Headers:
  - `Authorization: Bearer {{customer_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "recipientName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "address": "456 Đường DEF, Phường UVW, Quận 2, TP.HCM"
}
```

### Bước 5: Test Đặt địa chỉ làm mặc định

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/shipping-addresses/{{new_address_id}}/set-default`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

### Bước 6: Test Xóa địa chỉ

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/shipping-addresses/{{address_id}}`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

**Lưu ý:** Không thể xóa địa chỉ mặc định duy nhất

---

## Error Handling

- **400 Bad Request:** 
  - Validation fail
  - Không thể xóa địa chỉ mặc định duy nhất
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không phải CUSTOMER role
- **404 Not Found:** 
  - Địa chỉ không tồn tại
  - Không có địa chỉ mặc định

---

## Logic xử lý chi tiết

### 1. Quản lý địa chỉ mặc định

- **Chỉ có một mặc định:** Hệ thống đảm bảo chỉ có một địa chỉ `isDefault = true` tại một thời điểm
- **Auto-unset:** Khi set địa chỉ mới làm mặc định, tất cả địa chỉ mặc định khác tự động bị unset
- **Bảo vệ địa chỉ mặc định:** Không cho phép xóa địa chỉ mặc định duy nhất

### 2. Validation

- **recipientName:** Không được để trống
- **phoneNumber:** Không được để trống, phải đúng format
- **address:** Không được để trống

### 3. Sắp xếp danh sách

- Địa chỉ mặc định (`isDefault = true`) luôn được sắp xếp lên đầu
- Các địa chỉ khác sắp xếp theo thời gian tạo

### 4. Sử dụng trong checkout

- Khi checkout, nếu không chỉ định `shippingAddressId`:
  1. Ưu tiên sử dụng địa chỉ mặc định (nếu có)
  2. Nếu không có địa chỉ mặc định → Sử dụng địa chỉ trong customer profile
  3. Địa chỉ được snapshot vào order để đảm bảo không bị ảnh hưởng nếu địa chỉ bị xóa

---

## Tips và Best Practices

1. **Đặt địa chỉ mặc định:** Nên có ít nhất một địa chỉ mặc định để thuận tiện khi checkout
2. **Validation:** Luôn validate phone number và address format
3. **Snapshot trong order:** Địa chỉ được snapshot vào order để đảm bảo tính nhất quán
4. **UI/UX:** 
   - Hiển thị địa chỉ mặc định rõ ràng
   - Cho phép customer dễ dàng thay đổi địa chỉ mặc định
   - Cảnh báo khi xóa địa chỉ mặc định duy nhất

---

## Common Issues

### Issue: Không thể xóa địa chỉ mặc định

**Nguyên nhân:** Đây là địa chỉ mặc định duy nhất

**Giải pháp:**
- Đặt một địa chỉ khác làm mặc định trước
- Sau đó mới xóa địa chỉ này

### Issue: Không tìm thấy địa chỉ mặc định

**Nguyên nhân:** Customer chưa có địa chỉ mặc định

**Giải pháp:**
- Tạo địa chỉ mới với `isDefault = true`
- Hoặc đặt một địa chỉ hiện có làm mặc định

---

## Liên hệ

Nếu có thắc mắc về Shipping Address Module, vui lòng liên hệ team Backend.







