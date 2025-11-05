# Product Module - Hướng dẫn API

## Tổng quan

Module quản lý sản phẩm (Product). Tất cả endpoints yêu cầu authentication với role **ADMIN** hoặc **EMPLOYEE**.

**Base URL:** `/api/v1/products`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

**Đặc biệt:** API tạo/cập nhật sản phẩm sử dụng `multipart/form-data` để upload ảnh, không phải `application/json`.

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/products` | ADMIN, EMPLOYEE | Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm) |
| GET | `/api/v1/products/{id}` | ADMIN, EMPLOYEE | Lấy chi tiết sản phẩm theo ID |
| GET | `/api/v1/products/code/{code}` | ADMIN, EMPLOYEE | Tìm sản phẩm theo mã (chính xác) |
| GET | `/api/v1/products/search/name` | ADMIN, EMPLOYEE | Tìm kiếm sản phẩm theo tên |
| GET | `/api/v1/products/category/{categoryId}` | ADMIN, EMPLOYEE | Lọc sản phẩm theo danh mục |
| GET | `/api/v1/products/brand/{brand}` | ADMIN, EMPLOYEE | Lọc sản phẩm theo thương hiệu |
| GET | `/api/v1/products/supplier/{supplierId}` | ADMIN, EMPLOYEE | Lọc sản phẩm theo nhà cung cấp |
| GET | `/api/v1/products/price` | ADMIN, EMPLOYEE | Lọc sản phẩm theo khoảng giá |
| GET | `/api/v1/products/best-sellers` | ADMIN, EMPLOYEE | Lấy sản phẩm bán chạy |
| POST | `/api/v1/products` | ADMIN, EMPLOYEE | Tạo sản phẩm mới (với upload ảnh) |
| PUT | `/api/v1/products/{id}` | ADMIN, EMPLOYEE | Cập nhật sản phẩm (với upload ảnh) |
| DELETE | `/api/v1/products/{id}` | ADMIN | Xóa sản phẩm |

---

## 1. Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)

### Thông tin Endpoint

- **URL:** `GET /api/v1/products`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "idProduct" | Trường sắp xếp |
| sortDirection | String | No | "ASC" | Hướng sắp xếp (ASC/DESC) |
| code | String | No | - | Tìm theo mã sản phẩm |
| name | String | No | - | Tìm theo tên sản phẩm |
| categoryId | Integer | No | - | Lọc theo danh mục |
| brand | String | No | - | Lọc theo thương hiệu |
| minPrice | Double | No | - | Giá tối thiểu |
| maxPrice | Double | No | - | Giá tối đa |

### Ví dụ Request

```
GET /api/v1/products?pageNo=1&pageSize=10&categoryId=1&brand=Apple&minPrice=1000000&maxPrice=50000000
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": {
    "content": [
      {
        "idProduct": 1,
        "idCategory": 1,
        "categoryName": "Điện tử",
        "productName": "iPhone 15 Pro",
        "brand": "Apple",
        "idSupplier": 1,
        "supplierName": "Công ty ABC",
        "description": "Điện thoại cao cấp",
        "price": 25000000,
        "stockQuantity": 10,
        "status": "ACTIVE",
        "imageUrl": "/uploads/products/iphone15pro.jpg",
        "productCode": "SP001",
        "codeType": "SKU",
        "sku": "IP15PRO-001",
        "createdAt": "2025-01-01T00:00:00",
        "updatedAt": "2025-01-01T00:00:00"
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

- Nếu có bất kỳ tham số tìm kiếm/lọc nào (code, name, categoryId, brand, minPrice, maxPrice), hệ thống sẽ tự động dùng searchProducts
- Có thể kết hợp nhiều filter cùng lúc
- SortBy có thể là: `idProduct`, `productName`, `price`, `stockQuantity`, `createdAt`, etc.

---

## 2. Lấy chi tiết sản phẩm

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của sản phẩm |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy thông tin sản phẩm thành công",
  "data": {
    "idProduct": 1,
    "idCategory": 1,
    "categoryName": "Điện tử",
    "productName": "iPhone 15 Pro",
    "brand": "Apple",
    "idSupplier": 1,
    "supplierName": "Công ty ABC",
    "description": "Điện thoại cao cấp",
    "price": 25000000,
    "stockQuantity": 10,
    "status": "ACTIVE",
    "imageUrl": "/uploads/products/iphone15pro.jpg",
    "productCode": "SP001",
    "codeType": "SKU",
    "sku": "IP15PRO-001"
  }
}
```

---

## 3. Tìm sản phẩm theo mã (chính xác)

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/code/{code}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| code | String | Yes | Mã sản phẩm (chính xác) |

### Ví dụ Request

```
GET /api/v1/products/code/SP001
```

### Response

**Status Code:** `200 OK`

Trả về ProductDto object (giống như lấy chi tiết)

---

## 4. Tìm kiếm sản phẩm theo tên

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/search/name?name={name}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| name | String | **Yes** | Tên sản phẩm để tìm kiếm (gần đúng) |
| pageNo | Integer | No | 1 |
| pageSize | Integer | No | 10 |
| sortBy | String | No | "idProduct" |
| sortDirection | String | No | "ASC" |

### Ví dụ Request

```
GET /api/v1/products/search/name?name=iPhone&pageNo=1&pageSize=10
```

---

## 5. Lọc sản phẩm theo danh mục

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/category/{categoryId}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| categoryId | Integer | Yes | ID của danh mục |

---

## 6. Lọc sản phẩm theo thương hiệu

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/brand/{brand}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| brand | String | Yes | Tên thương hiệu |

---

## 7. Lọc sản phẩm theo nhà cung cấp

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/supplier/{supplierId}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| supplierId | Integer | Yes | ID của nhà cung cấp |

---

## 8. Lọc sản phẩm theo khoảng giá

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/price?minPrice={min}&maxPrice={max}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| minPrice | Double | No | Giá tối thiểu |
| maxPrice | Double | No | Giá tối đa |
| pageNo | Integer | No | 1 |
| pageSize | Integer | No | 10 |
| sortBy | String | No | "price" |
| sortDirection | String | No | "ASC" |

### Ví dụ Request

```
GET /api/v1/products/price?minPrice=1000000&maxPrice=5000000&pageNo=1&pageSize=10
```

---

## 9. Lấy sản phẩm bán chạy

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/best-sellers?status={status}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| status | String | No | Trạng thái đơn hàng (COMPLETED, etc.) |
| pageNo | Integer | No | 1 |
| pageSize | Integer | No | 10 |

### Lưu ý

- Sản phẩm đã được sort sẵn theo số lượng bán, không cần sortBy
- Phù hợp cho trang chủ, trang sản phẩm nổi bật

---

## 10. Tạo sản phẩm mới (với upload ảnh)

### Thông tin Endpoint

- **URL:** `POST /api/v1/products`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `multipart/form-data` ⚠️ **QUAN TRỌNG**

### Request Body (form-data)

| Key | Type | Required | Mô tả |
|-----|------|----------|-------|
| productDto | Text (JSON string) | **Yes** | Thông tin sản phẩm (JSON string) |
| image | File | No | Hình ảnh sản phẩm |

### productDto (JSON string)

```json
{
  "idCategory": "integer (required)",
  "productName": "string (required)",
  "brand": "string (optional)",
  "idSupplier": "integer (optional)",
  "description": "string (optional)",
  "price": "number (required, >= 0)",
  "stockQuantity": "integer (optional, >= 0)",
  "productCode": "string (optional)",
  "codeType": "enum (required: SKU, MANUAL)",
  "sku": "string (optional)"
}
```

### Ví dụ Request Body trong Postman

**Body tab:** Chọn `form-data` (KHÔNG phải raw JSON)

- Key: `productDto` (Type: **Text**)
  Value:
  ```json
  {
    "idCategory": 1,
    "productName": "iPhone 15 Pro",
    "brand": "Apple",
    "idSupplier": 1,
    "description": "Điện thoại cao cấp",
    "price": 25000000,
    "stockQuantity": 10,
    "codeType": "SKU",
    "sku": "IP15PRO-001"
  }
  ```

- Key: `image` (Type: **File**)
  Value: Chọn file ảnh từ máy tính (optional)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Thêm sản phẩm thành công",
  "data": {
    "idProduct": 1,
    "productName": "iPhone 15 Pro",
    "imageUrl": "/uploads/products/iphone15pro.jpg",
    /* ... các field khác */
  }
}
```

### Lưu ý QUAN TRỌNG

⚠️ **KHÔNG** chọn `raw` JSON trong Body tab  
⚠️ Chọn tab **form-data** thay vì raw  
⚠️ `productDto` phải là **Text** (không phải File) và chứa JSON string  
⚠️ `image` là **File** và có thể để trống (optional)  
⚠️ File size tối đa: 10MB

---

## 11. Cập nhật sản phẩm (với upload ảnh)

### Thông tin Endpoint

- **URL:** `PUT /api/v1/products/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `multipart/form-data` ⚠️ **QUAN TRỌNG**

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của sản phẩm cần cập nhật |

### Request Body

Giống như tạo mới (form-data với productDto và image)

### Lưu ý

- Nếu không gửi `image`, ảnh cũ sẽ được giữ nguyên
- Nếu gửi `image` mới, ảnh cũ sẽ bị thay thế

---

## 12. Xóa sản phẩm

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/products/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của sản phẩm cần xóa |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa sản phẩm thành công",
  "data": null
}
```

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Lấy danh sách sản phẩm

**Request:**
- Method: `GET`
- URL: `{{base_url}}/products?pageNo=1&pageSize=10&categoryId=1&brand=Apple`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 2: Test Tạo sản phẩm mới (với upload ảnh) ⚠️

**Request:**
- Method: `POST`
- URL: `{{base_url}}/products`
- Headers:
  - `Authorization: Bearer {{token}}`
  - **KHÔNG SET Content-Type header** (Postman sẽ tự động set `multipart/form-data`)

- **Body tab:** Chọn **form-data** (KHÔNG phải raw JSON)
  - Key: `productDto` (Type: **Text**)
    Value:
    ```json
    {
      "idCategory": 1,
      "productName": "iPhone 15 Pro",
      "brand": "Apple",
      "idSupplier": 1,
      "description": "Điện thoại cao cấp",
      "price": 25000000,
      "stockQuantity": 10,
      "codeType": "SKU",
      "sku": "IP15PRO-001"
    }
    ```
  - Key: `image` (Type: **File**)
    Value: Chọn file ảnh từ máy tính (có thể để trống)

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.idProduct) {
        pm.environment.set("product_id", jsonData.data.idProduct);
        console.log("Product ID saved:", jsonData.data.idProduct);
    }
}
```

### Bước 3: Test Lấy chi tiết sản phẩm

**Request:**
- Method: `GET`
- URL: `{{base_url}}/products/{{product_id}}`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 4: Test Tìm kiếm theo tên

**Request:**
- Method: `GET`
- URL: `{{base_url}}/products/search/name?name=iPhone&pageNo=1&pageSize=10`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 5: Test Lọc theo khoảng giá

**Request:**
- Method: `GET`
- URL: `{{base_url}}/products/price?minPrice=1000000&maxPrice=50000000&pageNo=1&pageSize=10`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 6: Test Cập nhật sản phẩm

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/products/{{product_id}}`
- Headers:
  - `Authorization: Bearer {{token}}`
- Body (form-data): Giống như tạo mới

### Bước 7: Test Xóa sản phẩm (chỉ ADMIN)

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/products/{{product_id}}`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

---

## Error Handling

- **400 Bad Request:** Validation fail, file quá lớn (>10MB)
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không đủ quyền (ví dụ: EMPLOYEE cố xóa sản phẩm)
- **404 Not Found:** Sản phẩm không tồn tại
- **409 Conflict:** Mã sản phẩm đã tồn tại

---

## Tips và Best Practices

1. **Upload ảnh:** Luôn sử dụng `form-data`, không phải `raw` JSON
2. **Validate trước:** Kiểm tra price >= 0, stockQuantity >= 0
3. **CodeType:** 
   - `SKU`: Tự động sinh hoặc tự nhập SKU
   - `MANUAL`: Tự nhập productCode
4. **Image URL:** Sau khi upload, imageUrl sẽ là đường dẫn tương đối, cần thêm base URL khi hiển thị
5. **Best Sellers:** Sử dụng cho trang chủ, trang sản phẩm nổi bật

---

## Common Issues

### Issue: 400 Bad Request khi tạo sản phẩm

**Nguyên nhân:**
- Sử dụng `raw` JSON thay vì `form-data`
- `productDto` là File thay vì Text
- JSON string trong `productDto` bị lỗi format

**Giải pháp:**
- Chọn tab **form-data** trong Body
- Đảm bảo `productDto` là **Text** (không phải File)
- Kiểm tra JSON string hợp lệ

### Issue: File quá lớn

**Nguyên nhân:** File > 10MB

**Giải pháp:** Resize hoặc compress ảnh trước khi upload

---

## Liên hệ

Nếu có thắc mắc về Product Module, vui lòng liên hệ team Backend.





