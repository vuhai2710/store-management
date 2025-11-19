# QUICK START - HIỂN THỊ GỢI Ý SẢN PHẨM TRÊN TRANG CHỦ

## ⚡ Các bước nhanh

### Bước 1: Copy component vào frontend

Copy file `HomePageRecommendations.jsx` vào thư mục `src/components/` của frontend project.

### Bước 2: Import và sử dụng trong trang chủ

Trong file trang chủ của bạn (ví dụ: `HomePage.jsx`, `App.jsx`):

```jsx
import HomePageRecommendations from './components/HomePageRecommendations';

function HomePage() {
  return (
    <div>
      {/* Các component khác */}
      
      {/* Thêm dòng này */}
      <HomePageRecommendations />
      
      {/* Các component khác */}
    </div>
  );
}
```

### Bước 3: Đảm bảo backend đang chạy

```bash
# Chạy Spring Boot backend
mvn spring-boot:run
# hoặc
./mvnw spring-boot:run
```

### Bước 4: Kiểm tra API hoạt động

Mở browser và test API:
```
http://localhost:8080/api/v1/products/recommendations/home?limit=10
```

**Lưu ý**: Cần có JWT token trong header Authorization.

### Bước 5: Cấu hình CORS (nếu cần)

Nếu frontend chạy trên port khác (ví dụ: 3000), thêm vào `application.yaml`:

```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
```

## ✅ Kiểm tra

1. Backend đang chạy trên port 8080
2. Frontend đang chạy và có thể gọi API
3. User đã đăng nhập (có JWT token)
4. Database có sản phẩm với status = IN_STOCK

## 🐛 Troubleshooting

### Không hiển thị sản phẩm
- Kiểm tra console browser có lỗi không
- Kiểm tra Network tab xem API có được gọi không
- Kiểm tra response từ API

### Lỗi CORS
- Thêm cấu hình CORS vào backend (xem Bước 5)

### Lỗi 401 Unauthorized
- Kiểm tra token có hợp lệ không
- Kiểm tra token có được gửi trong header không

### Lỗi 500 Internal Server Error
- Kiểm tra Python script có chạy được không
- Kiểm tra log backend để xem lỗi chi tiết

## 📝 Tùy chỉnh

Bạn có thể tùy chỉnh:
- Số lượng sản phẩm: Thay đổi `limit` trong component
- Styling: Thêm CSS vào component
- Layout: Thay đổi grid layout

## 📚 Tài liệu chi tiết

Xem file `frontend-integration-guide.md` để biết thêm chi tiết.


