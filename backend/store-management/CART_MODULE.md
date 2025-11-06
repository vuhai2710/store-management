# Cart Module - Hướng dẫn API

## Tổng quan

Module quản lý giỏ hàng (Shopping Cart) cho khách hàng. Mỗi khách hàng có một giỏ hàng duy nhất.

**Base URL:** `/api/v1/cart`

**Authentication:** Required (CUSTOMER role)
```
Authorization: Bearer {JWT_TOKEN}
```

**Đặc điểm:**
- Giỏ hàng được tự động tạo khi khách hàng đăng nhập lần đầu
- Mỗi khách hàng chỉ có 1 giỏ hàng
- Tự động kiểm tra tồn kho và trạng thái sản phẩm trước khi thêm vào giỏ
- Tổng tiền được tính tự động từ giá hiện tại của sản phẩm

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/cart` | CUSTOMER | Lấy giỏ hàng của tôi |
| POST | `/api/v1/cart/items` | CUSTOMER | Thêm sản phẩm vào giỏ hàng |
| PUT | `/api/v1/cart/items/{itemId}` | CUSTOMER | Cập nhật số lượng sản phẩm |
| DELETE | `/api/v1/cart/items/{itemId}` | CUSTOMER | Xóa sản phẩm khỏi giỏ hàng |
| DELETE | `/api/v1/cart` | CUSTOMER | Xóa toàn bộ giỏ hàng |

---

## 1. Lấy giỏ hàng

### Thông tin Endpoint

- **URL:** `GET /api/v1/cart`
- **Authentication:** Required (CUSTOMER)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy giỏ hàng thành công",
  "data": {
    "idCart": 1,
    "idCustomer": 1,
    "cartItems": [
      {
        "idCartItem": 1,
        "idProduct": 5,
        "productName": "iPhone 15 Pro",
        "productCode": "SP001",
        "productImageUrl": "/uploads/products/iphone15pro.jpg",
        "productPrice": 25000000,
        "productStockQuantity": 10,
        "quantity": 2,
        "subtotal": 50000000
      }
    ],
    "totalAmount": 50000000,
    "totalItems": 2,
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-01T00:00:00"
  }
}
```

### Lưu ý

- Nếu giỏ hàng chưa tồn tại, hệ thống sẽ tự động tạo mới
- `totalAmount`: Tổng tiền của tất cả sản phẩm trong giỏ
- `totalItems`: Tổng số lượng sản phẩm (số lượng items, không phải số sản phẩm khác nhau)
- `subtotal`: Giá của từng item (quantity × productPrice)

---

## 2. Thêm sản phẩm vào giỏ hàng

### Thông tin Endpoint

- **URL:** `POST /api/v1/cart/items`
- **Authentication:** Required (CUSTOMER)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "productId": 5,
  "quantity": 2
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| productId | Integer | Yes | ID của sản phẩm |
| quantity | Integer | Yes | Số lượng (phải >= 1) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Thêm sản phẩm vào giỏ hàng thành công",
  "data": {
    "idCart": 1,
    "cartItems": [...],
    "totalAmount": 50000000,
    "totalItems": 2
  }
}
```

### Logic xử lý

1. **Kiểm tra sản phẩm tồn tại:** Nếu không tìm thấy → 404 Not Found
2. **Kiểm tra trạng thái sản phẩm:**
   - Nếu `OUT_OF_STOCK` → Lỗi "Sản phẩm đã hết hàng"
   - Nếu `DISCONTINUED` → Lỗi "Sản phẩm đã ngừng kinh doanh"
3. **Kiểm tra tồn kho:** Nếu `stockQuantity < quantity` → Lỗi "Số lượng sản phẩm không đủ"
4. **Kiểm tra sản phẩm đã có trong giỏ:**
   - Nếu đã có → Cộng thêm quantity vào số lượng hiện tại
   - Nếu chưa có → Tạo mới cart item
5. **Tự động tạo giỏ hàng:** Nếu customer chưa có giỏ hàng → Tự động tạo mới

### Ví dụ Request

```json
POST /api/v1/cart/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 5,
  "quantity": 2
}
```

### Lỗi có thể xảy ra

- **404 Not Found:** Sản phẩm không tồn tại
- **400 Bad Request:** 
  - Sản phẩm đã hết hàng
  - Sản phẩm đã ngừng kinh doanh
  - Số lượng không đủ
  - Validation fail (quantity < 1)

---

## 3. Cập nhật số lượng sản phẩm

### Thông tin Endpoint

- **URL:** `PUT /api/v1/cart/items/{itemId}`
- **Authentication:** Required (CUSTOMER)
- **Content-Type:** `application/json`

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| itemId | Integer | Yes | ID của cart item cần cập nhật |

### Request Body

```json
{
  "quantity": 3
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| quantity | Integer | Yes | Số lượng mới (phải >= 1) |

### Response

**Status Code:** `200 OK`

Trả về CartDto với thông tin đã được cập nhật.

### Logic xử lý

1. **Kiểm tra cart item tồn tại:** Nếu không tìm thấy → 404 Not Found
2. **Kiểm tra quyền:** Cart item phải thuộc về giỏ hàng của customer hiện tại
3. **Kiểm tra tồn kho:** Nếu `stockQuantity < newQuantity` → Lỗi "Số lượng sản phẩm không đủ"
4. **Cập nhật quantity:** Cập nhật số lượng mới

---

## 4. Xóa sản phẩm khỏi giỏ hàng

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/cart/items/{itemId}`
- **Authentication:** Required (CUSTOMER)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| itemId | Integer | Yes | ID của cart item cần xóa |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
  "data": {
    "idCart": 1,
    "cartItems": [...],
    "totalAmount": 30000000,
    "totalItems": 1
  }
}
```

### Logic xử lý

1. **Kiểm tra cart item tồn tại:** Nếu không tìm thấy → 404 Not Found
2. **Kiểm tra quyền:** Cart item phải thuộc về giỏ hàng của customer hiện tại
3. **Xóa item:** Xóa cart item khỏi database

---

## 5. Xóa toàn bộ giỏ hàng

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/cart`
- **Authentication:** Required (CUSTOMER)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa giỏ hàng thành công",
  "data": null
}
```

### Logic xử lý

- Xóa tất cả cart items trong giỏ hàng
- Giỏ hàng vẫn tồn tại, chỉ xóa các items

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Lấy giỏ hàng

**Request:**
- Method: `GET`
- URL: `{{base_url}}/cart`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.cartItems && jsonData.data.cartItems.length > 0) {
        pm.environment.set("cart_item_id", jsonData.data.cartItems[0].idCartItem);
        console.log("Cart Item ID saved:", jsonData.data.cartItems[0].idCartItem);
    }
}
```

### Bước 2: Test Thêm sản phẩm vào giỏ hàng

**Request:**
- Method: `POST`
- URL: `{{base_url}}/cart/items`
- Headers:
  - `Authorization: Bearer {{customer_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    console.log("Total amount:", jsonData.data.totalAmount);
    console.log("Total items:", jsonData.data.totalItems);
}
```

### Bước 3: Test Cập nhật số lượng

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/cart/items/{{cart_item_id}}`
- Headers:
  - `Authorization: Bearer {{customer_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "quantity": 5
}
```

### Bước 4: Test Xóa sản phẩm khỏi giỏ hàng

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/cart/items/{{cart_item_id}}`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

### Bước 5: Test Xóa toàn bộ giỏ hàng

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/cart`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

---

## Error Handling

- **400 Bad Request:** 
  - Validation fail (quantity < 1)
  - Sản phẩm đã hết hàng
  - Sản phẩm đã ngừng kinh doanh
  - Số lượng không đủ
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không phải CUSTOMER role
- **404 Not Found:** 
  - Sản phẩm không tồn tại
  - Cart item không tồn tại

---

## Logic xử lý chi tiết

### 1. Auto-create Cart

Khi customer lần đầu truy cập giỏ hàng hoặc thêm sản phẩm:
- Hệ thống kiểm tra xem customer đã có giỏ hàng chưa
- Nếu chưa có → Tự động tạo giỏ hàng mới
- Nếu đã có → Sử dụng giỏ hàng hiện tại

### 2. Validate Stock

Trước khi thêm/cập nhật sản phẩm:
- Kiểm tra `product.stockQuantity >= quantity`
- Nếu không đủ → Trả về lỗi với số lượng còn lại

### 3. Validate Product Status

- `IN_STOCK`: Cho phép thêm vào giỏ
- `OUT_OF_STOCK`: Không cho phép thêm
- `DISCONTINUED`: Không cho phép thêm

### 4. Tính tổng tiền

- `subtotal` = `quantity × productPrice` (tính từ giá hiện tại)
- `totalAmount` = Tổng tất cả subtotals
- `totalItems` = Tổng số lượng (tổng quantity của tất cả items)

### 5. Merge duplicate products

Khi thêm sản phẩm đã có trong giỏ:
- Không tạo item mới
- Cộng quantity mới vào quantity hiện tại
- Đảm bảo không vượt quá stock

---

## Tips và Best Practices

1. **Luôn kiểm tra stock trước checkout:** Stock có thể thay đổi giữa lúc thêm vào giỏ và checkout
2. **Hiển thị giá động:** Giá trong giỏ hàng là giá hiện tại, có thể thay đổi khi admin cập nhật
3. **Xử lý hết hàng:** Khi sản phẩm hết hàng, cần thông báo cho customer và đề xuất xóa khỏi giỏ
4. **Persistent cart:** Giỏ hàng được lưu trong database, không mất khi đăng xuất

---

## Common Issues

### Issue: Lỗi "Số lượng sản phẩm không đủ" khi thêm vào giỏ

**Nguyên nhân:** 
- Stock đã thay đổi sau khi customer xem sản phẩm
- Nhiều customer cùng thêm sản phẩm cuối cùng

**Giải pháp:**
- Hiển thị số lượng còn lại cho customer
- Đề xuất giảm số lượng hoặc xóa khỏi giỏ

### Issue: Sản phẩm không thể thêm vào giỏ

**Nguyên nhân:**
- Sản phẩm đã hết hàng (OUT_OF_STOCK)
- Sản phẩm đã ngừng kinh doanh (DISCONTINUED)

**Giải pháp:**
- Kiểm tra trạng thái sản phẩm trước khi hiển thị nút "Thêm vào giỏ"
- Thông báo rõ ràng lý do không thể thêm

---

## Liên hệ

Nếu có thắc mắc về Cart Module, vui lòng liên hệ team Backend.





