// src/components/pages/CartPage.js
import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import styles from '../../styles/styles';

const CartPage = ({ cart, cartTotal, setCurrentPage, handleUpdateQty, handleRemoveFromCart }) => (
  <section style={{ padding: '4rem 0' }}>
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Shopping Cart</h2>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f8f8', borderRadius: '0.5rem' }}>
          <p style={{ color: '#6c757d', fontSize: '1.125rem', marginBottom: '1.5rem' }}>Your cart is empty</p>
          <button 
            onClick={() => setCurrentPage('shop')}
            style={styles.buttonSecondary}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '2rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Products</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Price</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Quantity</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id} style={styles.tableRow}>
                    <td style={{ padding: '1rem' }}>{item.name}</td>
                    <td style={{ padding: '1rem' }}>${item.price}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => handleUpdateQty(item.id, item.qty - 1)} style={{ backgroundColor: '#e9ecef', padding: '0.25rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>
                          <Minus size={16} />
                        </button>
                        <span style={{ width: '2rem', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => handleUpdateQty(item.id, item.qty + 1)} style={{ backgroundColor: '#e9ecef', padding: '0.25rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>${(item.price * item.qty)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleRemoveFromCart(item.id)}
                        style={{ backgroundColor: '#fdecec', color: '#dc3545', padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>{/* Phần trống cho desktop */}</div>
            <div style={{ backgroundColor: '#f8f8f8', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #dee2e6' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Cart Total</h3>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>${cartTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem', color: '#28a745' }}>
                  <span>Total</span>
                  <span>${cartTotal}</span>
                </div>
              </div>
              <button style={{ ...styles.buttonSecondary, width: '100%', padding: '0.75rem' }}>CHECKOUT</button>
            </div>
          </div>
        </>
      )}
    </div>
  </section>
);

export default CartPage;