# 🎨 Hướng Dẫn Setup Frontend

Hướng dẫn setup và chạy frontend. **Không cần tạo file .env, có thể chạy ngay!**

## ✅ Prerequisites

- **Node.js 16+** và **npm 8+**
- **Git**

## 📦 Cài Đặt Dependencies

### Admin Panel (Port 3000)

```bash
cd frontend
npm install
npm start
```

Frontend sẽ tự động mở tại `http://localhost:3000`

### Customer Frontend (Port 3003)

```bash
cd client-frontend
npm install
npm start
```

Frontend sẽ tự động mở tại `http://localhost:3003`

## 🔐 Default Login Credentials

```
Username: admin
Password: admin123
```

## ⚙️ Cấu Hình (Optional)

**⚠️ QUAN TRỌNG:** Frontend đã có default API URL là `http://localhost:8080/api/v1`, nên **KHÔNG CẦN** tạo file `.env` nếu backend chạy ở `localhost:8080`.

### Khi nào cần tạo .env?

Chỉ cần tạo file `.env` nếu:

- Backend chạy ở port khác (không phải 8080)
- Backend chạy ở server khác (không phải localhost)

### Cách tạo .env (nếu cần)

Tạo file `frontend/.env` với nội dung:

```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

Restart frontend sau khi thay đổi.

## 🆘 Troubleshooting

### "npm install" bị lỗi

```bash
cd frontend
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
2. Kiểm tra API URL trong code: `frontend/src/services/api.js`
3. Kiểm tra file `.env` (nếu có)
4. Restart frontend sau khi thay đổi

### "Module not found"

```bash
cd frontend
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

File build sẽ được tạo trong thư mục `frontend/build/`

## 🎯 Quick Reference

### URLs

- **Admin Panel:** http://localhost:3000
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
- [ ] Có thể login với `admin` / `admin123`
