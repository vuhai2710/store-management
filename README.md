# Hệ thống Quản lý Cửa hàng - Store Management System

## Tổng quan dự án

Hệ thống quản lý cửa hàng toàn diện được xây dựng với kiến trúc Full-Stack hiện đại:
- **Backend**: Spring Boot 3.5.5 (Java 17)
- **Frontend**: ReactJS 18.2
- **Database**: MySQL 8.0+

## Tính năng chính

### 1. Quản lý Nhân viên
- ✅ CRUD thông tin nhân viên
- ✅ Đăng nhập (Username/Password)
- ✅ Phân quyền (Admin, Nhân viên bán hàng, Khách hàng)
- Theo dõi nhân viên tạo đơn hàng

### 2. Quản lý Khách hàng
- CRUD thông tin khách hàng
- Phân loại: VIP, Regular
- Lịch sử mua hàng
- Tìm kiếm (Tên, SĐT)

### 3. Quản lý Sản phẩm
- ✅ CRUD (thêm, sửa, xóa, xem)
- ✅ Thông tin: mã, tên, giá, mô tả
- ✅ Phân loại sản phẩm
- ✅ Tìm kiếm (Tên, SKU, loại)
- ✅ Trạng thái (Đang bán, ngừng bán, hết hàng)

### 4. Quản lý Đơn hàng
- Tạo đơn hàng (chọn khách hàng, sản phẩm, số lượng)
- Cập nhật trạng thái (Chờ xác nhận → Hoàn thành → Hủy)
- Tính tổng tiền, VAT
- Xem chi tiết đơn hàng
- Hình thức thanh toán (Tiền mặt, chuyển khoản, ZaloPay)

### 5. Quản lý Tồn kho
- Hiển thị số lượng tồn kho
- Tự động cập nhật số lượng khi nhập/bán hàng
- Cảnh báo sản phẩm sắp hết
- Lịch sử nhập/xuất kho

### 6. Quản lý Nhà cung cấp
- CRUD nhà cung cấp
- Tạo đơn nhập hàng
- Báo cáo tổng nhập hàng theo NCC

### 7. Dashboard & Báo cáo
- ✅ API tổng quan (số sản phẩm, khách hàng, đơn hàng)
- API báo cáo doanh thu (ngày/tháng)
- API sản phẩm bán chạy
- Biểu đồ Chart.js

### 8. API cho Giao diện Khách hàng
- Giỏ hàng (Thêm/xóa/xem)
- Sort, Filter, Search cho trang sản phẩm
- Tích hợp API thanh toán (ZaloPay)
- Theo dõi vận đơn (GHN)

## Cài đặt và chạy dự án

### Yêu cầu hệ thống

#### Backend
- Java JDK 17 hoặc cao hơn
- Maven 3.6+
- MySQL 8.0+

#### Frontend
- Node.js 16.0+ 
- npm 8.0+

### Bước 1: Clone Repository

```bash
git clone https://github.com/vuhai2710/store-management.git
cd store-management
```

### Bước 2: Setup Database

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database và import schema
CREATE DATABASE quanly_banhang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quanly_banhang;
SOURCE backend/init_manage_store.sql;
```

Hoặc:
```bash
mysql -u root -p < backend/init_manage_store.sql
```

### Bước 3: Cấu hình Backend

```bash
cd backend/store-management

# Chỉnh sửa src/main/resources/application.yaml
# Cập nhật thông tin database:
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/quanly_banhang
    username: root
    password: your_password
```

### Bước 4: Chạy Backend

```bash
# Từ thư mục backend/store-management
./mvnw clean install
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### Bước 5: Cấu hình Frontend

```bash
cd frontend

# Tạo file .env từ env.example
cp env.example .env

# Nội dung .env:
REACT_APP_API_URL=http://localhost:8080/api
```

### Bước 6: Chạy Frontend

```bash
# Từ thư mục frontend
npm install
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Cấu trúc thư mục

```
store-management/
├── backend/
│   ├── store-management/         # Spring Boot application
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/
│   │   │   │   │   └── com/storemanagement/
│   │   │   │   │       ├── config/          # Configuration
│   │   │   │   │       ├── controller/      # REST Controllers
│   │   │   │   │       ├── dto/             # Data Transfer Objects
│   │   │   │   │       ├── entity/          # JPA Entities
│   │   │   │   │       ├── exception/       # Exception handling
│   │   │   │   │       ├── repository/      # JPA Repositories
│   │   │   │   │       ├── service/         # Business Logic
│   │   │   │   │       └── util/            # Utilities
│   │   │   │   └── resources/
│   │   │   │       └── application.yaml     # App configuration
│   │   │   └── test/                        # Unit tests
│   │   └── pom.xml                          # Maven dependencies
│   ├── init_manage_store.sql                # Database schema
│   └── README.md                            # Backend documentation
│
└── frontend/
    ├── public/                               # Static files
    ├── src/
    │   ├── components/                       # React components
    │   ├── pages/                            # Page components
    │   ├── services/                         # API services
    │   ├── store/                            # Redux store
    │   ├── App.js                            # Main app component
    │   └── index.js                          # Entry point
    ├── package.json                          # npm dependencies
    └── README.md                             # Frontend documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Employees
- `GET /api/employees` - Danh sách nhân viên
- `GET /api/employees/{id}` - Chi tiết nhân viên
- `POST /api/employees` - Tạo nhân viên
- `PUT /api/employees/{id}` - Cập nhật nhân viên
- `DELETE /api/employees/{id}` - Xóa nhân viên

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `GET /api/products/search?keyword={keyword}` - Tìm kiếm
- `GET /api/products/low-stock?threshold={number}` - Sản phẩm sắp hết
- `POST /api/products` - Tạo sản phẩm
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `PATCH /api/products/{id}/stock?quantity={number}` - Cập nhật tồn kho
- `DELETE /api/products/{id}` - Xóa sản phẩm

### Dashboard
- `GET /api/dashboard/stats` - Thống kê tổng quan

## Authentication

Hệ thống sử dụng JWT (JSON Web Token) để xác thực:

1. **Đăng nhập**: POST `/api/auth/login`
```json
{
  "username": "admin",
  "password": "password"
}
```

2. **Response**: Nhận token
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

3. **Sử dụng token**: Thêm vào header
```
Authorization: Bearer {token}
```

## User Roles

- **ADMIN**: Toàn quyền quản lý hệ thống
- **EMPLOYEE**: Nhân viên bán hàng, quyền hạn chế
- **CUSTOMER**: Khách hàng, chỉ xem và mua hàng

## Testing

### Backend Testing
```bash
cd backend/store-management
./mvnw test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Deployment

### Backend - Build JAR
```bash
cd backend/store-management
./mvnw clean package -DskipTests
java -jar target/store-management-0.0.1-SNAPSHOT.jar
```

### Frontend - Build Production
```bash
cd frontend
npm run build
# Serve build folder với web server (nginx, apache, etc.)
```

## Troubleshooting

### Database Connection Error
- Kiểm tra MySQL service đã chạy
- Xác nhận database đã được import
- Kiểm tra username/password trong application.yaml

### CORS Error
- Backend đã cấu hình CORS cho localhost:3000
- Nếu frontend chạy ở port khác, cập nhật SecurityConfig.java

### Port Already in Use
```bash
# Backend: Thay đổi port trong application.yaml
server:
  port: 8081

# Frontend: Chạy với port khác
PORT=3001 npm start
```

## Database Schema Overview

### Bảng chính
1. **users** - Tài khoản người dùng (username, password, role)
2. **employees** - Thông tin nhân viên
3. **customers** - Thông tin khách hàng (VIP/Regular)
4. **products** - Sản phẩm (tên, giá, tồn kho, trạng thái)
5. **categories** - Danh mục sản phẩm
6. **orders** - Đơn hàng (status, payment_method)
7. **order_details** - Chi tiết đơn hàng
8. **suppliers** - Nhà cung cấp
9. **purchase_orders** - Đơn nhập hàng
10. **inventory_transactions** - Giao dịch nhập/xuất kho
11. **carts & cart_items** - Giỏ hàng
12. **shipments** - Vận chuyển

## Roadmap

### Đã hoàn thành ✅
- [x] Database schema design
- [x] Backend entities và repositories
- [x] Authentication với JWT
- [x] Employee management API
- [x] Product management API
- [x] Dashboard statistics API
- [x] Exception handling
- [x] CORS configuration
- [x] Frontend structure với ReactJS

### Đang phát triển 🚧
- [ ] Customer management API
- [ ] Order management API
- [ ] Inventory management API
- [ ] Supplier management API
- [ ] Cart API
- [ ] Report & Analytics API
- [ ] Frontend-Backend integration
- [ ] Payment gateway integration (ZaloPay)
- [ ] Shipping integration (GHN)

## Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## License

MIT License

## Contact & Support

- **Repository**: https://github.com/vuhai2710/store-management
- **Issues**: https://github.com/vuhai2710/store-management/issues
- **Email**: support@storemanagement.com

## Acknowledgments

- Spring Boot Documentation
- React Documentation
- Ant Design Components
- Chart.js for data visualization

---

**Note**: Đây là hệ thống đang trong quá trình phát triển. Một số tính năng có thể chưa hoàn thiện hoặc đang được cải thiện.
