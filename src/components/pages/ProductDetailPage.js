// src/components/pages/ProductDetailPage.js
import React, { useState } from 'react';
import { Minus, Plus, Heart, Share2, ShoppingBag } from 'lucide-react';
import styles from '../../styles/styles';
import StarRating from '../layout/StarRating';
import ProductCard from '../shared/ProductCard';

const ProductDetailPage = ({ product, products, cart, setCurrentPage, handleAddToCart, handleAddToWishlist, isInWishlist, handleViewProductDetail }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [qty, setQty] = useState(1);
  const itemInCart = cart.find(item => item.id === product.id);

  // Lấy 4 sản phẩm cùng danh mục (liên quan)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleQuantityChange = (delta) => {
    setQty(prev => Math.max(1, prev + delta));
  };
  
  const handleAddToCartClick = () => {
      // Truyền sản phẩm cùng với số lượng đã chọn
      const productWithQty = { ...product, qty };
      handleAddToCart(productWithQty);
  };
  
  const handleBuyNow = () => {
    handleAddToCartClick();
    setCurrentPage('cart'); // Chuyển đến trang giỏ hàng ngay lập tức
  };

  // --- Helpers cho khu vực Tabs ---
  const DescriptionBlock = () => (
    <div style={{ padding: '1.5rem', border: '1px solid #dee2e6', borderRadius: '0.5rem', backgroundColor: '#fff' }}>
      <h4 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '2px solid #007bff', display: 'inline-block', paddingBottom: '0.25rem' }}>
        Product Description
      </h4>
      <p style={{ lineHeight: 1.6, color: '#495057', marginBottom: '1.5rem' }}>
        {product.desc}
      </p>
      <h5 style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.75rem' }}>
        Key Specifications:
      </h5>
      <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#495057' }}>
        {Object.entries(product.specs || {}).map(([key, value]) => (
          <li key={key} style={{ marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 'bold' }}>{key.toUpperCase()}:</span> {value}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: '1.5rem', fontStyle: 'italic', color: '#6c757d' }}>
        Note: Specifications are based on the standard model configuration.
      </p>
    </div>
  );

  const ReviewsBlock = () => (
    <div style={{ padding: '1.5rem', border: '1px solid #dee2e6', borderRadius: '0.5rem', backgroundColor: '#fff' }}>
      <h4 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
        Customer Reviews ({product.reviews})
      </h4>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' }}>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#007bff' }}>
          {product.rating}
        </div>
        <div>
          <StarRating rating={product.rating} />
          <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>Based on {product.reviews} ratings</p>
        </div>
      </div>
      
      <p style={{ color: '#6c757d', textAlign: 'center' }}>No detailed reviews available yet for this product.</p>

      <button style={{ ...styles.buttonPrimary, padding: '0.5rem 1rem', fontSize: '0.875rem', marginTop: '1rem' }}>
        Write a Review
      </button>
    </div>
  );

  const InformationBlock = () => (
    <div style={{ padding: '1.5rem', border: '1px solid #dee2e6', borderRadius: '0.5rem', backgroundColor: '#fff' }}>
      <h4 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>Shipping & Returns</h4>
      <p style={{ lineHeight: 1.6, color: '#495057', marginBottom: '1.5rem' }}>
        We offer Free Shipping for all orders over $500 worldwide. 
        Delivery time usually takes 3-7 business days depending on the region.
      </p>
      <p style={{ lineHeight: 1.6, color: '#495057' }}>
        Returns are accepted within 30 days of receiving your order, provided the item is unused and in its original packaging.
      </p>
    </div>
  );
  
  // --- Main Render ---
  return (
    <section style={{ padding: '4rem 0', backgroundColor: '#f8f8f8' }}>
      <div style={styles.container}>

        {/* Breadcrumb */}
        <div style={{ color: '#6c757d', marginBottom: '2rem' }}>
          <button onClick={() => setCurrentPage('home')} style={{ ...styles.navLink, color: '#007bff', padding: 0 }}>Home</button> /
          <button onClick={() => setCurrentPage('shop')} style={{ ...styles.navLink, color: '#007bff', padding: 0 }}> Shop</button> /
          <span> {product.name}</span>
        </div>

        {/* Product Details Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          
          {/* Image Gallery (Left) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              {product.image}
            </div>
            {/* Gallery Thumbnails */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ width: '80px', height: '80px', backgroundColor: '#e9ecef', borderRadius: '0.25rem', opacity: i === 0 ? 1 : 0.6, cursor: 'pointer', border: i === 0 ? '2px solid #007bff' : 'none' }}></div>
              ))}
            </div>
          </div>

          {/* Product Info (Right) */}
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.2' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <StarRating rating={product.rating} />
              <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>({product.reviews} Reviews)</span>
              <span style={{ color: '#28a745', fontWeight: '600', marginLeft: '1rem' }}>
                ✅ In Stock
              </span>
            </div>

            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc3545', marginBottom: '1rem' }}>
              ${product.price}.00 
              {product.oldPrice && <span style={{ fontSize: '1.25rem', color: '#adb5bd', textDecoration: 'line-through', marginLeft: '1rem' }}>${product.oldPrice}.00</span>}
            </p>

            <p style={{ color: '#495057', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.desc}
            </p>

            {/* Quantity Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', border: '1px solid #dee2e6', borderRadius: '0.5rem' }}>
                <div style={{ fontWeight: 'bold', color: '#495057' }}>Quantity:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }}>
                    <button onClick={() => handleQuantityChange(-1)} style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer' }}>
                        <Minus size={18} />
                    </button>
                    <span style={{ padding: '0 0.5rem', fontWeight: 'bold' }}>{qty}</span>
                    <button onClick={() => handleQuantityChange(1)} style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer' }}>
                        <Plus size={18} />
                    </button>
                </div>
                {itemInCart && <span style={{ color: '#007bff', fontSize: '0.875rem' }}>({itemInCart.qty} in cart)</span>}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={handleAddToCartClick}
                style={{ ...styles.buttonSecondary, padding: '1rem 2rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ShoppingBag size={20} /> ADD TO CART
              </button>
              <button 
                onClick={handleBuyNow}
                style={{ ...styles.buttonPrimary, padding: '1rem 2rem', fontSize: '1.125rem' }}
              >
                BUY NOW
              </button>
            </div>
            
            {/* Wishlist & Share */}
            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => handleAddToWishlist(product)}
                        style={{ background: 'none', border: 'none', color: '#495057', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Heart size={20} style={{ fill: isInWishlist(product.id) ? 'red' : 'none', color: isInWishlist(product.id) ? 'red' : '#495057' }} />
                        {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6c757d', fontSize: '0.875rem' }}>
                    <span>SHARE:</span> <Share2 size={18} style={{ cursor: 'pointer' }} />
                </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description, Information, Reviews (Bottom) */}
        <div style={{ marginBottom: '4rem' }}>
            {/* Tab Navigations */}
            <div style={{ display: 'flex', borderBottom: '2px solid #e9ecef', marginBottom: '1.5rem' }}>
                {['description', 'information', 'reviews'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '1rem 1.5rem',
                            border: 'none',
                            background: 'none',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            color: activeTab === tab ? '#007bff' : '#495057',
                            borderBottom: activeTab === tab ? '2px solid #007bff' : '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: '1.125rem',
                            transition: 'color 0.3s, border-bottom 0.3s'
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'description' && <DescriptionBlock />}
                {activeTab === 'information' && <InformationBlock />}
                {activeTab === 'reviews' && <ReviewsBlock />}
            </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {relatedProducts.length > 0 ? (
                relatedProducts.map(related => (
                    <ProductCard 
                        key={related.id} 
                        product={related} 
                        handleAddToCart={handleAddToCart} 
                        handleAddToWishlist={handleAddToWishlist} 
                        isInWishlist={isInWishlist}
                        handleViewProductDetail={handleViewProductDetail} // <- TRUYỀN prop
                    />
                ))
            ) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6c757d' }}>No related products found in the same category.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;