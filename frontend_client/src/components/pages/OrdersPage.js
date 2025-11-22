// src/components/pages/OrdersPage.js
import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, X, Eye, XCircle, CheckCircle, CreditCard } from 'lucide-react';
import styles from '../../styles/styles';
import LoadingSpinner from '../common/LoadingSpinner';
import { ordersService } from '../../services/ordersService';
import { paymentService } from '../../services/paymentService';
import { formatPrice, formatDate, formatOrderStatus } from '../../utils/formatUtils';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../constants/orderStatus';

const OrdersPage = ({ setCurrentPage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingPayOSLink, setIsCreatingPayOSLink] = useState(false);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const ordersData = await ordersService.getMyOrders({
          pageNo,
          pageSize,
          status: statusFilter || undefined,
        });

        setOrders(ordersData?.content || []);
        setTotalPages(ordersData?.totalPages || 1);

      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [pageNo, statusFilter]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      await ordersService.cancelOrder(orderId);
      // Refresh orders
      const ordersData = await ordersService.getMyOrders({
        pageNo,
        pageSize,
        status: statusFilter || undefined,
      });
      setOrders(ordersData?.content || []);
      alert('Hủy đơn hàng thành công');
    } catch (error) {
      console.error('Error canceling order:', error);
      alert(error?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm('Bạn đã nhận được hàng chưa? Xác nhận đã nhận hàng?')) {
      return;
    }

    try {
      await ordersService.confirmDelivery(orderId);
      // Refresh orders
      const ordersData = await ordersService.getMyOrders({
        pageNo,
        pageSize,
        status: statusFilter || undefined,
      });
      setOrders(ordersData?.content || []);
      alert('Xác nhận nhận hàng thành công');
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert(error?.message || 'Không thể xác nhận nhận hàng. Vui lòng thử lại.');
    }
  };

  const handleViewOrderDetail = async (orderId) => {
    try {
      const orderDetail = await ordersService.getMyOrderById(orderId);
      setSelectedOrder(orderDetail);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      alert(error?.message || 'Không thể tải chi tiết đơn hàng.');
    }
  };

  const handlePayWithPayOS = async (order) => {
    if (!order) return;

    const orderId = order.idOrder || order.id;
    if (!orderId) {
      alert('Không tìm thấy mã đơn hàng để thanh toán.');
      return;
    }

    try {
      setIsCreatingPayOSLink(true);
      const paymentData = await paymentService.createPayOSPaymentLink(orderId);

      if (paymentData && paymentData.paymentLinkUrl) {
        window.location.href = paymentData.paymentLinkUrl;
      } else {
        alert('Không nhận được liên kết thanh toán PayOS. Vui lòng thử lại.');
        setIsCreatingPayOSLink(false);
      }
    } catch (error) {
      console.error('Error creating PayOS payment link:', error);
      alert(error?.message || 'Không thể tạo liên kết thanh toán PayOS. Vui lòng thử lại.');
      setIsCreatingPayOSLink(false);
    }
  };

  // Filter orders by search term
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order.idOrder?.toString().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.customerPhone?.includes(searchTerm)
    );
  });

  if (loading) {
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
    <section style={{ padding: '4rem 0', backgroundColor: '#F8FAFC' }}>
      <div style={styles.container}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Đơn hàng của tôi</h2>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={20} style={{ color: '#6c757d' }} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNo(1);
              }}
              style={{
                padding: '0.75rem',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.values(ORDER_STATUS).map(status => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '0.5rem'
          }}>
            {error}
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Package size={64} style={{ color: '#6c757d', margin: '0 auto 1rem' }} />
            <p style={{ color: '#6c757d', fontSize: '1.125rem', marginBottom: '1.5rem' }}>Không tìm thấy đơn hàng nào</p>
            <button onClick={() => setCurrentPage('shop')} style={styles.buttonPrimary}>
              Bắt đầu mua sắm
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {filteredOrders.map(order => {
                const status = order.status || ORDER_STATUS.PENDING;
                const statusColor = ORDER_STATUS_COLORS[status] || '#6c757d';
                const statusLabel = ORDER_STATUS_LABELS[status] || status;

                return (
                  <div
                    key={order.idOrder || order.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#212529' }}>
                            Đơn hàng #{order.idOrder || order.id}
                          </h3>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: statusColor + '20',
                            color: statusColor,
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {statusLabel}
                          </span>
                        </div>
                        <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          Ngày đặt: {formatDate(order.orderDate, 'dd/MM/yyyy HH:mm')}
                        </p>
                        {order.deliveredAt && (
                          <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                            Đã giao: {formatDate(order.deliveredAt, 'dd/MM/yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563EB', marginBottom: '0.5rem' }}>
                          {formatPrice(order.finalAmount || order.totalAmount || 0)}
                        </p>
                        <button
                          onClick={() => handleViewOrderDetail(order.idOrder || order.id)}
                          style={{
                            ...styles.buttonSecondary,
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <Eye size={16} /> Xem chi tiết
                        </button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.orderDetails && order.orderDetails.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                          Sản phẩm: {order.orderDetails.length} sản phẩm
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {order.orderDetails.slice(0, 3).map((detail, index) => (
                            <span
                              key={index}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem',
                                color: '#495057'
                              }}
                            >
                              {detail.productName || detail.productName} × {detail.quantity || detail.qty || 0}
                            </span>
                          ))}
                          {order.orderDetails.length > 3 && (
                            <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                              +{order.orderDetails.length - 3} sản phẩm khác
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                      {status === ORDER_STATUS.PENDING && (
                        <button
                          onClick={() => handleCancelOrder(order.idOrder || order.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#fdecec',
                            color: '#dc3545',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <XCircle size={16} /> Hủy đơn hàng
                        </button>
                      )}
                      {status === ORDER_STATUS.CONFIRMED && (
                        <button
                          onClick={() => handleConfirmDelivery(order.idOrder || order.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <CheckCircle size={16} /> Xác nhận đã nhận hàng
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setPageNo(pageNo - 1)}
                  disabled={pageNo === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.25rem',
                    backgroundColor: pageNo === 1 ? '#E2E8F0' : '#fff',
                    cursor: pageNo === 1 ? 'not-allowed' : 'pointer',
                    opacity: pageNo === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (pageNo <= 3) {
                    pageNumber = i + 1;
                  } else if (pageNo >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = pageNo - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPageNo(pageNumber)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: pageNo === pageNumber ? '1px solid #2563EB' : '1px solid #E2E8F0',
                        borderRadius: '0.25rem',
                        backgroundColor: pageNo === pageNumber ? '#2563EB' : '#fff',
                        color: pageNo === pageNumber ? 'white' : '#495057',
                        cursor: 'pointer'
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPageNo(pageNo + 1)}
                  disabled={pageNo === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.25rem',
                    backgroundColor: pageNo === totalPages ? '#E2E8F0' : '#fff',
                    cursor: pageNo === totalPages ? 'not-allowed' : 'pointer',
                    opacity: pageNo === totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Chi tiết đơn hàng #{selectedOrder.idOrder || selectedOrder.id}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    color: '#6c757d'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Trạng thái:</strong>{' '}
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: ORDER_STATUS_COLORS[selectedOrder.status] + '20',
                    color: ORDER_STATUS_COLORS[selectedOrder.status],
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                  </span>
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Ngày đặt:</strong> {formatDate(selectedOrder.orderDate, 'dd/MM/yyyy HH:mm')}
                </p>

                {/* Tóm tắt tiền */}
                {selectedOrder.totalAmount != null && (
                  <p style={{ marginBottom: '0.25rem' }}>
                    <strong>Tạm tính:</strong> {formatPrice(selectedOrder.totalAmount)}
                  </p>
                )}

                {selectedOrder.discount != null && Number(selectedOrder.discount) > 0 && (
                  <p style={{ marginBottom: '0.25rem', color: '#28a745' }}>
                    <strong>Giảm giá:</strong> -{formatPrice(selectedOrder.discount)}
                  </p>
                )}

                <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  <strong>Tổng thanh toán:</strong> {formatPrice(selectedOrder.finalAmount || (selectedOrder.totalAmount != null && selectedOrder.discount != null ? selectedOrder.totalAmount - selectedOrder.discount : selectedOrder.totalAmount || 0))}
                </p>

                {selectedOrder.promotionCode && (
                  <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: '#6c757d' }}>
                    <strong>Mã giảm giá:</strong> {selectedOrder.promotionCode}
                  </p>
                )}

                {selectedOrder.notes && (
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#495057' }}>
                    <strong>Ghi chú:</strong> {selectedOrder.notes}
                  </p>
                )}

                {selectedOrder.shippingAddressSnapshot && (
                  <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    <strong>Địa chỉ giao hàng:</strong> {selectedOrder.shippingAddressSnapshot}
                  </p>
                )}
              </div>

              {selectedOrder.paymentMethod === 'PAYOS' && selectedOrder.status === ORDER_STATUS.PENDING && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => handlePayWithPayOS(selectedOrder)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    disabled={isCreatingPayOSLink}
                  >
                    <CreditCard size={16} />
                    {isCreatingPayOSLink ? 'Đang tạo link PayOS...' : 'Thanh toán qua PayOS'}
                  </button>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Sản phẩm trong đơn hàng</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedOrder.orderDetails.map((detail, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '1rem',
                          border: '1px solid #E2E8F0',
                          borderRadius: '0.25rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {detail.productName || detail.product?.productName || 'Sản phẩm không xác định'}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            Số lượng: {detail.quantity || detail.qty || 0}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: '600', color: '#2563EB' }}>
                            {formatPrice(detail.price || detail.productPrice || 0)}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            Tổng: {formatPrice((detail.price || detail.productPrice || 0) * (detail.quantity || detail.qty || 0))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isCreatingPayOSLink && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              minWidth: '260px',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <LoadingSpinner />
            <p style={{ margin: 0, color: '#495057', textAlign: 'center' }}>
              Đang tạo liên kết thanh toán PayOS. Vui lòng chờ trong giây lát...
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrdersPage;



