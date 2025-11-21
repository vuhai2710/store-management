// src/components/shared/ProductCard.js
import React, { useState, useRef, useEffect } from 'react';
import styles from '../../styles/styles';
import StarRating from '../layout/StarRating';
import { getImageUrl, formatPrice } from '../../utils/formatUtils';
import { INVENTORY_STATUS, INVENTORY_STATUS_LABELS, INVENTORY_STATUS_COLORS } from '../../constants/inventoryStatus';
import { promotionService } from '../../services/promotionService';
import { useAuth } from '../../hooks/useAuth';

const ProductCard = ({ product, handleAddToCart, handleViewProductDetail }) => {
  const [imageError, setImageError] = useState(false);
  const addToCartButtonRef = useRef(null);
  const [autoDiscount, setAutoDiscount] = useState(0);
  const [autoDiscountInfo, setAutoDiscountInfo] = useState(null);
  const { isAuthenticated } = useAuth();

  // Get product image URL
  const getProductImage = () => {
    if (imageError) return null;
    // Try to get image from product.images array (first image)
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0].imageUrl || product.images[0].url);
    }
    // Try to get image from product.imageUrl
    if (product.imageUrl) {
      return getImageUrl(product.imageUrl);
    }
    // Fallback to emoji if no image
    return null;
  };

  const productImage = getProductImage();
  const productName = product.productName || product.name;
  const productPrice = product.price || 0;
  const status = product.status || product.inventoryStatus || INVENTORY_STATUS.IN_STOCK;
  const isOutOfStock = status === INVENTORY_STATUS.OUT_OF_STOCK;
  const finalPrice = Math.max(0, productPrice - (autoDiscount || 0));
  const averageRating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;

  useEffect(() => {
    const calculateAutoDiscount = async () => {
      if (!isAuthenticated || !product) {
        setAutoDiscount(0);
        setAutoDiscountInfo(null);
        return;
      }

      const basePrice = product.price || 0;
      if (!basePrice || basePrice <= 0) {
        setAutoDiscount(0);
        setAutoDiscountInfo(null);
        return;
      }

      try {
        const response = await promotionService.calculateDiscount({
          totalAmount: basePrice,
          items: [
            {
              productId: product.idProduct || product.id,
              quantity: 1,
            },
          ],
        });

        if (response && response.applicable && response.discount > 0) {
          setAutoDiscount(Number(response.discount));
          setAutoDiscountInfo(response);
        } else {
          setAutoDiscount(0);
          setAutoDiscountInfo(null);
        }
      } catch (e) {
        setAutoDiscount(0);
        setAutoDiscountInfo(null);
      }
    };

    calculateAutoDiscount();
  }, [isAuthenticated, product]);

  return (
    <div style={styles.card}>
      {/* Vùng ảnh và thông tin có thể click để xem chi tiết */}
      <div
        onClick={() => handleViewProductDetail(product.idProduct || product.id)}
        style={{ cursor: 'pointer' }}
      >
        <div style={styles.cardImage}>
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              onError={() => setImageError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              backgroundColor: '#e9ecef'
            }}>
              {product.image || '📦'}
            </div>
          )}
          {isOutOfStock && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(220, 53, 69, 0.9)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              Hết hàng
            </div>
          )}
        </div>
        <div style={styles.cardContent}>
          <h3 style={styles.cardTitle}>{productName}</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <StarRating rating={averageRating} />
            {reviewCount > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.25rem' }}>
                ({reviewCount})
              </p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            {autoDiscount > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div>
                  <span
                    style={{
                      textDecoration: 'line-through',
                      color: '#6c757d',
                      fontSize: '0.875rem',
                      marginRight: '0.5rem',
                    }}
                  >
                    {formatPrice(productPrice)}
                  </span>
                  <span style={styles.cardPrice}>{formatPrice(finalPrice)}</span>
                </div>
              </div>
            ) : (
              <p style={styles.cardPrice}>{formatPrice(productPrice)}</p>
            )}
            {status && (
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                backgroundColor: INVENTORY_STATUS_COLORS[status] + '20',
                color: INVENTORY_STATUS_COLORS[status],
                fontWeight: '600'
              }}>
                {INVENTORY_STATUS_LABELS[status] || status}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Nút Add to Cart (riêng biệt) */}
      <div style={{ padding: '0 1rem 1rem' }}>
        <button
          ref={addToCartButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(product, addToCartButtonRef.current);
          }}
          disabled={isOutOfStock}
          style={{
            ...styles.buttonSecondary,
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.875rem',
            opacity: isOutOfStock ? 0.5 : 1,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer'
          }}
        >
          {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;