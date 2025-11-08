# Customer Module - Hướng dẫn API

## Tổng quan

Module quản lý khách hàng (Customer). Phân quyền:
- **ADMIN, EMPLOYEE:** Có thể quản lý tất cả customers
- **CUSTOMER:** Chỉ có thể xem/sửa thông tin của chính mình qua `/me` endpoints

**Base URL:** `/api/v1/customers`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/customers` | ADMIN, EMPLOYEE | Lấy danh sách khách hàng (có phân trang) |
| GET | `/api/v1/customers/{id}` | ADMIN, EMPLOYEE | Lấy chi tiết khách hàng |
| GET | `/api/v1/customers/search` | ADMIN, EMPLOYEE | Tìm kiếm khách hàng |
| GET | `/api/v1/customers/type/{type}` | ADMIN, EMPLOYEE | Lấy khách hàng theo loại |
| PUT | `/api/v1/customers/{id}` | ADMIN, EMPLOYEE | Cập nhật khách hàng |
| PATCH | `/api/v1/customers/{id}/upgrade-vip` | ADMIN | Nâng cấp khách hàng lên VIP |
| PATCH | `/api/v1/customers/{id}/downgrade-regular` | ADMIN | Hạ cấp khách hàng xuống REGULAR |
| DELETE | `/api/v1/customers/{id}` | ADMIN | Xóa khách hàng |
| GET | `/api/v1/customers/me` | CUSTOMER | Lấy thông tin của chính mình |
| PUT | `/api/v1/customers/me` | CUSTOMER | Cập nhật thông tin của chính mình |
| PUT | `/api/v1/customers/me/change-password` | CUSTOMER | Đổi mật khẩu |

---

## 1. Lấy danh sách khách hàng

### Thông tin Endpoint

- **URL:** `GET /api/v1/customers`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 5 | Số lượng item mỗi trang |
| sortBy | String | No | "idCustomer" | Trường sắp xếp |
| sortDirection | String | No | "ASC" | Hướng sắp xếp (ASC/DESC) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách customer thành công",
  "data": {
    "content": [
      {
        "idCustomer": 1,
        "idUser": 1,
        "username": "customer1",
        "email": "customer1@example.com",
        "customerName": "Nguyễn Văn A",
        "phoneNumber": "0912345678",
        "address": "123 Đường ABC",
        "customerType": "REGULAR",
        "isActive": true,
        "createdAt": "2025-01-01T00:00:00",
        "updatedAt": "2025-01-01T00:00:00"
      }
    ],
    "pageNo": 1,
    "pageSize": 5,
    "totalElements": 50,
    "totalPages": 10,
    "isFirst": true,
    "isLast": false,
    "hasNext": true,
    "hasPrevious": false,
    "isEmpty": false
  }
}
```

---

## 2. Lấy chi tiết khách hàng

### Thông tin Endpoint

- **URL:** `GET /api/v1/customers/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của customer |

---

## 3. Tìm kiếm khách hàng

### Thông tin Endpoint

- **URL:** `GET /api/v1/customers/search`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| name | String | No | Tên khách hàng (optional) |
| phone | String | No | Số điện thoại (optional) |
| pageNo | Integer | No | 1 |
| pageSize | Integer | No | 5 |
| sortBy | String | No | "idCustomer" |
| sortDirection | String | No | "ASC" |

### Ví dụ Request

```
GET /api/v1/customers/search?name=Nguyễn&phone=0912
```

### Lưu ý

- Có thể tìm theo name hoặc phone hoặc cả hai
- Tìm kiếm gần đúng (partial match)

---

## 4. Lấy khách hàng theo loại

### Thông tin Endpoint

- **URL:** `GET /api/v1/customers/type/{type}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| type | String | Yes | Loại khách hàng: REGULAR hoặc VIP |

### Ví dụ Request

```
GET /api/v1/customers/type/VIP?pageNo=1&pageSize=5
```

---

## 5. Cập nhật khách hàng

### Thông tin Endpoint

- **URL:** `PUT /api/v1/customers/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json`

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của customer cần cập nhật |

### Request Body

```json
{
  "customerName": "string (optional)",
  "phoneNumber": "string (optional, valid phone)",
  "email": "string (optional, valid email)",
  "address": "string (optional)"
}
```

### Lưu ý

- Chỉ có thể cập nhật một số field, không thể thay đổi customerType (phải dùng upgrade/downgrade endpoints)
- Username không thể thay đổi

---

## 6. Nâng cấp khách hàng lên VIP

### Thông tin Endpoint

- **URL:** `PATCH /api/v1/customers/{id}/upgrade-vip`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của customer |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Nâng cấp customer lên VIP thành công",
  "data": {
    "idCustomer": 1,
    "customerType": "VIP",
    /* ... các field khác */
  }
}
```

---

## 7. Hạ cấp khách hàng xuống REGULAR

### Thông tin Endpoint

- **URL:** `PATCH /api/v1/customers/{id}/downgrade-regular`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của customer |

---

## 8. Xóa khách hàng

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/customers/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của customer cần xóa |

---

## 9. Customer xem thông tin của chính mình

### Thông tin Endpoint

- **URL:** `GET /api/v1/customers/me`
- **Authentication:** Required (**CUSTOMER role**)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy thông tin thành công",
  "data": {
    "idCustomer": 1,
    "customerName": "Nguyễn Văn A",
    "phoneNumber": "0912345678",
    "email": "customer1@example.com",
    "address": "123 Đường ABC",
    "customerType": "REGULAR",
    /* ... */
  }
}
```

### Lưu ý

- Customer chỉ có thể xem thông tin của chính mình
- ID được lấy tự động từ JWT token

---

## 10. Customer cập nhật thông tin của chính mình

### Thông tin Endpoint

- **URL:** `PUT /api/v1/customers/me`
- **Authentication:** Required (**CUSTOMER role**)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "customerName": "string (optional)",
  "phoneNumber": "string (optional, valid phone)",
  "email": "string (optional, valid email)",
  "address": "string (optional)"
}
```

### Lưu ý

- Customer chỉ có thể cập nhật thông tin của chính mình
- Không thể thay đổi customerType (phải do ADMIN)

---

## 11. Customer đổi mật khẩu

### Thông tin Endpoint

- **URL:** `PUT /api/v1/customers/me/change-password`
- **Authentication:** Required (**CUSTOMER role**)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required)"
}
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

### Logic xử lý

1. **Kiểm tra user tồn tại:** Lấy user từ username trong JWT token
2. **Verify mật khẩu hiện tại:** So sánh với mật khẩu đã hash trong database
3. **Encode mật khẩu mới:** Hash bằng BCrypt trước khi lưu
4. **Cập nhật:** Lưu mật khẩu mới vào database

### Lỗi có thể xảy ra

- **400 Bad Request:** Mật khẩu hiện tại không đúng
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không phải CUSTOMER role

### Ví dụ Request

```json
PUT /api/v1/customers/me/change-password
Authorization: Bearer {customer_token}
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Lấy danh sách khách hàng (ADMIN/EMPLOYEE)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/customers?pageNo=1&pageSize=5&sortBy=idCustomer&sortDirection=ASC`
- Headers:
  - `Authorization: Bearer {{token}}` (ADMIN hoặc EMPLOYEE token)

### Bước 2: Test Tìm kiếm khách hàng

**Request:**
- Method: `GET`
- URL: `{{base_url}}/customers/search?name=Nguyễn&phone=0912&pageNo=1&pageSize=5`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 3: Test Cập nhật khách hàng

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/customers/1`
- Headers:
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "customerName": "Nguyễn Văn A - Cập nhật",
  "phoneNumber": "0912345678",
  "email": "customer@example.com",
  "address": "Địa chỉ mới"
}
```

### Bước 4: Test Nâng cấp VIP (chỉ ADMIN)

**Request:**
- Method: `PATCH`
- URL: `{{base_url}}/customers/1/upgrade-vip`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 5: Test Customer xem thông tin của chính mình

**Request:**
- Method: `GET`
- URL: `{{base_url}}/customers/me`
- Headers:
  - `Authorization: Bearer {{customer_token}}` (CUSTOMER token)

### Bước 6: Test Customer cập nhật thông tin của chính mình

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/customers/me`
- Headers:
  - `Authorization: Bearer {{customer_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "customerName": "Tên mới",
  "phoneNumber": "0912345678",
  "email": "email@example.com",
  "address": "Địa chỉ mới"
}
```

### Bước 7: Test Customer đổi mật khẩu

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/customers/me/change-password`
- Headers:
  - `Authorization: Bearer {{customer_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

---

## Error Handling

- **400 Bad Request:** Validation fail
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không đủ quyền (ví dụ: EMPLOYEE cố nâng cấp VIP)
- **404 Not Found:** Customer không tồn tại

---

## Customer Types

- **REGULAR:** Khách hàng thường
- **VIP:** Khách hàng VIP (có thể có ưu đãi đặc biệt)

---

## Tips và Best Practices

1. **Phân quyền rõ ràng:** ADMIN/EMPLOYEE quản lý tất cả, CUSTOMER chỉ quản lý chính mình
2. **Upgrade/Downgrade:** Chỉ ADMIN mới có quyền thay đổi customerType
3. **Search:** Sử dụng endpoint search khi cần tìm kiếm nhanh
4. **Filter by type:** Sử dụng endpoint `/type/{type}` để lọc VIP customers

---

## Liên hệ

Nếu có thắc mắc về Customer Module, vui lòng liên hệ team Backend.








