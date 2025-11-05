# Inventory Transaction Module - Hướng dẫn API

## Tổng quan

Module quản lý lịch sử nhập/xuất kho (Inventory Transaction). Tất cả endpoints yêu cầu authentication với role **ADMIN** hoặc **EMPLOYEE**.

**Base URL:** `/api/v1/inventory-transactions`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

**Lưu ý:** Module này chỉ dùng để **xem** lịch sử, không có endpoint tạo/cập nhật/xóa. Transactions được tạo tự động khi:
- Tạo đơn nhập hàng (IN)
- Tạo đơn bán hàng (OUT)
- Điều chỉnh kho (ADJUSTMENT)

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/inventory-transactions` | ADMIN, EMPLOYEE | Lấy tất cả lịch sử nhập/xuất kho (có phân trang) |
| GET | `/api/v1/inventory-transactions/product/{productId}` | ADMIN, EMPLOYEE | Lấy lịch sử của một sản phẩm |
| GET | `/api/v1/inventory-transactions/reference` | ADMIN, EMPLOYEE | Lấy transactions theo reference |
| GET | `/api/v1/inventory-transactions/history` | ADMIN, EMPLOYEE | Lấy lịch sử trong khoảng thời gian |

---

## 1. Lấy tất cả lịch sử nhập/xuất kho

### Thông tin Endpoint

- **URL:** `GET /api/v1/inventory-transactions`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "transactionDate" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp (ASC/DESC) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy lịch sử nhập/xuất kho thành công",
  "data": {
    "content": [
      {
        "idTransaction": 1,
        "idProduct": 1,
        "productName": "iPhone 15 Pro",
        "productCode": "SP001",
        "transactionType": "IN",
        "quantity": 10,
        "referenceType": "PURCHASE_ORDER",
        "referenceId": 1,
        "transactionDate": "2025-01-01T10:00:00",
        "notes": "Nhập hàng từ đơn nhập hàng #1"
      }
    ],
    "pageNo": 1,
    "pageSize": 10,
    "totalElements": 100,
    "totalPages": 10,
    "isFirst": true,
    "isLast": false,
    "hasNext": true,
    "hasPrevious": false,
    "isEmpty": false
  }
}
```

### Transaction Types

- **IN:** Nhập kho (từ đơn nhập hàng)
- **OUT:** Xuất kho (từ đơn bán hàng)
- **ADJUSTMENT:** Điều chỉnh kho

### Reference Types

- **PURCHASE_ORDER:** Đơn nhập hàng
- **SALE_ORDER:** Đơn bán hàng
- **ADJUSTMENT:** Điều chỉnh kho

---

## 2. Lấy lịch sử của một sản phẩm

### Thông tin Endpoint

- **URL:** `GET /api/v1/inventory-transactions/product/{productId}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| productId | Integer | Yes | ID của sản phẩm |

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "transactionDate" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp |

### Ví dụ Request

```
GET /api/v1/inventory-transactions/product/1?pageNo=1&pageSize=10
```

### Response

Giống như endpoint lấy tất cả, nhưng chỉ lọc theo productId

---

## 3. Lấy transactions theo reference

### Thông tin Endpoint

- **URL:** `GET /api/v1/inventory-transactions/reference`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| referenceType | String | **Yes** | Loại reference (PURCHASE_ORDER, SALE_ORDER, ADJUSTMENT) |
| referenceId | Integer | **Yes** | ID của reference |
| pageNo | Integer | No | 1 |
| pageSize | Integer | No | 10 |
| sortBy | String | No | "transactionDate" |
| sortDirection | String | No | "DESC" |

### Ví dụ Request

```
GET /api/v1/inventory-transactions/reference?referenceType=PURCHASE_ORDER&referenceId=1&pageNo=1&pageSize=10
```

### Response

Danh sách transactions liên quan đến reference cụ thể

### Lưu ý

- Phù hợp để xem tất cả transactions của một đơn nhập hàng hoặc đơn bán hàng
- ReferenceType phải là một trong: PURCHASE_ORDER, SALE_ORDER, ADJUSTMENT

---

## 4. Lấy lịch sử trong khoảng thời gian

### Thông tin Endpoint

- **URL:** `GET /api/v1/inventory-transactions/history`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| startDate | String | No | 1 tháng trước | Ngày bắt đầu (format: YYYY-MM-DDTHH:mm:ss) |
| endDate | String | No | Hiện tại | Ngày kết thúc (format: YYYY-MM-DDTHH:mm:ss) |
| productId | Integer | No | - | Lọc theo sản phẩm (optional) |
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "transactionDate" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp |

### Ví dụ Request

```
GET /api/v1/inventory-transactions/history?startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59&productId=1
```

### Response

Danh sách transactions trong khoảng thời gian (có thể kèm productId)

### Lưu ý

- Date format: `YYYY-MM-DDTHH:mm:ss`
- Nếu không có startDate/endDate, mặc định lấy 1 tháng gần nhất
- Có thể kết hợp với productId để lọc theo cả sản phẩm và thời gian

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Lấy tất cả lịch sử

**Request:**
- Method: `GET`
- URL: `{{base_url}}/inventory-transactions?pageNo=1&pageSize=10&sortBy=transactionDate&sortDirection=DESC`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 2: Test Lấy lịch sử của một sản phẩm

**Request:**
- Method: `GET`
- URL: `{{base_url}}/inventory-transactions/product/1?pageNo=1&pageSize=10`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 3: Test Lấy transactions theo reference

**Request:**
- Method: `GET`
- URL: `{{base_url}}/inventory-transactions/reference?referenceType=PURCHASE_ORDER&referenceId=1&pageNo=1&pageSize=10`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 4: Test Lấy lịch sử trong khoảng thời gian

**Request:**
- Method: `GET`
- URL: `{{base_url}}/inventory-transactions/history?startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59&productId=1`
- Headers:
  - `Authorization: Bearer {{token}}`

---

## Error Handling

- **400 Bad Request:** ReferenceType không hợp lệ
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **404 Not Found:** Product không tồn tại

---

## Tips và Best Practices

1. **Xem lịch sử sản phẩm:** Sử dụng endpoint `/product/{productId}` để xem tất cả transactions của một sản phẩm
2. **Xem transactions của đơn hàng:** Sử dụng endpoint `/reference` để xem tất cả transactions liên quan đến một đơn hàng
3. **Báo cáo:** Sử dụng endpoint `/history` với date range để tạo báo cáo
4. **Sort:** Mặc định sort theo transactionDate DESC (mới nhất trước)

---

## Liên hệ

Nếu có thắc mắc về Inventory Transaction Module, vui lòng liên hệ team Backend.





