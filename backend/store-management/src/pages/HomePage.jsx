import React from 'react'
import ProductRecommendations from '../components/ProductRecommendations'
import './HomePage.css'

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Chào mừng đến với Store Management</h1>
          <p className="hero-subtitle">Khám phá các sản phẩm tuyệt vời được gợi ý dành riêng cho bạn</p>
        </div>
      </section>

      {/* Product Recommendations Section */}
      <ProductRecommendations 
        limit={10}
        title="Sản phẩm gợi ý cho bạn"
      />

      {/* Additional Sections */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Giao hàng nhanh</h3>
            <p>Giao hàng toàn quốc trong 24-48 giờ</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Thanh toán an toàn</h3>
            <p>Hỗ trợ nhiều phương thức thanh toán</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>Ưu đãi hấp dẫn</h3>
            <p>Nhiều chương trình khuyến mãi đặc biệt</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

