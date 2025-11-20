# Hướng dẫn Test Python Service

## Bước 1: Start Python Service

```bash
cd ../recommender_service
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 5000
```

## Bước 2: Test trực tiếp Python Service

Mở browser hoặc dùng curl:

```bash
# Test root endpoint
curl http://localhost:5000/

# Test recommendations (thay YOUR_USER_ID bằng user_id thực tế, ví dụ: 13)
curl "http://localhost:5000/recommend?userId=13"

# Test similar products (thay PRODUCT_ID bằng product_id thực tế)
curl "http://localhost:5000/similar-products?productId=1"
```

## Bước 3: Kiểm tra logs

Khi gọi API, bạn sẽ thấy logs trong terminal chạy Python service:

```
[Python Service] Getting recommendations for userId: 13
[Loader] Connecting to database: localhost:3306/store_management
[Loader] Executing query for user_id: 13, limit: 200
[Loader] Query returned X rows
[Collaborative] Loaded X views
[Python Service] Found X recommendations: [...]
```

## Bước 4: Kiểm tra Spring Boot logs

Khi frontend gọi API, xem Spring Boot logs:

```
INFO - Getting recommendations for userId: 13
INFO - Calling Python recommender service: http://localhost:5000/recommend?userId=13
INFO - Python service response status: 200 OK, body: {"userId":13,"recommendations":[...]}
INFO - Successfully got X recommendations from Python service
```

## Troubleshooting

### Python service không start được
- Kiểm tra Python: `python --version`
- Kiểm tra dependencies: `pip list | findstr fastapi`
- Kiểm tra port 5000: `netstat -ano | findstr :5000`

### Python service start nhưng không trả về recommendations
- Kiểm tra database connection trong `config.py`
- Kiểm tra logs để xem có lỗi gì
- Kiểm tra xem có dữ liệu trong `product_view` không

### Spring Boot không gọi được Python service
- Kiểm tra Python service có đang chạy không
- Kiểm tra `application.yaml`: `recommender.base-url: http://localhost:5000`
- Kiểm tra firewall

