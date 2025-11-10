# 🎨 Frontend - Admin Panel

Hệ thống ERP hoàn chỉnh được xây dựng bằng ReactJS để quản lý toàn diện cửa hàng điện tử.

## ✅ Prerequisites

- **Node.js 16+** và **npm 8+**
- **Git**

## 🚀 Quick Start

```bash
cd frontend_admin
npm install
npm start
```

Frontend sẽ tự động mở tại `http://localhost:3000`

## 🔐 Default Login Credentials

```
Username: admin
Password: admin123
```

## ⚙️ Cấu Hình

**⚠️ QUAN TRỌNG:** Frontend đã có default API URL là `http://localhost:8080/api/v1`, nên **KHÔNG CẦN** tạo file `.env` nếu backend chạy ở `localhost:8080`.

### Khi nào cần tạo .env?

Chỉ cần tạo file `.env` nếu:

- Backend chạy ở port khác (không phải 8080)
- Backend chạy ở server khác (không phải localhost)

### Cách tạo .env (nếu cần)

Tạo file `frontend_admin/.env` với nội dung:

```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

Restart frontend sau khi thay đổi.

## 🆘 Troubleshooting

### "npm install" bị lỗi

```bash
cd frontend_admin
rm -rf node_modules package-lock.json  # Linux/Mac
rmdir /s /q node_modules & del package-lock.json  # Windows
npm cache clean --force
npm install
```

### "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

Hoặc chạy ở port khác: `PORT=3001 npm start`

### "Network Error" hoặc "Cannot connect to backend"

1. Kiểm tra backend đang chạy: `http://localhost:8080/api/v1`
2. Kiểm tra API URL trong code: `frontend_admin/src/services/api.js`
3. Kiểm tra file `.env` (nếu có)
4. Restart frontend sau khi thay đổi

### "Module not found"

```bash
cd frontend_admin
rm -rf node_modules package-lock.json
npm install
```

### Frontend chạy nhưng không hiển thị gì

1. Mở Developer Tools (F12) → Xem tab Console và Network
2. Kiểm tra backend đang chạy tại `http://localhost:8080`
3. Clear browser cache: Ctrl+Shift+Delete

## 📚 Build Production

```bash
npm run build
```

File build sẽ được tạo trong thư mục `frontend_admin/build/`

## 🎯 Quick Reference

### URLs

- **Admin Panel:** http://localhost:3000
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
- [ ] Có thể login với `admin` / `admin123`

## 📋 Tính Năng

- **Quản lý Đơn hàng**: Dashboard, CRUD đơn hàng, theo dõi trạng thái
- **Quản lý Sản phẩm**: CRUD sản phẩm, upload hình ảnh, quản lý tồn kho
- **Quản lý Khách hàng**: Thông tin khách hàng, lịch sử mua hàng
- **Quản lý Kho**: Tồn kho, nhà cung cấp, kho hàng
- **Quản lý Nhân viên**: Thông tin nhân viên, phân quyền
- **Quản lý Tài chính**: Doanh thu, chi phí, bảng lương
- **Báo cáo**: Thống kê, biểu đồ, xuất báo cáo

## 🛠 Tech Stack

- **React 18**: Framework chính
- **Ant Design**: UI Component Library
- **Redux Toolkit**: State Management
- **React Router**: Routing
- **Recharts**: Biểu đồ thống kê
- **Axios**: HTTP Client

## 📁 Cấu trúc dự án

```
src/
├── components/          # Components tái sử dụng
│   ├── common/         # Components chung
│   ├── layout/         # Layout components
│   ├── dashboard/      # Dashboard components
│   ├── orders/         # Order management
│   ├── products/       # Product management
│   └── ...
├── pages/              # Page components
├── store/              # Redux store
│   └── slices/         # Redux slices
├── services/           # API services
├── hooks/              # Custom hooks
└── utils/              # Utility functions
```
