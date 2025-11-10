# 🛍️ Store Management System - Hệ Thống Quản Lý Cửa Hàng Điện Tử

Hệ thống ERP quản lý cửa hàng bán điện tử với các tính năng: Quản lý sản phẩm, đơn hàng, khách hàng, nhân viên, kho, tài chính, tích hợp thanh toán PayOS và vận chuyển GHN.

---

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Tech Stack](#-tech-stack)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [Cấu Hình Environment Variables](#-cấu-hình-environment-variables)
- [API Documentation](#-api-documentation)
- [Tính Năng Chính](#-tính-năng-chính)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Tổng Quan

Store Management System là một hệ thống ERP (Enterprise Resource Planning) toàn diện được xây dựng để quản lý hoạt động kinh doanh của cửa hàng điện tử. Hệ thống hỗ trợ:

- ✅ **Quản lý sản phẩm** - CRUD sản phẩm, nhiều ảnh, mã SKU tự động
- ✅ **Quản lý đơn hàng** - Đặt hàng, thanh toán online/COD, tracking shipment
- ✅ **Quản lý kho** - Nhập hàng, xuất hàng, inventory transactions
- ✅ **Quản lý khách hàng** - Thông tin khách hàng, lịch sử mua hàng
- ✅ **Quản lý nhân viên** - Phân quyền, chấm công, lương
- ✅ **Tích hợp thanh toán** - PayOS Payment Gateway
- ✅ **Tích hợp vận chuyển** - Giao Hàng Nhanh (GHN)
- ✅ **Chat real-time** - WebSocket chat giữa khách hàng và nhân viên
- ✅ **Báo cáo & thống kê** - Doanh thu, sản phẩm bán chạy, tồn kho

---

## 🛠 Tech Stack

### Backend
- **Framework:** Spring Boot 3.5.5
- **Language:** Java 17
- **Database:** MySQL 8.0
- **ORM:** Hibernate / JPA
- **Migration:** Flyway
- **Security:** Spring Security + JWT
- **Real-time:** WebSocket (STOMP)
- **File Upload:** Multipart File Handling
- **Mapping:** MapStruct
- **Build Tool:** Maven

### Frontend (Admin Panel)
- **Framework:** ReactJS 18
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **UI Library:** Ant Design
- **HTTP Client:** Axios
- **Charts:** Recharts / Chart.js

### Frontend (Customer Site)
- **Framework:** ReactJS 18
- **Styling:** CSS3, Material-UI / Ant Design

---

## ⚙️ Yêu Cầu Hệ Thống

### Development
- **Java JDK:** 17 hoặc cao hơn
- **Maven:** 3.8+ (hoặc dùng Maven Wrapper đã có sẵn)
- **MySQL:** 8.0+
- **Node.js:** 16+ và npm 8+
- **IDE:** IntelliJ IDEA (khuyến nghị) hoặc Eclipse/VS Code
- **Git:** 2.30+

### Production
- **Server:** Linux (Ubuntu 20.04+) hoặc Windows Server
- **Memory:** Tối thiểu 2GB RAM (khuyến nghị 4GB+)
- **Storage:** 10GB+ (tùy vào số lượng ảnh/file upload)

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Database Setup

#### Bước 1: Cài đặt MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Windows: Download từ https://dev.mysql.com/downloads/installer/

# MacOS
brew install mysql
```

#### Bước 2: Khởi động MySQL
```bash
# Linux
sudo systemctl start mysql
sudo systemctl enable mysql

# Windows: MySQL service sẽ tự động chạy
# MacOS
brew services start mysql
```

#### Bước 3: Tạo Database
```bash
# Login vào MySQL
mysql -u root -p

# Trong MySQL console
CREATE DATABASE store_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# (Optional) Tạo user riêng thay vì dùng root
CREATE USER 'storeapp'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON store_management.* TO 'storeapp'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

#### Bước 4: Import Initial Data (Optional)
Database schema sẽ được tự động tạo bởi Flyway khi chạy backend lần đầu. Nếu muốn import dữ liệu mẫu:

```bash
mysql -u root -p store_management < backend/init_database.sql
```

---

### 2. Backend Setup

#### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd store_management
```

#### Bước 2: Mở Project trong IntelliJ IDEA
1. Mở IntelliJ IDEA
2. Chọn `File` → `Open`
3. Navigate đến thư mục `backend/store-management`
4. Click `OK`
5. IntelliJ sẽ tự động detect Maven project và download dependencies

#### Bước 3: Cấu hình Environment
```bash
cd backend/store-management/src/main/resources

# Copy template
cp application-template.yaml application.yaml

# Chỉnh sửa application.yaml (dùng editor hoặc IDE)
```

Cấu hình **TỐI THIỂU** trong `application.yaml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/store_management
    username: root          # MySQL username của bạn
    password: your_password # MySQL password của bạn

jwt:
  secret: "change-this-to-secure-random-string-min-32-chars"
  signerKey: "change-this-signer-key-base64"
```

**Xem chi tiết cấu hình:** [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)

#### Bước 4: Build Project
```bash
cd backend/store-management

# Linux/Mac
./mvnw clean install

# Windows
mvnw.cmd clean install
```

#### Bước 5: Chạy Backend
**Cách 1: Từ IntelliJ IDEA**
1. Mở file `StoreManagementApplication.java`
2. Click vào biểu tượng ▶️ bên cạnh `public class StoreManagementApplication`
3. Chọn `Run 'StoreManagementApplication'`

**Cách 2: Từ Terminal**
```bash
# Linux/Mac
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

---

### 3. Frontend Setup

#### Bước 1: Cấu hình Environment
```bash
cd frontend

# Copy template
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_ENVIRONMENT=development
```

#### Bước 2: Install Dependencies
```bash
npm install
# hoặc
yarn install
```

#### Bước 3: Chạy Frontend
```bash
npm start
# hoặc
yarn start
```

Frontend sẽ chạy tại: `http://localhost:3000`

#### (Optional) Setup Client Frontend
```bash
cd client-frontend
npm install
npm start
```

Client frontend sẽ chạy tại: `http://localhost:3001`

---

## ▶️ Chạy Ứng Dụng

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend/store-management
./mvnw spring-boot:run
```

**Terminal 2 - Admin Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Customer Frontend (Optional):**
```bash
cd client-frontend
npm start
```

### Production Mode

**Backend:**
```bash
cd backend/store-management
./mvnw clean package
java -jar target/store-management-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve build folder bằng nginx hoặc serve
```

---

## 🔐 Cấu Hình Environment Variables

Chi tiết về cấu hình các biến môi trường: **[ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)**

### Các cấu hình quan trọng:
- ✅ **Database Credentials** - Bắt buộc
- ✅ **JWT Secret** - Bắt buộc cho production
- 🔶 **Email (Gmail)** - Optional, cho reset password
- 🔶 **PayOS** - Optional, cho thanh toán online
- 🔶 **GHN** - Optional, cho vận chuyển

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:8080/api/v1
Production: https://your-domain.com/api/v1
```

### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Endpoints
- **Auth:** `/api/v1/auth/*`
- **Products:** `/api/v1/products/*`
- **Orders:** `/api/v1/orders/*`
- **Customers:** `/api/v1/customers/*`
- **Users:** `/api/v1/users/*`
- **Inventory:** `/api/v1/inventory-transactions/*`
- **Import Orders:** `/api/v1/import-orders/*`
- **Chat:** `/api/v1/chat/*`

**Chi tiết API:** Xem các file `*_MODULE.md` trong `backend/store-management/`

---

## ✨ Tính Năng Chính

### 1. Quản Lý Sản Phẩm
- CRUD sản phẩm với validation
- Upload nhiều ảnh (tối đa 5 ảnh/sản phẩm)
- Mã SKU tự động hoặc nhập thủ công
- Quản lý category và supplier
- **Stock quantity chỉ được cập nhật từ inventory transactions** - [Xem chi tiết](backend/store-management/STOCK_MANAGEMENT_GUIDE.md)

### 2. Quản Lý Đơn Hàng
- Đặt hàng từ admin panel hoặc customer site
- Thanh toán: COD, Bank Transfer, PayOS (online)
- Tracking đơn hàng real-time
- Tích hợp GHN shipping
- Xuất PDF hóa đơn

### 3. Quản Lý Kho
- Nhập hàng từ nhà cung cấp (Import Order)
- Tự động cập nhật stock quantity
- Inventory transactions tracking
- Báo cáo tồn kho

### 4. Quản Lý Khách Hàng & Nhân Viên
- Thông tin khách hàng, lịch sử mua hàng
- Phân quyền: ADMIN, EMPLOYEE, CUSTOMER
- Upload avatar
- Change password

### 5. Chat Real-time
- WebSocket chat giữa customer và employee
- Notification khi có tin nhắn mới
- Lịch sử chat

### 6. Báo Cáo & Thống Kê
- Dashboard với charts
- Doanh thu theo thời gian
- Sản phẩm bán chạy
- Tồn kho, nhập/xuất

---

## 🏗 Architecture

```
store_management/
├── backend/
│   └── store-management/          # Spring Boot Application
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/storemanagement/
│       │   │   │       ├── config/        # Security, CORS, WebSocket config
│       │   │   │       ├── controller/    # REST API endpoints
│       │   │   │       ├── service/       # Business logic
│       │   │   │       ├── repository/    # JPA repositories
│       │   │   │       ├── model/         # JPA entities
│       │   │   │       ├── dto/           # Data Transfer Objects
│       │   │   │       ├── mapper/        # MapStruct mappers
│       │   │   │       └── utils/         # Utilities, validators
│       │   │   └── resources/
│       │   │       ├── db/migration/      # Flyway SQL scripts
│       │   │       └── application.yaml   # Configuration (NOT committed)
│       │   └── test/
│       ├── uploads/                       # Uploaded files (NOT committed)
│       └── pom.xml                        # Maven dependencies
│
├── frontend/                              # ReactJS Admin Panel
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/                     # API calls
│   │   ├── store/                        # Redux store
│   │   └── utils/
│   ├── .env.example                      # Environment template
│   └── package.json
│
├── client-frontend/                       # ReactJS Customer Site
│   └── (similar structure)
│
├── ENV_SETUP_GUIDE.md                    # Environment config guide
└── README.md                              # This file
```

---

## 🤝 Contributing

### Git Workflow
1. Clone repository
2. Tạo branch mới: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m "Add: your feature description"`
4. Push to branch: `git push origin feature/your-feature-name`
5. Tạo Pull Request

### Code Style
- **Java:** Follow Google Java Style Guide
- **React:** Follow Airbnb React Style Guide
- **Naming:** camelCase (Java), PascalCase (Components), snake_case (database)

### Commit Message Convention
```
Type: Short description

Types: Add, Update, Fix, Remove, Refactor, Docs
Examples:
- Add: user avatar upload feature
- Fix: stock quantity update bug
- Update: improve product search performance
```

---

## 🆘 Troubleshooting

### Backend không khởi động được

**Lỗi: "Cannot connect to database"**
```
Kiểm tra:
1. MySQL đang chạy: mysql -u root -p
2. Database store_management đã tạo chưa
3. Username/password trong application.yaml đúng chưa
```

**Lỗi: "Port 8080 already in use"**
```
Tìm process đang dùng port 8080:
# Linux/Mac
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Lỗi: "Flyway migration failed"**
```
Xóa bảng flyway_schema_history và chạy lại:
mysql -u root -p
USE store_management;
DROP TABLE flyway_schema_history;
EXIT;
```

### Frontend không kết nối được Backend

**Lỗi: "Network Error" hoặc "CORS Error"**
```
Kiểm tra:
1. Backend đang chạy tại http://localhost:8080
2. REACT_APP_API_BASE_URL trong .env đúng
3. CORS đã được cấu hình trong WebMvcConfig.java
```

### Database Connection Issues

**Lỗi: "Access denied for user"**
```
Cấp quyền lại:
mysql -u root -p
GRANT ALL PRIVILEGES ON store_management.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📞 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation:** Xem các file `*_MODULE.md` trong `backend/store-management/`
- **Email:** your-team-email@example.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Backend Team:** Spring Boot, Database, API
- **Frontend Team:** ReactJS, UI/UX
- **DevOps Team:** Deployment, Server Management

---

## 🗺 Roadmap

- [ ] Mobile App (React Native)
- [ ] Multi-warehouse support
- [ ] Advanced analytics & reporting
- [ ] Email notifications
- [ ] SMS notifications via Twilio
- [ ] Barcode scanner integration
- [ ] Multi-language support

---

📅 **Last Updated:** November 10, 2025  
🎯 **Version:** 1.0.0  
👨‍💻 **Author:** Store Management Development Team

---

**Happy Coding! 🚀**


