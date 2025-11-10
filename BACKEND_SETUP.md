# 🚀 Hướng Dẫn Setup Backend

Hướng dẫn setup và chạy backend trong IntelliJ IDEA. **Chỉ cần thay đổi MySQL password là có thể chạy được!**

## ✅ Prerequisites

- **Java JDK 17+**
- **MySQL 8.0+**
- **IntelliJ IDEA** (Community hoặc Ultimate)
- **Git**

## 🗄️ Database Setup

```bash
# Đăng nhập vào MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE store_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Thoát
EXIT;
```

✅ Database đã sẵn sàng! Schema sẽ được tự động tạo bởi Flyway khi chạy backend lần đầu.

## 🔧 Mở Project trong IntelliJ IDEA

**⚠️ QUAN TRỌNG NHẤT:** Phải mở đúng thư mục để IntelliJ nhận diện Maven!

### ❌ SAI: Mở từ thư mục root

- Nếu mở từ `D:\project1\store_management` (thư mục root)
- IntelliJ sẽ KHÔNG nhận diện Maven project

### ✅ ĐÚNG: Mở từ thư mục backend/store-management

1. Mở IntelliJ IDEA
2. Chọn `File` → `Open`
3. Navigate đến: `D:\project1\store_management\backend\store-management`
4. Chọn folder `store-management` (KHÔNG phải thư mục root!)
5. Click `OK` → `Open as Project`
6. Đợi IntelliJ index và download Maven dependencies (2-5 phút)

### Kiểm tra Maven đã được nhận diện:

- Xem bên phải màn hình, phải có tab **Maven**
- Right-click vào `pom.xml` → Phải thấy option **Maven**

## ⚙️ Cấu Hình Application

### Bước 1: Copy File Cấu Hình

```bash
# Windows
cd backend\store-management\src\main\resources
copy application.yaml.example application.yaml

# Linux/Mac
cd backend/store-management/src/main/resources
cp application.yaml.example application.yaml
```

### Bước 2: Chỉnh Sửa application.yaml

**⚠️ CHỈ CẦN THAY ĐỔI MỘT THỨ DUY NHẤT: MySQL Password!**

Mở file `application.yaml` và tìm dòng:

```yaml
spring:
  datasource:
    username: root
    password: # ⬅️ ĐIỀN MySQL PASSWORD CỦA BẠN VÀO ĐÂY
```

**Ví dụ:**

```yaml
spring:
  datasource:
    username: root
    password: mypassword123 # ← Điền password của bạn
```

✅ Cấu hình hoàn tất!

## ▶️ Chạy Backend

### Cách 1: Chạy từ IntelliJ IDEA (Khuyến nghị)

1. Mở file `StoreManagementApplication.java`
2. Click chuột phải vào class `StoreManagementApplication`
3. Chọn **Run 'StoreManagementApplication'** hoặc **Debug 'StoreManagementApplication'**

Backend sẽ chạy tại: `http://localhost:8080`

### Cách 2: Chạy từ Terminal

```bash
# Windows
cd backend\store-management
mvnw.cmd spring-boot:run

# Linux/Mac
cd backend/store-management
./mvnw spring-boot:run
```

## 🆘 Troubleshooting

### Maven không hiển thị

**Nguyên nhân:** Mở project từ thư mục root thay vì thư mục `backend/store-management`

**Giải pháp:**

1. Đóng IntelliJ
2. Mở IntelliJ → `File` → `Open`
3. Navigate đến: `backend/store-management` (KHÔNG phải thư mục root!)
4. Chọn folder `store-management` và click `OK`

### "Cannot connect to database"

1. Kiểm tra MySQL đang chạy: `mysql -u root -p`
2. Kiểm tra database đã tạo: `SHOW DATABASES;`
3. Kiểm tra credentials trong `application.yaml`

### "Port 8080 already in use"

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

Hoặc đổi port trong `application.yaml`:

```yaml
server:
  port: 8081
```

### "Cannot resolve symbol '@SpringBootApplication'"

1. Re-import Maven: Right-click `pom.xml` → `Maven` → `Reload Project`
2. Invalidate caches: `File` → `Invalidate Caches / Restart...`

### Java version mismatch

1. Kiểm tra Java version: `java -version` (phải >= 17)
2. `File` → `Project Structure` → `Project SDK`: Chọn Java 17

## ✅ Checklist Sau Khi Setup

- [ ] Maven dependencies đã download
- [ ] Run Configuration đã tạo
- [ ] File `application.yaml` tồn tại và có config đúng
- [ ] MySQL đang chạy
- [ ] Database `store_management` đã tạo
- [ ] Backend chạy được tại `http://localhost:8080`

## 🎯 Quick Reference

### Default Login

```
Username: admin
Password: admin123
```

### URLs

- **Backend API:** http://localhost:8080/api/v1
- **Health Check:** http://localhost:8080/actuator/health

### Common Commands

```bash
# Clean và compile
mvnw.cmd clean compile  # Windows
./mvnw clean compile    # Linux/Mac

# Run application
mvnw.cmd spring-boot:run  # Windows
./mvnw spring-boot:run    # Linux/Mac
```
