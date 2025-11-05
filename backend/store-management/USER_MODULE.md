# User Module - Hướng dẫn API

## Tổng quan

Module quản lý tài khoản người dùng (User). Chủ yếu dành cho **ADMIN** để quản lý users.

**Base URL:** `/api/v1/users`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/users` | ADMIN | Lấy danh sách users (có phân trang) |
| GET | `/api/v1/users/status` | ADMIN | Lấy users theo trạng thái |
| GET | `/api/v1/users/{id}` | ADMIN | Lấy chi tiết user |
| PUT | `/api/v1/users/{id}` | ADMIN | Cập nhật user |
| PATCH | `/api/v1/users/{id}/deactivate` | ADMIN | Vô hiệu hóa user |
| PATCH | `/api/v1/users/{id}/activate` | ADMIN | Kích hoạt user |
| PATCH | `/api/v1/users/{id}/role` | ADMIN | Thay đổi role của user |
| DELETE | `/api/v1/users/{id}` | ADMIN | Xóa user |
| GET | `/api/v1/users/profile` | Any authenticated | Lấy profile của chính mình |

---

## 1. Lấy danh sách users (có phân trang)

### Thông tin Endpoint

- **URL:** `GET /api/v1/users`
- **Authentication:** Required (**chỉ ADMIN**)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 5 | Số lượng item mỗi trang |
| sortBy | String | No | "idUser" | Trường sắp xếp |
| sortDirection | String | No | "ASC" | Hướng sắp xếp (ASC/DESC) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách user thành công",
  "data": {
    "content": [
      {
        "idUser": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "ADMIN",
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

## 2. Lấy users theo trạng thái

### Thông tin Endpoint

- **URL:** `GET /api/v1/users/status?isActive={true/false}`
- **Authentication:** Required (**chỉ ADMIN**)

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| isActive | Boolean | **Yes** | true = active, false = inactive |
| pageNo | Integer | No | 1 |
| pageSize | Integer | No | 5 |
| sortBy | String | No | "idUser" |
| sortDirection | String | No | "ASC" |

### Ví dụ Request

```
GET /api/v1/users/status?isActive=true&pageNo=1&pageSize=5
```

---

## 3. Lấy chi tiết user

### Thông tin Endpoint

- **URL:** `GET /api/v1/users/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của user |

---

## 4. Cập nhật user

### Thông tin Endpoint

- **URL:** `PUT /api/v1/users/{id}`
- **Authentication:** Required (**chỉ ADMIN**)
- **Content-Type:** `application/json`

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của user cần cập nhật |

### Request Body

```json
{
  "username": "string (optional, min 4 chars)",
  "email": "string (optional, valid email)"
}
```

### Lưu ý

- Chỉ có thể cập nhật username và email
- Không thể thay đổi password trực tiếp (phải dùng change password endpoint nếu có)
- Không thể thay đổi role (phải dùng change role endpoint)

---

## 5. Vô hiệu hóa user

### Thông tin Endpoint

- **URL:** `PATCH /api/v1/users/{id}/deactivate`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của user |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Vô hiệu hóa user thành công",
  "data": null
}
```

### Lưu ý

- User bị vô hiệu hóa sẽ không thể đăng nhập
- User vẫn tồn tại trong database, chỉ bị set `isActive = false`

---

## 6. Kích hoạt user

### Thông tin Endpoint

- **URL:** `PATCH /api/v1/users/{id}/activate`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của user |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Kích hoạt user thành công",
  "data": null
}
```

---

## 7. Thay đổi role của user

### Thông tin Endpoint

- **URL:** `PATCH /api/v1/users/{id}/role?role={ADMIN/EMPLOYEE/CUSTOMER}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của user |

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| role | String | **Yes** | ADMIN, EMPLOYEE, hoặc CUSTOMER |

### Ví dụ Request

```
PATCH /api/v1/users/1/role?role=EMPLOYEE
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Thay đổi role thành công",
  "data": {
    "idUser": 1,
    "username": "user1",
    "email": "user1@example.com",
    "role": "EMPLOYEE",
    "isActive": true
  }
}
```

### Lưu ý

- Chỉ có thể thay đổi role thành: ADMIN, EMPLOYEE, hoặc CUSTOMER
- Cần cẩn thận khi thay đổi role, có thể ảnh hưởng đến quyền truy cập

---

## 8. Xóa user

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/users/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của user cần xóa |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa user thành công",
  "data": null
}
```

### Lưu ý

- Xóa user sẽ xóa vĩnh viễn, không thể khôi phục
- Cần kiểm tra xem user có đang được sử dụng không trước khi xóa

---

## 9. Lấy profile của chính mình

### Thông tin Endpoint

- **URL:** `GET /api/v1/users/profile`
- **Authentication:** Required (Any authenticated user)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy thông tin profile thành công",
  "data": {
    "idUser": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-01T00:00:00"
  }
}
```

### Lưu ý

- Any authenticated user (ADMIN, EMPLOYEE, CUSTOMER) đều có thể xem profile của chính mình
- ID được lấy tự động từ JWT token

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Lấy danh sách users (ADMIN only)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/users?pageNo=1&pageSize=5&sortBy=idUser&sortDirection=ASC`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 2: Test Lấy users theo trạng thái

**Request:**
- Method: `GET`
- URL: `{{base_url}}/users/status?isActive=true&pageNo=1&pageSize=5`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 3: Test Lấy chi tiết user

**Request:**
- Method: `GET`
- URL: `{{base_url}}/users/1`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 4: Test Cập nhật user

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/users/1`
- Headers:
  - `Authorization: Bearer {{admin_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### Bước 5: Test Vô hiệu hóa user

**Request:**
- Method: `PATCH`
- URL: `{{base_url}}/users/1/deactivate`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 6: Test Kích hoạt user

**Request:**
- Method: `PATCH`
- URL: `{{base_url}}/users/1/activate`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 7: Test Thay đổi role

**Request:**
- Method: `PATCH`
- URL: `{{base_url}}/users/1/role?role=EMPLOYEE`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 8: Test Xóa user

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/users/1`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 9: Test Lấy profile của chính mình

**Request:**
- Method: `GET`
- URL: `{{base_url}}/users/profile`
- Headers:
  - `Authorization: Bearer {{token}}` (any authenticated user)

---

## Error Handling

- **400 Bad Request:** Validation fail, username/email đã tồn tại
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không đủ quyền (chỉ ADMIN mới có quyền)
- **404 Not Found:** User không tồn tại

---

## User Roles

- **ADMIN:** Quyền quản trị cao nhất
- **EMPLOYEE:** Nhân viên
- **CUSTOMER:** Khách hàng

---

## Tips và Best Practices

1. **Chỉ ADMIN:** Hầu hết các endpoint chỉ dành cho ADMIN
2. **Activate/Deactivate:** Sử dụng thay vì xóa khi muốn tạm thời vô hiệu hóa user
3. **Change Role:** Cẩn thận khi thay đổi role, có thể ảnh hưởng đến quyền truy cập
4. **Profile:** Any authenticated user đều có thể xem profile của chính mình

---

## Liên hệ

Nếu có thắc mắc về User Module, vui lòng liên hệ team Backend.




