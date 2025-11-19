# 🚀 TÍCH HỢP ĐƠN GIẢN NHẤT - CHỈ 3 BƯỚC

## ⚡ Cách nhanh nhất

### Bước 1: Copy hook vào project

Copy file `src/hooks/useRecommendations.js` vào project của bạn (tạo thư mục `hooks` nếu chưa có).

### Bước 2: Import và sử dụng trong trang chủ

Trong file trang chủ của bạn, thêm:

```jsx
// Import hook
import useRecommendations from './hooks/useRecommendations'

// Trong component
function HomePage() {
  // Sử dụng hook
  const { recommendations, loading } = useRecommendations(6)
  
  // ... code khác ...
  
  // Thêm vào JSX (sau section "Sản phẩm mới")
  return (
    <div>
      {/* Các section khác */}
      
      {/* Section gợi ý sản phẩm */}
      {!loading && recommendations.length > 0 && (
        <section style={{ padding: '60px 20px', backgroundColor: '#f8f9fa', marginTop: '40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
              💡 Sản phẩm gợi ý cho bạn
            </h2>
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
                    <button
                      style={{
                        width: '100%',
                        padding: '10px',
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
    </div>
  )
}
```

## 📝 Hoặc copy code trực tiếp (không dùng hook)

Nếu không muốn tạo hook, copy code này vào trang chủ:

```jsx
// Thêm vào đầu file
import { useEffect, useState } from 'react'
import axios from 'axios'

// Trong component HomePage, thêm state:
const [recommendations, setRecommendations] = useState([])

// Thêm useEffect:
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
      console.error('Error:', err)
    }
  }
  fetchRecommendations()
}, [])

// Thêm vào JSX (sau section "Sản phẩm mới"):
{recommendations.length > 0 && (
  <section style={{ padding: '60px 20px', backgroundColor: '#f8f9fa', marginTop: '40px' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        💡 Sản phẩm gợi ý cho bạn
      </h2>
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
              <button
                style={{
                  width: '100%',
                  padding: '10px',
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

## ✅ Kiểm tra

Sau khi thêm code:
1. Lưu file
2. Refresh browser (F5)
3. Mở Console → Bạn sẽ thấy:
   ```
   [API] -> GET http://localhost:8080/api/v1/products/recommendations/home?limit=6
   [API] <- 200 /products/recommendations/home
   ```
4. Scroll xuống → Thấy section "💡 Sản phẩm gợi ý cho bạn"

## 🎯 Vị trí đặt code

Đặt section này **sau section "Sản phẩm mới"** hoặc ở vị trí bạn muốn.

