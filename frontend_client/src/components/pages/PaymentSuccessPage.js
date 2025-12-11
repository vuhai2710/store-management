// src/components/pages/PaymentSuccessPage.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, ShoppingBag, XCircle } from 'lucide-react';
import styles from '../../styles/styles';
import LoadingSpinner from '../common/LoadingSpinner';
import { paymentService } from '../../services/paymentService';
import { formatPrice } from '../../utils/formatUtils';

const PaymentSuccessPage = ({ setCurrentPage }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams(window.location.search);
        const orderIdParam = params.get('orderId');

        if (!orderIdParam) {
          setError('Không tìm thấy mã đơn hàng trong đường dẫn.');
          return;
        }

        const parsedOrderId = Number(orderIdParam);
        if (!parsedOrderId || Number.isNaN(parsedOrderId)) {
          setError('Mã đơn hàng không hợp lệ.');
          return;
        }

        setOrderId(parsedOrderId);

        const statusData = await paymentService.getPayOSPaymentStatus(parsedOrderId);
        setPaymentStatus(statusData);
      } catch (err) {
        console.error('Error fetching PayOS payment status:', err);
        const message = err?.message || err?.responseData?.message || 'Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  useEffect(() => {
    if (paymentStatus && (paymentStatus.status === 'COMPLETED' || paymentStatus.status === 'CONFIRMED')) {
      const timer = setTimeout(() => {
        setCurrentPage('orders');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, setCurrentPage]);

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}>
          <LoadingSpinner />
          <p style={{ marginTop: '1rem', color: '#6c757d' }}>
            Đang kiểm tra trạng thái thanh toán. Vui lòng chờ trong giây lát...
          </p>
        </div>
      );
    }

    if (error) {
      return (
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
            Không thể xác nhận thanh toán
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: '#6c757d',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}>
            {error}
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setCurrentPage('orders')}
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
              Xem đơn hàng
            </button>
          </div>
        </div>
      );
    }

    if (paymentStatus && (paymentStatus.status === 'COMPLETED' || paymentStatus.status === 'CONFIRMED')) {
      const finalAmount = paymentStatus.finalAmount || paymentStatus.amount || 0;

      return (
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
            backgroundColor: '#28a745',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'scaleIn 0.5s ease-out',
          }}>
            <CheckCircle size={60} color="white" />
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#28a745',
            marginBottom: '1rem',
          }}>
            Thanh toán thành công!
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: '#6c757d',
            marginBottom: '1.5rem',
            lineHeight: 1.6,
          }}>
            Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý đơn hàng và giao hàng sớm nhất có thể.
          </p>

          <div style={{
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            backgroundColor: '#F8FAFC',
            textAlign: 'left',
          }}>
            <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#495057' }}>
              <strong>Mã đơn hàng:</strong> #{paymentStatus.orderId || orderId}
            </p>
            <p style={{ marginBottom: 0, fontSize: '1rem', color: '#495057' }}>
              <strong>Tổng tiền:</strong> {formatPrice(finalAmount, 'VND')}
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setCurrentPage('orders')}
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
              Xem đơn hàng
            </button>
          </div>

          <p style={{
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: '#6c757d',
          }}>
            Trang sẽ tự động chuyển đến trang đơn hàng sau 3 giây...
          </p>
        </div>
      );
    }

    if (paymentStatus && paymentStatus.status === 'CANCELED') {
      return (
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
            Thanh toán thất bại hoặc bị hủy
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: '#6c757d',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}>
            Giao dịch PayOS cho đơn hàng của bạn không thành công hoặc đã bị hủy. Bạn có thể thử thanh toán lại từ trang đơn hàng.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setCurrentPage('orders')}
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
              Xem đơn hàng
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#343a40',
          marginBottom: '1rem',
        }}>
          Trạng thái thanh toán không xác định
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#6c757d',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}>
          Không tìm thấy thông tin thanh toán cho đơn hàng này. Vui lòng kiểm tra lại trong trang đơn hàng của bạn.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setCurrentPage('orders')}
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
            Xem đơn hàng
          </button>
        </div>
      </div>
    );
  };

  return (
    <section style={{ padding: '4rem 0', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <div style={styles.container}>{renderContent()}</div>

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




