# Authentication Module - Hướng dẫn API

## Tổng quan

Module xử lý đăng ký, đăng nhập, đăng xuất. Tất cả endpoints đều **PUBLIC** (không cần authentication).

**Base URL:** `/api/v1/auth`

---

## Danh sách Endpoints

| Method | Endpoint                       | Authentication | Mô tả                                                |
| ------ | ------------------------------ | -------------- | ---------------------------------------------------- |
| POST   | `/api/v1/auth/register`        | Không cần      | Đăng ký tài khoản khách hàng mới                     |
| POST   | `/api/v1/auth/login`           | Không cần      | Đăng nhập vào hệ thống                               |
| POST   | `/api/v1/auth/logout`          | Không cần      | Đăng xuất khỏi hệ thống                              |
| POST   | `/api/v1/auth/forgot-password` | Không cần      | **MỚI** - Quên mật khẩu (gửi mật khẩu mới qua email) |

---

## 1. Đăng ký tài khoản

### Thông tin Endpoint

- **URL:** `POST /api/v1/auth/register`
- **Authentication:** Không cần
- **Content-Type:** `application/json`

### Request Body

```json
{
  "username": "string (required, min 4 chars)",
  "password": "string (required, min 4 chars)",
  "email": "string (required, valid email format)",
  "customerName": "string (required)",
  "phoneNumber": "string (required, valid phone format)",
  "address": "string (optional)"
}
```

### Ví dụ Request

```json
{
  "username": "customer1",
  "password": "123456",
  "email": "customer1@example.com",
  "customerName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

### Response

**Status Code:** `201 Created`

```json
{
  "code": 201,
  "message": "Đăng ký thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "authenticated": true
  }
}
```

### Lưu ý

- Sau khi đăng ký thành công, token sẽ được trả về trong response
- Token này có thể sử dụng ngay để gọi các API khác
- Username phải có ít nhất 4 ký tự
- Password phải có ít nhất 4 ký tự
- Email phải đúng định dạng email
- Phone phải đúng định dạng số điện thoại

---

## 2. Đăng nhập

### Thông tin Endpoint

- **URL:** `POST /api/v1/auth/login`
- **Authentication:** Không cần
- **Content-Type:** `application/json`

### Request Body

```json
{
  "username": "string (required, min 4 chars)",
  "password": "string (required, min 4 chars)"
}
```

### Ví dụ Request

```json
{
  "username": "admin",
  "password": "123456"
}
```

### Response

**Status Code:** `200 OK`

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

### Lưu ý

- **QUAN TRỌNG:** Sau khi đăng nhập thành công, cần lưu token và sử dụng trong header cho tất cả các request sau:
  ```
  Authorization: Bearer {token}
  ```
- Token có thời hạn 24 giờ (86400000 milliseconds)
- Token chứa thông tin về user và role
- Nếu đăng nhập sai username/password, sẽ trả về lỗi 401 Unauthorized

---

## 3. Đăng xuất

### Thông tin Endpoint

- **URL:** `POST /api/v1/auth/logout`
- **Authentication:** Không cần
- **Content-Type:** `application/json`

### Request Body

Không cần (có thể gửi body rỗng)

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Đăng xuất thành công",
  "data": null
}
```

### Lưu ý

- Với JWT stateless, logout chủ yếu xử lý ở phía client
- Frontend cần **xóa token khỏi storage** (localStorage/sessionStorage) sau khi gọi endpoint này
- Token vẫn còn hiệu lực cho đến khi hết hạn, nhưng client không còn sử dụng nữa

---

## Hướng dẫn Test bằng Postman

### Bước 1: Cấu hình Environment

1. Tạo Environment mới trong Postman: `Store Management Local`
2. Thêm biến:
   - `base_url`: `http://localhost:8080/api/v1`
   - `token`: (để trống, sẽ được set sau khi login)

### Bước 2: Test Đăng ký

**Request:**

- Method: `POST`
- URL: `{{base_url}}/auth/register`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "username": "customer1",
  "password": "123456",
  "email": "customer1@example.com",
  "customerName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "address": "123 Đường ABC"
}
```

**Test Script (tự động lưu token):**

```javascript
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.token) {
    pm.environment.set("token", jsonData.data.token);
    console.log("Token saved:", jsonData.data.token);
    console.log("Authenticated:", jsonData.data.authenticated);
  }
}
```

### Bước 3: Test Đăng nhập

**Request:**

- Method: `POST`
- URL: `{{base_url}}/auth/login`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "username": "admin",
  "password": "123456"
}
```

**Test Script (tự động lưu token):**

```javascript
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.token) {
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("admin_token", jsonData.data.token); // Nếu login admin
    console.log("Token saved:", jsonData.data.token);
    console.log("Authenticated:", jsonData.data.authenticated);
  }
}
```

### Bước 4: Test Đăng xuất

**Request:**

- Method: `POST`
- URL: `{{base_url}}/auth/logout`
- Headers: (không cần)

**Test Script (xóa token):**

```javascript
if (pm.response.code === 200) {
  pm.environment.set("token", "");
  console.log("Logged out, token cleared");
}
```

---

## Error Handling

### 400 Bad Request

Khi validation fail (thiếu field, format sai):

```json
{
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "username": "Tên đăng nhập phải có ít nhất 4 ký tự",
    "email": "Email không đúng định dạng"
  }
}
```

### 401 Unauthorized

Khi đăng nhập sai username/password:

```json
{
  "code": 401,
  "message": "Tên đăng nhập hoặc mật khẩu không đúng"
}
```

### 409 Conflict

Khi username hoặc email đã tồn tại:

```json
{
  "code": 409,
  "message": "Username đã tồn tại"
}
```

---

## Tips và Best Practices

1. **Lưu token an toàn:** Lưu token trong localStorage hoặc sessionStorage, không hardcode trong code
2. **Refresh token:** Nếu có refresh token, sử dụng để renew token trước khi hết hạn
3. **Error handling:** Luôn kiểm tra response code và xử lý lỗi phù hợp
4. **Logout cleanup:** Khi logout, xóa tất cả data liên quan đến user (token, user info, etc.)
5. **Token expiration:** Xử lý trường hợp token hết hạn (401), tự động redirect về trang login

---

## Ví dụ Flow hoàn chỉnh

1. **Đăng ký tài khoản mới:**

   - POST `/api/v1/auth/register`
   - Lưu token từ response
   - Sử dụng token cho các request sau

2. **Đăng nhập:**

   - POST `/api/v1/auth/login`
   - Lưu token từ response
   - Redirect đến trang dashboard

3. **Sử dụng token:**

   - Thêm header: `Authorization: Bearer {token}`
   - Gọi các API khác

4. **Đăng xuất:**
   - POST `/api/v1/auth/logout`
   - Xóa token khỏi storage
   - Redirect về trang login

---

## 4. Quên mật khẩu

### Thông tin Endpoint

- **URL:** `POST /api/v1/auth/forgot-password`
- **Authentication:** Không cần
- **Content-Type:** `application/json`

### Request Body

```json
{
  "email": "string (required, valid email format)"
}
```

### Ví dụ Request

```json
{
  "email": "customer1@example.com"
}
```

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Mật khẩu mới đã được gửi đến email: customer1@example.com",
  "data": null
}
```

### Flow xử lý

1. **Nhập email**: User nhập email đã đăng ký
2. **Tìm tài khoản**: Hệ thống tìm user theo email
3. **Generate password**: Tạo mật khẩu ngẫu nhiên (10 ký tự: chữ + số)
4. **Update database**: Hash và lưu mật khẩu mới vào DB
5. **Gửi email**: Gửi email chứa mật khẩu mới cho user
6. **Return success**: Trả về thông báo thành công

### Email nhận được

User sẽ nhận được email với nội dung:

- **Tiêu đề**: "Khôi phục mật khẩu - Store Management System"
- **Nội dung**: Mật khẩu mới (10 ký tự random)
- **Hướng dẫn**: Đăng nhập và đổi mật khẩu ngay

### Lưu ý

⚠️ **Quan trọng**:

- Mật khẩu mới là **ngẫu nhiên** và chỉ gửi 1 lần
- Nên **đổi mật khẩu ngay** sau khi đăng nhập
- Email có thể mất **vài giây** để đến hộp thư
- Kiểm tra cả **hộp thư spam/junk** nếu không thấy email

### Error Responses

**404 Not Found - Không tìm thấy tài khoản**:

```json
{
  "code": 404,
  "message": "Không tìm thấy tài khoản với email: wrong@example.com"
}
```

**500 Internal Server Error - Lỗi gửi email**:

```json
{
  "code": 500,
  "message": "Không thể gửi email. Vui lòng thử lại sau."
}
```

---

## Liên hệ

Nếu có thắc mắc về Authentication Module, vui lòng liên hệ team Backend.
