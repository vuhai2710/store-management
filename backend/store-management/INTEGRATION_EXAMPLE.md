# Hướng dẫn tích hợp gợi ý sản phẩm vào trang chủ hiện tại

## Cách 1: Sử dụng component có sẵn (Đơn giản nhất)

### Bước 1: Copy component vào project của bạn

Copy file `src/components/ProductRecommendationsSection.jsx` vào project frontend của bạn.

### Bước 2: Import và sử dụng trong trang chủ

Trong file trang chủ của bạn (ví dụ: `HomePage.jsx`, `Home.jsx`, hoặc file chứa "Sản phẩm bán chạy"):

```jsx
import ProductRecommendationsSection from './components/ProductRecommendationsSection'

function HomePage() {
  return (
    <div>
      {/* Các section khác */}
      
      {/* Thêm section gợi ý sản phẩm */}
      <ProductRecommendationsSection />
      
      {/* Các section khác */}
    </div>
  )
}
```

## Cách 2: Tích hợp trực tiếp vào code hiện tại

Nếu bạn muốn thêm trực tiếp vào code hiện tại, copy đoạn code sau:

```jsx
// Thêm vào đầu file
import { useEffect, useState } from 'react'
import axios from 'axios'

// Thêm vào component HomePage
const [recommendations, setRecommendations] = useState([])

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

// Thêm vào JSX (sau section "Sản phẩm mới")
{recommendations.length > 0 && (
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

## Cách 3: Tạo service riêng (Khuyến nghị cho project lớn)

### Tạo file `src/services/recommendationService.js`:

```javascript
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api/v1'

export const getHomeRecommendations = async (limit = 6) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    const response = await axios.get(
      `${API_BASE_URL}/products/recommendations/home?limit=${limit}`,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data && response.data.code === 200) {
      return response.data.data || []
    }
    return []
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}
```

### Sử dụng trong component:

```jsx
import { getHomeRecommendations } from './services/recommendationService'

const [recommendations, setRecommendations] = useState([])

useEffect(() => {
  const loadRecommendations = async () => {
    const data = await getHomeRecommendations(6)
    setRecommendations(data)
  }
  loadRecommendations()
}, [])
```

## Lưu ý quan trọng

1. **API URL**: Đảm bảo API URL đúng với backend của bạn
2. **Authentication**: Nếu API yêu cầu token, đảm bảo user đã đăng nhập
3. **CORS**: Đảm bảo backend đã cấu hình CORS cho frontend
4. **Error Handling**: Component sẽ không hiển thị nếu không có data (không làm ảnh hưởng UI)

## Vị trí hiển thị

Nên đặt section gợi ý sản phẩm:
- Sau section "Sản phẩm mới"
- Hoặc giữa các section khác
- Hoặc ở cuối trang trước footer

## Customization

Bạn có thể tùy chỉnh:
- Số lượng sản phẩm: Thay đổi `limit` trong API call
- Style: Thay đổi CSS/styling theo design của bạn
- Layout: Thay đổi grid layout

