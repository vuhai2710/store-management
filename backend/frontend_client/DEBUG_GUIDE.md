# Hướng dẫn Debug - Gợi ý sản phẩm không hiển thị

## Kiểm tra nhanh

### 1. Mở Browser Console (F12)
Kiểm tra xem có lỗi nào không:
- Lỗi CORS
- Lỗi 401 (Unauthorized)
- Lỗi 404 (Not Found)
- Lỗi Network

### 2. Kiểm tra Network Tab
- Mở tab Network trong DevTools
- Tìm request đến `/api/v1/products/recommendations/home`
- Kiểm tra:
  - Status code (200 = OK, 401 = Unauthorized, 404 = Not Found)
  - Response data
  - Request headers (có Authorization token không?)

### 3. Kiểm tra Backend
- Backend có đang chạy trên port 8080 không?
- API endpoint có hoạt động không?
  - Test: http://localhost:8080/api/v1/products/recommendations/home?limit=10

### 4. Kiểm tra Authentication
- User có đăng nhập không?
- Token có được lưu trong localStorage không?
  - Mở Console, gõ: `localStorage.getItem('token')` hoặc `localStorage.getItem('accessToken')`

## Các lỗi thường gặp

### Lỗi 401 Unauthorized
**Nguyên nhân**: User chưa đăng nhập hoặc token không hợp lệ

**Giải pháp**:
1. Đăng nhập vào hệ thống
2. Kiểm tra token có trong localStorage không
3. Nếu backend yêu cầu authentication, cần đăng nhập trước

### Lỗi CORS
**Nguyên nhân**: Backend chưa cấu hình CORS

**Giải pháp**: Thêm vào `application.yaml`:
```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3003"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
```

### Không có sản phẩm trả về
**Nguyên nhân**: 
- Database không có sản phẩm với status = IN_STOCK
- Python script lỗi

**Giải pháp**:
1. Kiểm tra database có sản phẩm không
2. Kiểm tra log backend
3. Kiểm tra Python script có chạy được không

### Component không render
**Nguyên nhân**: 
- `recommendations.length === 0` và không có error
- Component return null

**Giải pháp**: Đã cập nhật code để hiển thị empty state

## Test API trực tiếp

### Với Postman hoặc curl:

```bash
# Test API (cần token)
curl -X GET "http://localhost:8080/api/v1/products/recommendations/home?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test không cần token (nếu backend cho phép):

```bash
curl -X GET "http://localhost:8080/api/v1/products/recommendations/home?limit=10"
```

## Console Logs

Component đã được thêm console.log để debug:
- `Fetching recommendations...` - Bắt đầu fetch
- `Recommendations received:` - Data nhận được
- `Error loading recommendations:` - Lỗi xảy ra

Kiểm tra console để xem log chi tiết.

