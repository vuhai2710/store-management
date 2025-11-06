# Employee Module - Hướng dẫn API

## Tổng quan

Module quản lý nhân viên (Employee). Phân quyền:
- **ADMIN:** Có thể quản lý tất cả employees (CRUD)
- **EMPLOYEE:** Chỉ có thể xem/sửa thông tin của chính mình qua `/me` endpoints

**Base URL:** `/api/v1/employees`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| POST | `/api/v1/employees` | ADMIN | Tạo nhân viên mới |
| GET | `/api/v1/employees` | ADMIN | Lấy danh sách nhân viên (không phân trang) |
| GET | `/api/v1/employees/paginated` | ADMIN | Lấy danh sách nhân viên (có phân trang) |
| GET | `/api/v1/employees/{id}` | ADMIN | Lấy chi tiết nhân viên |
| GET | `/api/v1/employees/user/{userId}` | ADMIN | Lấy nhân viên theo User ID |
| PUT | `/api/v1/employees/{id}` | ADMIN | Cập nhật nhân viên |
| DELETE | `/api/v1/employees/{id}` | ADMIN | Xóa nhân viên |
| GET | `/api/v1/employees/me` | EMPLOYEE | Lấy thông tin của chính mình |
| PUT | `/api/v1/employees/me` | EMPLOYEE | Cập nhật thông tin của chính mình |

---

## 1. Tạo nhân viên mới

### Thông tin Endpoint

- **URL:** `POST /api/v1/employees`
- **Authentication:** Required (**chỉ ADMIN**)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "employeeName": "string (required)",
  "hireDate": "date (optional, format: YYYY-MM-DD)",
  "phoneNumber": "string (required, valid phone)",
  "address": "string (optional)",
  "baseSalary": "number (optional, >= 0)",
  "username": "string (required, min 4 chars)",
  "password": "string (required, min 4 chars)",
  "email": "string (required, valid email)"
}
```

### Ví dụ Request

```json
{
  "employeeName": "Nguyễn Văn B",
  "hireDate": "2025-01-01",
  "phoneNumber": "0912345678",
  "address": "123 Đường XYZ, Quận 1, TP.HCM",
  "baseSalary": 10000000,
  "username": "employee1",
  "password": "123456",
  "email": "employee1@example.com"
}
```

### Response

**Status Code:** `201 Created`

```json
{
  "code": 201,
  "message": "Tạo nhân viên thành công",
  "data": {
    "idEmployee": 1,
    "idUser": 2,
    "employeeName": "Nguyễn Văn B",
    "hireDate": "2025-01-01",
    "phoneNumber": "0912345678",
    "address": "123 Đường XYZ",
    "baseSalary": 10000000,
    "username": "employee1",
    "email": "employee1@example.com",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00"
  }
}
```

### Lưu ý

- Tự động tạo User account với role EMPLOYEE
- Password được hash trước khi lưu
- Username và email phải unique

---

## 2. Lấy danh sách nhân viên (không phân trang)

### Thông tin Endpoint

- **URL:** `GET /api/v1/employees`
- **Authentication:** Required (**chỉ ADMIN**)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách nhân viên thành công",
  "data": [
    {
      "idEmployee": 1,
      "employeeName": "Nguyễn Văn B",
      /* ... */
    }
  ]
}
```

---

## 3. Lấy danh sách nhân viên (có phân trang)

### Thông tin Endpoint

- **URL:** `GET /api/v1/employees/paginated`
- **Authentication:** Required (**chỉ ADMIN**)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| page | Integer | No | 0 | Số trang (0-based) |
| size | Integer | No | 10 | Số lượng item mỗi trang |
| sort | String | No | "idEmployee,DESC" | Sắp xếp (fieldName,DIRECTION) |

### Ví dụ Request

```
GET /api/v1/employees/paginated?page=0&size=10&sort=idEmployee,DESC
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách nhân viên thành công",
  "data": {
    "content": [ /* EmployeeDto objects */ ],
    "pageNo": 1,
    "pageSize": 10,
    "totalElements": 50,
    "totalPages": 5,
    "isFirst": true,
    "isLast": false,
    "hasNext": true,
    "hasPrevious": false,
    "isEmpty": false
  }
}
```

### Lưu ý

- Page parameter là 0-based (0 = trang đầu tiên)
- Sort format: `fieldName,DIRECTION` (ví dụ: `idEmployee,DESC`)

---

## 4. Lấy chi tiết nhân viên

### Thông tin Endpoint

- **URL:** `GET /api/v1/employees/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của employee |

---

## 5. Lấy nhân viên theo User ID

### Thông tin Endpoint

- **URL:** `GET /api/v1/employees/user/{userId}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| userId | Integer | Yes | ID của user |

### Lưu ý

- Phù hợp khi biết userId và cần lấy thông tin employee

---

## 6. Cập nhật nhân viên

### Thông tin Endpoint

- **URL:** `PUT /api/v1/employees/{id}`
- **Authentication:** Required (**chỉ ADMIN**)
- **Content-Type:** `application/json`

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của employee cần cập nhật |

### Request Body

```json
{
  "employeeName": "string (optional)",
  "hireDate": "date (optional)",
  "phoneNumber": "string (optional, valid phone)",
  "address": "string (optional)",
  "baseSalary": "number (optional, >= 0)",
  "username": "string (optional, min 4 chars)",
  "password": "string (optional, min 4 chars)",
  "email": "string (optional, valid email)"
}
```

### Lưu ý

- ADMIN có thể cập nhật tất cả fields
- Nếu không gửi password, password cũ sẽ được giữ nguyên

---

## 7. Xóa nhân viên

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/employees/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của employee cần xóa |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa nhân viên thành công",
  "data": null
}
```

---

## 8. Employee xem thông tin của chính mình

### Thông tin Endpoint

- **URL:** `GET /api/v1/employees/me`
- **Authentication:** Required (**EMPLOYEE role**)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy thông tin cá nhân thành công",
  "data": {
    "idEmployee": 1,
    "employeeName": "Nguyễn Văn B",
    "phoneNumber": "0912345678",
    "address": "123 Đường XYZ",
    "baseSalary": 10000000,
    "hireDate": "2025-01-01",
    /* ... */
  }
}
```

### Lưu ý

- Employee chỉ có thể xem thông tin của chính mình
- ID được lấy tự động từ JWT token

---

## 9. Employee cập nhật thông tin của chính mình

### Thông tin Endpoint

- **URL:** `PUT /api/v1/employees/me`
- **Authentication:** Required (**EMPLOYEE role**)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "employeeName": "string (optional)",
  "phoneNumber": "string (optional, valid phone)",
  "address": "string (optional)"
}
```

### Lưu ý

- Employee chỉ có thể cập nhật một số field: employeeName, phoneNumber, address
- **KHÔNG THỂ** cập nhật: baseSalary, username, password, email, hireDate
- Những field này chỉ ADMIN mới có quyền thay đổi

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Tạo nhân viên mới (ADMIN only)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/employees`
- Headers:
  - `Authorization: Bearer {{admin_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "employeeName": "Nguyễn Văn B",
  "hireDate": "2025-01-01",
  "phoneNumber": "0912345678",
  "address": "123 Đường XYZ",
  "baseSalary": 10000000,
  "username": "employee1",
  "password": "123456",
  "email": "employee1@example.com"
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.idEmployee) {
        pm.environment.set("employee_id", jsonData.data.idEmployee);
        pm.environment.set("employee_user_id", jsonData.data.idUser);
        console.log("Employee ID saved:", jsonData.data.idEmployee);
    }
}
```

### Bước 2: Test Lấy danh sách nhân viên

**Request:**
- Method: `GET`
- URL: `{{base_url}}/employees`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 3: Test Lấy danh sách có phân trang

**Request:**
- Method: `GET`
- URL: `{{base_url}}/employees/paginated?page=0&size=10&sort=idEmployee,DESC`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 4: Test Lấy chi tiết nhân viên

**Request:**
- Method: `GET`
- URL: `{{base_url}}/employees/{{employee_id}}`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 5: Test Cập nhật nhân viên

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/employees/{{employee_id}}`
- Headers:
  - `Authorization: Bearer {{admin_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "employeeName": "Nguyễn Văn B - Cập nhật",
  "phoneNumber": "0912345678",
  "address": "Địa chỉ mới",
  "baseSalary": 12000000
}
```

### Bước 6: Test Employee xem thông tin của chính mình

**Request:**
- Method: `GET`
- URL: `{{base_url}}/employees/me`
- Headers:
  - `Authorization: Bearer {{employee_token}}` (EMPLOYEE token)

### Bước 7: Test Employee cập nhật thông tin của chính mình

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/employees/me`
- Headers:
  - `Authorization: Bearer {{employee_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "employeeName": "Tên mới",
  "phoneNumber": "0912345678",
  "address": "Địa chỉ mới"
}
```

### Bước 8: Test Xóa nhân viên (chỉ ADMIN)

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/employees/{{employee_id}}`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

---

## Error Handling

- **400 Bad Request:** Validation fail, username/email đã tồn tại
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không đủ quyền (ví dụ: EMPLOYEE cố cập nhật employee khác)
- **404 Not Found:** Employee không tồn tại

---

## Tips và Best Practices

1. **Phân quyền rõ ràng:** ADMIN quản lý tất cả, EMPLOYEE chỉ quản lý chính mình
2. **Tạo employee:** Tự động tạo User account, không cần tạo riêng
3. **Cập nhật:** Employee chỉ có thể cập nhật thông tin cá nhân, không thể thay đổi salary, username, password
4. **Pagination:** Sử dụng endpoint `/paginated` cho table view

---

## Liên hệ

Nếu có thắc mắc về Employee Module, vui lòng liên hệ team Backend.












