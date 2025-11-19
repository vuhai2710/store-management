# ⚡ Quick Test - Kiểm tra nhanh hệ thống gợi ý

## 🚀 Test nhanh trong 3 bước

### Bước 1: Test Python Script (30 giây)

```bash
python product_recommendation_api.py 1 5
```

**Kết quả mong đợi:**
```json
{
  "product_id": 1,
  "top_n": 5,
  "recommendations": [...]
}
```

✅ **Nếu thấy JSON output** → Python script OK  
❌ **Nếu thấy lỗi** → Kiểm tra dependencies: `pip install pandas scikit-learn`

---

### Bước 2: Test Backend API (1 phút)

**Cách 1: Dùng Browser**
1. Đăng nhập vào hệ thống
2. Mở http://localhost:8080/api/v1/products/recommendations/home?limit=6
3. Thêm header: `Authorization: Bearer YOUR_TOKEN`

**Cách 2: Dùng Postman**
- Method: `GET`
- URL: `http://localhost:8080/api/v1/products/recommendations/home?limit=6`
- Headers: `Authorization: Bearer YOUR_TOKEN`

**Kết quả mong đợi:**
```json
{
  "code": 200,
  "data": [
    {
      "productId": 1,
      "name": "...",
      "similarity": 0.85,  // ← Quan trọng: phải < 1.0
      ...
    }
  ]
}
```

✅ **Nếu similarity < 1.0** → Content-based Filtering đang hoạt động  
❌ **Nếu similarity = 1.0** → Đang dùng fallback (Python script không chạy)

---

### Bước 3: Test Frontend (30 giây)

1. Mở http://localhost:3003
2. Đăng nhập
3. Mở Console (F12)
4. Scroll xuống trang chủ

**Kiểm tra:**
- ✅ Console có log: `[HomePage] Recommendations received: [...]`
- ✅ Section "💡 Sản phẩm gợi ý cho bạn" hiển thị
- ✅ Có sản phẩm được hiển thị

---

## 🎯 Checklist nhanh

- [ ] Python script chạy được: `python product_recommendation_api.py 1 5`
- [ ] Backend API trả về 200: `/recommendations/home`
- [ ] Similarity score < 1.0 (không phải hardcode)
- [ ] Frontend hiển thị section gợi ý
- [ ] Console không có lỗi

---

## 🐛 Nếu có lỗi

### Python script lỗi
```bash
# Cài đặt dependencies
pip install pandas scikit-learn nltk
```

### Backend API lỗi 401
- Kiểm tra đã đăng nhập chưa
- Kiểm tra token có hợp lệ không

### Frontend không hiển thị
- Kiểm tra Console có lỗi không
- Kiểm tra Network tab xem API có được gọi không
- Kiểm tra backend đang chạy không

---

## 📝 Test script tự động

Chạy script test tự động:

```bash
python test_recommendations.py
```

Script sẽ test:
1. ✅ Python recommendation script
2. ✅ Product data
3. ✅ TF-IDF processing


