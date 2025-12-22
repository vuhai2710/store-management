
import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, Headset } from 'lucide-react';
import styles from '../../styles/styles';
import ProductCard from '../shared/ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import OnSaleSlider from '../homepage/OnSaleSlider';
import api from '../../services/api';
import { productsService } from '../../services/productsService';
import { categoriesService } from '../../services/categoriesService';
import { useAuth } from '../../hooks/useAuth';

const HomePage = ({ setCurrentPage, handleAddToCart, handleViewProductDetail, setSelectedCategory, handleCategoryNavigation }) => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [homepagePolicy, setHomepagePolicy] = useState({
    returnWindowDays: 7,
    autoFreeShippingPromotion: null,
  });

  useEffect(() => {
    const fetchHomepagePolicy = async () => {
      try {
        const response = await api.get('/settings/homepage-policy');
        setHomepagePolicy({
          returnWindowDays: response.data?.returnWindowDays || 7,
          autoFreeShippingPromotion: response.data?.autoFreeShippingPromotion || null,
        });
      } catch (err) {
        console.error('Error fetching homepage policy:', err);
        setHomepagePolicy({
          returnWindowDays: 7,
          autoFreeShippingPromotion: null,
        });
      }
    };

    fetchHomepagePolicy();
  }, []);

  useEffect(() => {
    const fetchData = async () => {

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const categoriesData = await categoriesService.getAll();
        setCategories(categoriesData || []);

        const bestSellersData = await productsService.getTop5BestSellingProducts();
        setBestSellers(bestSellersData || []);

        const newProductsData = await productsService.getNewProducts({ pageNo: 1, pageSize: 6 });
        setNewProducts(newProductsData?.content || []);

        const featuredData = await productsService.getProducts({ pageNo: 1, pageSize: 6 });
        setFeaturedProducts(featuredData?.content || []);

        try {
          const recommendedData = await productsService.getRecommendedProducts();
          console.log('Recommended products data:', recommendedData);
          setRecommendedProducts(Array.isArray(recommendedData) ? recommendedData : []);
        } catch (recError) {
          console.error('Error fetching recommended products:', recError);
          setRecommendedProducts([]);
        }

      } catch (err) {
        console.error('Error fetching homepage data:', err);

        if (err?.status !== 401) {
          setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const serviceIconStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
    transition: 'transform 0.3s'
  };

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
      { }
      <section style={{ position: 'relative', height: '80vh', background: 'linear-gradient(135deg, #020617, #1E293B, #2563EB)', overflow: 'hidden' }}>
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

      { }
      <section style={{ backgroundColor: '#f0f4f8', padding: '3rem 0' }}>
        <div style={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div style={serviceIconStyle}>
              <Truck size={36} style={{ color: '#2563EB', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                {homepagePolicy.autoFreeShippingPromotion
                  ? 'MIỄN PHÍ VẬN CHUYỂN'
                  : 'MIỄN PHÍ VẬN CHUYỂN'}
              </h4>
              {homepagePolicy.autoFreeShippingPromotion ? (
                <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                  Trên mọi đơn hàng {homepagePolicy.autoFreeShippingPromotion}
                </p>
              ) : null}
            </div>
            <div style={serviceIconStyle}>
              <RefreshCw size={36} style={{ color: '#2563EB', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>ĐỔI TRẢ {homepagePolicy.returnWindowDays} NGÀY</h4>
              <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>Đổi trả dễ dàng</p>
            </div>
            <div style={serviceIconStyle}>
              <Headset size={36} style={{ color: '#2563EB', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>HỖ TRỢ 24/7</h4>
              <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>Hỗ trợ tận tâm</p>
            </div>
          </div>
        </div>
      </section>

      { }
      {isAuthenticated && categories.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div style={styles.container}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>Mua sắm theo danh mục</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              {categories.slice(0, 6).map(cat => (
                <div
                  key={cat.idCategory || cat.id}
                  onClick={() => {

                    if (handleCategoryNavigation) {
                      handleCategoryNavigation(cat.idCategory || cat.id, cat.categoryName || cat.name);
                    } else {

                      if (setSelectedCategory) {
                        setSelectedCategory(cat.categoryName || cat.name);
                      }
                      setCurrentPage('shop');
                    }
                  }}
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
                  <h3 style={{ fontWeight: '600', fontSize: '1rem', color: '#212529', margin: 0 }}>
                    {cat.categoryName || cat.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      { }
      {!isAuthenticated && (
        <section style={{ padding: '4rem 0', backgroundColor: '#F8FAFC' }}>
          <div style={styles.container}>
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Chào mừng đến với Electronics Store! 🎉
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

      { }
      {isAuthenticated && (
        <OnSaleSlider
          handleViewProductDetail={handleViewProductDetail}
          onLoginClick={() => setCurrentPage('login')}
          onShopClick={() => setCurrentPage('shop')}
        />
      )}

      { }
      {isAuthenticated && bestSellers.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Sản phẩm bán chạy 🔥</h2>
              <button
                onClick={() => setCurrentPage('shop')}
                style={{ color: '#2563EB', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
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

      { }
      {isAuthenticated && (
        <section style={{ padding: '4rem 0', backgroundColor: '#f0f4f8' }}>
          <div style={styles.container}>
            {recommendedProducts.length > 0 ? (
              <>
                { }
                {recommendedProducts.slice(0, 4).length > 0 && (
                  <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Đã xem gần đây 👀</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                      {recommendedProducts.slice(0, 4).map(product => (
                        <ProductCard
                          key={product.idProduct || product.id}
                          product={product}
                          handleAddToCart={handleAddToCart}
                          handleViewProductDetail={handleViewProductDetail}
                        />
                      ))}
                    </div>
                  </div>
                )}

                { }
                {recommendedProducts.slice(4, 12).length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Gợi ý dành cho bạn ⭐</h2>
                      <button
                        onClick={() => setCurrentPage('shop')}
                        style={{ color: '#2563EB', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Xem tất cả →
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                      {recommendedProducts.slice(4, 12).map(product => (
                        <ProductCard
                          key={product.idProduct || product.id}
                          product={product}
                          handleAddToCart={handleAddToCart}
                          handleViewProductDetail={handleViewProductDetail}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                  Chưa có gợi ý sản phẩm. Hãy xem một số sản phẩm để chúng tôi có thể gợi ý cho bạn!
                </p>
                <button
                  onClick={() => setCurrentPage('shop')}
                  style={{ ...styles.buttonPrimary, padding: '0.75rem 1.5rem' }}
                >
                  Khám phá sản phẩm
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      { }
      {isAuthenticated && featuredProducts.length > 0 && (
        <section style={{ padding: '4rem 0', backgroundColor: '#F8FAFC' }}>
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

      { }
      {isAuthenticated && newProducts.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Sản phẩm mới 🆕</h2>
              <button
                onClick={() => setCurrentPage('shop')}
                style={{ color: '#2563EB', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
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
