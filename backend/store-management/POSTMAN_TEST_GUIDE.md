# Hướng dẫn test Upload Image Product với Postman

## Bước 1: Login để lấy JWT Token

### Request:
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/v1/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "username": "admin",
    "password": "admin"
  }
  ```

### Response sẽ có dạng:
```json
{
  "code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "authenticated": true
  }
}
```

**Lưu ý**: Copy token từ response để dùng ở bước 2.

---

## Bước 2: Upload Product với Image

### Request:
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/v1/products`
- **Headers**: 
  ```
  Authorization: Bearer {YOUR_TOKEN_HERE}
  ```
  ⚠️ **Lưu ý quan trọng**: KHÔNG set `Content-Type` header, Postman sẽ tự động set `multipart/form-data`

### Body (form-data):

Trong Postman, chọn tab **Body** → **form-data**:

| Key | Type | Value |
|-----|------|-------|
| `productDto` | Text | Xem JSON bên dưới |
| `image` | File | Chọn file ảnh từ máy tính |

### JSON cho `productDto` (key: `productDto`, type: Text):

```json
{
  "idCategory": 1,
  "productName": "iPhone 15 Pro Max",
  "brand": "Apple",
  "idSupplier": 1,
  "description": "iPhone 15 Pro Max 256GB - Màu Titan tự nhiên",
  "price": 29990000,
  "stockQuantity": 10,
  "codeType": "SKU"
}
```

**Giải thích các trường:**
- `idCategory`: ID của danh mục (bắt buộc)
- `productName`: Tên sản phẩm (bắt buộc)
- `brand`: Thương hiệu (optional)
- `idSupplier`: ID nhà cung cấp (optional)
- `description`: Mô tả sản phẩm (optional)
- `price`: Giá sản phẩm (bắt buộc, >= 0)
- `stockQuantity`: Số lượng tồn kho (optional, default: 0)
- `codeType`: Loại mã sản phẩm (bắt buộc): `SKU`, `IMEI`, `SERIAL`, `BARCODE`
  - Nếu chọn `SKU`, không cần `productCode` (sẽ tự động sinh)
  - Các loại khác cần có `productCode`

### File ảnh (key: `image`, type: File):
- Click vào trường **Value** và chọn **Select Files**
- Chọn file ảnh (JPEG, JPG, PNG, GIF, WEBP)
- Kích thước tối đa: 10MB

### Response thành công:
```json
{
  "code": 200,
  "message": "Thêm sản phẩm thành công",
  "data": {
    "idProduct": 1,
    "idCategory": 1,
    "categoryName": "Điện thoại",
    "productName": "iPhone 15 Pro Max",
    "brand": "Apple",
    "idSupplier": 1,
    "supplierName": "Apple Vietnam",
    "description": "iPhone 15 Pro Max 256GB - Màu Titan tự nhiên",
    "price": 29990000.0,
    "stockQuantity": 10,
    "status": "IN_STOCK",
    "imageUrl": "/uploads/products/abc123-def456-ghi789.jpg",
    "productCode": "SKU-ELEC-001",
    "codeType": "SKU",
    "sku": "SKU-ELEC-001",
    "createdAt": "2025-01-11T12:00:00",
    "updatedAt": "2025-01-11T12:00:00"
  }
}
```

### Truy cập ảnh đã upload:
Sau khi upload thành công, ảnh có thể truy cập qua:
```
http://localhost:8080/uploads/products/{filename}
```

Ví dụ: `http://localhost:8080/uploads/products/abc123-def456-ghi789.jpg`

---

## Bước 3: Update Product với Image mới

### Request:
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/v1/products/{id}`
  - Thay `{id}` bằng ID sản phẩm cần sửa
- **Headers**: 
  ```
  Authorization: Bearer {YOUR_TOKEN_HERE}
  ```

### Body (form-data):
Giống như Bước 2, nhưng:
- `productDto` có thể chỉ gửi các trường cần thay đổi
- `image` là optional (nếu không gửi, giữ nguyên ảnh cũ)

**Lưu ý**: Nếu upload ảnh mới, ảnh cũ sẽ tự động bị xóa.

---

## Ví dụ ProductDto với các CodeType khác:

### Với IMEI:
```json
{
  "idCategory": 1,
  "productName": "Samsung Galaxy S24",
  "brand": "Samsung",
  "price": 24990000,
  "stockQuantity": 5,
  "codeType": "IMEI",
  "productCode": "123456789012345"
}
```

### Với SERIAL:
```json
{
  "idCategory": 1,
  "productName": "MacBook Pro M3",
  "brand": "Apple",
  "price": 49990000,
  "stockQuantity": 3,
  "codeType": "SERIAL",
  "productCode": "C02XK1ABCDEF"
}
```

### Với BARCODE:
```json
{
  "idCategory": 2,
  "productName": "Áo thun Nike",
  "brand": "Nike",
  "price": 599000,
  "stockQuantity": 50,
  "codeType": "BARCODE",
  "productCode": "8801234567890"
}
```

---

## Troubleshooting

### Lỗi 401 Unauthorized:
- Kiểm tra token đã đúng chưa
- Token có thể đã hết hạn, cần login lại

### Lỗi 400 Bad Request:
- Kiểm tra JSON trong `productDto` có đúng format không
- Kiểm tra các trường required: `idCategory`, `productName`, `price`, `codeType`
- Nếu `codeType` không phải `SKU`, cần có `productCode`

### Lỗi khi upload file:
- Kiểm tra file có phải là ảnh không (JPEG, JPG, PNG, GIF, WEBP)
- Kiểm tra kích thước file <= 10MB
- Đảm bảo chọn đúng type: `File` (không phải `Text`)

### Ảnh không hiển thị:
- Kiểm tra URL ảnh trong response
- Truy cập trực tiếp URL: `http://localhost:8080/uploads/products/{filename}`
- Kiểm tra thư mục `uploads/products/` có file không

