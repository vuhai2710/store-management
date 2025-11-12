# Báo cáo Kiểm thử API Integration

## Tổng quan
Báo cáo này kiểm tra việc tích hợp frontend với backend API để đảm bảo logic khớp nhau.

## 1. Pagination - ✅ ĐÚNG

### Backend:
- Nhận `pageNo` là **1-indexed** (default = 1)
- Convert sang 0-indexed: `PageRequest.of(pageNo - 1, pageSize, ...)`
- Trả về `pageNo` từ `page.getNumber()` - **0-indexed**

### Frontend:
- Gửi `pageNo` là **1-indexed** ✅
- Nhận `pageNo` là **0-indexed** từ backend
- Convert sang 1-indexed: `(pageResponse.pageNo || 0) + 1` ✅

**Kết luận:** Logic pagination đúng.

---

## 2. Orders API - ⚠️ CÓ LỖI

### 2.1. Get Orders - ✅ ĐÚNG
- **Endpoint:** `GET /api/v1/orders`
- **Params:** `pageNo`, `pageSize`, `sortBy`, `sortDirection`, `status`, `customerId`
- **Frontend:** `ordersService.getOrders()` - ✅ Đúng

### 2.2. Create Order - ⚠️ SAI FORMAT
- **Backend Endpoint:** `POST /api/v1/orders/create-for-customer`
- **Backend Body Format:**
```json
{
  "idCustomer": 1,
  "orderDetails": [
    {
      "idProduct": 1,
      "quantity": 2,
      "price": 1000000
    }
  ],
  "paymentMethod": "CASH",
  "notes": "Ghi chú"
}
```

- **Frontend (`OrderForm.js`):** Đang gửi:
```javascript
{
  customerId,  // ❌ SAI - phải là idCustomer
  items,       // ❌ SAI - phải là orderDetails
  subtotal,    // ❌ Backend không cần
  vat,         // ❌ Backend không cần
  totalAmount, // ❌ Backend tự tính
  status       // ❌ Backend tự set = PENDING
}
```

**Cần sửa:** `OrderForm.js` phải map đúng format.

### 2.3. Update Order Status - ✅ ĐÚNG
- **Endpoint:** `PUT /api/v1/orders/{id}/status`
- **Body:** `{ "status": "CONFIRMED" }`
- **Frontend:** `ordersService.updateOrderStatus()` - ✅ Đúng

### 2.4. Update Order - ❌ KHÔNG TỒN TẠI
- **Backend:** Không có endpoint `PUT /api/v1/orders/{id}`
- **Frontend:** `OrderForm.js` đang dùng `updateOrder` - ❌ SAI
- **Giải pháp:** Chỉ cho phép tạo mới, không cho phép update trực tiếp

---

## 3. Products API - ✅ ĐÚNG

### 3.1. Get Products - ✅ ĐÚNG
- **Endpoint:** `GET /api/v1/products`
- **Params:** `pageNo`, `pageSize`, `sortBy`, `sortDirection`, `code`, `name`, `categoryId`, `brand`, `minPrice`, `maxPrice`
- **Frontend:** `productsService.getProductsPaginated()` - ✅ Đúng

### 3.2. Create/Update Product - ✅ ĐÚNG
- **Endpoints:** `POST /api/v1/products`, `PUT /api/v1/products/{id}`
- **Body Format:** Đúng với `ProductDto`
- **Frontend:** `productsService.createProduct()`, `productsService.updateProduct()` - ✅ Đúng

### 3.3. Product Images - ✅ ĐÚNG
- **Upload:** `POST /api/v1/products/{id}/images` - ✅
- **Get Images:** `GET /api/v1/products/{id}/images` - ✅
- **Delete Image:** `DELETE /api/v1/products/images/{imageId}` - ✅
- **Set Primary:** `PUT /api/v1/products/images/{imageId}/primary` - ✅

---

## 4. Customers API - ✅ ĐÚNG

### 4.1. Get Customers - ✅ ĐÚNG
- **Endpoint:** `GET /api/v1/customers`
- **Params:** `pageNo`, `pageSize`, `sortBy`, `sortDirection`
- **Frontend:** `customersService.getAllCustomers()` - ✅ Đúng

### 4.2. Search Customers - ✅ ĐÚNG
- **Endpoint:** `GET /api/v1/customers/search`
- **Params:** `name`, `phone`, `pageNo`, `pageSize`, ...
- **Frontend:** `customersService.searchCustomers()` - ✅ Đúng

### 4.3. Create Customer - ✅ ĐÚNG
- **Endpoint:** `POST /api/v1/auth/register`
- **Body:** `{ username, password, email, customerName, phoneNumber, address }`
- **Frontend:** `customersService.createCustomer()` - ✅ Đúng

### 4.4. Update Customer - ✅ ĐÚNG
- **Endpoint:** `PUT /api/v1/customers/{id}`
- **Body:** `{ customerName, phoneNumber, address, customerType }`
- **Frontend:** `customersService.updateCustomer()` - ✅ Đúng

---

## 5. Categories API - ✅ ĐÚNG

### 5.1. Get Categories - ✅ ĐÚNG
- **Endpoint:** `GET /api/v1/categories/all` hoặc `GET /api/v1/categories`
- **Frontend:** `categoriesService.getAll()` - ✅ Đúng

### 5.2. CRUD Operations - ✅ ĐÚNG
- Tất cả endpoints đều đúng format

---

## 6. Import Orders API - ✅ ĐÚNG

### 6.1. Get Import Orders - ✅ ĐÚNG
- **Endpoint:** `GET /api/v1/import-orders`
- **Params:** `pageNo`, `pageSize`, `sortBy`, `sortDirection`
- **Frontend:** `importOrderService.getImportOrders()` - ✅ Đúng

### 6.2. Create Import Order - ✅ ĐÚNG
- **Endpoint:** `POST /api/v1/import-orders`
- **Body:** `{ idSupplier, importOrderDetails: [{ idProduct, quantity, importPrice }] }`
- **Frontend:** `importOrderService.createImportOrder()` - ✅ Đúng

---

## 7. Response Structure - ✅ ĐÚNG

### Backend Response:
```json
{
  "code": 200,
  "message": "Success",
  "data": { ... } // PageResponse hoặc DTO
}
```

### Frontend Interceptor:
- Unwrap `response.data.data` → `response.data` ✅
- Xử lý error messages đúng ✅

---

## 8. Lỗi Phát Hiện

### ❌ LỖI 1: OrderForm.js - Format không đúng
**File:** `frontend_admin/src/components/orders/OrderForm.js`
**Vấn đề:**
- Gửi `customerId` thay vì `idCustomer`
- Gửi `items` thay vì `orderDetails`
- Gửi các field không cần thiết: `subtotal`, `vat`, `totalAmount`, `status`

**Cần sửa:** Map đúng format theo backend API.

### ❌ LỖI 2: OrderForm.js - Dùng updateOrder không tồn tại
**File:** `frontend_admin/src/components/orders/OrderForm.js`
**Vấn đề:**
- Backend không có endpoint `PUT /api/v1/orders/{id}`
- Chỉ có `PUT /api/v1/orders/{id}/status` để update status

**Cần sửa:** Chỉ cho phép tạo mới, không cho phép update trực tiếp.

---

## 9. Khuyến nghị

1. **Sửa OrderForm.js:** Map đúng format request body
2. **Loại bỏ updateOrder:** Chỉ dùng `updateOrderStatus` cho status updates
3. **Thêm validation:** Validate request body trước khi gửi
4. **Thêm error handling:** Hiển thị lỗi validation từ backend rõ ràng hơn

---

## 10. Kết luận

- ✅ **Pagination:** Đúng
- ✅ **Products API:** Đúng
- ✅ **Customers API:** Đúng
- ✅ **Categories API:** Đúng
- ✅ **Import Orders API:** Đúng
- ⚠️ **Orders API:** Có lỗi ở OrderForm.js - cần sửa format request body

