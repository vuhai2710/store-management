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
| GET | `/api/v1/inventory-transactions/by-type` | ADMIN, EMPLOYEE | **MỚI** - Lấy lịch sử theo loại giao dịch (IN/OUT) |
| GET | `/api/v1/inventory-transactions/filter` | ADMIN, EMPLOYEE | **MỚI** - Lọc lịch sử theo nhiều criteria |

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

## 5. Lấy lịch sử theo loại giao dịch (IN/OUT)

### Thông tin Endpoint

- **URL:** `GET /api/v1/inventory-transactions/by-type`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| transactionType | String | **Yes** | Loại giao dịch: **IN** (nhập kho) hoặc **OUT** (xuất kho) |
| pageNo | Integer | No | Số trang (default: 1) |
| pageSize | Integer | No | Số lượng item mỗi trang (default: 10) |
| sortBy | String | No | Trường sắp xếp (default: "transactionDate") |
| sortDirection | String | No | Hướng sắp xếp: ASC/DESC (default: "DESC") |

### Ví dụ Request

**Lấy tất cả giao dịch NHẬP KHO:**
```
GET /api/v1/inventory-transactions/by-type?transactionType=IN&pageNo=1&pageSize=10
```

**Lấy tất cả giao dịch XUẤT KHO:**
```
GET /api/v1/inventory-transactions/by-type?transactionType=OUT&pageNo=1&pageSize=10
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy lịch sử nhập kho thành công",
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

### Use Cases

- **Báo cáo nhập kho:** Lấy tất cả transactions với `transactionType=IN`
- **Báo cáo xuất kho:** Lấy tất cả transactions với `transactionType=OUT`
- **Phân tích xu hướng:** So sánh số lượng nhập/xuất trong một khoảng thời gian

---

## 6. Lọc lịch sử theo nhiều criteria

### Thông tin Endpoint

- **URL:** `GET /api/v1/inventory-transactions/filter`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Mô tả:** Endpoint mạnh mẽ cho phép lọc theo nhiều tiêu chí cùng lúc

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| transactionType | String | No | - | Loại giao dịch: IN hoặc OUT |
| productId | Integer | No | - | ID sản phẩm |
| startDate | String | No | 1 tháng trước | Ngày bắt đầu (format: YYYY-MM-DDTHH:mm:ss) |
| endDate | String | No | Hiện tại | Ngày kết thúc (format: YYYY-MM-DDTHH:mm:ss) |
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "transactionDate" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp |

### Ví dụ Request

**1. Lọc giao dịch NHẬP KHO của sản phẩm #1 trong tháng 1/2025:**
```
GET /api/v1/inventory-transactions/filter?transactionType=IN&productId=1&startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59
```

**2. Lọc tất cả giao dịch XUẤT KHO trong tháng 1/2025:**
```
GET /api/v1/inventory-transactions/filter?transactionType=OUT&startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59
```

**3. Lọc tất cả giao dịch của sản phẩm #5 (không phân biệt IN/OUT):**
```
GET /api/v1/inventory-transactions/filter?productId=5&startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59
```

**4. Lọc tất cả giao dịch NHẬP KHO trong 7 ngày gần nhất:**
```
GET /api/v1/inventory-transactions/filter?transactionType=IN&startDate=2025-01-25T00:00:00&endDate=2025-02-01T23:59:59
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lọc lịch sử nhập/xuất kho thành công",
  "data": {
    "content": [
      {
        "idTransaction": 15,
        "idProduct": 1,
        "productName": "iPhone 15 Pro",
        "productCode": "SP001",
        "transactionType": "IN",
        "quantity": 20,
        "referenceType": "PURCHASE_ORDER",
        "referenceId": 5,
        "transactionDate": "2025-01-15T14:30:00",
        "notes": "Nhập hàng lô mới"
      }
    ],
    "pageNo": 1,
    "pageSize": 10,
    "totalElements": 8,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true,
    "hasNext": false,
    "hasPrevious": false,
    "isEmpty": false
  }
}
```

### Use Cases

**1. Báo cáo chi tiết theo sản phẩm:**
```
filter?productId=1&startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59
```
→ Xem tất cả giao dịch (IN + OUT) của sản phẩm trong tháng

**2. Báo cáo nhập hàng theo nhà cung cấp:**
- Bước 1: Lọc transactions nhập kho
- Bước 2: Group theo referenceId để tổng hợp theo đơn nhập hàng

**3. Phân tích xu hướng bán hàng:**
```
filter?transactionType=OUT&startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59
```
→ Tổng số lượng xuất kho = Tổng sản phẩm đã bán

**4. Kiểm tra biến động tồn kho của một sản phẩm:**
```
filter?productId=5&startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59
```
→ Xem chi tiết từng lần nhập/xuất của sản phẩm #5

### So sánh với các endpoints khác

| Endpoint | Use Case |
|----------|----------|
| `/filter` | **Linh hoạt nhất** - Lọc theo nhiều tiêu chí cùng lúc |
| `/by-type` | Đơn giản - Chỉ lọc theo IN/OUT |
| `/history` | Lọc theo thời gian (có thể kèm productId) |
| `/product/{id}` | Xem tất cả transactions của 1 sản phẩm |

### Lưu ý

- Tất cả params đều **optional** (trừ startDate/endDate có default)
- Nếu không truyền `transactionType` → Lấy cả IN và OUT
- Nếu không truyền `productId` → Lấy tất cả sản phẩm
- Endpoint này tối ưu cho báo cáo và phân tích dữ liệu

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

























