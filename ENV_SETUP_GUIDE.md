# Hướng Dẫn Cấu Hình Environment Variables

## 📋 Tổng Quan

Project này sử dụng các file configuration để quản lý thông tin nhạy cảm (database credentials, API keys, secrets). **KHÔNG BAO GIỜ** commit các file chứa thông tin thực vào git.

## 🔒 Các File Nhạy Cảm (KHÔNG được commit)

### ❌ KHÔNG commit các file sau:
- `frontend/.env`
- `backend/store-management/src/main/resources/application.yaml` (nếu chứa credentials thực)
- Bất kỳ file nào chứa passwords, API keys, secrets

### ✅ CÓ THỂ commit:
- `frontend/.env.example` - Template không chứa giá trị thực
- `backend/store-management/src/main/resources/application-template.yaml` - Template
- Các file hướng dẫn và documentation

---

## 🎯 Setup Cho Người Mới Pull Code

### 1. Frontend Configuration

#### Bước 1: Copy template
```bash
cd frontend
cp .env.example .env
```

#### Bước 2: Chỉnh sửa `.env`
```env
# Mở file .env và điền các giá trị:
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_ENVIRONMENT=development
```

**Lưu ý:** File `.env` đã được thêm vào `.gitignore` nên sẽ không bị commit nhầm.

---

### 2. Backend Configuration

#### Bước 1: Copy template
```bash
cd backend/store-management/src/main/resources
cp application-template.yaml application.yaml
```

#### Bước 2: Chỉnh sửa `application.yaml`

##### 2.1. Database Configuration (BẮT BUỘC)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/store_management
    username: root              # Thay bằng MySQL username của bạn
    password: your_password     # Thay bằng MySQL password của bạn
```

##### 2.2. JWT Configuration (BẮT BUỘC cho Production)
```yaml
jwt:
  secret: "your-secret-key-min-32-characters-long"
  signerKey: "your-signer-key-base64-encoded"
  expiration: 86400000  # 24 hours
```

**Tạo secure keys:**
```bash
# Linux/Mac
openssl rand -base64 64

# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

##### 2.3. Email Configuration (TÙY CHỌN)
Nếu cần gửi email (reset password, notifications):

```yaml
spring:
  mail:
    username: your-email@gmail.com
    password: your-app-password  # Gmail App Password, không phải mật khẩu thường
```

**Cách lấy Gmail App Password:**
1. Truy cập https://myaccount.google.com/security
2. Bật "2-Step Verification"
3. Tạo "App Password" tại https://myaccount.google.com/apppasswords
4. Sử dụng App Password (16 ký tự) thay vì mật khẩu thường

##### 2.4. PayOS Configuration (TÙY CHỌN)
Nếu sử dụng thanh toán online PayOS:

```yaml
payos:
  client-id: "YOUR_CLIENT_ID"
  api-key: "YOUR_API_KEY"
  checksum-key: "YOUR_CHECKSUM_KEY"
  webhook-url: "https://your-domain.com/api/v1/payments/payos/webhook"
  return-url: "http://localhost:3000/payment/success"
  cancel-url: "http://localhost:3000/payment/cancel"
  environment: "sandbox"  # hoặc "production"
```

**Đăng ký PayOS:**
1. Truy cập https://my.payos.vn
2. Đăng ký tài khoản
3. Lấy credentials từ dashboard
4. Cấu hình webhook URL (cần HTTPS - dùng ngrok cho development)

##### 2.5. GHN Shipping Configuration (TÙY CHỌN)
Nếu sử dụng vận chuyển GHN:

```yaml
ghn:
  token: "YOUR_GHN_TOKEN"
  shop-id: 123456
  webhook-url: "https://your-domain.com/api/v1/ghn/webhook"
  environment: "sandbox"  # hoặc "production"
```

**Đăng ký GHN:**
1. Truy cập https://khachhang.ghn.vn
2. Đăng ký tài khoản
3. Lấy Token API từ "Thông tin cá nhân" → "Token API"
4. Lấy Shop ID từ "Quản lý cửa hàng"

---

## 🌍 Environment Variables (Alternative Approach)

Thay vì hard-code trong `application.yaml`, bạn có thể dùng environment variables:

### Linux/Mac
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/store_management
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your-secret-key
export EMAIL_USERNAME=your-email@gmail.com
export EMAIL_PASSWORD=your-app-password
```

### Windows PowerShell
```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/store_management"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="your_password"
$env:JWT_SECRET="your-secret-key"
$env:EMAIL_USERNAME="your-email@gmail.com"
$env:EMAIL_PASSWORD="your-app-password"
```

### Docker
```yaml
# docker-compose.yml
environment:
  - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/store_management
  - SPRING_DATASOURCE_USERNAME=root
  - SPRING_DATASOURCE_PASSWORD=root_password
  - JWT_SECRET=your-secret-key
```

---

## 🔐 Security Best Practices

### ✅ DO (Nên làm)
1. ✅ Sử dụng environment variables cho production
2. ✅ Tạo JWT secret ngẫu nhiên và dài (min 32 ký tự)
3. ✅ Sử dụng Gmail App Password, không phải mật khẩu thường
4. ✅ Thay đổi tất cả default passwords
5. ✅ Sử dụng HTTPS cho production
6. ✅ Rotate secrets định kỳ
7. ✅ Backup `.env` và `application.yaml` ở nơi an toàn (password manager)

### ❌ DON'T (Không nên làm)
1. ❌ Commit file `.env` hoặc `application.yaml` có credentials thực
2. ❌ Share passwords qua chat, email
3. ❌ Sử dụng mật khẩu yếu hoặc default
4. ❌ Hard-code secrets trong source code
5. ❌ Dùng cùng một secret cho development và production
6. ❌ Dùng mật khẩu Gmail thường (phải dùng App Password)

---

## 🧪 Development vs Production

### Development (Local)
- Dùng `application.yaml` với credentials local
- JWT secret đơn giản để dễ debug
- PayOS/GHN sandbox environment
- HTTP localhost OK

### Production
- **BẮT BUỘC** dùng environment variables
- JWT secret mạnh, random, dài
- PayOS/GHN production environment
- **BẮT BUỘC** HTTPS
- Không expose database port ra public
- Sử dụng reverse proxy (nginx)

---

## 🆘 Troubleshooting

### Lỗi: "Cannot connect to database"
**Nguyên nhân:** MySQL chưa chạy hoặc credentials sai
**Giải pháp:**
1. Kiểm tra MySQL đang chạy: `mysql -u root -p`
2. Kiểm tra username/password trong `application.yaml`
3. Kiểm tra database `store_management` đã tạo chưa

### Lỗi: "Invalid JWT secret"
**Nguyên nhân:** JWT secret quá ngắn hoặc không hợp lệ
**Giải pháp:**
1. JWT secret phải ít nhất 32 ký tự
2. Tạo secret mới bằng lệnh openssl ở trên

### Lỗi: "Email authentication failed"
**Nguyên nhân:** Dùng mật khẩu Gmail thường thay vì App Password
**Giải pháp:**
1. Bật 2-Step Verification trên Google Account
2. Tạo App Password
3. Dùng App Password (16 ký tự) trong config

### Lỗi: "PayOS webhook failed"
**Nguyên nhân:** Webhook URL không accessible từ internet
**Giải pháp:**
1. Cài ngrok: `ngrok http 8080`
2. Lấy HTTPS URL từ ngrok
3. Cập nhật webhook URL trong PayOS dashboard và `application.yaml`

---

## 📚 Related Documentation

- **JWT Configuration:** `backend/store-management/SECURITY.md` (if exists)
- **PayOS Integration:** `backend/store-management/PAYOS_INTEGRATION_GUIDE.md`
- **GHN Integration:** `backend/store-management/GHN_INTEGRATION_GUIDE.md`
- **Stock Management:** `backend/store-management/STOCK_MANAGEMENT_GUIDE.md`

---

## 🤝 Team Workflow

### Khi pull code mới:
1. Kiểm tra xem có file template mới không
2. So sánh với file config hiện tại của bạn
3. Cập nhật config nếu có thay đổi cấu trúc
4. **KHÔNG** commit file config có credentials thực

### Khi thêm config mới:
1. Thêm vào file `-template.yaml` hoặc `.example`
2. Cập nhật hướng dẫn này
3. Thông báo team về config mới
4. Commit template, **KHÔNG** commit file thực

---

📅 **Last Updated:** November 10, 2025  
👤 **Author:** Store Management Development Team


