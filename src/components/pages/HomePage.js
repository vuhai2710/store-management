// src/components/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, Headset, Clock, ShoppingBag } from 'lucide-react'; // Import icons mới
import styles from '../../styles/styles';
import ProductCard from '../shared/ProductCard';
import { products, blogs, categories } from '../../data/data';

// Component NHẬN handleViewProductDetail
const HomePage = ({ setCurrentPage, handleAddToCart, handleAddToWishlist, isInWishlist, handleViewProductDetail }) => {
  
  // --- CHỨC NĂNG MÔ PHỎNG: Đồng hồ đếm ngược cho Deal of the Week ---
  const calculateTimeLeft = () => {
    const difference = +new Date('2025-12-31') - +new Date(); // Đặt mục tiêu Deal kết thúc vào cuối năm 2025
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer); // Cleanup
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && interval !== 'seconds') {
      // return;
    }

    timerComponents.push(
      <span key={interval} style={{ backgroundColor: '#fff', color: '#dc3545', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}>
        {timeLeft[interval] !== undefined ? timeLeft[interval] : 0} 
        <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#6c757d' }}>{interval.toUpperCase()}</div>
      </span>
    );
  });
  // --- END Đồng hồ đếm ngược ---
  
  const dealProduct = products.find(p => p.id === 5); // Sony XM5

  // Style cho Service Icons
  const serviceIconStyle = {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    textAlign: 'center',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s'
  };

  return (
    <div>
      {/* 1. Hero Carousel Section (Đã làm lại thanh lịch hơn) */}
      <section style={{ position: 'relative', height: '80vh', background: 'linear-gradient(135deg, #1f2937, #1e3a8a, #1f2937)', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '100%', ...styles.container, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center', width: '100%' }}>
            <div style={{ color: 'white', zIndex: 10 }}>
              <span style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '0.5rem 1rem', borderRadius: '9999px', marginBottom: '1.5rem', fontWeight: '600' }}>🚀 BEST PRICE GUARANTEED</span>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 'extrabold', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                The Future of Tech, Today.
              </h1>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#bfdbfe' }}>
                Explore Mới, Mạnh Mẽ, Tinh Tế. Khám phá các thiết bị điện tử hàng đầu.
              </p>
              <button 
                onClick={() => setCurrentPage('shop')}
                style={{ ...styles.buttonPrimary, padding: '1rem 2.5rem', fontSize: '1.125rem' }}
              >
                SHOP NOW →
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '10rem', opacity: 0.9 }}>
              {products[0].image}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Service Bar (Thanh Dịch vụ) */}
      <section style={{ backgroundColor: '#f0f4f8', padding: '3rem 0' }}>
        <div style={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div style={serviceIconStyle}>
              <Truck size={36} style={{ color: '#007bff', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>FREE SHIPPING</h4>
              <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>Trên mọi đơn hàng 
                 $500</p>
            </div>
            <div style={serviceIconStyle}>
              <RefreshCw size={36} style={{ color: '#007bff', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>30 DAY RETURN</h4>
              <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>Đổi trả dễ dàng</p>
            </div>
            <div style={serviceIconStyle}>
              <Headset size={36} style={{ color: '#007bff', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>24/7 SUPPORT</h4>
              <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>Hỗ trợ tận tâm</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Explorer (Khám phá Danh mục) */}
      <section style={{ padding: '4rem 0' }}>
        <div style={styles.container}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>Shop by Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.5rem' }}>
            {categories.slice(0, 6).map(cat => (
              <div 
                key={cat} 
                onClick={() => { setCurrentPage('shop'); }} // Chuyển sang Shop
                style={{ 
                  textAlign: 'center', 
                  padding: '1.5rem 1rem', 
                  backgroundColor: '#fff', 
                  borderRadius: '0.5rem', 
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid #e9ecef'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                  {cat === 'Smartphones' && '📱'}
                  {cat === 'Laptops' && '💻'}
                  {cat === 'Accessories' && '⌨️'}
                  {cat === 'Wearables' && '⌚'}
                  {cat === 'Audio' && '🎧'}
                  {cat === 'Gaming' && '🎮'}
                </div>
                <h3 style={{ fontWeight: '600', fontSize: '1rem', color: '#212529' }}>{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Deal of the Week (Banner ưu đãi) */}
      {dealProduct && (
        <section style={{ padding: '4rem 0', backgroundColor: '#f0f4f8' }}>
          <div style={styles.container}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'center', backgroundColor: '#fff', padding: '3rem', borderRadius: '0.75rem', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}>
              
              {/* Left: Product Info & Countdown */}
              <div>
                <span style={{ fontSize: '1rem', color: '#dc3545', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>🔥 DEAL OF THE WEEK</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{dealProduct.name}</h2>
                <p style={{ fontSize: '1.25rem', color: '#6c757d', marginBottom: '1.5rem' }}>
                  Save big on the industry-leading noise canceling headphones. Limited stock!
                </p>
                
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                        Only ${dealProduct.price}.00 
                    </p>
                    <p style={{ fontSize: '1.25rem', color: '#adb5bd', textDecoration: 'line-through' }}>
                        ${dealProduct.oldPrice || (dealProduct.price + 100)}.00
                    </p>
                </div>

                {/* Countdown Timer */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {timerComponents.length ? timerComponents : <span>Deal Ended!</span>}
                </div>
              </div>
              
              {/* Right: Product Image & Action */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>{dealProduct.image}</div>
                <button 
                  onClick={() => { handleAddToCart(dealProduct); setCurrentPage('cart'); }}
                  style={{ ...styles.buttonPrimary, padding: '1rem 3rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', gap: '0.5rem' }}
                >
                  <ShoppingBag size={20} /> GRAB THE DEAL
                </button>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* 5. Best Sellers */}
      <section style={{ padding: '4rem 0' }}>
        <div style={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Best Sellers 🔥</h2>
            <button 
              onClick={() => setCurrentPage('shop')}
              style={{ color: '#007bff', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {products.sort((a, b) => b.reviews - a.reviews).slice(0, 4).map(product => (
              <div key={product.id}>
                <ProductCard 
                  product={product} 
                  handleAddToCart={handleAddToCart} 
                  handleAddToWishlist={handleAddToWishlist} 
                  isInWishlist={isInWishlist}
                  handleViewProductDetail={handleViewProductDetail}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 6. Featured Products (Có thể thay bằng Banner quảng cáo nếu muốn) */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f8f8f8' }}>
        <div style={styles.container}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem' }}>Featured Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {products.slice(0, 6).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                handleAddToCart={handleAddToCart} 
                handleAddToWishlist={handleAddToWishlist} 
                isInWishlist={isInWishlist}
                handleViewProductDetail={handleViewProductDetail}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* 7. Blog Section (Giữ nguyên) */}
      <section style={{ padding: '4rem 0' }}>
        <div style={styles.container}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem' }}>Latest Tech News</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {blogs.slice(0, 3).map(blog => (
              <div key={blog.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' }}>
                <div style={{ background: 'linear-gradient(135deg, #60a5fa, #a855f7)', height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem' }}>📰</div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.75rem' }}>
                    <span>📅 {blog.date}</span>
                    <span>💬 {blog.comments}</span>
                  </div>
                  <h3 style={{ fontWeight: '600', color: '#212529', marginBottom: '0.75rem' }}>{blog.title}</h3>
                  <p style={{ color: '#495057', fontSize: '0.875rem', marginBottom: '1rem' }}>{blog.excerpt}</p>
                  <button onClick={() => setCurrentPage('blog')} style={{ color: '#007bff', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>READ MORE →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;