# Category Module - Hướng dẫn API

## Tổng quan

Module quản lý danh mục sản phẩm (Category). Tất cả endpoints yêu cầu authentication với role **ADMIN** hoặc **EMPLOYEE**.

**Base URL:** `/api/v1/categories`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/categories/all` | ADMIN, EMPLOYEE | Lấy tất cả danh mục (không phân trang) |
| GET | `/api/v1/categories` | ADMIN, EMPLOYEE | Lấy danh sách danh mục (có phân trang, tìm kiếm) |
| GET | `/api/v1/categories/{id}` | ADMIN, EMPLOYEE | Lấy chi tiết danh mục theo ID |
| GET | `/api/v1/categories/search` | ADMIN, EMPLOYEE | Tìm kiếm danh mục theo tên |
| POST | `/api/v1/categories` | ADMIN, EMPLOYEE | Tạo danh mục mới |
| PUT | `/api/v1/categories/{id}` | ADMIN, EMPLOYEE | Cập nhật danh mục |
| DELETE | `/api/v1/categories/{id}` | ADMIN | Xóa danh mục |

---

## 1. Lấy tất cả danh mục (không phân trang)

### Thông tin Endpoint

- **URL:** `GET /api/v1/categories/all`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Request

Không có query parameters

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "idCategory": 1,
      "name": "Điện tử",
      "description": "Danh mục sản phẩm điện tử"
    },
    {
      "idCategory": 2,
      "name": "Thời trang",
      "description": "Danh mục sản phẩm thời trang"
    }
  ]
}
```

### Lưu ý

- Endpoint này trả về tất cả categories mà không phân trang
- Phù hợp cho dropdown, select box
- Nếu có nhiều categories, nên dùng endpoint có phân trang

---

## 2. Lấy danh sách danh mục (có phân trang)

### Thông tin Endpoint

- **URL:** `GET /api/v1/categories`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang (bắt đầu từ 1) |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "idCategory" | Trường sắp xếp |
| sortDirection | String | No | "ASC" | Hướng sắp xếp (ASC/DESC) |
| name | String | No | - | Tìm kiếm theo tên (optional) |

### Ví dụ Request

```
GET /api/v1/categories?pageNo=1&pageSize=10&sortBy=name&sortDirection=ASC&name=Điện
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách danh mục thành công",
  "data": {
    "content": [
      {
        "idCategory": 1,
        "name": "Điện tử",
        "description": "Danh mục sản phẩm điện tử"
      }
    ],
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

- Nếu có parameter `name`, sẽ tự động tìm kiếm theo tên
- SortBy có thể là: `idCategory`, `name`, `createdAt`, etc.
- SortDirection: `ASC` hoặc `DESC`

---

## 3. Lấy chi tiết danh mục

### Thông tin Endpoint

- **URL:** `GET /api/v1/categories/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của category |

### Ví dụ Request

```
GET /api/v1/categories/1
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy thông tin danh mục thành công",
  "data": {
    "idCategory": 1,
    "name": "Điện tử",
    "description": "Danh mục sản phẩm điện tử"
  }
}
```

### Error Response

**Status Code:** `404 Not Found` (nếu không tìm thấy)

```json
{
  "code": 404,
  "message": "Không tìm thấy danh mục với ID: 1"
}
```

---

## 4. Tìm kiếm danh mục theo tên

### Thông tin Endpoint

- **URL:** `GET /api/v1/categories/search`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| name | String | **Yes** | - | Tên danh mục để tìm kiếm |
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "idCategory" | Trường sắp xếp |
| sortDirection | String | No | "ASC" | Hướng sắp xếp |

### Ví dụ Request

```
GET /api/v1/categories/search?name=Điện&pageNo=1&pageSize=10
```

### Response

Giống như endpoint lấy danh sách có phân trang

---

## 5. Tạo danh mục mới

### Thông tin Endpoint

- **URL:** `POST /api/v1/categories`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

### Ví dụ Request

```json
{
  "name": "Điện tử",
  "description": "Danh mục sản phẩm điện tử"
}
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Thêm danh mục thành công",
  "data": {
    "idCategory": 1,
    "name": "Điện tử",
    "description": "Danh mục sản phẩm điện tử"
  }
}
```

### Error Response

**Status Code:** `400 Bad Request` (validation fail)

```json
{
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "name": "Tên danh mục không được để trống"
  }
}
```

---

## 6. Cập nhật danh mục

### Thông tin Endpoint

- **URL:** `PUT /api/v1/categories/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json`

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của category cần cập nhật |

### Request Body

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

### Ví dụ Request

```
PUT /api/v1/categories/1
```

```json
{
  "name": "Điện tử - Cập nhật",
  "description": "Mô tả mới"
}
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Cập nhật danh mục thành công",
  "data": {
    "idCategory": 1,
    "name": "Điện tử - Cập nhật",
    "description": "Mô tả mới"
  }
}
```

---

## 7. Xóa danh mục

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/categories/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của category cần xóa |

### Ví dụ Request

```
DELETE /api/v1/categories/1
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa danh mục thành công",
  "data": null
}
```

### Error Response

**Status Code:** `403 Forbidden` (nếu không phải ADMIN)

```json
{
  "code": 403,
  "message": "Access Denied"
}
```

**Status Code:** `400 Bad Request` (nếu category đang được sử dụng)

```json
{
  "code": 400,
  "message": "Không thể xóa danh mục vì đang có sản phẩm sử dụng"
}
```

---

## Hướng dẫn Test bằng Postman

### Bước 1: Setup

1. Đảm bảo đã login và có token trong environment
2. Token phải có role ADMIN hoặc EMPLOYEE

### Bước 2: Test Lấy tất cả danh mục

**Request:**
- Method: `GET`
- URL: `{{base_url}}/categories/all`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 3: Test Lấy danh sách có phân trang

**Request:**
- Method: `GET`
- URL: `{{base_url}}/categories?pageNo=1&pageSize=10&sortBy=name&sortDirection=ASC`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 4: Test Tìm kiếm

**Request:**
- Method: `GET`
- URL: `{{base_url}}/categories/search?name=Điện&pageNo=1&pageSize=10`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 5: Test Tạo danh mục mới

**Request:**
- Method: `POST`
- URL: `{{base_url}}/categories`
- Headers:
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Điện tử",
  "description": "Danh mục sản phẩm điện tử"
}
```

**Test Script (lưu ID):**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.idCategory) {
        pm.environment.set("category_id", jsonData.data.idCategory);
        console.log("Category ID saved:", jsonData.data.idCategory);
    }
}
```

### Bước 6: Test Lấy chi tiết

**Request:**
- Method: `GET`
- URL: `{{base_url}}/categories/{{category_id}}`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 7: Test Cập nhật

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/categories/{{category_id}}`
- Headers:
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Điện tử - Cập nhật",
  "description": "Mô tả mới"
}
```

### Bước 8: Test Xóa (chỉ ADMIN)

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/categories/{{category_id}}`
- Headers:
  - `Authorization: Bearer {{admin_token}}` (phải là ADMIN token)

---

## Error Handling

### 400 Bad Request
- Validation fail (thiếu field, format sai)
- Category đang được sử dụng (khi xóa)

### 401 Unauthorized
- Không có token hoặc token không hợp lệ

### 403 Forbidden
- Không đủ quyền (ví dụ: EMPLOYEE cố xóa category)

### 404 Not Found
- Category không tồn tại

---

## Tips và Best Practices

1. **Sử dụng endpoint `/all`** cho dropdown, select box
2. **Sử dụng endpoint có phân trang** cho table, list view
3. **Validate trước khi gửi** để tránh lỗi 400
4. **Kiểm tra quyền** trước khi cho phép xóa (chỉ ADMIN)
5. **Xử lý lỗi** khi category đang được sử dụng

---

## Liên hệ

Nếu có thắc mắc về Category Module, vui lòng liên hệ team Backend.





