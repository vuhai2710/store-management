/**
 * COMPONENT MẪU - COPY VÀO FRONTEND CỦA BẠN
 * 
 * File này là ví dụ component React để hiển thị gợi ý sản phẩm trên trang chủ
 * 
 * Cách sử dụng:
 * 1. Copy code này vào project frontend của bạn
 * 2. Đảm bảo đã cài đặt axios: npm install axios
 * 3. Tích hợp vào trang chủ của bạn
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const HomePageRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Lấy token từ localStorage hoặc context
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        
        const response = await axios.get(
          `${API_BASE_URL}/products/recommendations/home?limit=10`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.data) {
          setRecommendations(response.data.data);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Không thể tải sản phẩm gợi ý');
        // Fallback: có thể hiển thị sản phẩm mới hoặc sản phẩm bán chạy
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <section className="recommendations-section" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          Sản phẩm gợi ý cho bạn
        </h2>
        <p>Đang tải...</p>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Không hiển thị nếu có lỗi hoặc không có sản phẩm
  }

  return (
    <section className="recommendations-section" style={{ padding: '40px 20px' }}>
      <h2 style={{ 
        marginBottom: '30px', 
        fontSize: '24px', 
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Sản phẩm gợi ý cho bạn
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {recommendations.map((product) => (
          <div 
            key={product.productId}
            style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => {
              // Điều hướng đến trang chi tiết
              window.location.href = `/products/${product.productId}`;
            }}
          >
            {/* Ảnh sản phẩm */}
            <div style={{
              width: '100%',
              height: '200px',
              overflow: 'hidden',
              background: '#f5f5f5'
            }}>
              <img 
                src={product.imageUrl || '/placeholder.jpg'} 
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
              />
            </div>
            
            {/* Thông tin sản phẩm */}
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
                <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
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
                  currency: 'VND'
                }).format(product.price)}
              </p>
              
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.background = '#1565c0'}
                onMouseLeave={(e) => e.target.style.background = '#1976d2'}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomePageRecommendations;


