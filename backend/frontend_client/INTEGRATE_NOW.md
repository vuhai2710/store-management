# 🚀 Tích hợp ngay vào trang chủ hiện tại

## Bạn đang thấy các API khác hoạt động nhưng chưa thấy gợi ý sản phẩm?

Điều này có nghĩa là component gợi ý chưa được tích hợp vào trang chủ hiện tại của bạn.

## Cách tích hợp nhanh

### Bước 1: Tìm file trang chủ của bạn

Tìm file chứa các section như:
- "Sản phẩm bán chạy"
- "Sản phẩm nổi bật"  
- "Sản phẩm mới"

Có thể là: `HomePage.jsx`, `Home.jsx`, `HomePage.js`, hoặc file tương tự.

### Bước 2: Import component

Thêm vào đầu file:

```jsx
import RecommendationsSection from './components/RecommendationsSection'
// hoặc đường dẫn đúng đến component của bạn
```

### Bước 3: Thêm vào JSX

Thêm component vào sau section "Sản phẩm mới" hoặc ở vị trí bạn muốn:

```jsx
{/* Sau section "Sản phẩm mới" */}
<RecommendationsSection />
```

### Hoặc copy code trực tiếp:

Nếu không muốn tạo file riêng, copy code này vào trang chủ của bạn:

```jsx
// Thêm vào đầu file
import { useEffect, useState } from 'react'
import axios from 'axios'

// Thêm vào component HomePage
const [recommendations, setRecommendations] = useState([])
const [loadingRecommendations, setLoadingRecommendations] = useState(true)

useEffect(() => {
  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const response = await axios.get(
        'http://localhost:8080/api/v1/products/recommendations/home?limit=6',
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data && response.data.code === 200 && response.data.data) {
        setRecommendations(response.data.data)
      }
    } catch (err) {
      console.error('Error loading recommendations:', err)
    } finally {
      setLoadingRecommendations(false)
    }
  }
  
  fetchRecommendations()
}, [])

// Thêm vào JSX (sau section "Sản phẩm mới")
{!loadingRecommendations && recommendations.length > 0 && (
  <section style={{ padding: '60px 20px', backgroundColor: '#f8f9fa', marginTop: '40px' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
          💡 Sản phẩm gợi ý cho bạn
        </h2>
        <a href="/products" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '500' }}>
          Xem tất cả →
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {recommendations.map((product) => (
          <div
            key={product.productId}
            style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = `/products/${product.productId}`}
          >
            <div style={{ width: '100%', height: '200px', overflow: 'hidden', background: '#f5f5f5' }}>
              <img
                src={product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '15px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#333' }}>
                {product.name}
              </h3>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#e53935', margin: '12px 0' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </p>
              <span style={{ fontSize: '12px', color: '#4caf50', fontWeight: '500' }}>Còn hàng</span>
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '12px',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)}
```

## Sau khi tích hợp

1. **Lưu file**
2. **Refresh browser** (F5)
3. **Kiểm tra Console** - Bạn sẽ thấy:
   ```
   [API] -> GET http://localhost:8080/api/v1/products/recommendations/home
   [API] <- 200 /products/recommendations/home
   [API] Recommendations loaded: X products
   ```
4. **Scroll xuống** - Bạn sẽ thấy section "💡 Sản phẩm gợi ý cho bạn"

## Kiểm tra

Sau khi tích hợp, mở Console và bạn sẽ thấy:
- Request đến `/products/recommendations/home`
- Response với danh sách sản phẩm
- Section hiển thị trên trang

## Lưu ý

- Component chỉ hiển thị khi có data (không làm ảnh hưởng UI nếu lỗi)
- Tự động sử dụng token từ localStorage (giống các API khác)
- Tương thích với cấu trúc API hiện tại của bạn

