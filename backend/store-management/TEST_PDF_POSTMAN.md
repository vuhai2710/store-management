# Hướng dẫn Test PDF trên Postman

## 📋 Tổng quan

Hệ thống hiện có 2 loại PDF:
1. **Phiếu nhập hàng** (ImportOrder PDF) - ✅ Đã có
2. **Hóa đơn bán hàng** (Order PDF) - ⏳ Cần tạo

---

## 🧪 Test Phiếu Nhập Hàng PDF

### Bước 1: Lấy JWT Token

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Trong Postman:**
1. Method: `POST`
2. URL: `http://localhost:8080/api/v1/auth/login`
3. Headers:
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "username": "admin",
     "password": "password123"
   }
   ```
5. Copy token từ response

---

### Bước 2: Tạo đơn nhập hàng (nếu chưa có)

**Endpoint:** `POST /api/v1/import-orders`

**Trong Postman:**
1. Method: `POST`
2. URL: `http://localhost:8080/api/v1/import-orders`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {token}` (thay {token} bằng token từ bước 1)
4. Body (raw JSON):
   ```json
   {
     "idSupplier": 1,
     "importOrderDetails": [
       {
         "idProduct": 1,
         "quantity": 10,
         "importPrice": 5000000
       },
       {
         "idProduct": 2,
         "quantity": 5,
         "importPrice": 8000000
       }
     ]
   }
   ```
5. Ghi lại `idImportOrder` từ response (ví dụ: `1`)

---

### Bước 3: Xuất PDF phiếu nhập hàng

**Endpoint:** `GET /api/v1/import-orders/{id}/pdf`

**Trong Postman:**

#### Cách 1: Xem PDF trực tiếp trong Postman

1. Method: `GET`
2. URL: `http://localhost:8080/api/v1/import-orders/1/pdf`
   - Thay `1` bằng `idImportOrder` từ bước 2
3. Headers:
   - `Authorization: Bearer {token}`
4. Click **Send**
5. Postman sẽ tự động nhận diện PDF và hiển thị trong tab **Preview**

#### Cách 2: Download PDF

1. Sau khi click Send, click vào tab **Body**
2. Click nút **Save Response** (hoặc **Save as file**)
3. Chọn nơi lưu file
4. File sẽ được lưu với tên: `phieu-nhap-hang-1.pdf`

---

### Cách 3: Test với cURL (nếu cần)

```bash
curl -X GET "http://localhost:8080/api/v1/import-orders/1/pdf" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --output phieu-nhap-hang.pdf
```

---

## 📝 Chi tiết Request/Response

### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Headers
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="phieu-nhap-hang-1.pdf"
```

### Response Body
- Binary PDF data (không phải JSON)
- Kích thước: ~10-50 KB (tùy số lượng sản phẩm)

---

## ✅ Checklist Test

- [ ] Đã login và lấy được JWT token
- [ ] Đã tạo đơn nhập hàng thành công
- [ ] Gọi endpoint PDF với đúng `idImportOrder`
- [ ] Response status = `200 OK`
- [ ] Response có header `Content-Type: application/pdf`
- [ ] PDF có thể xem được trong Postman Preview
- [ ] PDF có thể download và mở được bằng PDF reader
- [ ] Nội dung PDF đúng (thông tin nhà cung cấp, sản phẩm, tổng tiền)

---

## 🐛 Troubleshooting

### Lỗi 401 Unauthorized
**Nguyên nhân:** Token hết hạn hoặc không hợp lệ
**Giải pháp:** Login lại để lấy token mới

### Lỗi 404 Not Found
**Nguyên nhân:** `idImportOrder` không tồn tại
**Giải pháp:** Kiểm tra lại ID đơn nhập hàng

### Lỗi 403 Forbidden
**Nguyên nhân:** User không có quyền (phải là ADMIN hoặc EMPLOYEE)
**Giải pháp:** Sử dụng tài khoản có quyền

### PDF không hiển thị trong Postman
**Nguyên nhân:** Postman có thể không tự động nhận diện PDF
**Giải pháp:** 
1. Click vào tab **Body** → chọn **Preview**
2. Hoặc click **Save Response** để download

### PDF bị lỗi hoặc không mở được
**Nguyên nhân:** 
- Server error khi tạo PDF
- Dependency thiếu (iText7)
**Giải pháp:**
1. Kiểm tra server logs
2. Đảm bảo đã compile: `mvn clean compile`
3. Kiểm tra dependency trong `pom.xml`

---

## 📊 Nội dung PDF Phiếu Nhập Hàng

PDF sẽ bao gồm:

1. **Header:**
   - Tiêu đề: "PHIẾU NHẬP HÀNG"
   - Mã đơn: #PO-{id}
   - Ngày nhập: dd/MM/yyyy HH:mm

2. **Thông tin nhà cung cấp:**
   - Tên nhà cung cấp
   - Địa chỉ
   - Số điện thoại
   - Email

3. **Thông tin nhân viên:**
   - Nhân viên tạo đơn

4. **Bảng chi tiết sản phẩm:**
   - STT
   - Tên sản phẩm
   - Mã sản phẩm
   - Số lượng
   - Đơn giá
   - Thành tiền

5. **Tổng tiền:**
   - Tổng tiền đơn nhập hàng

6. **Footer:**
   - Ngày xuất PDF
   - Ghi chú hệ thống

---

## 🎯 Test Cases

### Test Case 1: PDF với đơn nhập hàng có 1 sản phẩm
- Tạo đơn với 1 sản phẩm
- Xuất PDF
- ✅ Kiểm tra: PDF có 1 dòng sản phẩm

### Test Case 2: PDF với đơn nhập hàng có nhiều sản phẩm
- Tạo đơn với 5+ sản phẩm
- Xuất PDF
- ✅ Kiểm tra: PDF có đủ số dòng sản phẩm

### Test Case 3: PDF với đơn nhập hàng có giá trị lớn
- Tạo đơn với số tiền lớn (ví dụ: 100,000,000 đ)
- Xuất PDF
- ✅ Kiểm tra: Format tiền tệ đúng (dấu phẩy phân cách)

### Test Case 4: PDF với nhà cung cấp không có đầy đủ thông tin
- Tạo đơn với nhà cung cấp thiếu email/phone
- Xuất PDF
- ✅ Kiểm tra: PDF vẫn hiển thị được, các trường thiếu hiển thị rỗng

---

## 📸 Screenshots Postman Setup

### Setup Request:
```
Method: GET
URL: http://localhost:8080/api/v1/import-orders/1/pdf
Headers:
  Authorization: Bearer {token}
```

### Expected Response:
```
Status: 200 OK
Headers:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="phieu-nhap-hang-1.pdf"
Body: [Binary PDF data]
```

---

## 🧪 Test Hóa Đơn Bán Hàng PDF

### Endpoint
```
GET /api/v1/orders/{id}/pdf
```

### Trong Postman:

1. Method: `GET`
2. URL: `http://localhost:8080/api/v1/orders/1/pdf`
   - Thay `1` bằng `idOrder` thực tế
3. Headers:
   - `Authorization: Bearer {token}`
4. Click **Send**
5. Xem PDF trong tab **Preview** hoặc **Save Response**

### Response:
- Status: `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="hoa-don-{id}.pdf"`
- Body: PDF file

---

## 📝 Nội dung PDF Hóa Đơn Bán Hàng

PDF sẽ bao gồm:

1. **Header:**
   - Tiêu đề: "HÓA ĐƠN BÁN HÀNG"
   - Mã đơn: #HD-{id}
   - Ngày bán: dd/MM/yyyy HH:mm

2. **Thông tin khách hàng:**
   - Tên khách hàng
   - Địa chỉ
   - Số điện thoại

3. **Thông tin nhân viên:**
   - Nhân viên bán hàng

4. **Bảng chi tiết sản phẩm:**
   - STT
   - Tên sản phẩm
   - Mã sản phẩm
   - Số lượng
   - Đơn giá
   - Thành tiền

5. **Tổng tiền:**
   - Tổng tiền
   - Giảm giá (nếu có)
   - Thành tiền cuối cùng
   - Phương thức thanh toán

6. **Ghi chú** (nếu có)

7. **Footer:**
   - Ngày xuất PDF
   - Ghi chú hệ thống

---

## 📋 Checklist Test Hóa Đơn

- [ ] Đã có đơn hàng (Order) trong database
- [ ] Đã login và lấy được JWT token
- [ ] Gọi endpoint PDF với đúng `idOrder`
- [ ] Response status = `200 OK`
- [ ] Response có header `Content-Type: application/pdf`
- [ ] PDF có thể xem được trong Postman Preview
- [ ] PDF có thể download và mở được bằng PDF reader
- [ ] Nội dung PDF đúng (thông tin khách hàng, sản phẩm, tổng tiền)
- [ ] Hiển thị đúng giảm giá và phương thức thanh toán (nếu có)

---

## 💡 Tips

1. **Lưu Collection:** Tạo Postman Collection để lưu lại các request
2. **Environment Variables:** Tạo environment với:
   - `base_url`: `http://localhost:8080`
   - `token`: JWT token (auto update sau khi login)
3. **Pre-request Script:** Tự động lấy token trước khi gọi API
4. **Test Script:** Tự động kiểm tra response status và content type

---

**Version:** 1.0  
**Last Updated:** 2025-01-01

