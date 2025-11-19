# PRODUCT RECOMMENDATION MODULE

## Tổng quan

Module gợi ý sản phẩm sử dụng **Content-based Filtering** với Python script. Hệ thống sẽ phân tích mô tả và tên sản phẩm để tìm các sản phẩm tương tự.

## Cấu trúc

### Backend (Java Spring Boot)

1. **Controller**: `ProductRecommendationController.java`
   - Endpoint: `/api/v1/products/recommendations/{productId}`
   - Endpoint: `/api/v1/products/recommendations/home`

2. **Service**: `ProductRecommendationService.java` và `ProductRecommendationServiceImpl.java`
   - Gọi Python script để tính toán độ tương đồng
   - Map kết quả với dữ liệu từ database

3. **DTO**: `ProductRecommendationDTO.java`
   - Chứa thông tin sản phẩm được gợi ý

### Python Scripts

1. **product_recommendation.py**: Script chính với đầy đủ chức năng
2. **product_recommendation_api.py**: API endpoint để nhận product_id và trả về JSON

## Cài đặt

### 1. Cài đặt Python dependencies

```bash
pip install -r requirements.txt
```

### 2. Cấu hình trong `application.yaml`

```yaml
python:
  executable: "python"  # Hoặc "python3" trên Linux/Mac
  script:
    path: "product_recommendation_api.py"
```

### 3. Đảm bảo Python script có quyền thực thi

Trên Linux/Mac:
```bash
chmod +x product_recommendation_api.py
```

## API Endpoints

### 1. Lấy sản phẩm tương tự cho một sản phẩm

**Endpoint**: `GET /api/v1/products/recommendations/{productId}`

**Query Parameters**:
- `topN` (optional): Số lượng sản phẩm tương tự (mặc định: 5)

**Example Request**:
```http
GET /api/v1/products/recommendations/1?topN=5
Authorization: Bearer {JWT_TOKEN}
```

**Example Response**:
```json
{
  "code": 200,
  "message": "Lấy danh sách sản phẩm gợi ý thành công",
  "data": [
    {
      "productId": 2,
      "name": "Samsung Galaxy S24 Ultra",
      "similarity": 0.85,
      "imageUrl": "https://example.com/image.jpg",
      "price": 24990000,
      "category": "Điện thoại",
      "brand": "Samsung"
    },
    {
      "productId": 5,
      "name": "iPad Air 5th Gen",
      "similarity": 0.72,
      "imageUrl": "https://example.com/ipad.jpg",
      "price": 14990000,
      "category": "Máy tính bảng",
      "brand": "Apple"
    }
  ]
}
```

### 2. Lấy sản phẩm gợi ý cho trang chủ

**Endpoint**: `GET /api/v1/products/recommendations/home`

**Query Parameters**:
- `limit` (optional): Số lượng sản phẩm (mặc định: 10)

**Example Request**:
```http
GET /api/v1/products/recommendations/home?limit=10
Authorization: Bearer {JWT_TOKEN}
```

**Example Response**:
```json
{
  "code": 200,
  "message": "Lấy danh sách sản phẩm gợi ý trang chủ thành công",
  "data": [
    {
      "productId": 1,
      "name": "iPhone 15 Pro Max 256GB",
      "similarity": 1.0,
      "imageUrl": "https://example.com/iphone.jpg",
      "price": 29990000,
      "category": "Điện thoại",
      "brand": "Apple"
    }
  ]
}
```

## Sử dụng trong Frontend

### React Example

```javascript
import axios from 'axios';

// Lấy sản phẩm tương tự
const getRecommendedProducts = async (productId, topN = 5) => {
  try {
    const response = await axios.get(
      `/api/v1/products/recommendations/${productId}?topN=${topN}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

// Lấy sản phẩm gợi ý cho trang chủ
const getHomePageRecommendations = async (limit = 10) => {
  try {
    const response = await axios.get(
      `/api/v1/products/recommendations/home?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching home recommendations:', error);
    return [];
  }
};
```

### Component Example

```jsx
import React, { useEffect, useState } from 'react';

const ProductRecommendations = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const data = await getRecommendedProducts(productId, 5);
      setRecommendations(data);
    };
    fetchRecommendations();
  }, [productId]);

  return (
    <div className="recommendations">
      <h2>Sản phẩm tương tự</h2>
      <div className="recommendations-grid">
        {recommendations.map((product) => (
          <div key={product.productId} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>Độ tương đồng: {(product.similarity * 100).toFixed(1)}%</p>
            <p>Giá: {product.price.toLocaleString('vi-VN')} VND</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Cách hoạt động

1. **Text Preprocessing**: 
   - Chuyển thành chữ thường
   - Loại bỏ ký tự đặc biệt
   - Loại bỏ stopwords tiếng Việt
   - Tách từ

2. **TF-IDF Vectorization**:
   - Chuyển văn bản thành vector bằng TF-IDF
   - Sử dụng unigram và bigram

3. **Cosine Similarity**:
   - Tính độ tương đồng giữa các sản phẩm
   - Sắp xếp theo độ tương đồng giảm dần

4. **Top N Selection**:
   - Lấy top N sản phẩm có độ tương đồng cao nhất

## Fallback Mechanism

Nếu Python script thất bại, hệ thống sẽ tự động chuyển sang chế độ fallback:
- Lấy sản phẩm cùng category
- Chỉ lấy sản phẩm còn hàng (IN_STOCK)
- Similarity mặc định: 0.5

## Troubleshooting

### Lỗi: Python script không chạy được

1. Kiểm tra Python đã được cài đặt:
```bash
python --version
# hoặc
python3 --version
```

2. Kiểm tra dependencies:
```bash
pip install -r requirements.txt
```

3. Kiểm tra đường dẫn script trong `application.yaml`

### Lỗi: Không tìm thấy sản phẩm

- Đảm bảo sản phẩm có `status = IN_STOCK`
- Đảm bảo sản phẩm có `description` và `productName`

### Lỗi: Encoding

- Đảm bảo Python script sử dụng UTF-8
- Kiểm tra encoding của database

## Tối ưu hóa

1. **Caching**: Có thể cache kết quả gợi ý để tăng performance
2. **Background Processing**: Chạy Python script trong background thread
3. **Batch Processing**: Xử lý nhiều sản phẩm cùng lúc

## Tích hợp với Database thực tế

Hiện tại Python script sử dụng dữ liệu mẫu. Để tích hợp với database thực tế:

1. Tạo REST API endpoint trong Python để đọc từ database
2. Hoặc export dữ liệu từ database sang CSV/JSON
3. Hoặc sử dụng JDBC connector trong Python

## Notes

- Python script cần được chạy mỗi lần có request (có thể tối ưu bằng caching)
- Đảm bảo Python environment có đủ dependencies
- Trên production, nên sử dụng virtual environment cho Python


