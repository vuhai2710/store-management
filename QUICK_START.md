# ⚡ Quick Start Guide - Hướng Dẫn Khởi Động Nhanh

Hướng dẫn này giúp bạn chạy project trong **5-10 phút** với cấu hình tối thiểu.

---

## ✅ Prerequisites (Yêu Cầu)

Đảm bảo bạn đã cài đặt:
- ✅ Java JDK 17+ → [Download](https://www.oracle.com/java/technologies/downloads/)
- ✅ MySQL 8.0+ → [Download](https://dev.mysql.com/downloads/installer/)
- ✅ Node.js 16+ & npm → [Download](https://nodejs.org/)
- ✅ Git → [Download](https://git-scm.com/downloads)

---

## 🚀 3 Bước Khởi Động

### Bước 1: Setup Database (2 phút)

```bash
# Mở MySQL command line
mysql -u root -p

# Tạo database
CREATE DATABASE store_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

### Bước 2: Setup Backend (3 phút)

```bash
# Clone project (nếu chưa)
git clone <repository-url>
cd store_management/backend/store-management

# Copy config template
cd src/main/resources
cp application-template.yaml application.yaml
```

**Chỉnh sửa `application.yaml` (CHỈ 2 dòng quan trọng):**
```yaml
spring:
  datasource:
    username: root              # ← Thay bằng MySQL username của bạn
    password: your_password     # ← Thay bằng MySQL password của bạn
```

**Chạy backend:**
```bash
# Về thư mục gốc của backend
cd ../../..

# Linux/Mac
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

✅ Backend sẽ chạy tại `http://localhost:8080`

---

### Bước 3: Setup Frontend (2 phút)

**Terminal mới:**
```bash
cd store_management/frontend

# Copy config
cp .env.example .env

# Install & Run
npm install
npm start
```

✅ Frontend sẽ tự động mở tại `http://localhost:3000`

---

## 🎉 Hoàn Tất!

### Default Login:
```
Username: admin
Password: admin123
```

### Các URLs:
- 🖥 **Admin Panel:** http://localhost:3000
- 🌐 **Backend API:** http://localhost:8080/api/v1
- 📱 **Customer Site:** http://localhost:3001 (optional)

---

## ⚙️ Cấu Hình Nâng Cao (Optional)

Các tính năng sau có thể bỏ qua cho development cục bộ:

### 1. Email (Reset Password)
**Bỏ qua:** Email sẽ in ra console thay vì gửi thật

**Nếu muốn setup:**
- Xem [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md) - Mục "Email Configuration"

### 2. PayOS (Thanh toán Online)
**Bỏ qua:** Có thể dùng COD hoặc Bank Transfer

**Nếu muốn setup:**
- Đăng ký tại https://my.payos.vn
- Xem [PAYOS_INTEGRATION_GUIDE.md](backend/store-management/PAYOS_INTEGRATION_GUIDE.md)

### 3. GHN (Vận chuyển)
**Bỏ qua:** Có thể tạo đơn không cần shipping

**Nếu muốn setup:**
- Đăng ký tại https://khachhang.ghn.vn
- Xem [GHN_INTEGRATION_GUIDE.md](backend/store-management/GHN_INTEGRATION_GUIDE.md)

---

## 🆘 Gặp Lỗi?

### Backend không chạy được

**Lỗi: "Cannot connect to database"**
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# Nếu không vào được, start MySQL:
# Linux
sudo systemctl start mysql

# MacOS
brew services start mysql

# Windows: Mở Services và start MySQL80
```

**Lỗi: "Port 8080 đã được sử dụng"**
```bash
# Đổi port trong application.yaml:
server:
  port: 8081  # Thay vì 8080

# Và cập nhật trong frontend/.env:
REACT_APP_API_BASE_URL=http://localhost:8081/api/v1
```

### Frontend không kết nối Backend

**Lỗi: "Network Error"**
```bash
# Kiểm tra:
1. Backend đang chạy? → http://localhost:8080
2. File frontend/.env có đúng URL không?
3. Restart frontend: Ctrl+C rồi npm start lại
```

### Maven build lỗi

**Lỗi: "Java version mismatch"**
```bash
# Kiểm tra Java version
java -version

# Phải là Java 17 hoặc cao hơn
# Nếu không, download JDK 17: https://www.oracle.com/java/technologies/downloads/
```

---

## 📚 Next Steps

Sau khi chạy thành công:

1. ✅ Đọc [README.md](README.md) để hiểu về project
2. ✅ Xem [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md) để cấu hình production
3. ✅ Khám phá các module docs trong `backend/store-management/*.md`
4. ✅ Test các API bằng Postman hoặc từ frontend

---

## 🎯 Đã Chạy Thành Công?

**Test thử:**
1. Mở http://localhost:3000
2. Login với `admin` / `admin123`
3. Vào trang Products
4. Thêm một sản phẩm mới
5. ✅ Nếu thêm được → Setup hoàn tất!

---

📞 **Need Help?** Xem [README.md](README.md) phần Troubleshooting hoặc liên hệ team!

🚀 **Happy Coding!**


