# Backend - Hệ thống Quản lý Cửa hàng

## Tổng quan
Backend của hệ thống quản lý cửa hàng được xây dựng bằng Spring Boot 3.5.5, cung cấp RESTful API cho các chức năng quản lý toàn diện.

## Công nghệ sử dụng

### Framework & Libraries
- **Spring Boot 3.5.5**: Framework chính
- **Spring Data JPA**: ORM và database integration
- **Spring Security**: Authentication và Authorization
- **MySQL Connector**: Database driver
- **Lombok**: Giảm boilerplate code
- **JWT (jjwt 0.11.5)**: JSON Web Token authentication
- **Hibernate Validator**: Validation

### Database
- **MySQL 8.0+**: Database chính
- **JPA/Hibernate**: ORM framework

## Cấu trúc dự án

```
src/main/java/com/storemanagement/
├── config/              # Configuration classes
│   └── SecurityConfig.java
├── controller/          # REST Controllers
│   ├── AuthController.java
│   ├── EmployeeController.java
│   ├── ProductController.java
│   └── DashboardController.java
├── dto/                 # Data Transfer Objects
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── EmployeeRequest.java
│   └── ProductRequest.java
├── entity/              # JPA Entities
│   ├── User.java
│   ├── Employee.java
│   ├── Customer.java
│   ├── Product.java
│   ├── Order.java
│   └── ...
├── exception/           # Exception handling
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   └── GlobalExceptionHandler.java
├── repository/          # JPA Repositories
│   ├── UserRepository.java
│   ├── EmployeeRepository.java
│   └── ...
├── service/             # Business Logic
│   ├── AuthService.java
│   ├── EmployeeService.java
│   ├── ProductService.java
│   └── DashboardService.java
└── util/                # Utility classes
    └── JwtUtil.java
```

## Cài đặt và chạy

### Yêu cầu hệ thống
- Java 17 hoặc cao hơn
- Maven 3.6+
- MySQL 8.0+

### Bước 1: Tạo database
```sql
CREATE DATABASE quanly_banhang;
```

### Bước 2: Import schema
```bash
mysql -u root -p quanly_banhang < ../init_manage_store.sql
```

### Bước 3: Cấu hình database
Chỉnh sửa file `src/main/resources/application.yaml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/quanly_banhang
    username: root
    password: your_password
```

### Bước 4: Build và chạy
```bash
# Build project
./mvnw clean install

# Chạy ứng dụng
./mvnw spring-boot:run
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký tài khoản mới

### Employees (Nhân viên)
- `GET /api/employees` - Lấy danh sách nhân viên
- `GET /api/employees/{id}` - Lấy thông tin nhân viên
- `POST /api/employees` - Tạo nhân viên mới
- `PUT /api/employees/{id}` - Cập nhật nhân viên
- `DELETE /api/employees/{id}` - Xóa nhân viên

### Products (Sản phẩm)
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/{id}` - Lấy thông tin sản phẩm
- `GET /api/products/search?keyword={keyword}` - Tìm kiếm sản phẩm
- `GET /api/products/status/{status}` - Lọc theo trạng thái
- `GET /api/products/low-stock?threshold={number}` - Sản phẩm sắp hết
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `PATCH /api/products/{id}/stock?quantity={number}` - Cập nhật tồn kho
- `DELETE /api/products/{id}` - Xóa sản phẩm

### Dashboard
- `GET /api/dashboard/stats` - Thống kê tổng quan

## Authentication & Security

### JWT Token
Hệ thống sử dụng JWT để xác thực. Sau khi đăng nhập thành công, client nhận được token và phải gửi kèm trong header của các request tiếp theo:

```
Authorization: Bearer <token>
```

### User Roles
- **ADMIN**: Quản trị viên - full quyền
- **EMPLOYEE**: Nhân viên - quyền hạn chế
- **CUSTOMER**: Khách hàng - chỉ xem và mua hàng

## Database Schema

### Các bảng chính:
1. **users** - Tài khoản người dùng
2. **employees** - Thông tin nhân viên
3. **customers** - Thông tin khách hàng
4. **products** - Sản phẩm
5. **categories** - Danh mục sản phẩm
6. **orders** - Đơn hàng
7. **order_details** - Chi tiết đơn hàng
8. **suppliers** - Nhà cung cấp
9. **purchase_orders** - Đơn nhập hàng
10. **inventory_transactions** - Giao dịch kho
11. **carts** - Giỏ hàng
12. **shipments** - Vận chuyển

## Validation

Các request đều được validate tự động:
- Username: 3-100 ký tự
- Password: tối thiểu 6 ký tự
- Email: định dạng email hợp lệ
- Required fields: không được để trống

## Error Handling

API trả về error response theo format:
```json
{
  "status": 404,
  "message": "Employee not found with id: '123'",
  "timestamp": "2025-10-23T04:46:00"
}
```

HTTP Status codes:
- `200 OK` - Thành công
- `201 Created` - Tạo mới thành công
- `400 Bad Request` - Dữ liệu không hợp lệ
- `401 Unauthorized` - Chưa xác thực
- `403 Forbidden` - Không có quyền
- `404 Not Found` - Không tìm thấy
- `500 Internal Server Error` - Lỗi server

## Testing

```bash
# Chạy tests
./mvnw test

# Chạy với coverage
./mvnw test jacoco:report
```

## Development

### Hot reload
Sử dụng Spring DevTools để tự động reload khi code thay đổi:
```bash
./mvnw spring-boot:run
```

### Debug
```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

## Deployment

### Build JAR
```bash
./mvnw clean package -DskipTests
```

File JAR được tạo tại: `target/store-management-0.0.1-SNAPSHOT.jar`

### Chạy JAR
```bash
java -jar target/store-management-0.0.1-SNAPSHOT.jar
```

### Environment Variables
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/quanly_banhang
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your_secret_key
```

## Troubleshooting

### Database connection error
- Kiểm tra MySQL đã chạy
- Xác nhận database đã được tạo
- Kiểm tra username/password trong application.yaml

### Port already in use
```bash
# Thay đổi port trong application.yaml
server:
  port: 8081
```

### JWT Token error
- Kiểm tra JWT secret trong application.yaml
- Xác nhận token chưa hết hạn (24h)

## Roadmap

### Đã hoàn thành
- [x] Entity layer cho tất cả modules
- [x] Repository layer với custom queries
- [x] Authentication với JWT
- [x] Employee management API
- [x] Product management API
- [x] Dashboard statistics API
- [x] Exception handling
- [x] CORS configuration

### Đang phát triển
- [ ] Customer management API
- [ ] Order management API
- [ ] Inventory management API
- [ ] Supplier management API
- [ ] Cart API
- [ ] Report API
- [ ] Payment integration (ZaloPay)
- [ ] Shipping integration (GHN)

## Contributing
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
MIT License

## Contact
- Email: support@storemanagement.com
- GitHub: https://github.com/vuhai2710/store-management
