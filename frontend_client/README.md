# 🛍️ Customer Frontend

Frontend dành cho khách hàng mua sắm online.

## ✅ Prerequisites

- **Node.js 16+** và **npm 8+**
- **Git**

## 🚀 Quick Start

```bash
cd frontend_client
npm install
npm start
```

Frontend sẽ tự động mở tại `http://localhost:3003`

## ⚙️ Cấu Hình

**⚠️ QUAN TRỌNG:** Frontend đã có default API URL là `http://localhost:8080/api/v1`, nên **KHÔNG CẦN** tạo file `.env` nếu backend chạy ở `localhost:8080`.

### Khi nào cần tạo .env?

Chỉ cần tạo file `.env` nếu:

- Backend chạy ở port khác (không phải 8080)
- Backend chạy ở server khác (không phải localhost)

### Cách tạo .env (nếu cần)

Tạo file `frontend_client/.env` với nội dung:

```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

Restart frontend sau khi thay đổi.

## 🆘 Troubleshooting

### "npm install" bị lỗi

```bash
cd frontend_client
rm -rf node_modules package-lock.json  # Linux/Mac
rmdir /s /q node_modules & del package-lock.json  # Windows
npm cache clean --force
npm install
```

### "Port 3003 already in use"

```bash
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3003
kill -9 <PID>
```

Hoặc chạy ở port khác: `PORT=3004 npm start`

### "Network Error" hoặc "Cannot connect to backend"

1. Kiểm tra backend đang chạy: `http://localhost:8080/api/v1`
2. Kiểm tra API URL trong code
3. Kiểm tra file `.env` (nếu có)
4. Restart frontend sau khi thay đổi

### "Module not found"

```bash
cd frontend_client
rm -rf node_modules package-lock.json
npm install
```

## 📚 Build Production

```bash
npm run build
```

File build sẽ được tạo trong thư mục `frontend_client/build/`

## 🎯 Quick Reference

### URLs

- **Customer Frontend:** http://localhost:3003
- **Backend API:** http://localhost:8080/api/v1

### Common Commands

```bash
npm install    # Install dependencies
npm start      # Start development server
npm run build  # Build for production
npm test       # Run tests
```

## ✅ Checklist Sau Khi Setup

- [ ] Node.js và npm đã cài đặt
- [ ] Dependencies đã được install
- [ ] Frontend chạy được (`npm start`)
- [ ] Backend đang chạy tại `http://localhost:8080`
- [ ] Frontend kết nối được với backend

## 📋 Tính Năng

- **Trang chủ**: Hiển thị sản phẩm nổi bật
- **Danh mục sản phẩm**: Duyệt và tìm kiếm sản phẩm
- **Chi tiết sản phẩm**: Xem thông tin chi tiết sản phẩm
- **Giỏ hàng**: Thêm, xóa, cập nhật sản phẩm trong giỏ hàng
- **Thanh toán**: Đặt hàng và thanh toán
- **Tài khoản**: Đăng ký, đăng nhập, quản lý tài khoản
- **Wishlist**: Lưu sản phẩm yêu thích

## 🛠 Tech Stack

- **React 18**: Framework chính
- **Material-UI / Ant Design**: UI Component Library
- **CSS3**: Styling
- **Axios**: HTTP Client
