# Store Management Frontend

Frontend React cho hệ thống quản lý cửa hàng với tính năng gợi ý sản phẩm sử dụng Content-based Filtering.

## Tính năng

- ✅ Trang chủ với sản phẩm gợi ý
- ✅ Hiển thị sản phẩm tương tự trên trang chi tiết
- ✅ Responsive design
- ✅ Tích hợp với backend Spring Boot

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình

Tạo file `.env` (tùy chọn):

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Cấu trúc thư mục

```
frontend_client/
├── src/
│   ├── components/
│   │   ├── ProductRecommendations.jsx
│   │   └── ProductRecommendations.css
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── HomePage.css
│   │   ├── ProductDetailPage.jsx
│   │   └── ProductDetailPage.css
│   ├── services/
│   │   └── productRecommendationService.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## API Endpoints

### Lấy sản phẩm gợi ý cho trang chủ

```
GET /api/v1/products/recommendations/home?limit=10
```

### Lấy sản phẩm tương tự

```
GET /api/v1/products/recommendations/{productId}?topN=5
```

## Yêu cầu

- Node.js >= 16
- npm hoặc yarn
- Backend Spring Boot đang chạy trên port 8080

## Build cho production

```bash
npm run build
```

Files sẽ được build vào thư mục `dist/`.

## Preview production build

```bash
npm run preview
```

## Lưu ý

- Đảm bảo backend đang chạy trước khi chạy frontend
- Nếu backend chạy trên port khác, cập nhật `vite.config.js` hoặc `.env`
- Cần JWT token để gọi API (lưu trong localStorage với key `token` hoặc `accessToken`)

## Troubleshooting

### Lỗi CORS

Nếu gặp lỗi CORS, đảm bảo backend đã cấu hình CORS đúng cách.

### Không hiển thị sản phẩm

- Kiểm tra console browser để xem lỗi
- Kiểm tra Network tab để xem API response
- Đảm bảo user đã đăng nhập (có JWT token)

### Lỗi 401 Unauthorized

- Kiểm tra token có hợp lệ không
- Kiểm tra token có được lưu trong localStorage không

