// src/components/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, Headset, Clock, ShoppingBag } from 'lucide-react';
import styles from '../../styles/styles';
import ProductCard from '../shared/ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { productsService } from '../../services/productsService';
import { categoriesService } from '../../services/categoriesService';
import { formatPrice } from '../../utils/formatUtils';
import { useAuth } from '../../hooks/useAuth';

// Component NHẬN handleViewProductDetail
const HomePage = ({ setCurrentPage, handleAddToCart, handleViewProductDetail }) => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch data from API only when authenticated
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch data if user is authenticated
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoriesData = await categoriesService.getAll();
        setCategories(categoriesData || []);

        // Fetch best sellers
        const bestSellersData = await productsService.getTop5BestSellingProducts();
        setBestSellers(bestSellersData || []);

        // Fetch new products
        const newProductsData = await productsService.getNewProducts({ pageNo: 1, pageSize: 6 });
        setNewProducts(newProductsData?.content || []);

        // Fetch featured products (first 6 products)
        const featuredData = await productsService.getProducts({ pageNo: 1, pageSize: 6 });
        setFeaturedProducts(featuredData?.content || []);

        // Fetch recommendations
        try {
          console.log('[HomePage] Fetching recommendations...');
          const recommendationsData = await productsService.getHomeRecommendations({ limit: 6 });
          console.log('[HomePage] Recommendations received:', recommendationsData);
          // Map recommendations to match ProductCard format (productId -> idProduct)
          const mappedRecommendations = (recommendationsData || []).map(rec => ({
            ...rec,
            idProduct: rec.productId || rec.idProduct || rec.id,
            productName: rec.name || rec.productName,
          }));
          console.log('[HomePage] Mapped recommendations:', mappedRecommendations);
          setRecommendations(mappedRecommendations);
        } catch (err) {
          console.error('[HomePage] Error fetching recommendations:', err);
          setRecommendations([]);
        }

      } catch (err) {
        console.error('Error fetching homepage data:', err);
        // Don't show error if it's just authentication issue
        if (err?.status !== 401) {
          setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // --- CHỨC NĂNG MÔ PHỎNG: Đồng hồ đếm ngược cho Deal of the Week ---
  const calculateTimeLeft = () => {
    const difference = +new Date('2025-12-31') - +new Date();
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

    return () => clearTimeout(timer);
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
  
  const dealProduct = bestSellers[0] || newProducts[0]; // Get first product from best sellers or new products

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

  // Show loading only when authenticated and loading
  if (loading && isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.buttonPrimary}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Hero Carousel Section (Đã làm lại thanh lịch hơn) */}
      <section style={{ position: 'relative', height: '80vh', background: 'linear-gradient(135deg, #1f2937, #1e3a8a, #1f2937)', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '100%', ...styles.container, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center', width: '100%' }}>
            <div style={{ color: 'white', zIndex: 10 }}>
              <span style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '0.5rem 1rem', borderRadius: '9999px', marginBottom: '1.5rem', fontWeight: '600' }}>🚀 CAM KẾT GIÁ TỐT NHẤT</span>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 'extrabold', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                Tương lai công nghệ, ngay hôm nay.
              </h1>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#bfdbfe' }}>
                Khám phá mới, mạnh mẽ, tinh tế. Khám phá các thiết bị điện tử hàng đầu.
              </p>
              <button 
                onClick={() => setCurrentPage('shop')}
                style={{ ...styles.buttonPrimary, padding: '1rem 2.5rem', fontSize: '1.125rem' }}
              >
                MUA SẮM NGAY →
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '10rem', opacity: 0.9 }}>
              💻
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
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>MIỄN PHÍ VẬN CHUYỂN</h4>
              <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>Trên mọi đơn hàng 
                 500.000đ</p>
            </div>
            <div style={serviceIconStyle}>
              <RefreshCw size={36} style={{ color: '#007bff', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>ĐỔI TRẢ 30 NGÀY</h4>
              <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>Đổi trả dễ dàng</p>
            </div>
            <div style={serviceIconStyle}>
              <Headset size={36} style={{ color: '#007bff', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>HỖ TRỢ 24/7</h4>
              <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>Hỗ trợ tận tâm</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Explorer (Khám phá Danh mục) */}
      {isAuthenticated && categories.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div style={styles.container}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>Mua sắm theo danh mục</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              {categories.slice(0, 6).map(cat => (
                <div 
                  key={cat.idCategory || cat.id} 
                  onClick={() => { setCurrentPage('shop'); }} 
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
                    📦
                  </div>
                  <h3 style={{ fontWeight: '600', fontSize: '1rem', color: '#212529' }}>
                    {cat.categoryName || cat.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Login Prompt for unauthenticated users */}
      {!isAuthenticated && (
        <section style={{ padding: '4rem 0', backgroundColor: '#f8f9fa' }}>
          <div style={styles.container}>
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Chào mừng đến với TechStore! 🎉
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#6c757d', marginBottom: '2rem' }}>
                Đăng nhập để xem sản phẩm và mua sắm ngay hôm nay!
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => setCurrentPage('login')}
                  style={{ ...styles.buttonPrimary, padding: '1rem 2rem', fontSize: '1.125rem' }}
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => setCurrentPage('register')}
                  style={{ ...styles.buttonSecondary, padding: '1rem 2rem', fontSize: '1.125rem' }}
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Deal of the Week (Banner ưu đãi) */}
      {isAuthenticated && dealProduct && (
        <section style={{ padding: '4rem 0', backgroundColor: '#f0f4f8' }}>
          <div style={styles.container}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'center', backgroundColor: '#fff', padding: '3rem', borderRadius: '0.75rem', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}>
              
              {/* Left: Product Info & Countdown */}
              <div>
                <span style={{ fontSize: '1rem', color: '#dc3545', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>🔥 ƯU ĐÃI TUẦN NÀY</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  {dealProduct.productName || dealProduct.name}
                </h2>
                <p style={{ fontSize: '1.25rem', color: '#6c757d', marginBottom: '1.5rem' }}>
                  {dealProduct.description || 'Tiết kiệm lớn với sản phẩm tuyệt vời này. Số lượng có hạn!'}
                </p>
                
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                        Chỉ {formatPrice(dealProduct.price)} 
                    </p>
                </div>

                {/* Countdown Timer */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {timerComponents.length ? timerComponents : <span>Ưu đãi đã kết thúc!</span>}
                </div>
              </div>
              
              {/* Right: Product Image & Action */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>📦</div>
                <button 
                  onClick={() => { handleAddToCart(dealProduct); setCurrentPage('cart'); }}
                  style={{ ...styles.buttonPrimary, padding: '1rem 3rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', gap: '0.5rem' }}
                >
                  <ShoppingBag size={20} /> MUA NGAY
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Product Recommendations */}
      {isAuthenticated && (
        <section style={{ padding: '4rem 0', backgroundColor: '#f8f9fa' }}>
          <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>💡 Sản phẩm gợi ý cho bạn</h2>
              <button 
                onClick={() => setCurrentPage('shop')}
                style={{ color: '#007bff', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Xem tất cả →
              </button>
            </div>
            {recommendations.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {recommendations.map(product => (
                  <ProductCard 
                    key={product.idProduct || product.productId || product.id} 
                    product={product} 
                    handleAddToCart={handleAddToCart} 
                    handleViewProductDetail={handleViewProductDetail}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p>Đang tải sản phẩm gợi ý...</p>
                {loading && <LoadingSpinner />}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. Best Sellers */}
      {isAuthenticated && bestSellers.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Sản phẩm bán chạy 🔥</h2>
              <button 
                onClick={() => setCurrentPage('shop')}
                style={{ color: '#007bff', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Xem tất cả →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {bestSellers.slice(0, 4).map(product => (
                <ProductCard 
                  key={product.idProduct || product.id} 
                  product={product} 
                  handleAddToCart={handleAddToCart} 
                  handleViewProductDetail={handleViewProductDetail}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* 7. Featured Products */}
      {isAuthenticated && featuredProducts.length > 0 && (
        <section style={{ padding: '4rem 0', backgroundColor: '#f8f8f8' }}>
          <div style={styles.container}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem' }}>Sản phẩm nổi bật</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {featuredProducts.slice(0, 6).map(product => (
                <ProductCard 
                  key={product.idProduct || product.id} 
                  product={product} 
                  handleAddToCart={handleAddToCart} 
                  handleViewProductDetail={handleViewProductDetail}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* 8. New Products */}
      {isAuthenticated && newProducts.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Sản phẩm mới 🆕</h2>
              <button 
                onClick={() => setCurrentPage('shop')}
                style={{ color: '#007bff', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Xem tất cả →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {newProducts.slice(0, 6).map(product => (
                <ProductCard 
                  key={product.idProduct || product.id} 
                  product={product} 
                  handleAddToCart={handleAddToCart} 
                  handleViewProductDetail={handleViewProductDetail}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;