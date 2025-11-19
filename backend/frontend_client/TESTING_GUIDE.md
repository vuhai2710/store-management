# 🧪 Hướng dẫn kiểm tra gợi ý sản phẩm

## ✅ Frontend đã chạy thành công!

Frontend đang chạy tại: **http://localhost:3003**

## 🔍 Kiểm tra section gợi ý sản phẩm

### Bước 1: Mở browser
1. Mở http://localhost:3003
2. Scroll xuống để tìm section **"💡 Sản phẩm gợi ý cho bạn"**

### Bước 2: Kiểm tra Browser Console (F12)
1. Mở Developer Tools (F12)
2. Vào tab **Console**
3. Tìm các log:
   - `Fetching recommendations...`
   - `Calling API: /products/recommendations/home?limit=6`
   - `API Response:`
   - `Recommendations received:`

### Bước 3: Kiểm tra Network Tab
1. Vào tab **Network** trong DevTools
2. Refresh trang (F5)
3. Tìm request: `recommendations/home`
4. Kiểm tra:
   - **Status**: 200 = OK, 401 = Unauthorized, 404 = Not Found
   - **Response**: Xem data trả về

## ⚠️ Các trường hợp thường gặp

### Trường hợp 1: Không thấy section gợi ý
**Nguyên nhân có thể:**
- Backend chưa chạy
- API trả về lỗi
- Không có sản phẩm trong database

**Cách kiểm tra:**
1. Kiểm tra Console có lỗi không
2. Kiểm tra Network tab xem API có được gọi không
3. Kiểm tra backend có đang chạy không

### Trường hợp 2: Thấy "Đang tải sản phẩm gợi ý..."
**Nguyên nhân:**
- API đang được gọi nhưng chưa trả về

**Cách xử lý:**
- Đợi vài giây
- Kiểm tra Network tab xem request có hoàn thành không

### Trường hợp 3: Lỗi 401 Unauthorized
**Nguyên nhân:**
- User chưa đăng nhập
- Token không hợp lệ

**Cách xử lý:**
1. Đăng nhập vào hệ thống
2. Kiểm tra localStorage có token không:
   ```javascript
   localStorage.getItem('token')
   // hoặc
   localStorage.getItem('accessToken')
   ```

### Trường hợp 4: Lỗi CORS
**Nguyên nhân:**
- Backend chưa cấu hình CORS cho port 3003

**Cách xử lý:**
- Backend đã có CORS config, nhưng nếu vẫn lỗi, kiểm tra lại SecurityConfig

## 🚀 Đảm bảo Backend chạy

### Kiểm tra backend:
```bash
# Trong terminal khác, chạy:
cd C:\Project1\store-management\backend\store-management
mvn spring-boot:run
```

### Test API trực tiếp:
Mở browser và truy cập:
```
http://localhost:8080/api/v1/products/recommendations/home?limit=6
```

**Lưu ý**: Cần có JWT token trong header nếu API yêu cầu authentication.

## 📝 Checklist

- [ ] Frontend đang chạy trên http://localhost:3003
- [ ] Backend đang chạy trên http://localhost:8080
- [ ] User đã đăng nhập (có token trong localStorage)
- [ ] Database có sản phẩm với status = IN_STOCK
- [ ] Console không có lỗi JavaScript
- [ ] Network tab hiển thị request thành công (status 200)

## 🎯 Kết quả mong đợi

Khi mọi thứ hoạt động đúng, bạn sẽ thấy:
- Section "💡 Sản phẩm gợi ý cho bạn" hiển thị
- Grid layout với các sản phẩm
- Mỗi sản phẩm có: ảnh, tên, giá, button "Thêm vào giỏ"
- Có thể click vào sản phẩm để xem chi tiết

## 🐛 Debug

Nếu vẫn không thấy section:
1. Mở Console (F12) → xem có lỗi gì
2. Mở Network tab → xem API request
3. Kiểm tra response từ API
4. Kiểm tra backend logs

