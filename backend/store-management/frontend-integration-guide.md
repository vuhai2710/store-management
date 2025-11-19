# HƯỚNG DẪN TÍCH HỢP GỢI Ý SẢN PHẨM VÀO TRANG CHỦ FRONTEND

## Bước 1: Tạo Service để gọi API

Tạo file `src/services/productRecommendationService.js` (hoặc `.ts` nếu dùng TypeScript):

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

/**
 * Lấy sản phẩm gợi ý cho trang chủ
 * @param {number} limit - Số lượng sản phẩm cần lấy (mặc định: 10)
 * @returns {Promise<Array>} Danh sách sản phẩm gợi ý
 */
export const getHomePageRecommendations = async (limit = 10) => {
  try {
    const token = localStorage.getItem('token'); // Hoặc cách lấy token của bạn
    
    const response = await axios.get(
      `${API_BASE_URL}/products/recommendations/home?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching home page recommendations:', error);
    return [];
  }
};

/**
 * Lấy sản phẩm tương tự cho một sản phẩm cụ thể
 * @param {number} productId - ID sản phẩm
 * @param {number} topN - Số lượng sản phẩm tương tự (mặc định: 5)
 * @returns {Promise<Array>} Danh sách sản phẩm tương tự
 */
export const getRecommendedProducts = async (productId, topN = 5) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get(
      `${API_BASE_URL}/products/recommendations/${productId}?topN=${topN}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return [];
  }
};
```

## Bước 2: Tạo Component hiển thị gợi ý sản phẩm

Tạo file `src/components/ProductRecommendations.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import { getHomePageRecommendations, getRecommendedProducts } from '../services/productRecommendationService';
import './ProductRecommendations.css';

/**
 * Component hiển thị sản phẩm gợi ý
 * @param {Object} props
 * @param {number} props.productId - ID sản phẩm (nếu có, sẽ hiển thị sản phẩm tương tự)
 * @param {number} props.limit - Số lượng sản phẩm hiển thị
 * @param {string} props.title - Tiêu đề section
 */
const ProductRecommendations = ({ 
  productId = null, 
  limit = 10, 
  title = "Sản phẩm gợi ý cho bạn" 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let data;
        
        if (productId) {
          // Lấy sản phẩm tương tự cho sản phẩm cụ thể
          data = await getRecommendedProducts(productId, limit);
        } else {
          // Lấy sản phẩm gợi ý cho trang chủ
          data = await getHomePageRecommendations(limit);
        }
        
        setRecommendations(data);
        setError(null);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Không thể tải sản phẩm gợi ý');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, limit]);

  if (loading) {
    return (
      <div className="product-recommendations">
        <h2 className="recommendations-title">{title}</h2>
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-recommendations">
        <h2 className="recommendations-title">{title}</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Không hiển thị gì nếu không có sản phẩm
  }

  return (
    <div className="product-recommendations">
      <h2 className="recommendations-title">{title}</h2>
      <div className="recommendations-grid">
        {recommendations.map((product) => (
          <div key={product.productId} className="product-card">
            <div className="product-image-container">
              <img 
                src={product.imageUrl || '/placeholder-product.jpg'} 
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
              {product.similarity && product.similarity < 1.0 && (
                <div className="similarity-badge">
                  {(product.similarity * 100).toFixed(0)}% tương tự
                </div>
              )}
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              {product.category && (
                <p className="product-category">{product.category}</p>
              )}
              {product.brand && (
                <p className="product-brand">{product.brand}</p>
              )}
              <p className="product-price">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.price)}
              </p>
              <button 
                className="view-product-btn"
                onClick={() => {
                  // Điều hướng đến trang chi tiết sản phẩm
                  window.location.href = `/products/${product.productId}`;
                }}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
```

## Bước 3: Tạo CSS cho component

Tạo file `src/components/ProductRecommendations.css`:

```css
.product-recommendations {
  margin: 40px 0;
  padding: 20px;
}

.recommendations-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.similarity-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 48px;
}

.product-category {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
}

.product-brand {
  font-size: 12px;
  color: #888;
  margin: 4px 0;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #e53935;
  margin: 12px 0;
}

.view-product-btn {
  width: 100%;
  padding: 10px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.view-product-btn:hover {
  background: #1565c0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  text-align: center;
  padding: 40px;
  color: #e53935;
}
```

## Bước 4: Tích hợp vào trang chủ

Trong file trang chủ của bạn (ví dụ: `src/pages/HomePage.jsx` hoặc `src/App.jsx`):

```jsx
import React from 'react';
import ProductRecommendations from '../components/ProductRecommendations';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Các component khác của trang chủ */}
      
      {/* Banner, hero section, etc. */}
      
      {/* Thêm component gợi ý sản phẩm */}
      <ProductRecommendations 
        limit={10}
        title="Sản phẩm gợi ý cho bạn"
      />
      
      {/* Các component khác */}
    </div>
  );
};

export default HomePage;
```

## Bước 5: Tích hợp vào trang chi tiết sản phẩm

Trong file trang chi tiết sản phẩm (ví dụ: `src/pages/ProductDetailPage.jsx`):

```jsx
import React from 'react';
import ProductRecommendations from '../components/ProductRecommendations';

const ProductDetailPage = ({ productId }) => {
  return (
    <div className="product-detail-page">
      {/* Thông tin chi tiết sản phẩm */}
      
      {/* Sản phẩm tương tự */}
      <ProductRecommendations 
        productId={productId}
        limit={5}
        title="Sản phẩm tương tự"
      />
    </div>
  );
};

export default ProductDetailPage;
```

## Bước 6: Kiểm tra API hoạt động

Trước khi tích hợp, hãy test API bằng Postman hoặc browser:

1. **Test API trang chủ:**
```bash
GET http://localhost:8080/api/v1/products/recommendations/home?limit=10
Headers: Authorization: Bearer {YOUR_JWT_TOKEN}
```

2. **Test API sản phẩm tương tự:**
```bash
GET http://localhost:8080/api/v1/products/recommendations/1?topN=5
Headers: Authorization: Bearer {YOUR_JWT_TOKEN}
```

## Lưu ý quan trọng

1. **Authentication**: Đảm bảo user đã đăng nhập và có JWT token
2. **CORS**: Nếu frontend chạy trên port khác (ví dụ: 3000), cần cấu hình CORS trong backend
3. **Error Handling**: Component đã có xử lý lỗi, nhưng bạn có thể tùy chỉnh thêm
4. **Loading State**: Component hiển thị "Đang tải..." khi fetch data
5. **Empty State**: Nếu không có sản phẩm, component sẽ không hiển thị gì

## Troubleshooting

### Lỗi CORS
Thêm vào `application.yaml`:
```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
```

### Lỗi 401 Unauthorized
- Kiểm tra token có hợp lệ không
- Kiểm tra token có được gửi trong header không

### Không có sản phẩm hiển thị
- Kiểm tra database có sản phẩm với status = IN_STOCK không
- Kiểm tra console log để xem lỗi

## Tùy chỉnh thêm

Bạn có thể tùy chỉnh:
- Số lượng sản phẩm hiển thị
- Layout (grid, carousel, list)
- Styling
- Thêm các thông tin khác (rating, discount, etc.)

