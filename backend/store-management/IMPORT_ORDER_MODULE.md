# Import Order Module - Hướng dẫn API

## Tổng quan

Module quản lý đơn nhập hàng từ nhà cung cấp. Tất cả endpoints yêu cầu authentication với role **ADMIN** hoặc **EMPLOYEE**.

**Base URL:** `/api/v1/import-orders`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

**Lưu ý:** Khi tạo đơn nhập hàng, Employee ID sẽ tự động lấy từ JWT token, không cần gửi trong request.

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| POST | `/api/v1/import-orders` | ADMIN, EMPLOYEE | Tạo đơn nhập hàng mới |
| GET | `/api/v1/import-orders/{id}` | ADMIN, EMPLOYEE | Lấy chi tiết đơn nhập hàng |
| GET | `/api/v1/import-orders` | ADMIN, EMPLOYEE | Lấy danh sách đơn nhập hàng (có phân trang) |
| GET | `/api/v1/import-orders/supplier/{supplierId}` | ADMIN, EMPLOYEE | Lấy đơn nhập hàng theo nhà cung cấp |
| GET | `/api/v1/import-orders/history` | ADMIN, EMPLOYEE | Lấy lịch sử nhập hàng (theo thời gian) |
| GET | `/api/v1/import-orders/{id}/pdf` | ADMIN, EMPLOYEE | Xuất phiếu nhập hàng PDF |

---

## 1. Tạo đơn nhập hàng mới

### Thông tin Endpoint

- **URL:** `POST /api/v1/import-orders`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "idSupplier": "integer (required)",
  "importOrderDetails": [
    {
      "idProduct": "integer (required)",
      "quantity": "integer (required, > 0)",
      "importPrice": "number (required, >= 0)"
    }
  ]
}
```

### Ví dụ Request

```json
{
  "idSupplier": 1,
  "importOrderDetails": [
    {
      "idProduct": 1,
      "quantity": 10,
      "importPrice": 20000000
    },
    {
      "idProduct": 2,
      "quantity": 5,
      "importPrice": 15000000
    }
  ]
}
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Tạo đơn nhập hàng thành công",
  "data": {
    "idImportOrder": 1,
    "idSupplier": 1,
    "supplierName": "Công ty ABC",
    "idEmployee": 1,
    "employeeName": "Nguyễn Văn B",
    "orderDate": "2025-01-01T10:00:00",
    "totalAmount": 275000000,
    "importOrderDetails": [
      {
        "idImportOrderDetail": 1,
        "idProduct": 1,
        "productName": "iPhone 15 Pro",
        "productCode": "SP001",
        "quantity": 10,
        "importPrice": 20000000,
        "subtotal": 200000000
      },
      {
        "idImportOrderDetail": 2,
        "idProduct": 2,
        "productName": "iPad Pro",
        "productCode": "SP002",
        "quantity": 5,
        "importPrice": 15000000,
        "subtotal": 75000000
      }
    ]
  }
}
```

### Lưu ý

- **Tự động cập nhật:** Sau khi tạo đơn nhập hàng thành công:
  - Tự động tạo inventory transactions (IN)
  - Tự động cập nhật stock quantity của sản phẩm
  - Total amount được tính tự động từ importOrderDetails
- Employee ID được lấy từ JWT token, không cần gửi trong request
- Order date được set tự động là thời gian hiện tại

---

## 2. Lấy chi tiết đơn nhập hàng

### Thông tin Endpoint

- **URL:** `GET /api/v1/import-orders/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của đơn nhập hàng |

### Response

**Status Code:** `200 OK`

Trả về ImportOrderDto với đầy đủ thông tin và danh sách importOrderDetails

---

## 3. Lấy danh sách đơn nhập hàng (có phân trang)

### Thông tin Endpoint

- **URL:** `GET /api/v1/import-orders`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "idImportOrder" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp (ASC/DESC) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách đơn nhập hàng thành công",
  "data": {
    "content": [ /* ImportOrderDto objects */ ],
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

## 4. Lấy đơn nhập hàng theo nhà cung cấp

### Thông tin Endpoint

- **URL:** `GET /api/v1/import-orders/supplier/{supplierId}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| supplierId | Integer | Yes | ID của nhà cung cấp |

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "idImportOrder" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp |

---

## 5. Lấy lịch sử nhập hàng (theo thời gian)

### Thông tin Endpoint

- **URL:** `GET /api/v1/import-orders/history`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| startDate | String | No | 1 tháng trước | Ngày bắt đầu (format: YYYY-MM-DDTHH:mm:ss) |
| endDate | String | No | Hiện tại | Ngày kết thúc (format: YYYY-MM-DDTHH:mm:ss) |
| supplierId | Integer | No | - | Lọc theo nhà cung cấp (optional) |
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "idImportOrder" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp |

### Ví dụ Request

```
GET /api/v1/import-orders/history?startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59&supplierId=1
```

### Lưu ý

- Date format: `YYYY-MM-DDTHH:mm:ss` (ví dụ: `2025-01-01T00:00:00`)
- Nếu không có startDate/endDate, mặc định lấy 1 tháng gần nhất
- Có thể kết hợp với supplierId để lọc theo cả nhà cung cấp và thời gian

---

## 6. Xuất phiếu nhập hàng PDF

### Thông tin Endpoint

- **URL:** `GET /api/v1/import-orders/{id}/pdf`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của đơn nhập hàng |

### Response

**Status Code:** `200 OK`

**Content-Type:** `application/pdf`

**Body:** PDF file (binary)

### Lưu ý

- Response trả về file PDF, không phải JSON
- File name: `phieu-nhap-hang-{id}.pdf`
- Phù hợp để in hoặc tải về

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Tạo đơn nhập hàng mới

**Request:**
- Method: `POST`
- URL: `{{base_url}}/import-orders`
- Headers:
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "idSupplier": 1,
  "importOrderDetails": [
    {
      "idProduct": 1,
      "quantity": 10,
      "importPrice": 20000000
    },
    {
      "idProduct": 2,
      "quantity": 5,
      "importPrice": 15000000
    }
  ]
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.idImportOrder) {
        pm.environment.set("import_order_id", jsonData.data.idImportOrder);
        console.log("Import Order ID saved:", jsonData.data.idImportOrder);
        console.log("Total Amount:", jsonData.data.totalAmount);
    }
}
```

### Bước 2: Test Lấy chi tiết đơn nhập hàng

**Request:**
- Method: `GET`
- URL: `{{base_url}}/import-orders/{{import_order_id}}`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 3: Test Lấy danh sách đơn nhập hàng

**Request:**
- Method: `GET`
- URL: `{{base_url}}/import-orders?pageNo=1&pageSize=10&sortBy=idImportOrder&sortDirection=DESC`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 4: Test Lấy lịch sử nhập hàng

**Request:**
- Method: `GET`
- URL: `{{base_url}}/import-orders/history?startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59&supplierId=1`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 5: Test Xuất PDF

**Request:**
- Method: `GET`
- URL: `{{base_url}}/import-orders/{{import_order_id}}/pdf`
- Headers:
  - `Authorization: Bearer {{token}}`

**Lưu ý trong Postman:**
- Click **Send and Download** để tải file PDF
- Hoặc xem trực tiếp trong tab **Body** > chọn **Preview**

---

## Error Handling

- **400 Bad Request:** Validation fail, thiếu field, quantity <= 0, importPrice < 0
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **404 Not Found:** Supplier hoặc Product không tồn tại
- **500 Internal Server Error:** Lỗi khi tạo inventory transaction

---

## Tips và Best Practices

1. **Kiểm tra stock:** Đảm bảo sản phẩm tồn tại trước khi tạo đơn nhập
2. **Validate quantity:** Quantity phải > 0
3. **Validate price:** ImportPrice phải >= 0
4. **Date format:** Sử dụng format `YYYY-MM-DDTHH:mm:ss` khi filter theo thời gian
5. **PDF export:** Phù hợp để in hoặc lưu trữ

---

## Liên hệ

Nếu có thắc mắc về Import Order Module, vui lòng liên hệ team Backend.





