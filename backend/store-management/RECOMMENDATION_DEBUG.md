# Hướng dẫn Debug Recommendations

## Các bước kiểm tra

### 1. Kiểm tra Backend API
Mở browser console và kiểm tra:
- API call: `GET /api/v1/products/recommend`
- Response status: Phải là 200
- Response data: Phải có format `{ code: 200, message: "...", data: [...] }`

### 2. Kiểm tra Python Recommender Service
Đảm bảo Python service đang chạy:
```bash
cd ../recommender_service
uvicorn app:app --reload --port 5000
```

Kiểm tra service hoạt động:
- Mở: http://localhost:5000/
- Phải thấy: `{"message": "Product Recommender Service"}`

### 3. Kiểm tra Database
Đảm bảo:
- Bảng `product_view` đã được tạo (migration V19)
- Có dữ liệu view history trong bảng `product_view`
- User đã đăng nhập và có `user_id` trong JWT token

### 4. Kiểm tra Frontend
Mở browser console (F12) và kiểm tra:
- Log: `Recommended products data: [...]`
- Nếu thấy mảng rỗng `[]`: User chưa có view history
- Nếu thấy error: Kiểm tra network tab để xem API response

### 5. Test thủ công
1. Đăng nhập vào hệ thống
2. Xem một số sản phẩm (click vào product detail)
3. Quay lại trang chủ
4. Section "Gợi ý dành cho bạn" sẽ xuất hiện

## Troubleshooting

### Không thấy section recommendations
- **Nguyên nhân**: User chưa có view history hoặc Python service chưa chạy
- **Giải pháp**: 
  - Xem một số sản phẩm trước
  - Đảm bảo Python service đang chạy
  - Kiểm tra console log để xem error

### API trả về lỗi 500
- **Nguyên nhân**: Python service không chạy hoặc lỗi kết nối
- **Giải pháp**: 
  - Kiểm tra Python service: `http://localhost:5000/`
  - Kiểm tra config trong `application.yaml`: `recommender.base-url`

### API trả về mảng rỗng
- **Nguyên nhân**: User chưa có view history đủ để tạo recommendations
- **Giải pháp**: 
  - Xem nhiều sản phẩm hơn
  - Đợi một chút để hệ thống xử lý

## Test API trực tiếp

### Test Recommendations API
```bash
curl -X GET "http://localhost:8080/api/v1/products/recommend" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Python Service
```bash
curl -X GET "http://localhost:5000/recommend?userId=1"
```

