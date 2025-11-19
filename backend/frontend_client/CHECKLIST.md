# Checklist - Kiểm tra tại sao gợi ý sản phẩm không hiển thị

## ✅ Bước 1: Kiểm tra Browser Console (F12)

1. Mở trang http://localhost:3003
2. Mở Developer Tools (F12)
3. Vào tab **Console**
4. Tìm các log:
   - `Fetching recommendations...`
   - `Calling API: /products/recommendations/home?limit=10`
   - `API Response:`
   - `Recommendations received:`

**Nếu thấy lỗi:**
- `401 Unauthorized` → Cần đăng nhập
- `Network Error` → Backend không chạy hoặc CORS
- `404 Not Found` → API endpoint sai

## ✅ Bước 2: Kiểm tra Network Tab

1. Vào tab **Network** trong DevTools
2. Refresh trang (F5)
3. Tìm request: `recommendations/home`
4. Kiểm tra:
   - **Status**: 200 = OK, 401 = Unauthorized, 404 = Not Found
   - **Response**: Xem data trả về
   - **Headers**: Xem có Authorization token không?

## ✅ Bước 3: Kiểm tra Backend

1. Backend có đang chạy không?
   ```bash
   # Kiểm tra port 8080
   curl http://localhost:8080/api/v1/products/recommendations/home?limit=10
   ```

2. Test API trực tiếp (với token):
   ```bash
   curl -X GET "http://localhost:8080/api/v1/products/recommendations/home?limit=10" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## ✅ Bước 4: Kiểm tra Authentication

1. Mở Console (F12)
2. Gõ: `localStorage.getItem('token')` hoặc `localStorage.getItem('accessToken')`
3. Nếu trả về `null` → User chưa đăng nhập

**Giải pháp**: Đăng nhập vào hệ thống trước

## ✅ Bước 5: Kiểm tra Database

1. Kiểm tra có sản phẩm trong database không:
   ```sql
   SELECT * FROM products WHERE status = 'IN_STOCK' LIMIT 10;
   ```

2. Nếu không có sản phẩm → Thêm sản phẩm vào database

## ✅ Bước 6: Kiểm tra Python Script

1. Test Python script trực tiếp:
   ```bash
   cd backend/store-management
   python product_recommendation_api.py 1 5
   ```

2. Nếu lỗi → Cài đặt dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 🔧 Các lỗi thường gặp và cách sửa

### Lỗi: "Vui lòng đăng nhập để xem sản phẩm gợi ý"
**Nguyên nhân**: User chưa đăng nhập

**Giải pháp**: 
- Đăng nhập vào hệ thống
- Hoặc tạm thời cho phép endpoint không cần authentication (chỉ để test)

### Lỗi: "Không thể kết nối đến server"
**Nguyên nhân**: Backend không chạy

**Giải pháp**: 
- Chạy backend: `mvn spring-boot:run`
- Kiểm tra port 8080 có bị chiếm không

### Lỗi: "Hiện chưa có sản phẩm gợi ý"
**Nguyên nhân**: 
- Database không có sản phẩm
- Tất cả sản phẩm có status khác IN_STOCK

**Giải pháp**: 
- Thêm sản phẩm vào database
- Cập nhật status = 'IN_STOCK'

### Component không hiển thị gì cả
**Nguyên nhân**: Component return null khi không có data

**Giải pháp**: Đã cập nhật code để hiển thị empty state

## 📝 Debug Logs

Component đã được thêm console.log. Kiểm tra console để xem:
- API có được gọi không?
- Response là gì?
- Có lỗi gì không?

## 🚀 Quick Fix

Nếu vẫn không hoạt động, thử:

1. **Restart frontend**:
   ```bash
   # Stop server (Ctrl+C)
   # Start lại
   npm run dev
   ```

2. **Restart backend**:
   ```bash
   # Stop Spring Boot
   # Start lại
   mvn spring-boot:run
   ```

3. **Clear browser cache**: Ctrl+Shift+Delete

4. **Hard refresh**: Ctrl+Shift+R

