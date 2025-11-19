# 🚀 Hướng dẫn nhanh - Thêm gợi ý sản phẩm vào trang chủ

## Copy-paste code này vào trang chủ của bạn

### 1. Thêm vào đầu file (imports)

```jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
```

### 2. Thêm state vào component HomePage

```jsx
const [recommendations, setRecommendations] = useState([])
```

### 3. Thêm useEffect để fetch data

```jsx
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
      
      if (response.data && response.data.code === 200) {
        setRecommendations(response.data.data || [])
      }
    } catch (err) {
      console.error('Error loading recommendations:', err)
    }
  }
  
  fetchRecommendations()
}, [])
```

### 4. Thêm JSX vào trang chủ (sau section "Sản phẩm mới")

```jsx
{/* Sản phẩm gợi ý cho bạn */}
{recommendations.length > 0 && (
  <section style={{ 
    padding: '60px 20px', 
    backgroundColor: '#f8f9fa', 
    marginTop: '40px' 
  }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#333', 
          margin: 0 
        }}>
          💡 Sản phẩm gợi ý cho bạn
        </h2>
        <a 
          href="/products" 
          style={{ 
            color: '#1976d2', 
            textDecoration: 'none', 
            fontWeight: '500',
            fontSize: '16px'
          }}
        >
          Xem tất cả →
        </a>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {recommendations.map((product) => (
          <div
            key={product.productId}
            style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onClick={() => {
              window.location.href = `/products/${product.productId}`
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '200px', 
              overflow: 'hidden', 
              background: '#f5f5f5' 
            }}>
              <img
                src={product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
                alt={product.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
                }}
              />
            </div>
            <div style={{ padding: '15px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: '0 0 8px 0', 
                color: '#333',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '48px'
              }}>
                {product.name}
              </h3>
              {product.category && (
                <p style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  margin: '4px 0' 
                }}>
                  {product.category}
                </p>
              )}
              <p style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#e53935', 
                margin: '12px 0' 
              }}>
                {new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND',
                  maximumFractionDigits: 0
                }).format(product.price)}
              </p>
              <span style={{ 
                fontSize: '12px', 
                color: '#4caf50', 
                fontWeight: '500' 
              }}>
                Còn hàng
              </span>
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '12px',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  // Thêm logic thêm vào giỏ hàng ở đây
                  alert('Đã thêm vào giỏ hàng')
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

1. **Backend đang chạy**: http://localhost:8080
2. **API hoạt động**: Mở http://localhost:8080/api/v1/products/recommendations/home?limit=6
3. **User đã đăng nhập**: Kiểm tra localStorage có token không
4. **Console không có lỗi**: Mở F12 → Console

## 🔧 Tùy chỉnh

- **Số lượng sản phẩm**: Thay đổi `limit=6` thành số bạn muốn
- **API URL**: Thay đổi nếu backend chạy port khác
- **Style**: Tùy chỉnh CSS theo design của bạn

## 📝 Lưu ý

- Component chỉ hiển thị khi có data (không làm ảnh hưởng UI nếu lỗi)
- Cần đảm bảo user đã đăng nhập nếu API yêu cầu authentication
- Nếu không thấy section, kiểm tra console để xem lỗi

