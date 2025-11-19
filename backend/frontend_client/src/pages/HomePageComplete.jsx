/**
 * Trang chủ hoàn chỉnh với gợi ý sản phẩm
 * Design đẹp, hiện đại, responsive
 */

import React, { useEffect, useState } from 'react'
import { getHomePageRecommendations } from '../services/productRecommendationService'
import './HomePageComplete.css'

const HomePageComplete = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getHomePageRecommendations(6)
        setRecommendations(data || [])
      } catch (err) {
        console.error('Error loading recommendations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="homepage-complete">
      {/* Header */}
      <header className="homepage-header">
        <div className="header-top">
          <div className="container">
            <div className="header-info">
              <span>📧 hello@electronicstore.com</span>
              <span>📞 +84 123456789</span>
              <span>👋 Xin chào, Nguyen Chung</span>
            </div>
          </div>
        </div>
        <div className="header-main">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <h1>💻 Electronic Store</h1>
              </div>
              <nav className="main-nav">
                <a href="/">Trang chủ</a>
                <a href="/products">Cửa hàng</a>
                <a href="/orders">Đơn hàng</a>
                <a href="/news">Tin tức</a>
                <a href="/contact">Liên hệ</a>
              </nav>
              <div className="header-actions">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  className="search-input"
                />
                <div className="cart-icon">
                  🛒 Giỏ hàng <span className="cart-count">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">🚀 CAM KẾT GIÁ TỐT NHẤT</div>
            <h2 className="hero-title">Tương lai công nghệ, ngay hôm nay.</h2>
            <p className="hero-subtitle">
              Khám phá mới, mạnh mẽ, tinh tế. Khám phá các thiết bị điện tử hàng đầu.
            </p>
            <button className="hero-cta">MUA SẮM NGAY →</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-bar">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">💻</span>
              <div>
                <h4>MIỄN PHÍ VẬN CHUYỂN</h4>
                <p>Trên mọi đơn hàng 500.000đ</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <div>
                <h4>ĐỔI TRẢ 30 NGÀY</h4>
                <p>Đổi trả dễ dàng</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛟</span>
              <div>
                <h4>HỖ TRỢ 24/7</h4>
                <p>Hỗ trợ tận tâm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Mua sắm theo danh mục</h2>
          <div className="categories-grid">
            {['Điện thoại', 'Laptop', 'Tablet', 'Phụ kiện', 'Đồng hồ thông minh', 'Điện tử'].map((cat, idx) => (
              <div key={idx} className="category-card">
                <span className="category-icon">📦</span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="flash-sale-section">
        <div className="container">
          <div className="flash-sale-card">
            <div className="flash-sale-content">
              <h2>🔥 ƯU ĐÃI TUẦN NÀY</h2>
              <h3>Xiaomi 14 Pro</h3>
              <p>Điện thoại với camera Leica</p>
              <div className="price">Chỉ 15.000.000 ₫</div>
              <div className="countdown">
                <div><span>41</span> DAYS</div>
                <div><span>13</span> HOURS</div>
                <div><span>34</span> MINUTES</div>
                <div><span>26</span> SECONDS</div>
              </div>
              <button className="buy-now-btn">📦 MUA NGAY</button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm bán chạy 🔥</h2>
            <a href="/products" className="view-all">Xem tất cả →</a>
          </div>
          <div className="products-grid">
            {/* Sample products - replace with real data */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="product-card">
                <div className="product-image">
                  <img src={`https://via.placeholder.com/300x300?text=Product+${i}`} alt="Product" />
                </div>
                <div className="product-info">
                  <h3>Product Name {i}</h3>
                  <p className="product-price">{(15000000 + i * 1000000).toLocaleString('vi-VN')} ₫</p>
                  <span className="stock-status">Còn hàng</span>
                  <button className="add-to-cart">Thêm vào giỏ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm nổi bật</h2>
          </div>
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="product-card">
                <div className="product-image">
                  <img src={`https://via.placeholder.com/300x300?text=Product+${i}`} alt="Product" />
                </div>
                <div className="product-info">
                  <h3>Product Name {i}</h3>
                  <p className="product-price">{(18000000 + i * 1000000).toLocaleString('vi-VN')} ₫</p>
                  <span className="stock-status">Còn hàng</span>
                  <button className="add-to-cart">Thêm vào giỏ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW PRODUCTS RECOMMENDATIONS SECTION */}
      {!loading && recommendations.length > 0 && (
        <section className="products-section recommendations-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">💡 Sản phẩm gợi ý cho bạn</h2>
              <a href="/products" className="view-all">Xem tất cả →</a>
            </div>
            <div className="products-grid">
              {recommendations.map((product) => (
                <div
                  key={product.productId}
                  className="product-card recommendation-card"
                  onClick={() => {
                    window.location.href = `/products/${product.productId}`
                  }}
                >
                  <div className="product-image">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={product.name}
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
                    <h3>{product.name}</h3>
                    {product.category && (
                      <p className="product-category">{product.category}</p>
                    )}
                    <p className="product-price">{formatPrice(product.price)}</p>
                    <span className="stock-status">Còn hàng</span>
                    <button 
                      className="add-to-cart"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Add to cart logic here
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

      {loading && (
        <section className="products-section">
          <div className="container">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải sản phẩm gợi ý...</p>
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm mới 🆕</h2>
            <a href="/products" className="view-all">Xem tất cả →</a>
          </div>
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="product-card">
                <div className="product-image">
                  <img src={`https://via.placeholder.com/300x300?text=Product+${i}`} alt="Product" />
                </div>
                <div className="product-info">
                  <h3>Product Name {i}</h3>
                  <p className="product-price">{(20000000 + i * 1000000).toLocaleString('vi-VN')} ₫</p>
                  <span className="stock-status">Còn hàng</span>
                  <button className="add-to-cart">Thêm vào giỏ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Electronic Store</h3>
              <p>Address: số 3 Cầu Giấy</p>
              <p>Phone: +84 123456789</p>
              <p>Email: hello@electronicstore.com</p>
            </div>
            <div className="footer-section">
              <h4>Useful Links</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/secure">Secure Shopping</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>More</h4>
              <ul>
                <li><a href="/who-we-are">Who We Are</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/testimonials">Testimonials</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Newsletter</h4>
              <p>Get E-mail updates</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your mail" />
                <button>Subscribe</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Copyright © 2025 All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePageComplete

