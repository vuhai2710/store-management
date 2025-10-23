# API Testing Guide

## Setup
Đảm bảo backend đang chạy tại: `http://localhost:8080`

## 1. Authentication Tests

### 1.1 Register a New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

### 1.2 Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

**Lưu token để sử dụng cho các request tiếp theo**

## 2. Category Tests

### 2.1 Create Category
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "categoryName": "Điện thoại"
  }'
```

### 2.2 Get All Categories
```bash
curl -X GET http://localhost:8080/api/categories
```

### 2.3 Get Category by ID
```bash
curl -X GET http://localhost:8080/api/categories/1
```

### 2.4 Update Category
```bash
curl -X PUT http://localhost:8080/api/categories/1 \
  -H "Content-Type: application/json" \
  -d '{
    "categoryName": "Smartphone"
  }'
```

### 2.5 Delete Category
```bash
curl -X DELETE http://localhost:8080/api/categories/1
```

## 3. Product Tests

### 3.1 Create Product
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "idCategory": 1,
    "productName": "iPhone 15 Pro Max",
    "description": "Flagship phone from Apple",
    "price": 29990000,
    "stockQuantity": 50,
    "status": "available",
    "imageUrl": "https://example.com/iphone15.jpg"
  }'
```

### 3.2 Get All Products
```bash
curl -X GET http://localhost:8080/api/products
```

### 3.3 Search Products
```bash
curl -X GET "http://localhost:8080/api/products/search?keyword=iPhone"
```

### 3.4 Get Products by Status
```bash
curl -X GET http://localhost:8080/api/products/status/available
```

### 3.5 Get Low Stock Products
```bash
curl -X GET "http://localhost:8080/api/products/low-stock?threshold=10"
```

### 3.6 Update Product Stock
```bash
curl -X PATCH "http://localhost:8080/api/products/1/stock?quantity=20" \
  -H "Content-Type: application/json"
```

### 3.7 Update Product
```bash
curl -X PUT http://localhost:8080/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "idCategory": 1,
    "productName": "iPhone 15 Pro Max 256GB",
    "description": "Flagship phone from Apple - 256GB",
    "price": 31990000,
    "stockQuantity": 45,
    "status": "available",
    "imageUrl": "https://example.com/iphone15.jpg"
  }'
```

## 4. Employee Tests

### 4.1 Create Employee
```bash
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "idUser": 1,
    "employeeName": "Nguyen Van A",
    "hireDate": "2024-01-15",
    "phoneNumber": "0901234567",
    "address": "123 Nguyen Trai, Ha Noi",
    "baseSalary": 15000000
  }'
```

### 4.2 Get All Employees
```bash
curl -X GET http://localhost:8080/api/employees
```

### 4.3 Get Employee by ID
```bash
curl -X GET http://localhost:8080/api/employees/1
```

### 4.4 Update Employee
```bash
curl -X PUT http://localhost:8080/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "employeeName": "Nguyen Van A",
    "hireDate": "2024-01-15",
    "phoneNumber": "0901234567",
    "address": "456 Le Loi, Ha Noi",
    "baseSalary": 18000000
  }'
```

## 5. Customer Tests

### 5.1 Create Customer
```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Tran Thi B",
    "address": "789 Tran Phu, Ha Noi",
    "phoneNumber": "0987654321",
    "customerType": "VIP"
  }'
```

### 5.2 Get All Customers
```bash
curl -X GET http://localhost:8080/api/customers
```

### 5.3 Search Customers
```bash
curl -X GET "http://localhost:8080/api/customers/search?keyword=Tran"
```

### 5.4 Get Customers by Type
```bash
curl -X GET http://localhost:8080/api/customers/type/VIP
```

### 5.5 Update Customer
```bash
curl -X PUT http://localhost:8080/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Tran Thi B",
    "address": "789 Tran Phu, Ha Noi",
    "phoneNumber": "0987654321",
    "customerType": "REGULAR"
  }'
```

## 6. Supplier Tests

### 6.1 Create Supplier
```bash
curl -X POST http://localhost:8080/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "supplierName": "Apple Vietnam",
    "address": "Singapore",
    "phoneNumber": "0281234567",
    "email": "contact@apple.vn"
  }'
```

### 6.2 Get All Suppliers
```bash
curl -X GET http://localhost:8080/api/suppliers
```

### 6.3 Search Suppliers
```bash
curl -X GET "http://localhost:8080/api/suppliers/search?keyword=Apple"
```

### 6.4 Update Supplier
```bash
curl -X PUT http://localhost:8080/api/suppliers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "supplierName": "Apple Vietnam Ltd",
    "address": "Singapore",
    "phoneNumber": "0281234567",
    "email": "contact@apple.vn"
  }'
```

## 7. Dashboard Tests

### 7.1 Get Dashboard Statistics
```bash
curl -X GET http://localhost:8080/api/dashboard/stats
```

Response:
```json
{
  "totalProducts": 100,
  "totalCustomers": 250,
  "totalEmployees": 15,
  "totalOrders": 500,
  "pendingOrders": 20,
  "completedOrders": 450,
  "totalRevenue": 500000000,
  "lowStockProducts": 5
}
```

## Testing with Postman

### Import Collection
1. Mở Postman
2. Import các request từ file này
3. Tạo Environment với biến:
   - `baseUrl`: `http://localhost:8080`
   - `token`: Token nhận được từ login

### Collection Variables
```json
{
  "baseUrl": "http://localhost:8080",
  "token": "Bearer eyJhbGciOiJIUzUxMiJ9..."
}
```

### Authorization
Đối với các endpoint yêu cầu authentication (sẽ implement sau):
- Type: Bearer Token
- Token: `{{token}}`

## Expected Response Codes

- `200 OK` - Request thành công
- `201 Created` - Tạo resource thành công
- `400 Bad Request` - Dữ liệu không hợp lệ
- `404 Not Found` - Resource không tồn tại
- `500 Internal Server Error` - Lỗi server

## Validation Errors

Nếu data không hợp lệ, API trả về error:

```json
{
  "productName": "Tên sản phẩm không được để trống",
  "price": "Giá sản phẩm không được để trống"
}
```

## Notes

1. Database phải được import trước khi test
2. Một số endpoint có thể yêu cầu tạo dữ liệu liên quan trước (ví dụ: Category trước khi tạo Product)
3. ID trong URL thay đổi tùy theo dữ liệu thực tế
4. Tất cả request đều accept JSON và return JSON
5. CORS đã được enable cho localhost:3000
