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

Xem chi tiết hướng dẫn setup tại: **[backend/store-management/README.md](backend/store-management/README.md)**

```bash
cd backend/store-management
# Copy application.yaml.example → application.yaml
# Chỉnh sửa MySQL password trong application.yaml
mvnw spring-boot:run
```

**⚠️ QUAN TRỌNG:** Phải mở project từ `backend/store-management` (KHÔNG phải thư mục root) để IntelliJ nhận diện Maven.

### Frontend Admin Panel (Port 3000)

Xem chi tiết hướng dẫn setup tại: **[frontend_admin/README.md](frontend_admin/README.md)**

```bash
cd frontend_admin
npm install
npm start
```

### Frontend Customer (Port 3003)

Xem chi tiết hướng dẫn setup tại: **[frontend_client/README.md](frontend_client/README.md)**

```bash
cd frontend_client
npm install
npm start
```

## 📍 URLs

- **Frontend (Admin Panel):** http://localhost:3000
- **Backend API:** http://localhost:8080/api/v1
- **Customer Frontend:** http://localhost:3003

## 🔐 Default Login

```
Username: admin
Password: admin123
```

## 🏗 Architecture

```
store_management/
├── backend/store-management/    # Spring Boot Application
│   ├── README.md                # Hướng dẫn setup backend
│   └── ...
├── frontend_admin/              # ReactJS Admin Panel
│   ├── README.md                # Hướng dẫn setup frontend admin
│   └── ...
└── frontend_client/             # ReactJS Customer Site
    ├── README.md                # Hướng dẫn setup frontend customer
    └── ...
```

## 📚 Documentation

### Backend
- Hướng dẫn setup: [backend/store-management/README.md](backend/store-management/README.md)
- API Documentation: Xem các file `*_MODULE.md` trong `backend/store-management/`
- Integration Guides: `PAYOS_INTEGRATION_GUIDE.md`, `GHN_INTEGRATION_GUIDE.md`

### Frontend
- Admin Panel: [frontend_admin/README.md](frontend_admin/README.md)
- Customer Site: [frontend_client/README.md](frontend_client/README.md)

## 🆘 Troubleshooting

**Backend không chạy được:**
- Kiểm tra MySQL đang chạy
- Kiểm tra database `store_management` đã tạo
- Kiểm tra `application.yaml` có đúng credentials
- Xem chi tiết: [backend/store-management/README.md](backend/store-management/README.md#-troubleshooting)

**Frontend không kết nối backend:**
- Kiểm tra backend đang chạy tại `http://localhost:8080`
- Kiểm tra API URL trong code (default: `http://localhost:8080/api/v1`)
- Xem chi tiết: [frontend_admin/README.md](frontend_admin/README.md#-troubleshooting)

## 📝 License

MIT License
