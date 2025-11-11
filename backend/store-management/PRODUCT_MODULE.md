# Product Module - Hướng dẫn API

## Tổng quan

Module quản lý sản phẩm (Product). Phân quyền:

- **ADMIN, EMPLOYEE:** Có thể quản lý tất cả sản phẩm (CRUD)
- **CUSTOMER:** Chỉ có thể xem, tìm kiếm và lọc sản phẩm (không thể tạo/sửa/xóa)

**Base URL:** `/api/v1/products`

**Authentication:** Required

```
Authorization: Bearer {JWT_TOKEN}
```

**Đặc biệt:**

- API tạo/cập nhật sản phẩm sử dụng `application/json` (không upload ảnh trong cùng request)
- Để upload ảnh, sử dụng endpoint riêng: `POST /api/v1/products/{id}/images`
- Cách này tách biệt việc quản lý thông tin sản phẩm và upload ảnh, dễ sử dụng hơn

---

## Danh sách Endpoints

### Endpoints cho Customer (xem, tìm kiếm, lọc)

| Method | Endpoint                                 | Authentication                | Mô tả                                                 |
| ------ | ---------------------------------------- | ----------------------------- | ----------------------------------------------------- |
| GET    | `/api/v1/products`                       | ADMIN, EMPLOYEE, **CUSTOMER** | Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm) |
| GET    | `/api/v1/products/{id}`                  | ADMIN, EMPLOYEE, **CUSTOMER** | Lấy chi tiết sản phẩm theo ID                         |
| GET    | `/api/v1/products/search/name`           | ADMIN, EMPLOYEE, **CUSTOMER** | Tìm kiếm sản phẩm theo tên                            |
| GET    | `/api/v1/products/category/{categoryId}` | ADMIN, EMPLOYEE, **CUSTOMER** | Lọc sản phẩm theo danh mục                            |
| GET    | `/api/v1/products/brand/{brand}`         | ADMIN, EMPLOYEE, **CUSTOMER** | Lọc sản phẩm theo thương hiệu                         |
| GET    | `/api/v1/products/price`                 | ADMIN, EMPLOYEE, **CUSTOMER** | Lọc sản phẩm theo khoảng giá                          |
| GET    | `/api/v1/products/best-sellers`          | ADMIN, EMPLOYEE, **CUSTOMER** | Lấy sản phẩm bán chạy                                 |
| GET    | `/api/v1/products/new`                   | ADMIN, EMPLOYEE, **CUSTOMER** | Lấy sản phẩm mới (mới nhất)                           |
| GET    | `/api/v1/products/{id}/related`          | ADMIN, EMPLOYEE, **CUSTOMER** | Lấy sản phẩm liên quan (cùng category)                |
| GET    | `/api/v1/products/brands`                | ADMIN, EMPLOYEE, **CUSTOMER** | Lấy danh sách tất cả thương hiệu                      |

### Endpoints chỉ cho Admin/Employee (quản lý)

| Method | Endpoint                                    | Authentication            | Mô tả                            |
| ------ | ------------------------------------------- | ------------------------- | -------------------------------- |
| GET    | `/api/v1/products/code/{code}`              | ADMIN, EMPLOYEE           | Tìm sản phẩm theo mã (chính xác) |
| GET    | `/api/v1/products/supplier/{supplierId}`    | ADMIN, EMPLOYEE           | Lọc sản phẩm theo nhà cung cấp   |
| POST   | `/api/v1/products`                          | ADMIN, EMPLOYEE           | Tạo sản phẩm mới (JSON only)     |
| PUT    | `/api/v1/products/{id}`                     | ADMIN, EMPLOYEE           | Cập nhật sản phẩm (JSON only)    |
| DELETE | `/api/v1/products/{id}`                     | ADMIN                     | Xóa sản phẩm                     |
| POST   | `/api/v1/products/{id}/images`              | ADMIN, EMPLOYEE           | Upload nhiều ảnh cho sản phẩm    |
| POST   | `/api/v1/products/{id}/images/single`       | ADMIN, EMPLOYEE           | Upload một ảnh cho sản phẩm      |
| GET    | `/api/v1/products/{id}/images`              | ADMIN, EMPLOYEE, CUSTOMER | Lấy danh sách ảnh của sản phẩm   |
| DELETE | `/api/v1/products/images/{imageId}`         | ADMIN, EMPLOYEE           | Xóa một ảnh của sản phẩm         |
| PUT    | `/api/v1/products/images/{imageId}/primary` | ADMIN, EMPLOYEE           | Đặt một ảnh làm ảnh chính        |

---

## 1. Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)

### Thông tin Endpoint

- **URL:** `GET /api/v1/products`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter     | Type    | Required | Default     | Mô tả                    |
| ------------- | ------- | -------- | ----------- | ------------------------ |
| pageNo        | Integer | No       | 1           | Số trang                 |
| pageSize      | Integer | No       | 10          | Số lượng item mỗi trang  |
| sortBy        | String  | No       | "idProduct" | Trường sắp xếp           |
| sortDirection | String  | No       | "ASC"       | Hướng sắp xếp (ASC/DESC) |
| code          | String  | No       | -           | Tìm theo mã sản phẩm     |
| name          | String  | No       | -           | Tìm theo tên sản phẩm    |
| categoryId    | Integer | No       | -           | Lọc theo danh mục        |
| brand         | String  | No       | -           | Lọc theo thương hiệu     |
| minPrice      | Double  | No       | -           | Giá tối thiểu            |
| maxPrice      | Double  | No       | -           | Giá tối đa               |

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
        "createdAt": "01/01/2025 00:00:00",
        "updatedAt": "01/01/2025 00:00:00"
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

| Parameter | Type    | Required | Mô tả           |
| --------- | ------- | -------- | --------------- |
| id        | Integer | Yes      | ID của sản phẩm |

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

| Parameter | Type   | Required | Mô tả                   |
| --------- | ------ | -------- | ----------------------- |
| code      | String | Yes      | Mã sản phẩm (chính xác) |

### Ví dụ Request

```
GET /api/v1/products/code/SP001
```

### Response

**Status Code:** `200 OK`

Trả về ProductDTO object (giống như lấy chi tiết)

---

## 4. Tìm kiếm sản phẩm theo tên

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/search/name?name={name}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter     | Type    | Required | Mô tả                               |
| ------------- | ------- | -------- | ----------------------------------- |
| name          | String  | **Yes**  | Tên sản phẩm để tìm kiếm (gần đúng) |
| pageNo        | Integer | No       | 1                                   |
| pageSize      | Integer | No       | 10                                  |
| sortBy        | String  | No       | "idProduct"                         |
| sortDirection | String  | No       | "ASC"                               |

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

| Parameter  | Type    | Required | Mô tả           |
| ---------- | ------- | -------- | --------------- |
| categoryId | Integer | Yes      | ID của danh mục |

---

## 6. Lọc sản phẩm theo thương hiệu

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/brand/{brand}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type   | Required | Mô tả           |
| --------- | ------ | -------- | --------------- |
| brand     | String | Yes      | Tên thương hiệu |

---

## 7. Lọc sản phẩm theo nhà cung cấp

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/supplier/{supplierId}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter  | Type    | Required | Mô tả               |
| ---------- | ------- | -------- | ------------------- |
| supplierId | Integer | Yes      | ID của nhà cung cấp |

---

## 8. Lọc sản phẩm theo khoảng giá

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/price?minPrice={min}&maxPrice={max}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Query Parameters

| Parameter     | Type    | Required | Mô tả         |
| ------------- | ------- | -------- | ------------- |
| minPrice      | Double  | No       | Giá tối thiểu |
| maxPrice      | Double  | No       | Giá tối đa    |
| pageNo        | Integer | No       | 1             |
| pageSize      | Integer | No       | 10            |
| sortBy        | String  | No       | "price"       |
| sortDirection | String  | No       | "ASC"         |

### Ví dụ Request

```
GET /api/v1/products/price?minPrice=1000000&maxPrice=5000000&pageNo=1&pageSize=10
```

---

## 9. Lấy sản phẩm bán chạy

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/best-sellers?status={status}`
- **Authentication:** Required (ADMIN, EMPLOYEE, **CUSTOMER**)

### Query Parameters

| Parameter | Type    | Required | Mô tả                                 |
| --------- | ------- | -------- | ------------------------------------- |
| status    | String  | No       | Trạng thái đơn hàng (COMPLETED, etc.) |
| pageNo    | Integer | No       | 1                                     |
| pageSize  | Integer | No       | 10                                    |

### Lưu ý

- Sản phẩm đã được sort sẵn theo số lượng bán, không cần sortBy
- Phù hợp cho trang chủ, trang sản phẩm nổi bật

---

## 10. Lấy sản phẩm mới

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/new?pageNo=1&pageSize=10&limit=20`
- **Authentication:** Required (ADMIN, EMPLOYEE, **CUSTOMER**)

### Query Parameters

| Parameter | Type    | Required | Mô tả |
| --------- | ------- | -------- | ----- | ------------------------------------ |
| pageNo    | Integer | No       | 1     | Số trang                             |
| pageSize  | Integer | No       | 10    | Số lượng item mỗi trang              |
| limit     | Integer | No       | -     | Giới hạn số lượng kết quả (optional) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách sản phẩm mới thành công",
  "data": {
    "content": [
      {
        "idProduct": 1,
        "productName": "iPhone 15 Pro",
        "price": 25000000,
        "status": "IN_STOCK"
        /* ... các field khác */
      }
    ],
    "pageNo": 1,
    "pageSize": 10,
    "totalElements": 50,
    "totalPages": 5
  }
}
```

### Logic xử lý

- Lấy sản phẩm có `status = IN_STOCK`
- Sắp xếp theo `createdAt DESC` (mới nhất trước)
- Nếu có `limit`, giới hạn số lượng kết quả
- Dùng cho: Trang chủ, banner "Sản phẩm mới"

### Ví dụ Request

```
GET /api/v1/products/new?pageNo=1&pageSize=10&limit=20
```

---

## 11. Lấy sản phẩm liên quan

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/{id}/related?limit=8`
- **Authentication:** Required (ADMIN, EMPLOYEE, **CUSTOMER**)

### Path Parameters

| Parameter | Type    | Required | Mô tả           |
| --------- | ------- | -------- | --------------- |
| id        | Integer | Yes      | ID của sản phẩm |

### Query Parameters

| Parameter | Type    | Required | Mô tả |
| --------- | ------- | -------- | ----- | ---------------------------------------- |
| limit     | Integer | No       | 8     | Số lượng sản phẩm liên quan (default: 8) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách sản phẩm liên quan thành công",
  "data": [
    {
      "idProduct": 2,
      "productName": "iPhone 15",
      "price": 22000000,
      "status": "IN_STOCK"
      /* ... các field khác */
    },
    {
      "idProduct": 3,
      "productName": "iPhone 14 Pro",
      "price": 20000000,
      "status": "IN_STOCK"
      /* ... các field khác */
    }
  ]
}
```

### Logic xử lý

- Lấy sản phẩm cùng `categoryId` với sản phẩm hiện tại
- Loại trừ sản phẩm hiện tại (`idProduct != {id}`)
- Chỉ lấy sản phẩm có `status = IN_STOCK`
- Giới hạn số lượng theo `limit` (mặc định: 8)
- Sắp xếp theo `createdAt DESC`
- Dùng cho: Trang chi tiết sản phẩm - hiển thị "Sản phẩm liên quan"

### Ví dụ Request

```
GET /api/v1/products/1/related?limit=8
```

---

## 12. Lấy danh sách tất cả thương hiệu

### Thông tin Endpoint

- **URL:** `GET /api/v1/products/brands`
- **Authentication:** Required (ADMIN, EMPLOYEE, **CUSTOMER**)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách thương hiệu thành công",
  "data": ["Apple", "Samsung", "Xiaomi", "Oppo"]
}
```

### Logic xử lý

- Lấy danh sách brand names **unique** từ products
- Chỉ lấy brands của sản phẩm có `status = IN_STOCK`
- Loại bỏ `null` và empty strings
- Sắp xếp theo tên thương hiệu (A-Z)
- Dùng cho: Dropdown/bộ lọc thương hiệu trong trang sản phẩm

### Ví dụ Request

```
GET /api/v1/products/brands
```

---

## 13. Tạo sản phẩm mới

### Thông tin Endpoint

- **URL:** `POST /api/v1/products`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json` ⚠️ **QUAN TRỌNG**

### Request Body (JSON)

```json
{
  "idCategory": 1,
  "productName": "iPhone 15 Pro",
  "brand": "Apple",
  "idSupplier": 1,
  "description": "Điện thoại cao cấp",
  "price": 25000000,
  "stockQuantity": 10,
  "codeType": "SKU"
}
```

| Field         | Type    | Required | Mô tả                                                   |
| ------------- | ------- | -------- | ------------------------------------------------------- |
| idCategory    | Integer | **Yes**  | ID danh mục sản phẩm                                    |
| productName   | String  | **Yes**  | Tên sản phẩm                                            |
| brand         | String  | No       | Thương hiệu (Apple, Samsung, ...)                       |
| idSupplier    | Integer | No       | ID nhà cung cấp                                         |
| description   | String  | No       | Mô tả sản phẩm                                          |
| price         | Double  | **Yes**  | Giá sản phẩm (>= 0)                                     |
| stockQuantity | Integer | No       | Số lượng tồn kho (>= 0, mặc định: 0)                    |
| codeType      | Enum    | **Yes**  | Loại mã: SKU, MANUAL                                    |
| productCode   | String  | No       | Mã sản phẩm (nếu codeType = SKU và để trống sẽ tự sinh) |
| sku           | String  | No       | SKU (nếu codeType = SKU và để trống sẽ tự sinh)         |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Thêm sản phẩm thành công",
  "data": {
    "idProduct": 1,
    "idCategory": 1,
    "categoryName": "Điện thoại",
    "productName": "iPhone 15 Pro",
    "brand": "Apple",
    "idSupplier": 1,
    "supplierName": "Công ty ABC",
    "description": "Điện thoại cao cấp",
    "price": 25000000,
    "stockQuantity": 10,
    "status": "IN_STOCK",
    "imageUrl": null,
    "images": [],
    "productCode": "IP15PRO-001",
    "codeType": "SKU",
    "sku": "IP15PRO-001",
    "createdAt": "10/11/2025 12:47:35",
    "updatedAt": "10/11/2025 12:47:35"
  }
}
```

### Lưu ý

- Sau khi tạo sản phẩm, có thể upload ảnh qua endpoint: `POST /api/v1/products/{id}/images`
- Nếu `codeType = SKU` và không có `productCode`, hệ thống sẽ tự động sinh SKU theo format: `{category_prefix}-{sequence}`
- Nếu `codeType = MANUAL`, bắt buộc phải có `productCode`

---

## 14. Cập nhật sản phẩm

### Thông tin Endpoint

- **URL:** `PUT /api/v1/products/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json` ⚠️ **QUAN TRỌNG**

### Path Parameters

| Parameter | Type    | Required | Mô tả                        |
| --------- | ------- | -------- | ---------------------------- |
| id        | Integer | Yes      | ID của sản phẩm cần cập nhật |

### Request Body (JSON)

```json
{
  "idCategory": 1,
  "productName": "iPhone 15 Pro Max",
  "brand": "Apple",
  "idSupplier": 1,
  "description": "Điện thoại cao cấp nhất",
  "price": 30000000,
  "stockQuantity": 5,
  "codeType": "SKU"
}
```

**Lưu ý:** Chỉ gửi các field cần cập nhật. Các field không gửi sẽ giữ nguyên giá trị cũ.

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Cập nhật sản phẩm thành công",
  "data": {
    "idProduct": 1,
    "idCategory": 1,
    "categoryName": "Điện thoại",
    "productName": "iPhone 15 Pro Max",
    "brand": "Apple",
    "idSupplier": 1,
    "supplierName": "Công ty ABC",
    "description": "Điện thoại cao cấp nhất",
    "price": 30000000,
    "stockQuantity": 5,
    "status": "IN_STOCK",
    "imageUrl": "/uploads/products/iphone15promax.jpg",
    "images": [...],
    "productCode": "IP15PRO-001",
    "codeType": "SKU",
    "sku": "IP15PRO-001",
    "createdAt": "10/11/2025 12:47:35",
    "updatedAt": "10/11/2025 13:00:00"
  }
}
```

### Lưu ý

- Để upload ảnh mới, sử dụng endpoint riêng: `POST /api/v1/products/{id}/images`
- Để xóa ảnh, sử dụng: `DELETE /api/v1/products/images/{imageId}`
- Để đặt ảnh chính, sử dụng: `PUT /api/v1/products/images/{imageId}/primary`

---

## 15. Xóa sản phẩm

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/products/{id}`
- **Authentication:** Required (**chỉ ADMIN**)

### Path Parameters

| Parameter | Type    | Required | Mô tả                   |
| --------- | ------- | -------- | ----------------------- |
| id        | Integer | Yes      | ID của sản phẩm cần xóa |

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

### Bước 2: Test Tạo sản phẩm mới

**Request:**

- Method: `POST`
- URL: `{{base_url}}/products`
- Headers:

  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`

- **Body tab:** Chọn **raw** và **JSON**
  ```json
  {
    "idCategory": 1,
    "productName": "iPhone 15 Pro",
    "brand": "Apple",
    "idSupplier": 1,
    "description": "Điện thoại cao cấp",
    "price": 25000000,
    "stockQuantity": 10,
    "codeType": "SKU"
  }
  ```

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

### Bước 3: Test Upload ảnh cho sản phẩm

**Request:**

- Method: `POST`
- URL: `{{base_url}}/products/{{product_id}}/images`
- Headers:

  - `Authorization: Bearer {{token}}`
  - **KHÔNG SET Content-Type header** (Postman sẽ tự động set `multipart/form-data`)

- **Body tab:** Chọn **form-data**
  - Key: `images` (Type: **File**)
    Value: Chọn một hoặc nhiều file ảnh (tối đa 5 ảnh)

### Bước 4: Test Lấy chi tiết sản phẩm

**Request:**

- Method: `GET`
- URL: `{{base_url}}/products/{{product_id}}`
- Headers:
  - `Authorization: Bearer {{token}}`

### Bước 5: Test Tìm kiếm theo tên

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
