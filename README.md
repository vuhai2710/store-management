# 🛍️ Store Management System

Hệ thống ERP quản lý cửa hàng bán điện tử với các tính năng: Quản lý sản phẩm, đơn hàng, khách hàng, nhân viên, kho, tài chính, tích hợp thanh toán PayOS và vận chuyển GHN.

## 🎯 Tổng Quan

- ✅ **Quản lý sản phẩm** - CRUD sản phẩm, nhiều ảnh, mã SKU tự động
- ✅ **Quản lý đơn hàng** - Đặt hàng, thanh toán online/COD, tracking shipment
- ✅ **Quản lý kho** - Nhập hàng, xuất hàng, inventory transactions
- ✅ **Quản lý khách hàng** - Thông tin khách hàng, lịch sử mua hàng
- ✅ **Quản lý nhân viên** - Phân quyền, chấm công, lương
- ✅ **Tích hợp thanh toán** - PayOS Payment Gateway
- ✅ **Tích hợp vận chuyển** - Giao Hàng Nhanh (GHN)
- ✅ **Chat real-time** - WebSocket chat giữa khách hàng và nhân viên
- ✅ **Báo cáo & thống kê** - Doanh thu, sản phẩm bán chạy, tồn kho

## 🛠 Tech Stack

### Backend

- Spring Boot 3.5.5, Java 17, MySQL 8.0
- Spring Security + JWT, WebSocket (STOMP)
- Hibernate/JPA, Flyway, MapStruct, Maven

### Frontend (Admin Panel)

- ReactJS 18, Redux Toolkit, React Router v6
- Ant Design, Axios, Recharts

### Frontend (Customer Site)

- ReactJS 18, CSS3, Material-UI / Ant Design

## ⚙️ Yêu Cầu Hệ Thống

- Java JDK 17+
- MySQL 8.0+
- Node.js 16+ và npm 8+
- Maven 3.8+ (hoặc dùng Maven Wrapper)

## 🚀 Quick Start

### Backend

1. Tạo database `store_management`
2. Copy `application.yaml.example` → `application.yaml`
3. Chỉ thay đổi MySQL password trong `application.yaml` (dòng 51)
4. Chạy từ IntelliJ hoặc terminal: `mvnw spring-boot:run`

**⚠️ QUAN TRỌNG:** Phải mở project từ `backend/store-management` (KHÔNG phải thư mục root) để IntelliJ nhận diện Maven.

Xem chi tiết: [BACKEND_SETUP.md](BACKEND_SETUP.md)

### Frontend Admin Panel (Port 3000)

```bash
cd frontend
npm install
npm start
```

### Frontend Customer (Port 3003)

```bash
cd client-frontend
npm install
npm start
```

Xem chi tiết: [FRONTEND_SETUP.md](FRONTEND_SETUP.md)

## 📍 URLs

- **Frontend (Admin Panel):** http://localhost:3000
- **Backend API:** http://localhost:8080/api/v1
- **Customer Frontend:** http://localhost:3003

## 🔐 Default Login

```
Username: admin
Password: admin123
```

## 📚 API Documentation

Base URL: `http://localhost:8080/api/v1`

- **Auth:** `/api/v1/auth/*`
- **Products:** `/api/v1/products/*`
- **Orders:** `/api/v1/orders/*`
- **Customers:** `/api/v1/customers/*`
- **Users:** `/api/v1/users/*`
- **Inventory:** `/api/v1/inventory-transactions/*`
- **Import Orders:** `/api/v1/import-orders/*`
- **Chat:** `/api/v1/chat/*`

Chi tiết API: Xem các file `*_MODULE.md` trong `backend/store-management/`

## 🏗 Architecture

```
store_management/
├── backend/store-management/    # Spring Boot Application
├── frontend/                     # ReactJS Admin Panel
└── client-frontend/              # ReactJS Customer Site
```

## 🆘 Troubleshooting

**Backend không chạy được:**

- Kiểm tra MySQL đang chạy
- Kiểm tra database `store_management` đã tạo
- Kiểm tra `application.yaml` có đúng credentials

**Frontend không kết nối backend:**

- Kiểm tra backend đang chạy tại `http://localhost:8080`
- Kiểm tra API URL trong code (default: `http://localhost:8080/api/v1`)

Xem chi tiết troubleshooting trong [BACKEND_SETUP.md](BACKEND_SETUP.md) và [FRONTEND_SETUP.md](FRONTEND_SETUP.md)
