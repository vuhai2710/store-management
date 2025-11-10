# Hướng dẫn test Upload Image Product với Postman

## 🎉 PHƯƠNG PHÁP MỚI - ĐƠN GIẢN HƠN (KHUYÊN DÙNG)

### Phương pháp 2-bước: Tạo sản phẩm → Upload ảnh riêng

Phương pháp này đơn giản hơn, dễ test với Postman và dễ tích hợp với React frontend.

---

## PHƯƠNG PHÁP MỚI: Bước 1 - Tạo sản phẩm (JSON only)

### Request:
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/v1/products`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {YOUR_TOKEN_HERE}
  ```
- **Body** (raw JSON):
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

### Response:
```json
{
  "code": 200,
  "message": "Thêm sản phẩm thành công",
  "data": {
    "idProduct": 1,
    "productName": "iPhone 15 Pro Max",
    "price": 29990000.0,
    "stockQuantity": 10,
    "status": "IN_STOCK",
    "imageUrl": null,
    "productCode": "SKU-ELEC-001",
    "codeType": "SKU"
  }
}
```

**Lưu ý**: Lưu lại `idProduct` để upload ảnh ở bước 2.

---

## PHƯƠNG PHÁP MỚI: Bước 2 - Upload nhiều ảnh

### Request:
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/v1/products/{idProduct}/images`
  - Thay `{idProduct}` bằng ID từ bước 1 (ví dụ: `/api/v1/products/1/images`)
- **Headers**: 
  ```
  Authorization: Bearer {YOUR_TOKEN_HERE}
  ```
  ⚠️ **KHÔNG set Content-Type** (Postman tự động set `multipart/form-data`)

### Body (form-data):

| Key | Type | Value |
|-----|------|-------|
| `images` | File | Chọn file ảnh 1 |
| `images` | File | Chọn file ảnh 2 |
| `images` | File | Chọn file ảnh 3 |
| ... | File | (tối đa 5 ảnh) |

**Cách thêm nhiều file:**
1. Trong Postman, tab **Body** → chọn **form-data**
2. Key: `images` (type: File) → chọn file ảnh 1
3. Click "+" hoặc Enter để thêm dòng mới
4. Key: `images` (type: File) → chọn file ảnh 2
5. Lặp lại cho các ảnh còn lại (tối đa 5 ảnh)

### Response:
```json
{
  "code": 200,
  "message": "Upload ảnh thành công",
  "data": [
    {
      "idProductImage": 1,
      "idProduct": 1,
      "imageUrl": "/uploads/products/uuid-1.jpg",
      "isPrimary": true,
      "displayOrder": 0,
      "createdAt": "2025-01-11T10:00:00"
    },
    {
      "idProductImage": 2,
      "idProduct": 1,
      "imageUrl": "/uploads/products/uuid-2.jpg",
      "isPrimary": false,
      "displayOrder": 1,
      "createdAt": "2025-01-11T10:00:01"
    }
  ]
}
```

**Ưu điểm phương pháp mới:**
- ✅ Đơn giản, dễ test với Postman
- ✅ Dễ tích hợp với React (gọi 2 API riêng biệt)
- ✅ Có thể upload nhiều ảnh (tối đa 5)
- ✅ Có thể thêm ảnh sau khi tạo sản phẩm

---

## PHƯƠNG PHÁP MỚI: Các endpoint quản lý ảnh

### 1. Thêm một ảnh cho sản phẩm

**POST** `/api/v1/products/{id}/images/single`

Body (form-data):
- Key: `image` (type: File) → chọn 1 file ảnh

### 2. Lấy tất cả ảnh của sản phẩm

**GET** `/api/v1/products/{id}/images`

### 3. Xóa một ảnh

**DELETE** `/api/v1/products/images/{imageId}`

Nếu xóa ảnh chính, ảnh tiếp theo sẽ tự động trở thành ảnh chính.

### 4. Đặt một ảnh làm ảnh chính

**PUT** `/api/v1/products/images/{imageId}/primary`

---

---

## PHƯƠNG PHÁP CŨ (Vẫn hoạt động)

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

## Bước 2: Upload Product với Image (PHƯƠNG PHÁP CŨ)

**Lưu ý**: Endpoint này đã được chuyển sang `/api/v1/products/with-image` để tránh conflict với phương pháp mới.

### Request:
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/v1/products/with-image`
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

## Bước 3: Update Product với Image mới (PHƯƠNG PHÁP CŨ)

**Khuyến nghị**: Sử dụng phương pháp mới - update product info và quản lý ảnh riêng biệt.

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

## So sánh 2 phương pháp

| Tính năng | Phương pháp Mới | Phương pháp Cũ |
|-----------|----------------|----------------|
| Tạo sản phẩm | JSON đơn giản | form-data phức tạp |
| Upload ảnh | Nhiều ảnh (max 5) | 1 ảnh |
| Quản lý ảnh | Thêm/Xóa/Set primary | Chỉ replace |
| Dễ test Postman | ✅ Rất dễ | ⚠️ Phức tạp |
| Tích hợp React | ✅ Dễ dàng | ⚠️ Khó hơn |
| Backward compatible | - | ✅ Có |

**Khuyến nghị**: Sử dụng phương pháp mới cho tất cả projects mới.

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

### ⚠️ Lỗi 415 "Content-Type 'application/octet-stream' is not supported" (QUAN TRỌNG):

**Nguyên nhân**: Postman đang gửi `productDto` dưới dạng File thay vì Text.

**Giải pháp**:

1. **Kiểm tra Type của `productDto`**:
   - Trong Postman, tab Body → form-data
   - Key `productDto` PHẢI có Type = **Text** (KHÔNG phải File)
   - Click vào dropdown bên cạnh key name để chọn đúng type

2. **Hướng dẫn chi tiết với hình ảnh**:
   
   **Bước 1**: Trong Postman, chọn tab **Body**, sau đó chọn **form-data**
   
   **Bước 2**: Thêm key `productDto`:
   - Key name: `productDto`
   - Hover chuột lên key name, sẽ thấy dropdown hiện ra
   - Click dropdown và chọn **Text** (mặc định là Text, nhưng đảm bảo không phải File)
   
   **Bước 3**: Paste JSON vào Value:
   ```json
   {
     "idCategory": 1,
     "productName": "iPhone 15 Pro Max",
     "brand": "Apple",
     "price": 29990000,
     "stockQuantity": 10,
     "codeType": "SKU"
   }
   ```
   
   **Bước 4**: Thêm key `image`:
   - Key name: `image`
   - Click dropdown và chọn **File**
   - Click "Select Files" để chọn file ảnh từ máy tính

3. **Checklist trước khi gửi request**:
   - [ ] `productDto` type = **Text** ✅
   - [ ] `image` type = **File** ✅
   - [ ] KHÔNG có header `Content-Type` trong Headers tab (Postman tự động set)
   - [ ] Header `Authorization: Bearer {token}` đã được thêm ✅

4. **Nếu vẫn lỗi 415**:
   - Xóa toàn bộ Body
   - Tạo lại từ đầu theo hướng dẫn trên
   - Đảm bảo không có header `Content-Type` thủ công trong Headers tab
   - Postman sẽ tự động set `Content-Type: multipart/form-data; boundary=...`

**Lưu ý**: Backend code đã đúng (`@RequestPart("productDto") ProductDto`), lỗi này chỉ do cấu hình sai trong Postman.

---

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




