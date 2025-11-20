# Hướng dẫn kiểm tra Python Service

## Bước 1: Kiểm tra Python Service có đang chạy

Mở terminal và chạy:
```bash
# Windows PowerShell
Test-NetConnection -ComputerName localhost -Port 5000

# Hoặc kiểm tra process
Get-Process | Where-Object {$_.ProcessName -like "*python*"}
```

Nếu port 5000 không mở → Python service chưa chạy

## Bước 2: Start Python Service

```bash
cd ../recommender_service
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 5000
```

Sau khi start, bạn sẽ thấy:
```
INFO:     Uvicorn running on http://0.0.0.0:5000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Bước 3: Test Python Service trực tiếp

Mở browser và vào: http://localhost:5000/

Phải thấy:
```json
{"message": "Product Recommender Service"}
```

## Bước 4: Kiểm tra Spring Boot Logs

Sau khi start Python service, khi gọi API recommendations, bạn sẽ thấy trong Spring Boot logs:

**Nếu Python service đang chạy:**
```
INFO  - Getting recommendations for userId: 1
INFO  - Calling Python recommender service: http://localhost:5000/recommend?userId=1
INFO  - Python service response status: 200 OK, body: {"userId":1,"recommendations":[...]}
INFO  - Successfully got X recommendations from Python service
```

**Nếu Python service chưa chạy:**
```
INFO  - Getting recommendations for userId: 1
INFO  - Calling Python recommender service: http://localhost:5000/recommend?userId=1
ERROR - Cannot connect to Python recommender service at http://localhost:5000/recommend?userId=1. Is the service running? Error: Connection refused
WARN  - No recommendations found for userId: 1
```

## Bước 5: Kiểm tra dữ liệu trong product_view

Nếu Python service đang chạy nhưng vẫn trả về mảng rỗng, kiểm tra xem có dữ liệu view history chưa:

```sql
-- Xem tổng số views
SELECT COUNT(*) FROM product_view;

-- Xem views của user cụ thể (thay YOUR_USER_ID)
SELECT * FROM product_view WHERE user_id = YOUR_USER_ID ORDER BY created_at DESC;
```

## Troubleshooting

### Python service không start được
- Kiểm tra Python đã cài chưa: `python --version`
- Kiểm tra dependencies: `pip list | findstr fastapi`
- Kiểm tra port 5000 có bị chiếm không: `netstat -ano | findstr :5000`

### Python service start nhưng Spring Boot vẫn không gọi được
- Kiểm tra `application.yaml`: `recommender.base-url: http://localhost:5000`
- Kiểm tra firewall có block port 5000 không
- Restart Spring Boot sau khi start Python service

