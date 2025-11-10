// src/components/pages/WishlistPage.js
import React from 'react';
import styles from '../../styles/styles';
import ProductCard from '../shared/ProductCard';

const WishlistPage = ({ wishlist, setCurrentPage, handleAddToCart, handleAddToWishlist, isInWishlist, handleViewProductDetail }) => (
  <section style={{ padding: '4rem 0' }}>
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>My Wishlist ({wishlist.length})</h2>
      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f8f8', borderRadius: '0.5rem' }}>
          <p style={{ color: '#6c757d', fontSize: '1.125rem', marginBottom: '1.5rem' }}>Your wishlist is empty</p>
          <button 
            onClick={() => setCurrentPage('shop')}
            style={styles.buttonSecondary}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {wishlist.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              handleAddToCart={handleAddToCart} 
              handleAddToWishlist={handleAddToWishlist} 
              isInWishlist={isInWishlist}
              handleViewProductDetail={handleViewProductDetail} // <- TRUYỀN prop
            />
          ))}
        </div>
      )}
    </div>
  </section>
);

export default WishlistPage;