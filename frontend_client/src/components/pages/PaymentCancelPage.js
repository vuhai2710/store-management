// src/components/pages/PaymentCancelPage.js
import React, { useState } from 'react';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import styles from '../../styles/styles';
import { paymentService } from '../../services/paymentService';

const PaymentCancelPage = ({ setCurrentPage }) => {
  const [retrying, setRetrying] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const orderIdParam = searchParams.get('orderId');
  const orderId = orderIdParam ? Number(orderIdParam) : null;

  const handleRetryPayment = async () => {
    if (!orderId) {
      setCurrentPage('orders');
      return;
    }

    try {
      setRetrying(true);
      const paymentData = await paymentService.createPayOSPaymentLink(orderId);
      if (paymentData && paymentData.paymentLinkUrl) {
        window.location.href = paymentData.paymentLinkUrl;
      } else {
        alert('Không nhận được liên kết thanh toán PayOS. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error retrying PayOS payment:', error);
      alert(error?.message || 'Không thể tạo lại liên kết thanh toán PayOS. Vui lòng thử lại.');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <section style={{ padding: '4rem 0', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <div style={styles.container}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 2rem',
            backgroundColor: '#dc3545',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <XCircle size={60} color="white" />
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#dc3545',
            marginBottom: '1rem',
          }}>
            Thanh toán đã bị hủy
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: '#6c757d',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}>
            Thanh toán bị hủy. Bạn có thể thử lại sau hoặc chọn phương thức thanh toán khác.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setCurrentPage('cart')}
              style={{
                ...styles.buttonPrimary,
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ShoppingBag size={20} />
              Quay về giỏ hàng
            </button>

            <button
              onClick={() => setCurrentPage('orders')}
              style={{
                ...styles.buttonSecondary,
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ArrowLeft size={20} />
              Xem đơn hàng
            </button>

            {orderId && (
              <button
                onClick={handleRetryPayment}
                disabled={retrying}
                style={{
                  ...styles.buttonSecondary,
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  opacity: retrying ? 0.7 : 1,
                  cursor: retrying ? 'not-allowed' : 'pointer',
                }}
              >
                {retrying ? 'Đang tạo lại link PayOS...' : 'Thử lại thanh toán PayOS'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentCancelPage;


