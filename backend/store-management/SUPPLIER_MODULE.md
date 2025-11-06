# Supplier Module - Hướng dẫn API

## Tổng quan

Module quản lý nhà cung cấp (Supplier). Tất cả endpoints yêu cầu authentication với role **ADMIN** hoặc **EMPLOYEE**.

**Base URL:** `/api/v1/suppliers`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/suppliers/all` | ADMIN, EMPLOYEE | Lấy tất cả nhà cung cấp (không phân trang) |
| GET | `/api/v1/suppliers` | ADMIN, EMPLOYEE | Lấy danh sách nhà cung cấp (có phân trang, tìm kiếm) |
| GET | `/api/v1/suppliers/{id}` | ADMIN, EMPLOYEE | Lấy chi tiết nhà cung cấp theo ID |
| GET | `/api/v1/suppliers/search` | ADMIN, EMPLOYEE | Tìm kiếm nhà cung cấp theo tên |
| POST | `/api/v1/suppliers` | ADMIN, EMPLOYEE | Tạo nhà cung cấp mới |
| PUT | `/api/v1/suppliers/{id}` | ADMIN, EMPLOYEE | Cập nhật nhà cung cấp |
| DELETE | `/api/v1/suppliers/{id}` | ADMIN | Xóa nhà cung cấp |

---

## 1. Lấy tất cả nhà cung cấp (không phân trang)

### Thông tin Endpoint

- **URL:** `GET /api/v1/suppliers/all`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách nhà cung cấp thành công",
  "data": [
    {
      "idSupplier": 1,
      "supplierName": "Công ty ABC",
      "address": "123 Đường XYZ",
      "phoneNumber": "0912345678",
      "email": "abc@example.com",
      "createdAt": "2025-01-01T00:00:00"
    }
  ]
}
```

---

## 2. Lấy danh sách nhà cung cấp (có phân trang)

### Thông tin Endpoint

- **URL:** `GET /api/v1/suppliers`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "idSupplier" | Trường sắp xếp |
| sortDirection | String | No | "ASC" | Hướng sắp xếp (ASC/DESC) |
| name | String | No | - | Tìm kiếm theo tên (optional) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách nhà cung cấp thành công",
  "data": {
    "content": [ /* SupplierDto objects */ ],
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

---

## 3. Lấy chi tiết nhà cung cấp

### Thông tin Endpoint

- **URL:** `GET /api/v1/suppliers/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của supplier |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy thông tin nhà cung cấp thành công",
  "data": {
    "idSupplier": 1,
    "supplierName": "Công ty ABC",
    "address": "123 Đường XYZ",
    "phoneNumber": "0912345678",
    "email": "abc@example.com",
    "createdAt": "2025-01-01T00:00:00"
  }
}
```

---

## 4. Tìm kiếm nhà cung cấp theo tên

### Thông tin Endpoint

- **URL:** `GET /api/v1/suppliers/search?name={name}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| name | String | **Yes** | Tên nhà cung cấp để tìm kiếm |
| pageNo | Integer | No | 1 |
| pageSize | Integer | No | 10 |
| sortBy | String | No | "idSupplier" |
| sortDirection | String | No | "ASC" |

---

## 5. Tạo nhà cung cấp mới

### Thông tin Endpoint

- **URL:** `POST /api/v1/suppliers`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "supplierName": "string (required, max 255 chars)",
  "address": "string (optional)",
  "phoneNumber": "string (optional, valid phone, max 20 chars)",
  "email": "string (optional, valid email)"
}
```

### Ví dụ Request

```json
{
  "supplierName": "Công ty ABC",
  "address": "123 Đường XYZ, Quận 1, TP.HCM",
  "phoneNumber": "0912345678",
  "email": "abc@example.com"
}
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Thêm nhà cung cấp thành công",
  "data": {
    "idSupplier": 1,
    "supplierName": "Công ty ABC",
    "address": "123 Đường XYZ",
    "phoneNumber": "0912345678",
    "email": "abc@example.com",
    "createdAt": "2025-01-01T00:00:00"
  }
}
```

---

## 6. Cập nhật nhà cung cấp

### Thông tin Endpoint

- **URL:** `PUT /api/v1/suppliers/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json`

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của supplier cần cập nhật |

### Request Body

Giống như tạo mới

---

## 7. Xóa nhà cung cấp

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/suppliers/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của supplier cần xóa |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa nhà cung cấp thành công",
  "data": null
}
```

### Error Response

**Status Code:** `400 Bad Request` (nếu supplier đang được sử dụng)

```json
{
  "code": 400,
  "message": "Không thể xóa nhà cung cấp vì đang có đơn nhập hàng liên quan"
}
```

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Lấy tất cả nhà cung cấp

**Request:**
- Method: `GET`
- URL: `{{base_url}}/suppliers/all`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 2: Test Lấy danh sách có phân trang

**Request:**
- Method: `GET`
- URL: `{{base_url}}/suppliers?pageNo=1&pageSize=10&name=ABC`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 3: Test Tạo nhà cung cấp mới

**Request:**
- Method: `POST`
- URL: `{{base_url}}/suppliers`
- Headers:
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "supplierName": "Công ty ABC",
  "address": "123 Đường XYZ, Quận 1, TP.HCM",
  "phoneNumber": "0912345678",
  "email": "abc@example.com"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.idSupplier) {
        pm.environment.set("supplier_id", jsonData.data.idSupplier);
        console.log("Supplier ID saved:", jsonData.data.idSupplier);
    }
}
```

### Bước 4: Test Lấy chi tiết

**Request:**
- Method: `GET`
- URL: `{{base_url}}/suppliers/{{supplier_id}}`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 5: Test Cập nhật

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/suppliers/{{supplier_id}}`
- Headers:
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "supplierName": "Công ty ABC - Cập nhật",
  "address": "Địa chỉ mới",
  "phoneNumber": "0912345678",
  "email": "abc@example.com"
}
```

### Bước 6: Test Xóa (chỉ ADMIN)

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/suppliers/{{supplier_id}}`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

---

## Error Handling

- **400 Bad Request:** Validation fail hoặc supplier đang được sử dụng
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không đủ quyền
- **404 Not Found:** Supplier không tồn tại

---

## Tips và Best Practices

1. Sử dụng endpoint `/all` cho dropdown khi tạo đơn nhập hàng
2. Validate email và phone number trước khi gửi
3. Kiểm tra xem supplier có đang được sử dụng không trước khi xóa
4. Chỉ ADMIN mới có quyền xóa supplier

---

## Liên hệ

Nếu có thắc mắc về Supplier Module, vui lòng liên hệ team Backend.














