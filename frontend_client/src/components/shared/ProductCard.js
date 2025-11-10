// src/components/shared/ProductCard.js
import React from 'react';
import { Heart } from 'lucide-react';
import styles from '../../styles/styles';
import StarRating from '../layout/StarRating';

const ProductCard = ({ product, handleAddToCart, handleAddToWishlist, isInWishlist, handleViewProductDetail }) => (
  <div style={styles.card}>
    {/* Vùng ảnh và thông tin có thể click để xem chi tiết */}
    <div 
        onClick={() => handleViewProductDetail(product.id)} // <- Gọi hàm handleViewProductDetail
        style={{ cursor: 'pointer' }}
    >
        <div style={styles.cardImage}>
          {product.image}
          <button 
            // Dừng sự kiện lan truyền để chỉ kích hoạt Wishlist, không kích hoạt xem chi tiết
            onClick={(e) => { e.stopPropagation(); handleAddToWishlist(product); }}
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer' }}
          >
            <Heart size={18} style={{ fill: isInWishlist(product.id) ? 'red' : 'none', color: isInWishlist(product.id) ? 'red' : '#495057' }} />
          </button>
        </div>
        <div style={styles.cardContent}>
          <h3 style={styles.cardTitle}>{product.name}</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <StarRating rating={product.rating} />
            <p style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.25rem' }}>({product.reviews})</p>
          </div>
          <p style={styles.cardPrice}>${product.price}.00</p>
        </div>
    </div>
    {/* Nút Add to Cart (riêng biệt) */}
    <div style={{ padding: '0 1rem 1rem' }}>
        <button 
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} // Add to cart
            style={{ ...styles.buttonSecondary, width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
        >
            ADD
        </button>
    </div>
  </div>
);

export default ProductCard;