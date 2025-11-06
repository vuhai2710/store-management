# Order Module - Hướng dẫn API

## Tổng quan

Module quản lý đơn hàng (Order). Phân quyền:
- **ADMIN, EMPLOYEE:** Có thể xem tất cả đơn hàng, xuất PDF hóa đơn
- **CUSTOMER:** Chỉ có thể xem và quản lý đơn hàng của chính mình

**Base URL:** `/api/v1/orders`

**Authentication:** Required
```
Authorization: Bearer {JWT_TOKEN}
```

**Đặc điểm:**
- Đơn hàng được tạo từ giỏ hàng (checkout) hoặc trực tiếp từ sản phẩm (Buy Now)
- Admin/Employee có thể tạo đơn hàng cho khách hàng không có tài khoản (walk-in customers)
- Thông tin sản phẩm được snapshot tại thời điểm mua để đảm bảo tính nhất quán
- Địa chỉ giao hàng được snapshot để không bị ảnh hưởng nếu địa chỉ bị xóa
- Hỗ trợ hủy đơn hàng (chỉ khi status = PENDING)

---

## Danh sách Endpoints

| Method | Endpoint | Authentication | Mô tả |
|--------|----------|----------------|-------|
| GET | `/api/v1/orders/{id}` | ADMIN, EMPLOYEE | Xem chi tiết đơn hàng |
| GET | `/api/v1/orders/{id}/pdf` | ADMIN, EMPLOYEE | Xuất PDF hóa đơn |
| POST | `/api/v1/orders/checkout` | CUSTOMER | Tạo đơn hàng từ giỏ hàng (checkout) |
| POST | `/api/v1/orders/buy-now` | CUSTOMER | Tạo đơn hàng trực tiếp từ sản phẩm (Buy Now) |
| POST | `/api/v1/orders/create-for-customer` | ADMIN, EMPLOYEE | Tạo đơn hàng cho khách hàng (có thể không có tài khoản) |
| GET | `/api/v1/orders/my-orders` | CUSTOMER | Lấy danh sách đơn hàng của tôi |
| GET | `/api/v1/orders/my-orders/{orderId}` | CUSTOMER | Xem chi tiết đơn hàng của tôi |
| PUT | `/api/v1/orders/my-orders/{orderId}/cancel` | CUSTOMER | Hủy đơn hàng |

---

## 1. Admin/Employee: Xem chi tiết đơn hàng

### Thông tin Endpoint

- **URL:** `GET /api/v1/orders/{id}`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của đơn hàng |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy thông tin đơn hàng thành công",
  "data": {
    "idOrder": 1,
    "idCustomer": 1,
    "customerName": "Nguyễn Văn A",
    "customerAddress": "123 Đường ABC",
    "customerPhone": "0912345678",
    "idEmployee": null,
    "employeeName": null,
    "orderDate": "2025-01-01T10:00:00",
    "status": "PENDING",
    "totalAmount": 50000000,
    "discount": 0,
    "finalAmount": 50000000,
    "paymentMethod": "CASH",
    "notes": null,
    "idShippingAddress": 1,
    "shippingAddressSnapshot": "Nguyễn Văn A, 123 Đường ABC, Phường XYZ, 0912345678",
    "orderDetails": [
      {
        "idOrderDetail": 1,
        "idProduct": 5,
        "productName": "iPhone 15 Pro",
        "productCode": "SP001",
        "sku": "IP15PRO-001",
        "productNameSnapshot": "iPhone 15 Pro",
        "productCodeSnapshot": "SP001",
        "productImageSnapshot": "/uploads/products/iphone15pro.jpg",
        "quantity": 2,
        "price": 25000000,
        "subtotal": 50000000
      }
    ]
  }
}
```

---

## 2. Admin/Employee: Xuất PDF hóa đơn

### Thông tin Endpoint

- **URL:** `GET /api/v1/orders/{id}/pdf`
- **Authentication:** Required (ADMIN, EMPLOYEE)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| id | Integer | Yes | ID của đơn hàng |

### Response

**Status Code:** `200 OK`
**Content-Type:** `application/pdf`

File PDF hóa đơn sẽ được download tự động.

---

## 3. Customer: Tạo đơn hàng từ giỏ hàng (Checkout)

### Thông tin Endpoint

- **URL:** `POST /api/v1/orders/checkout`
- **Authentication:** Required (CUSTOMER)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "shippingAddressId": 1,
  "paymentMethod": "CASH",
  "notes": "Giao hàng vào buổi sáng"
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| shippingAddressId | Integer | No | ID địa chỉ giao hàng (nếu không có thì dùng default hoặc customer.address) |
| paymentMethod | String | Yes | Phương thức thanh toán: CASH, TRANSFER, ZALOPAY |
| notes | String | No | Ghi chú đơn hàng |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Đặt hàng thành công",
  "data": {
    "idOrder": 1,
    "idCustomer": 1,
    "orderDate": "2025-01-01T10:00:00",
    "status": "PENDING",
    "totalAmount": 50000000,
    "paymentMethod": "CASH",
    "orderDetails": [...]
  }
}
```

### Logic xử lý chi tiết

1. **Kiểm tra giỏ hàng:**
   - Lấy giỏ hàng của customer
   - Kiểm tra giỏ hàng không rỗng
   - Nếu rỗng → Lỗi "Giỏ hàng trống"

2. **Validate sản phẩm:**
   - Với mỗi sản phẩm trong giỏ:
     - Kiểm tra trạng thái: Không cho phép `OUT_OF_STOCK` hoặc `DISCONTINUED`
     - Kiểm tra tồn kho: `stockQuantity >= quantity`
     - Nếu không đủ → Lỗi với số lượng còn lại

3. **Xử lý địa chỉ giao hàng:**
   - Nếu có `shippingAddressId` → Sử dụng địa chỉ đó
   - Nếu không có → Tìm địa chỉ mặc định
   - Nếu không có địa chỉ mặc định → Sử dụng địa chỉ trong customer profile
   - Tạo snapshot của địa chỉ để lưu vào order

4. **Tính tổng tiền:**
   - Tính tổng từ giá hiện tại của sản phẩm
   - `totalAmount = sum(quantity × price)`

5. **Tạo đơn hàng:**
   - Tạo order với status = PENDING
   - Lưu shipping address và snapshot

6. **Tạo order details với snapshot:**
   - Với mỗi sản phẩm trong giỏ:
     - Lấy thông tin hiện tại (name, code, image, price)
     - Lưu snapshot vào OrderDetail:
       - `productNameSnapshot`
       - `productCodeSnapshot`
       - `productImageSnapshot`
       - `price` (giá tại thời điểm mua)

7. **Cập nhật tồn kho:**
   - Trừ số lượng từ `product.stockQuantity`
   - Nếu `stockQuantity = 0` → Cập nhật status = OUT_OF_STOCK
   - Tạo InventoryTransaction (OUT) để ghi lại lịch sử

8. **Xóa giỏ hàng:**
   - Xóa tất cả items trong giỏ sau khi tạo order thành công

### Snapshot Protection

**Tại sao cần snapshot?**
- Khi admin chỉnh sửa thông tin sản phẩm (tên, giá, ảnh), đơn hàng đã đặt vẫn giữ nguyên thông tin tại thời điểm mua
- Đảm bảo tính nhất quán của lịch sử đơn hàng
- Khách hàng xem lại đơn hàng sẽ thấy đúng sản phẩm và giá đã mua

### Ví dụ Request

```json
POST /api/v1/orders/checkout
Authorization: Bearer {customer_token}
Content-Type: application/json

{
  "shippingAddressId": 1,
  "paymentMethod": "CASH",
  "notes": "Giao hàng vào buổi sáng"
}
```

### Lỗi có thể xảy ra

- **400 Bad Request:**
  - Giỏ hàng trống
  - Sản phẩm không còn khả dụng
  - Số lượng không đủ
  - Validation fail
- **404 Not Found:**
  - Địa chỉ giao hàng không tồn tại
  - Khách hàng không tồn tại

---

## 4. Customer: Tạo đơn hàng trực tiếp từ sản phẩm (Buy Now)

### Thông tin Endpoint

- **URL:** `POST /api/v1/orders/buy-now`
- **Authentication:** Required (CUSTOMER)
- **Content-Type:** `application/json`

### Request Body

```json
{
  "productId": 5,
  "quantity": 2,
  "shippingAddressId": 1,
  "paymentMethod": "CASH",
  "notes": "Giao hàng vào buổi sáng"
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| productId | Integer | Yes | ID của sản phẩm cần mua |
| quantity | Integer | Yes | Số lượng (phải >= 1) |
| shippingAddressId | Integer | No | ID địa chỉ giao hàng (nếu không có thì dùng default hoặc customer.address) |
| paymentMethod | String | Yes | Phương thức thanh toán: CASH, TRANSFER, ZALOPAY |
| notes | String | No | Ghi chú đơn hàng |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Đặt hàng thành công",
  "data": {
    "idOrder": 1,
    "idCustomer": 1,
    "orderDate": "2025-01-01T10:00:00",
    "status": "PENDING",
    "totalAmount": 50000000,
    "paymentMethod": "CASH",
    "orderDetails": [
      {
        "idOrderDetail": 1,
        "idProduct": 5,
        "productName": "iPhone 15 Pro",
        "quantity": 2,
        "price": 25000000,
        "subtotal": 50000000
      }
    ]
  }
}
```

### Logic xử lý chi tiết

1. **Kiểm tra customer tồn tại:** Lấy customerId từ JWT token
2. **Validate sản phẩm:**
   - Kiểm tra sản phẩm tồn tại
   - Kiểm tra trạng thái: Không cho phép `OUT_OF_STOCK` hoặc `DISCONTINUED`
   - Kiểm tra tồn kho: `stockQuantity >= quantity`
3. **Xử lý địa chỉ giao hàng:**
   - Nếu có `shippingAddressId` → Sử dụng địa chỉ đó
   - Nếu không có → Tìm địa chỉ mặc định
   - Nếu không có địa chỉ mặc định → Sử dụng địa chỉ trong customer profile
   - Tạo snapshot của địa chỉ để lưu vào order
4. **Tính tổng tiền:**
   - `totalAmount = quantity × price`
5. **Tạo đơn hàng:**
   - Tạo order với status = PENDING
   - Lưu shipping address và snapshot
6. **Tạo order detail với snapshot:**
   - Lấy thông tin hiện tại (name, code, image, price)
   - Lưu snapshot vào OrderDetail
7. **Cập nhật tồn kho:**
   - Trừ số lượng từ `product.stockQuantity`
   - Nếu `stockQuantity = 0` → Cập nhật status = OUT_OF_STOCK
   - Tạo InventoryTransaction (OUT) để ghi lại lịch sử
8. **Lưu ý:** Không xóa giỏ hàng vì không sử dụng giỏ hàng

### Ví dụ Request

```json
POST /api/v1/orders/buy-now
Authorization: Bearer {customer_token}
Content-Type: application/json

{
  "productId": 5,
  "quantity": 2,
  "shippingAddressId": 1,
  "paymentMethod": "CASH",
  "notes": "Giao hàng vào buổi sáng"
}
```

### Lỗi có thể xảy ra

- **400 Bad Request:**
  - Sản phẩm không còn khả dụng
  - Số lượng không đủ
  - Validation fail
- **404 Not Found:**
  - Sản phẩm không tồn tại
  - Địa chỉ giao hàng không tồn tại
  - Khách hàng không tồn tại

---

## 5. Admin/Employee: Tạo đơn hàng cho khách hàng (Walk-in Customers)

### Thông tin Endpoint

- **URL:** `POST /api/v1/orders/create-for-customer`
- **Authentication:** Required (ADMIN, EMPLOYEE)
- **Content-Type:** `application/json`

### Request Body

**Trường hợp 1: Tạo đơn cho khách hàng có sẵn (có customerId)**

```json
{
  "customerId": 1,
  "orderItems": [
    {
      "productId": 5,
      "quantity": 2
    },
    {
      "productId": 10,
      "quantity": 1
    }
  ],
  "paymentMethod": "CASH",
  "discount": 100000,
  "notes": "Khách hàng VIP"
}
```

**Trường hợp 2: Tạo đơn cho khách hàng mới (không có tài khoản)**

```json
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0912345678",
  "customerAddress": "123 Đường ABC, Quận XYZ",
  "orderItems": [
    {
      "productId": 5,
      "quantity": 2
    }
  ],
  "paymentMethod": "CASH",
  "discount": 0,
  "notes": "Khách hàng mua trực tiếp tại cửa hàng"
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| customerId | Integer | No | ID của khách hàng (nếu có sẵn). Nếu null thì tạo customer mới |
| customerName | String | Yes* | Tên khách hàng (required nếu customerId null) |
| customerPhone | String | Yes* | Số điện thoại khách hàng (required nếu customerId null) |
| customerAddress | String | No | Địa chỉ khách hàng (optional) |
| orderItems | Array | Yes | Danh sách sản phẩm trong đơn hàng |
| orderItems[].productId | Integer | Yes | ID của sản phẩm |
| orderItems[].quantity | Integer | Yes | Số lượng (phải >= 1) |
| paymentMethod | String | Yes | Phương thức thanh toán: CASH, TRANSFER, ZALOPAY |
| discount | Decimal | No | Giảm giá (mặc định 0, không được lớn hơn totalAmount) |
| notes | String | No | Ghi chú đơn hàng |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "idOrder": 1,
    "idCustomer": 1,
    "idEmployee": 1,
    "employeeName": "Nguyễn Văn B",
    "orderDate": "2025-01-01T10:00:00",
    "status": "PENDING",
    "totalAmount": 50000000,
    "discount": 100000,
    "finalAmount": 49900000,
    "paymentMethod": "CASH",
    "orderDetails": [...]
  }
}
```

### Logic xử lý chi tiết

1. **Xử lý Customer:**
   - Nếu có `customerId` → Sử dụng customer có sẵn
   - Nếu không có `customerId`:
     - Kiểm tra customer đã tồn tại với số điện thoại chưa
     - Nếu chưa tồn tại → Tạo Customer mới không có User (walk-in customer)
     - Nếu đã tồn tại → Sử dụng customer hiện tại
2. **Lấy Employee:**
   - Lấy employeeId từ JWT token (người tạo đơn)
3. **Validate sản phẩm:**
   - Với mỗi sản phẩm trong danh sách:
     - Kiểm tra sản phẩm tồn tại
     - Kiểm tra trạng thái: Không cho phép `OUT_OF_STOCK` hoặc `DISCONTINUED`
     - Kiểm tra tồn kho: `stockQuantity >= quantity`
4. **Tính tổng tiền:**
   - `totalAmount = sum(quantity × price)` cho tất cả sản phẩm
   - Áp dụng discount: `finalAmount = totalAmount - discount` (không được âm)
5. **Tạo đơn hàng:**
   - Tạo order với status = PENDING
   - Set employee (người tạo đơn)
   - Set customer (có thể là customer mới hoặc có sẵn)
   - Tạo shipping address snapshot từ customer info
6. **Tạo order details với snapshot:**
   - Với mỗi sản phẩm trong danh sách:
     - Lấy thông tin hiện tại (name, code, image, price)
     - Lưu snapshot vào OrderDetail
     - Trừ số lượng từ `product.stockQuantity`
     - Cập nhật product status nếu hết hàng
7. **Cập nhật tồn kho:**
   - Trừ số lượng từ `product.stockQuantity`
   - Nếu `stockQuantity = 0` → Cập nhật status = OUT_OF_STOCK
   - Tạo InventoryTransaction (OUT) để ghi lại lịch sử

### Walk-in Customers

**Khách hàng không có tài khoản (Walk-in customers):**
- Được tạo với `id_user = NULL` (không có User account)
- Vẫn có thể theo dõi lịch sử mua hàng qua Customer record
- Có thể tìm kiếm theo số điện thoại
- Nếu khách hàng quay lại với cùng số điện thoại, hệ thống sẽ sử dụng customer hiện tại

### Ví dụ Request

**Tạo đơn cho khách hàng mới:**

```json
POST /api/v1/orders/create-for-customer
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0912345678",
  "customerAddress": "123 Đường ABC",
  "orderItems": [
    {
      "productId": 5,
      "quantity": 2
    }
  ],
  "paymentMethod": "CASH",
  "discount": 0,
  "notes": "Khách hàng mua trực tiếp"
}
```

**Tạo đơn cho khách hàng có sẵn:**

```json
POST /api/v1/orders/create-for-customer
Authorization: Bearer {employee_token}
Content-Type: application/json

{
  "customerId": 1,
  "orderItems": [
    {
      "productId": 5,
      "quantity": 2
    }
  ],
  "paymentMethod": "CASH",
  "discount": 100000,
  "notes": "Khách hàng VIP"
}
```

### Lỗi có thể xảy ra

- **400 Bad Request:**
  - Sản phẩm không còn khả dụng
  - Số lượng không đủ
  - Tên khách hàng hoặc số điện thoại trống (khi tạo customer mới)
  - Discount lớn hơn totalAmount
  - Validation fail
- **404 Not Found:**
  - Sản phẩm không tồn tại
  - Customer không tồn tại (nếu có customerId)
  - Employee không tồn tại

---

## 6. Customer: Lấy danh sách đơn hàng của tôi

### Thông tin Endpoint

- **URL:** `GET /api/v1/orders/my-orders`
- **Authentication:** Required (CUSTOMER)

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng item mỗi trang |
| sortBy | String | No | "orderDate" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp (ASC/DESC) |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": {
    "content": [
      {
        "idOrder": 1,
        "orderDate": "2025-01-01T10:00:00",
        "status": "PENDING",
        "totalAmount": 50000000,
        "finalAmount": 50000000,
        "paymentMethod": "CASH"
      }
    ],
    "pageNo": 1,
    "pageSize": 10,
    "totalElements": 5,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true
  }
}
```

### Logic xử lý

- Chỉ lấy đơn hàng của customer hiện tại (từ JWT token)
- Sắp xếp mặc định theo `orderDate DESC` (mới nhất trước)

---

## 7. Customer: Xem chi tiết đơn hàng của tôi

### Thông tin Endpoint

- **URL:** `GET /api/v1/orders/my-orders/{orderId}`
- **Authentication:** Required (CUSTOMER)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| orderId | Integer | Yes | ID của đơn hàng |

### Response

**Status Code:** `200 OK`

Trả về OrderDto đầy đủ với order details (giống như endpoint admin nhưng chỉ lấy đơn hàng của customer).

### Logic xử lý

1. **Kiểm tra đơn hàng tồn tại:** Nếu không tìm thấy → 404 Not Found
2. **Kiểm tra quyền:** Đơn hàng phải thuộc về customer hiện tại
3. **Trả về chi tiết:** Bao gồm order details với snapshot fields

### Lỗi có thể xảy ra

- **400 Bad Request:** Không có quyền xem đơn hàng này
- **404 Not Found:** Đơn hàng không tồn tại

---

## 8. Customer: Hủy đơn hàng

### Thông tin Endpoint

- **URL:** `PUT /api/v1/orders/my-orders/{orderId}/cancel`
- **Authentication:** Required (CUSTOMER)

### Path Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| orderId | Integer | Yes | ID của đơn hàng cần hủy |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Hủy đơn hàng thành công",
  "data": {
    "idOrder": 1,
    "status": "CANCELED",
    /* ... các field khác */
  }
}
```

### Logic xử lý chi tiết

1. **Kiểm tra đơn hàng tồn tại:** Nếu không tìm thấy → 404 Not Found
2. **Kiểm tra quyền:** Đơn hàng phải thuộc về customer hiện tại
3. **Kiểm tra trạng thái:**
   - Chỉ cho phép hủy khi `status = PENDING`
   - Nếu đã CONFIRMED, COMPLETED → Không cho phép hủy
4. **Hoàn trả hàng vào kho:**
   - Với mỗi sản phẩm trong order:
     - Cộng lại số lượng vào `product.stockQuantity`
     - Nếu `stockQuantity > 0` và status = OUT_OF_STOCK → Cập nhật status = IN_STOCK
     - Tạo InventoryTransaction (IN) để ghi lại lịch sử hoàn trả
5. **Cập nhật trạng thái:** Đặt `status = CANCELED`

### Lưu ý

- **Chỉ hủy được khi PENDING:** Đơn hàng đã được xác nhận hoặc hoàn thành không thể hủy
- **Hoàn trả tự động:** Hàng được tự động hoàn trả vào kho
- **Ghi lại lịch sử:** Tạo inventory transaction để theo dõi

### Ví dụ Request

```
PUT /api/v1/orders/my-orders/1/cancel
Authorization: Bearer {customer_token}
```

### Lỗi có thể xảy ra

- **400 Bad Request:**
  - Chỉ có thể hủy đơn hàng ở trạng thái PENDING
  - Không có quyền hủy đơn hàng này
- **404 Not Found:** Đơn hàng không tồn tại

---

## Order Status

| Status | Mô tả |
|--------|-------|
| PENDING | Đơn hàng đang chờ xử lý (có thể hủy) |
| CONFIRMED | Đơn hàng đã được xác nhận |
| COMPLETED | Đơn hàng đã hoàn thành |
| CANCELED | Đơn hàng đã bị hủy |

---

## Payment Method

| Method | Mô tả |
|--------|-------|
| CASH | Thanh toán bằng tiền mặt |
| TRANSFER | Chuyển khoản |
| ZALOPAY | Thanh toán qua ZaloPay |

---

## Hướng dẫn Test bằng Postman

### Bước 1: Test Checkout (Customer)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/orders/checkout`
- Headers:
  - `Authorization: Bearer {{customer_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "shippingAddressId": 1,
  "paymentMethod": "CASH",
  "notes": "Giao hàng vào buổi sáng"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.idOrder) {
        pm.environment.set("order_id", jsonData.data.idOrder);
        console.log("Order ID saved:", jsonData.data.idOrder);
    }
}
```

### Bước 2: Test Lấy danh sách đơn hàng của tôi (Customer)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/orders/my-orders?pageNo=1&pageSize=10&sortBy=orderDate&sortDirection=DESC`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

### Bước 3: Test Xem chi tiết đơn hàng của tôi (Customer)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/orders/my-orders/{{order_id}}`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

### Bước 4: Test Hủy đơn hàng (Customer)

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/orders/my-orders/{{order_id}}/cancel`
- Headers:
  - `Authorization: Bearer {{customer_token}}`

**Lưu ý:** Chỉ hủy được khi status = PENDING

### Bước 5: Test Xem chi tiết đơn hàng (Admin/Employee)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/orders/{{order_id}}`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

### Bước 6: Test Xuất PDF hóa đơn (Admin/Employee)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/orders/{{order_id}}/pdf`
- Headers:
  - `Authorization: Bearer {{admin_token}}`

**Lưu ý:** Response sẽ là file PDF, không phải JSON

---

## Error Handling

- **400 Bad Request:**
  - Giỏ hàng trống
  - Sản phẩm không còn khả dụng
  - Số lượng không đủ
  - Chỉ có thể hủy đơn hàng ở trạng thái PENDING
  - Validation fail
- **401 Unauthorized:** Không có token hoặc token không hợp lệ
- **403 Forbidden:** Không đủ quyền
- **404 Not Found:**
  - Đơn hàng không tồn tại
  - Địa chỉ giao hàng không tồn tại
  - Không có quyền xem đơn hàng này

---

## Logic xử lý chi tiết

### 1. Snapshot Protection

**Vấn đề:** Khi admin chỉnh sửa sản phẩm (tên, giá, ảnh), đơn hàng đã đặt bị ảnh hưởng.

**Giải pháp:** Snapshot tất cả thông tin sản phẩm tại thời điểm mua:
- `productNameSnapshot`: Tên sản phẩm tại thời điểm mua
- `productCodeSnapshot`: Mã sản phẩm tại thời điểm mua
- `productImageSnapshot`: URL ảnh tại thời điểm mua
- `price`: Giá tại thời điểm mua (đã có sẵn)

**Khi hiển thị:**
- Ưu tiên dùng snapshot fields
- Nếu không có snapshot (đơn hàng cũ) → Fallback về product hiện tại

### 2. Shipping Address Snapshot

**Vấn đề:** Địa chỉ giao hàng có thể bị xóa sau khi đặt hàng.

**Giải pháp:** Lưu snapshot của địa chỉ vào order:
- `shippingAddressSnapshot`: Text chứa đầy đủ thông tin địa chỉ
- Vẫn giữ reference đến `ShippingAddress` để có thể trace

**Khi hiển thị:**
- Ưu tiên dùng `shippingAddressSnapshot`
- Nếu không có → Fallback về `ShippingAddress` hoặc customer address

### 3. Inventory Management

**Khi checkout:**
- Trừ số lượng từ `product.stockQuantity`
- Tạo InventoryTransaction (OUT) để ghi lại
- Cập nhật product status nếu hết hàng

**Khi hủy đơn:**
- Cộng lại số lượng vào `product.stockQuantity`
- Tạo InventoryTransaction (IN) để ghi lại hoàn trả
- Cập nhật product status nếu có hàng lại

### 4. Transaction Management

- Checkout là một transaction:
  - Nếu bất kỳ bước nào fail → Rollback toàn bộ
  - Đảm bảo tính nhất quán dữ liệu

---

## Tips và Best Practices

1. **Snapshot là quan trọng:** Đảm bảo snapshot được lưu đầy đủ để bảo vệ lịch sử đơn hàng
2. **Kiểm tra stock trước checkout:** Stock có thể thay đổi, cần validate lại
3. **Hủy đơn hàng:** Chỉ cho phép hủy khi PENDING để tránh rối loạn
4. **Inventory tracking:** Luôn tạo inventory transaction để theo dõi
5. **UI/UX:** 
   - Hiển thị rõ trạng thái đơn hàng
   - Cho phép customer hủy đơn dễ dàng (nếu PENDING)
   - Hiển thị thông tin snapshot để customer biết đã mua gì

---

## Common Issues

### Issue: Không thể hủy đơn hàng

**Nguyên nhân:** Đơn hàng không ở trạng thái PENDING

**Giải pháp:**
- Kiểm tra status của đơn hàng
- Chỉ cho phép hủy khi PENDING

### Issue: Sản phẩm trong đơn hàng thay đổi

**Nguyên nhân:** Admin chỉnh sửa sản phẩm

**Giải pháp:**
- Snapshot đã được lưu, sử dụng snapshot fields khi hiển thị
- Đảm bảo mapper ưu tiên snapshot

### Issue: Địa chỉ giao hàng không hiển thị

**Nguyên nhân:** Địa chỉ đã bị xóa

**Giải pháp:**
- Sử dụng `shippingAddressSnapshot` để hiển thị
- Đảm bảo snapshot được lưu khi checkout

---

## Liên hệ

Nếu có thắc mắc về Order Module, vui lòng liên hệ team Backend.





