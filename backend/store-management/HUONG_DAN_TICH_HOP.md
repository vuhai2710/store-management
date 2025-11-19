# 📋 HƯỚNG DẪN TÍCH HỢP GỢI Ý SẢN PHẨM VÀO TRANG CHỦ

## 🎯 Mục tiêu

Thêm section "💡 Sản phẩm gợi ý cho bạn" vào trang chủ hiện tại của bạn.

## 📍 Bước 1: Tìm file trang chủ

Tìm file chứa các section:
- "Sản phẩm bán chạy 🔥"
- "Sản phẩm nổi bật"
- "Sản phẩm mới 🆕"

File có thể là:
- `src/pages/HomePage.jsx`
- `src/pages/Home.jsx`
- `src/components/HomePage.jsx`
- Hoặc file tương tự

## 📝 Bước 2: Thêm code

### 2.1. Thêm imports (nếu chưa có)

Tìm dòng import ở đầu file, thêm:

```jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
```

**Lưu ý**: Nếu đã có rồi thì bỏ qua bước này.

### 2.2. Thêm state vào component

Tìm phần khai báo state trong component HomePage, thêm:

```jsx
const [recommendations, setRecommendations] = useState([])
const [loadingRecommendations, setLoadingRecommendations] = useState(true)
```

**Ví dụ vị trí:**
```jsx
function HomePage() {
  // Các state khác...
  const [products, setProducts] = useState([])
  
  // THÊM 2 DÒNG NÀY:
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  
  // ...
}
```

### 2.3. Thêm useEffect để fetch data

Tìm các useEffect khác trong component, thêm useEffect mới:

```jsx
useEffect(() => {
  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true)
      
      // Lấy token (giống như các API khác của bạn)
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
      
      console.log('[API] -> GET http://localhost:8080/api/v1/products/recommendations/home')
      console.log('[API] <-', response.status, '/products/recommendations/home', response.data)
      
      if (response.data && response.data.code === 200 && response.data.data) {
        setRecommendations(response.data.data)
        console.log('[API] Recommendations loaded:', response.data.data.length, 'products')
      }
    } catch (err) {
      console.error('[API] Error loading recommendations:', err)
    } finally {
      setLoadingRecommendations(false)
    }
  }
  
  fetchRecommendations()
}, [])
```

**Ví dụ vị trí:**
```jsx
useEffect(() => {
  // Fetch best sellers
  // ...
}, [])

// THÊM useEffect MỚI Ở ĐÂY:
useEffect(() => {
  const fetchRecommendations = async () => {
    // ... code ở trên
  }
  fetchRecommendations()
}, [])
```

### 2.4. Thêm JSX vào render

Tìm section "Sản phẩm mới 🆕", thêm code sau section đó:

```jsx
{/* Sản phẩm gợi ý cho bạn */}
{!loadingRecommendations && recommendations.length > 0 && (
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
              background: '#f5f5f5',
              position: 'relative'
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
              {product.similarity && product.similarity < 1.0 && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {(product.similarity * 100).toFixed(0)}% tương tự
                </div>
              )}
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
                  console.log('Add to cart:', product.productId)
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

**Ví dụ vị trí:**
```jsx
{/* Sản phẩm mới 🆕 */}
<section>
  {/* ... code sản phẩm mới ... */}
</section>

{/* THÊM CODE Ở ĐÂY - Sau section "Sản phẩm mới" */}
{!loadingRecommendations && recommendations.length > 0 && (
  <section>
    {/* ... code ở trên ... */}
  </section>
)}
```

## ✅ Bước 3: Kiểm tra

1. **Lưu file**
2. **Refresh browser** (F5)
3. **Mở Console** (F12) → Bạn sẽ thấy:
   ```
   [API] -> GET http://localhost:8080/api/v1/products/recommendations/home
   [API] <- 200 /products/recommendations/home
   [API] Recommendations loaded: X products
   ```
4. **Scroll xuống** → Bạn sẽ thấy section "💡 Sản phẩm gợi ý cho bạn"

## 🎨 Tùy chỉnh style (nếu cần)

Nếu bạn muốn style giống với các section khác, có thể:
- Thay đổi màu nền
- Thay đổi grid layout
- Thay đổi kích thước card
- Thêm CSS class thay vì inline style

## 📝 File tham khảo

Xem file `COPY_PASTE_CODE.jsx` để có code đầy đủ, dễ copy.

## 🐛 Troubleshooting

### Không thấy request trong Console
- Kiểm tra xem code đã được thêm đúng chưa
- Kiểm tra xem có lỗi syntax không
- Refresh browser và kiểm tra lại

### Lỗi 401 Unauthorized
- Đảm bảo user đã đăng nhập
- Kiểm tra token có trong localStorage không

### Không hiển thị section
- Kiểm tra `recommendations.length > 0`
- Kiểm tra Console có lỗi không
- Kiểm tra API response

