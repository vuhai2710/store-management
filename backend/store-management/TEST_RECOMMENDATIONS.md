# 🧪 Hướng dẫn kiểm tra hệ thống gợi ý sản phẩm

## ✅ Checklist kiểm tra

### 1. Kiểm tra Backend API

#### 1.1. Test API Homepage Recommendations

**Endpoint:** `GET /api/v1/products/recommendations/home?limit=6`

**Cách test:**
```bash
# Sử dụng curl (cần có JWT token)
curl -X GET "http://localhost:8080/api/v1/products/recommendations/home?limit=6" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Hoặc dùng Postman:**
1. Method: `GET`
2. URL: `http://localhost:8080/api/v1/products/recommendations/home?limit=6`
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
   - `Content-Type: application/json`

**Kết quả mong đợi:**
```json
{
  "code": 200,
  "message": "Lấy danh sách sản phẩm gợi ý trang chủ thành công",
  "data": [
    {
      "productId": 1,
      "name": "iPhone 15 Pro",
      "similarity": 0.85,
      "imageUrl": "...",
      "price": 25000000,
      "category": "Điện thoại",
      "brand": "Apple"
    },
    ...
  ]
}
```

#### 1.2. Test API Product Recommendations (trang chi tiết)

**Endpoint:** `GET /api/v1/products/recommendations/{productId}?topN=5`

**Cách test:**
```bash
curl -X GET "http://localhost:8080/api/v1/products/recommendations/1?topN=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Kết quả mong đợi:**
- Trả về 5 sản phẩm tương tự với productId = 1
- Mỗi sản phẩm có `similarity` score (0.0 - 1.0)

---

### 2. Kiểm tra Python Script

#### 2.1. Test Python script trực tiếp

```bash
# Chạy script với product_id và top_n
python product_recommendation_api.py 1 5
```

**Kết quả mong đợi:**
```json
{
  "product_id": 1,
  "top_n": 5,
  "recommendations": [
    {
      "product_id": 2,
      "name": "Samsung Galaxy S24 Ultra",
      "similarity": 0.75,
      "image_url": "...",
      "price": 24990000
    },
    ...
  ]
}
```

#### 2.2. Kiểm tra Python dependencies

```bash
pip list | grep -E "pandas|scikit-learn|nltk"
```

**Cần có:**
- pandas
- scikit-learn
- nltk (nếu dùng)

---

### 3. Kiểm tra Database

#### 3.1. Kiểm tra bảng orders và order_details

```sql
USE store_management;

-- Kiểm tra bảng tồn tại
SHOW TABLES LIKE 'orders';
SHOW TABLES LIKE 'order_details';

-- Kiểm tra có dữ liệu không
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM order_details;

-- Kiểm tra sản phẩm user đã mua
SELECT DISTINCT od.id_product, o.id_customer, o.order_date
FROM order_details od
INNER JOIN orders o ON od.id_order = o.id_order
WHERE o.id_customer = 1  -- Thay bằng customerId thực tế
ORDER BY o.order_date DESC
LIMIT 5;
```

#### 3.2. Kiểm tra sản phẩm có đủ dữ liệu

```sql
-- Kiểm tra sản phẩm có name và description
SELECT id_product, product_name, description, status
FROM products
WHERE status = 'IN_STOCK'
LIMIT 10;

-- Kiểm tra có sản phẩm nào thiếu description không
SELECT COUNT(*) 
FROM products 
WHERE description IS NULL OR description = '';
```

---

### 4. Kiểm tra Frontend

#### 4.1. Mở browser và kiểm tra Console

1. Mở http://localhost:3003
2. Đăng nhập
3. Mở Developer Tools (F12)
4. Vào tab **Console**

**Bạn sẽ thấy:**
```
[HomePage] Fetching recommendations...
[API] -> GET http://localhost:8080/api/v1/products/recommendations/home?limit=6
[API] <- 200 /products/recommendations/home
[HomePage] Recommendations received: [...]
[HomePage] Mapped recommendations: [...]
```

#### 4.2. Kiểm tra Network Tab

1. Vào tab **Network**
2. Refresh trang (F5)
3. Tìm request: `recommendations/home`
4. Kiểm tra:
   - **Status:** 200 OK
   - **Response:** Có data trả về

#### 4.3. Kiểm tra UI

- Scroll xuống trang chủ
- Tìm section "💡 Sản phẩm gợi ý cho bạn"
- Kiểm tra:
  - Section có hiển thị không?
  - Có sản phẩm được hiển thị không?
  - Mỗi sản phẩm có: ảnh, tên, giá, button "Thêm vào giỏ"

---

### 5. Test các trường hợp

#### 5.1. User đã mua hàng

**Kịch bản:**
- User đã có orders trong database
- Gọi API `/recommendations/home`

**Kết quả mong đợi:**
- Lấy sản phẩm user đã mua gần đây
- Tính similarity với các sản phẩm đó
- Trả về top N sản phẩm tương tự

#### 5.2. User chưa mua hàng

**Kịch bản:**
- User chưa có orders
- Gọi API `/recommendations/home`

**Kết quả mong đợi:**
- Lấy sản phẩm bán chạy làm seed
- Tính similarity với các sản phẩm đó
- Trả về top N sản phẩm tương tự

#### 5.3. Python script lỗi

**Kịch bản:**
- Python script không chạy được
- Gọi API `/recommendations/home`

**Kết quả mong đợi:**
- Fallback: Trả về sản phẩm mới nhất
- Similarity = 0.5 (mặc định)
- Không crash, vẫn trả về data

---

### 6. Kiểm tra Logs

#### 6.1. Backend Logs

Khi chạy Spring Boot, kiểm tra console logs:

```
INFO  - Getting home page recommendations with Content-based Filtering, customerId: 1, limit: 6
INFO  - Found 3 recently purchased products for customer ID: 1
INFO  - Calling Python script: .../product_recommendation_api.py with productId: 5, topN: 3
INFO  - Found 6 recommendations for homepage (customerId: 1)
```

#### 6.2. Python Script Logs

Nếu có lỗi, sẽ thấy:
```
ERROR - Error calling Python recommendation script
ERROR - Python script exited with code: 1
WARN  - Using fallback recommendations for homepage
```

---

## 🐛 Troubleshooting

### Không thấy recommendations

1. **Kiểm tra user đã đăng nhập chưa**
   - Mở Console → Kiểm tra có token không
   - Kiểm tra localStorage: `localStorage.getItem('token')`

2. **Kiểm tra backend đang chạy**
   - URL: http://localhost:8080
   - Health check: http://localhost:8080/actuator/health

3. **Kiểm tra database có dữ liệu**
   ```sql
   SELECT COUNT(*) FROM products WHERE status = 'IN_STOCK';
   ```

4. **Kiểm tra Python script**
   ```bash
   python product_recommendation_api.py 1 5
   ```

### Recommendations trống

1. **Kiểm tra có sản phẩm IN_STOCK không**
2. **Kiểm tra Python script có chạy được không**
3. **Kiểm tra logs để xem lỗi gì**

### Similarity = 1.0 (không đúng)

- Nếu tất cả similarity = 1.0 → Python script không chạy, đang dùng fallback
- Kiểm tra logs để xem Python script có lỗi không

---

## ✅ Kết quả mong đợi khi hoạt động đúng

1. ✅ API trả về 200 OK với data
2. ✅ Mỗi sản phẩm có similarity score (0.0 - 1.0, không phải 1.0)
3. ✅ Frontend hiển thị section "💡 Sản phẩm gợi ý cho bạn"
4. ✅ Sản phẩm được hiển thị với đầy đủ thông tin
5. ✅ Logs không có lỗi


