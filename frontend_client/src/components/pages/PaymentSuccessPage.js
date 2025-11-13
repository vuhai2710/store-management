// src/components/pages/PaymentSuccessPage.js
import React, { useEffect } from 'react';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import styles from '../../styles/styles';

const PaymentSuccessPage = ({ setCurrentPage }) => {
  useEffect(() => {
    // Redirect to orders page after 3 seconds
    const timer = setTimeout(() => {
      setCurrentPage('orders');
    }, 3000);

    return () => clearTimeout(timer);
  }, [setCurrentPage]);

  return (
    <section style={{ padding: '4rem 0', backgroundColor: '#f8f9fa', minHeight: '80vh' }}>
      <div style={styles.container}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 2rem',
            backgroundColor: '#28a745',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            <CheckCircle size={60} color="white" />
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#28a745',
            marginBottom: '1rem'
          }}>
            Thanh toán thành công!
          </h1>
          
          <p style={{
            fontSize: '1.125rem',
            color: '#6c757d',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý đơn hàng và giao hàng sớm nhất có thể.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentPage('orders')}
              style={{
                ...styles.buttonPrimary,
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ShoppingBag size={20} />
              Xem đơn hàng
            </button>
            
            <button
              onClick={() => setCurrentPage('home')}
              style={{
                ...styles.buttonSecondary,
                padding: '0.75rem 2rem',
                fontSize: '1rem'
              }}
            >
              Về trang chủ
            </button>
          </div>
          
          <p style={{
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: '#6c757d'
          }}>
            Trang sẽ tự động chuyển đến trang đơn hàng sau 3 giây...
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};

export default PaymentSuccessPage;

