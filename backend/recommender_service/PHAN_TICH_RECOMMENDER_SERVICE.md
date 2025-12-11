# Product Recommender Service – Preview

## Tổng quan
Dịch vụ backend viết bằng **FastAPI** cung cấp API gợi ý sản phẩm cho hệ thống quản lý cửa hàng. 
Nó kết nối tới **MySQL**, đọc dữ liệu sản phẩm và lịch sử xem sản phẩm của người dùng, sau đó sinh gợi ý bằng mô hình **hybrid (collaborative + content-based)**.

---

## Cấu trúc thư mục chính

```text
recommender_service/
├─ app.py                  # Khởi tạo FastAPI app, CORS, router, health check
├─ config.py               # Cấu hình kết nối DB (host, port, user, password, dbname, ...)
├─ requirements.txt        # Thư viện Python cần thiết
├─ start.bat / start.sh    # Script khởi động service (Windows / Linux)
├─ test_connection.py      # Script test kết nối tới DB
├─ models/                 # (Dự phòng cho class/model, hiện chưa xem chi tiết)
├─ modules/
│   ├─ __init__.py
│   ├─ collaborative.py    # Gợi ý dựa trên lịch sử xem (behavior-based)
│   ├─ content_based.py    # Mô hình content-based (TF-IDF + cosine similarity)
│   ├─ hybrid.py           # Kết hợp collaborative + content-based
│   ├─ loader.py           # Hàm kết nối & truy vấn MySQL (products, view history)
│   └─ preprocess.py       # Xử lý, trích xuất sở thích user từ lịch sử view
└─ routers/
    ├─ __init__.py
    └─ recommend_router.py # Định nghĩa các API /recommend, /similar-products
```

---

## Thành phần & chức năng chính

### 1. `app.py`
- Tạo FastAPI app: `FastAPI(title="Product Recommender Service")`.
- Bật **CORS** cho mọi origin (phục vụ frontend dễ dàng call API trong giai đoạn dev).
- Gắn router `recommend_router` với tag `"recommendations"`.
- Các endpoint hệ thống:
  - `GET /`  
    - Trả về `{ "message": "Product Recommender Service", "status": "running" }`.
  - `GET /health`  
    - Gọi `modules.loader.get_connection()` để kiểm tra kết nối DB.  
    - Nếu OK: `{ "status": "healthy", "database": "connected" }`.  
    - Nếu lỗi: `{ "status": "unhealthy", "database": "disconnected", "error": ... }`.
- Có hỗ trợ chạy trực tiếp bằng `uvicorn` (port 5000).

### 2. `routers/recommend_router.py`
Định nghĩa các API chính cho recommender:

1. **`GET /recommend`**
   - Query param: `userId: int`.
   - Flow:
     - Gọi `hybrid.init_models()` (đã được gọi sẵn khi import module) để đảm bảo model đã được load.
     - Gọi `hybrid.hybrid_recommend(userId, top_k=10)`.
     - Log ra console số lượng sản phẩm gợi ý.
   - Response dạng:
     ```json
     {
       "userId": 123,
       "recommendations": [1, 5, 7, ...]
     }
     ```
   - Nếu lỗi: trả về HTTP 500 với chi tiết exception.

2. **`GET /similar-products`**
   - Query param: `productId: int`.
   - Flow:
     - Gọi `hybrid.similar_products(productId, top_k=10)`.
   - Response dạng:
     ```json
     {
       "productId": 10,
       "similar": [3, 8, 11, ...]
     }
     ```
   - Nếu lỗi: trả về HTTP 500.

### 3. `modules/loader.py`
Các hàm làm việc với **MySQL**:

- `get_connection()`
  - Tạo kết nối MySQL dùng cấu hình trong `config.py`.

- `load_products()`
  - Truy vấn bảng `products` (join với `categories`) để lấy:
    - `id_product` → `id`
    - `product_name` → `name`
    - `category_name` → `category`
    - `brand`, `price`, `description`
  - Trả về `pandas.DataFrame` chứa toàn bộ danh sách sản phẩm.

- `load_user_history(user_id: int, limit: int = 200)`
  - Truy vấn bảng `product_view` để lấy lịch sử xem của 1 user:
    - `id, user_id, session_id, product_id, action_type, created_at`
  - Log chi tiết kết nối, query, số record trả về.
  - Trả về `DataFrame` lịch sử xem, dùng cho collaborative.

- `load_global_views(limit: int = 5000)`
  - Lấy lịch sử view global (user_id không null) để có thể dùng cho các phân tích/gợi ý nâng cao.

### 4. `modules/preprocess.py`
Xử lý dữ liệu lịch sử xem để suy ra **sở thích người dùng**:

- `get_user_preference_from_views(views_df, products_df)`
  - Merge lịch sử view (`views_df`) với danh sách sản phẩm (`products_df`) theo `product_id` ↔ `id`.
  - Đếm tần suất:
    - `category`
    - `brand`
  - Trả về:
    ```python
    {
      "categories": [top 5 categories],
      "brands": [top 5 brands]
    }
    ```
  - Nếu dữ liệu trống → trả về list rỗng.

### 5. `modules/collaborative.py`
Gợi ý dựa trên **hành vi** (view history) – dạng collaborative/behavior-based đơn giản:

- `recommend_by_view_history(user_id: int, products_df: pd.DataFrame, top_k: int = 10)`
  - Gọi `loader.load_user_history(user_id, limit=200)` để lấy lịch sử xem.
  - Nếu user chưa có lịch sử → trả về `[]`.
  - Gọi `preprocess.get_user_preference_from_views(...)` để lấy danh sách category/brand ưa thích.
  - Tạo danh sách **candidate** từ tất cả sản phẩm:
    - Khởi tạo cột `score = 0`.
    - Nếu `category` nằm trong `preferences["categories"]` → `score += 2`.
    - Nếu `brand` nằm trong `preferences["brands"]` → `score += 1`.
  - Loại bỏ các sản phẩm mà user đã xem (`views_df["product_id"]`).
  - Sắp xếp giảm dần theo `score`, lấy `top_k * 2` sản phẩm (để hybrid có thêm dữ liệu).
  - Trả về list ID sản phẩm.

### 6. `modules/content_based.py`
Mô hình **content-based** dùng TF-IDF + cosine similarity:

- Biến global:
  - `_products_df`: bản copy DataFrame sản phẩm.
  - `_vectorizer`: `TfidfVectorizer`.
  - `_similarity_matrix`: ma trận cosine similarity giữa các sản phẩm.

- `init_content_model(products_df)`
  - Gộp các trường text:
    - `category`, `brand`, `description` → cột `text`.
  - Khởi tạo `TfidfVectorizer(max_features=5000, stop_words='english')`.
  - Fit-transform trên cột `text` để tạo ma trận TF-IDF.
  - Tính `cosine_similarity` giữa các vector → `_similarity_matrix`.

- `similar_products(product_id: int, top_k: int = 10)`
  - Kiểm tra model đã được init chưa, nếu chưa → raise error.
  - Tìm index của sản phẩm trong `_products_df` theo `id`.
  - Lấy hàng tương ứng trong `_similarity_matrix` để được vector similarity.
  - Sắp xếp giảm dần, bỏ chính nó, lấy `top_k` sản phẩm tương tự.
  - Trả về list ID sản phẩm tương tự.

### 7. `modules/hybrid.py`
Kết hợp **collaborative + content-based**:

- Biến global:
  - `_initialized`: flag cho biết model đã init hay chưa.
  - `_products_df`: cache danh sách sản phẩm.

- `init_models()`
  - Nếu đã init → return.
  - Gọi `loader.load_products()` để lấy tất cả sản phẩm.
  - Gọi `content_based.init_content_model(_products_df)` để build model content-based.
  - Đánh dấu `_initialized = True`.

- `hybrid_recommend(user_id: int, top_k: int = 10)`
  - Đảm bảo model đã init.
  - Gọi `collaborative.recommend_by_view_history(user_id, _products_df, top_k * 2)`.
  - Nếu không có gợi ý collaborative → trả về `[]`.
  - Với 1–2 sản phẩm đầu tiên từ collaborative, gọi `content_based.similar_products(product_id, top_k=5)` để lấy danh sách similar, gom vào `similar_products_list`.
  - Trộn 2 danh sách (collaborative trước, rồi similar), loại bỏ trùng lặp, giữ nguyên thứ tự.
  - Cắt còn `top_k` ID sản phẩm và trả về.

- `similar_products(product_id: int, top_k: int = 10)`
  - Đảm bảo model đã init.
  - Gọi trực tiếp `content_based.similar_products(product_id, top_k)`.

---

## Cách hoạt động tổng quan

1. Service khởi động → `hybrid.init_models()` được gọi (khi import `recommend_router`):
   - Load tất cả sản phẩm từ MySQL.
   - Build TF-IDF và similarity matrix cho content-based.

2. Khi gọi `GET /recommend?userId=...`:
   - Lấy lịch sử xem của user từ `product_view`.
   - Phân tích để tìm ra category/brand ưa thích.
   - Chấm điểm sản phẩm mới dựa trên sở thích (collaborative/behavior-based).
   - Lấy một vài sản phẩm được đề xuất, mở rộng thêm các sản phẩm tương tự nội dung (content-based).
   - Trả về danh sách ID sản phẩm gợi ý.

3. Khi gọi `GET /similar-products?productId=...`:
   - Dùng ma trận similarity để tìm các sản phẩm có nội dung gần nhất (cùng category/brand/mô tả tương tự).

---

## Gợi ý sử dụng (development)

- Cài dependencies (trên Windows, dùng `cmd`):
  ```cmd
  cd D:\project1\store_management\backend\recommender_service
  pip install -r requirements.txt
  ```

- Chạy service bằng Uvicorn:
  ```cmd
  cd D:\project1\store_management\backend\recommender_service
  python -m uvicorn app:app --reload --port 5000
  ```

- Kiểm tra nhanh:
  - `GET http://localhost:5000/`  
  - `GET http://localhost:5000/health`  
  - `GET http://localhost:5000/recommend?userId=1`  
  - `GET http://localhost:5000/similar-products?productId=1`

---

## Tóm tắt
- Backend nhỏ gọn, tách rõ phần **API**, **loader (DB)**, **tiền xử lý**, và **logic gợi ý**.
- Hỗ trợ 2 chức năng chính: gợi ý sản phẩm theo user và tìm sản phẩm tương tự.
- Mô hình gợi ý dùng chiến lược **hybrid**: kết hợp hành vi người dùng và nội dung sản phẩm để cải thiện chất lượng gợi ý.

