import React, { useEffect, useState } from 'react'
import { getHomePageRecommendations, getRecommendedProducts } from '../services/productRecommendationService'
import './ProductRecommendations.css'

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
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching recommendations...', { productId, limit })
        
        let data
        
        if (productId) {
          // Lấy sản phẩm tương tự cho sản phẩm cụ thể
          console.log('Getting recommended products for productId:', productId)
          data = await getRecommendedProducts(productId, limit)
        } else {
          // Lấy sản phẩm gợi ý cho trang chủ
          console.log('Getting home page recommendations')
          data = await getHomePageRecommendations(limit)
        }
        
        console.log('Recommendations received:', data)
        setRecommendations(data || [])
        
        if (!data || data.length === 0) {
          console.warn('No recommendations returned from API')
        }
      } catch (err) {
        console.error('Error loading recommendations:', err)
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
        setError(`Không thể tải sản phẩm gợi ý: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [productId, limit])

  if (loading) {
    return (
      <section className="product-recommendations">
        <h2 className="recommendations-title">{title}</h2>
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="product-recommendations">
        <h2 className="recommendations-title">{title}</h2>
        <div className="error">
          <p>{error}</p>
        </div>
      </section>
    )
  }

  if (recommendations.length === 0 && !loading && !error) {
    return (
      <section className="product-recommendations">
        <h2 className="recommendations-title">{title}</h2>
        <div className="empty-state">
          <p>Hiện chưa có sản phẩm gợi ý.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Vui lòng đảm bảo bạn đã đăng nhập và backend đang chạy.
          </p>
        </div>
      </section>
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <section className="product-recommendations">
      <h2 className="recommendations-title">{title}</h2>
      <div className="recommendations-grid">
        {recommendations.map((product) => (
          <div 
            key={product.productId} 
            className="product-card"
            onClick={() => {
              window.location.href = `/products/${product.productId}`
            }}
          >
            <div className="product-image-container">
              <img 
                src={product.imageUrl || '/placeholder-product.jpg'} 
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
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
                {formatPrice(product.price)}
              </p>
              <button 
                className="view-product-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  window.location.href = `/products/${product.productId}`
                }}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProductRecommendations

