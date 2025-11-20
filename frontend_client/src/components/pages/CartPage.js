// src/components/pages/CartPage.js
import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import styles from '../../styles/styles';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatPrice, getImageUrl } from '../../utils/formatUtils';

const CartPage = ({ cart, cartTotal, cartSubtotal, cartAutomaticDiscount, setCurrentPage, handleUpdateQty, handleRemoveFromCart, cartLoading }) => {
  
  if (cartLoading) {
    return (
      <section style={{ padding: '4rem 0' }}>
        <div style={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '4rem 0' }}>
      <div style={styles.container}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Giỏ hàng</h2>
        {!cart || cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f8f8', borderRadius: '0.5rem' }}>
            <ShoppingBag size={64} style={{ color: '#6c757d', margin: '0 auto 1rem' }} />
            <p style={{ color: '#6c757d', fontSize: '1.125rem', marginBottom: '1.5rem' }}>Giỏ hàng của bạn đang trống</p>
            <button 
              onClick={() => setCurrentPage('shop')}
              style={styles.buttonSecondary}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', marginBottom: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1rem' }}>Sản phẩm</th>
                    <th style={{ textAlign: 'left', padding: '1rem' }}>Giá</th>
                    <th style={{ textAlign: 'left', padding: '1rem' }}>Số lượng</th>
                    <th style={{ textAlign: 'left', padding: '1rem' }}>Tổng</th>
                    <th style={{ textAlign: 'center', padding: '1rem' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => {
                    const productName = item.productName || item.product?.productName || item.name || 'Sản phẩm không xác định';
                    const originalUnitPrice = item.productPrice || item.price || item.product?.price || 0;
                    const quantity = item.quantity || item.qty || 0;
                    const originalSubtotal = item.subtotal || (originalUnitPrice * quantity);
                    const discountedSubtotal = item.discountedSubtotal != null ? item.discountedSubtotal : originalSubtotal;
                    const discountedUnitPrice = item.discountedUnitPrice != null && quantity
                      ? item.discountedUnitPrice
                      : (discountedSubtotal / (quantity || 1));
                    const itemId = item.idCartItem || item.id;
                    const productId = item.idProduct || item.productId || item.product?.idProduct || item.product?.id;
                    const productImage = item.productImageUrl || item.productImage || item.product?.imageUrl || item.imageUrl;

                    return (
                      <tr key={itemId} style={styles.tableRow}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#e9ecef', borderRadius: '0.25rem', overflow: 'hidden', flexShrink: 0 }}>
                              {productImage ? (
                                <img 
                                  src={getImageUrl(productImage)} 
                                  alt={productName}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📦</div>';
                                  }}
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
                              )}
                            </div>
                            <div>
                              <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#212529' }}>{productName}</h4>
                              {item.productCode || item.product?.productCode && (
                                <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                  Code: {item.productCode || item.product?.productCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>
                          {discountedUnitPrice != null && discountedUnitPrice < originalUnitPrice ? (
                            <div>
                              <div style={{ textDecoration: 'line-through', color: '#6c757d', fontSize: '0.875rem' }}>
                                {formatPrice(originalUnitPrice)}
                              </div>
                              <div>
                                {formatPrice(discountedUnitPrice)}
                              </div>
                            </div>
                          ) : (
                            <span>{formatPrice(originalUnitPrice)}</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handleUpdateQty(itemId, quantity - 1)} 
                              style={{ 
                                backgroundColor: '#e9ecef', 
                                padding: '0.5rem', 
                                borderRadius: '0.25rem', 
                                border: 'none', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Minus size={16} />
                            </button>
                            <span style={{ width: '3rem', textAlign: 'center', fontWeight: '600' }}>{quantity}</span>
                            <button 
                              onClick={() => handleUpdateQty(itemId, quantity + 1)} 
                              style={{ 
                                backgroundColor: '#e9ecef', 
                                padding: '0.5rem', 
                                borderRadius: '0.25rem', 
                                border: 'none', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {discountedSubtotal < originalSubtotal ? (
                            <div style={{ fontWeight: '600', color: '#007bff' }}>
                              <div style={{ textDecoration: 'line-through', color: '#6c757d', fontSize: '0.875rem' }}>
                                {formatPrice(originalSubtotal)}
                              </div>
                              <div>
                                {formatPrice(discountedSubtotal)}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontWeight: '600', color: '#007bff' }}>
                              {formatPrice(originalSubtotal)}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleRemoveFromCart(itemId)}
                            style={{ 
                              backgroundColor: '#fdecec', 
                              color: '#dc3545', 
                              padding: '0.5rem', 
                              borderRadius: '0.25rem', 
                              border: 'none', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto'
                            }}
                            title="Xóa khỏi giỏ hàng"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>{/* Empty space for desktop */}</div>
              <div style={{ backgroundColor: '#f8f8f8', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Tổng giỏ hàng</h3>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#495057' }}>
                    <span>Tạm tính</span>
                    <span>{formatPrice(cartSubtotal ?? cartTotal)}</span>
                  </div>
                  {cartAutomaticDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#28a745' }}>
                      <span>Giảm giá tự động</span>
                      <span>-{formatPrice(cartAutomaticDiscount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d', fontSize: '0.875rem' }}>
                    <span>Phí vận chuyển</span>
                    <span>Tính khi thanh toán</span>
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Tổng cộng</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#28a745' }}>
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <button 
                  onClick={() => setCurrentPage('checkout')}
                  style={{ ...styles.buttonPrimary, width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold' }}
                >
                  THANH TOÁN
                </button>
                <button 
                  onClick={() => setCurrentPage('shop')}
                  style={{ ...styles.buttonSecondary, width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.875rem' }}
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CartPage;
