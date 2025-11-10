// src/components/pages/ShopPage.js
import React, { useState } from 'react'; 
import styles from '../../styles/styles';
import ProductCard from '../shared/ProductCard';
import { products, categories } from '../../data/data';
import { Grid3X3, List } from 'lucide-react'; 

const ShopPage = ({ 
  filteredProducts, 
  selectedCategory, 
  setSelectedCategory, 
  handleAddToCart, 
  handleAddToWishlist, 
  isInWishlist, 
  handleViewProductDetail,
  sortOption,         
  setSortOption,
  setCurrentPage      // <--- KHẮC PHỤC LỖI: Đảm bảo prop này được nhận
}) => {
  const latestProducts = products.sort((a, b) => b.id - a.id).slice(0, 3);
  const [currentPriceRange, setCurrentPriceRange] = useState(3000); 
  
  // Style cho nút Category Filter
  const filterButtonStyle = (isActive) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: isActive ? '1px solid #007bff' : '1px solid #dee2e6',
    backgroundColor: isActive ? '#e0f7ff' : 'white',
    color: isActive ? '#007bff' : '#495057',
    fontWeight: isActive ? '600' : 'normal',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.3s',
    marginBottom: '0.25rem'
  });

  const handlePriceChange = (e) => {
    setCurrentPriceRange(parseInt(e.target.value));
  };
  
  // Áp dụng lọc giá 
  const productsToShow = filteredProducts.filter(p => p.price <= currentPriceRange);

  return (
    <section style={{ padding: '4rem 0', backgroundColor: '#f8f8f8' }}>
      <div style={styles.container}>
        
        {/* Breadcrumb và Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Tech Products Shop</h2>
            <div style={{ color: '#6c757d' }}>
                {/* Sử dụng setCurrentPage an toàn */}
                <button onClick={() => setCurrentPage('home')} style={{ ...styles.navLink, color: '#007bff', padding: 0 }}>Home</button> /
                <span> Shop</span>
            </div>
        </div>

        {/* Main Layout: Sidebar and Products */}
        <div style={styles.shopLayout}>
          
          {/* Sidebar (Modern Filters) */}
          <div style={styles.sidebar}>
            
            {/* Bộ lọc Danh mục */}
            <div style={styles.sidebarSection}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Filter by Category</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['All', ...categories].map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      style={filterButtonStyle(selectedCategory === cat)}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bộ lọc Giá (Slider mô phỏng) */}
            <div style={styles.sidebarSection}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Filter by Price</h3>
              <div style={{ padding: '0.5rem 0' }}>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="100" 
                  value={currentPriceRange}
                  onChange={handlePriceChange}
                  style={{ width: '100%', cursor: 'pointer', marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#495057' }}>
                    <span>$0</span>
                    <span style={{ fontWeight: 'bold', color: '#007bff', fontSize: '1rem', padding: '0.25rem 0.5rem', border: '1px solid #007bff', borderRadius: '0.25rem' }}>
                        MAX: ${currentPriceRange}
                    </span>
                    <span>$3000+</span>
                </div>
              </div>
            </div>
            
            {/* Sản phẩm mới nhất */}
            <div style={{...styles.sidebarSection, borderBottom: 'none'}}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Latest Additions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {latestProducts.map(product => (
                  <div 
                    key={product.id} 
                    style={{...styles.latestProductItem, cursor: 'pointer'}}
                    onClick={() => handleViewProductDetail(product.id)}
                  >
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#e9ecef', borderRadius: '0.25rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{product.image}</div>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#212529' }}>{product.name}</h4>
                      <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '0.875rem' }}>${product.price}.00</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Vùng hiển thị Sản phẩm */}
          <div>
            
            {/* Toolbar trên lưới sản phẩm */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#495057', fontWeight: '500' }}>
                    Showing **{productsToShow.length}** Products
                </p>
                
                {/* Sorting Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>Sort By:</span>
                    <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.375rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="default">Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating-desc">Top Rated</option>
                      <option value="reviews-desc">Most Reviewed</option>
                    </select>
                </div>

                {/* View Toggles (Mô phỏng) */}
                <div style={{ display: 'flex', gap: '0.5rem', color: '#6c757d' }}>
                    <Grid3X3 size={20} style={{ cursor: 'pointer', color: '#007bff' }} />
                    <List size={20} style={{ cursor: 'pointer' }} />
                </div>
            </div>

            {/* Lưới sản phẩm */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {productsToShow.length > 0 ? (
                productsToShow.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    handleAddToCart={handleAddToCart} 
                    handleAddToWishlist={handleAddToWishlist} 
                    isInWishlist={isInWishlist}
                    handleViewProductDetail={handleViewProductDetail} 
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #dee2e6' }}>
                  <p style={{ color: '#6c757d', fontSize: '1.125rem' }}>No products found matching your current filters.</p>
                </div>
              )}
            </div>

            {/* Pagination (Mô phỏng) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                <button style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.25rem', backgroundColor: '#fff', cursor: 'pointer' }}>1</button>
                <button style={{ padding: '0.5rem 1rem', border: '1px solid #007bff', borderRadius: '0.25rem', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>2</button>
                <button style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.25rem', backgroundColor: '#fff', cursor: 'pointer' }}>3</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ShopPage;