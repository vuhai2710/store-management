// src/components/pages/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, CreditCard, Truck } from 'lucide-react';
import styles from '../../styles/styles';
import LoadingSpinner from '../common/LoadingSpinner';
import { cartService } from '../../services/cartService';
import { ordersService } from '../../services/ordersService';
import { shippingAddressService } from '../../services/shippingAddressService';
import { paymentService } from '../../services/paymentService';
import { ghnService } from '../../services/ghnService';
import { promotionService } from '../../services/promotionService';
import { formatPrice, getImageUrl } from '../../utils/formatUtils';
import { useAuth } from '../../hooks/useAuth';

const CheckoutPage = ({ setCurrentPage }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phoneNumber: '',
    address: '',
    isDefault: false,
  });
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  
  // GHN shipping fee
  const [shippingFee, setShippingFee] = useState(0);
  const [loadingShippingFee, setLoadingShippingFee] = useState(false);
  const [shippingFeeError, setShippingFeeError] = useState(null);
  
  // Promotion/Discount
  const [promotionCode, setPromotionCode] = useState('');
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [promotionValid, setPromotionValid] = useState(false);
  const [promotionError, setPromotionError] = useState(null);
  const [loadingPromotion, setLoadingPromotion] = useState(false);
  const [automaticDiscount, setAutomaticDiscount] = useState(0);
  const [automaticDiscountInfo, setAutomaticDiscountInfo] = useState(null);
  
  // Default shop district ID (should be configured in backend, using placeholder for now)
  // TODO: Get this from backend config or API endpoint
  const SHOP_DISTRICT_ID = 1442; // Example: Ho Chi Minh City, District 1 (need to configure in backend)

  // Fetch cart and shipping addresses
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setCurrentPage('login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch cart
        const cartData = await cartService.getCart();
        setCart(cartData);

        // Fetch shipping addresses
        const addressesData = await shippingAddressService.getAllAddresses();
        setShippingAddresses(addressesData || []);

        // Set default address if available
        if (addressesData && addressesData.length > 0) {
          const defaultAddress = addressesData.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.idShippingAddress || defaultAddress.id);
          } else {
            setSelectedAddressId(addressesData[0].idShippingAddress || addressesData[0].id);
          }
        }

      } catch (error) {
        console.error('Error fetching checkout data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, setCurrentPage]);
  
  // Calculate shipping fee when address is selected
  useEffect(() => {
    const calculateShippingFee = async () => {
      if (!selectedAddressId || !cart || !shippingAddresses || shippingAddresses.length === 0) {
        setShippingFee(0);
        return;
      }
      
      // Find selected address
      const selectedAddress = shippingAddresses.find(
        addr => (addr.idShippingAddress || addr.id) === selectedAddressId
      );
      
      if (!selectedAddress) {
        setShippingFee(0);
        return;
      }
      
      // Check if address has districtId and wardCode
      if (!selectedAddress.districtId || !selectedAddress.wardCode) {
        setShippingFee(0);
        setShippingFeeError('Địa chỉ chưa có thông tin quận/huyện và phường/xã. Vui lòng cập nhật địa chỉ.');
        return;
      }
      
      const cartItems = cart.cartItems || cart.items || [];
      if (!cartItems || cartItems.length === 0) {
        setShippingFee(0);
        return;
      }
      
      try {
        setLoadingShippingFee(true);
        setShippingFeeError(null);
        
        // Calculate total weight (estimate 1kg per item or use actual weight if available)
        const estimatedWeight = cartItems.reduce((total, item) => {
          const itemWeight = item.weight || item.product?.weight || 1000; // Default 1kg per item
          const quantity = item.quantity || item.qty || 1;
          return total + (itemWeight * quantity);
        }, 0);
        
        const cartTotal = cart.totalAmount || cart.total || 0;
        
        // Calculate shipping fee using GHN API
        const feeResponse = await ghnService.calculateShippingFee({
          fromDistrictId: SHOP_DISTRICT_ID,
          toDistrictId: selectedAddress.districtId,
          toWardCode: selectedAddress.wardCode,
          weight: Math.max(estimatedWeight, 1000), // Minimum 1kg
          length: 20,
          width: 20,
          height: 20,
          insuranceValue: Math.round(cartTotal), // Order total as insurance value
        });
        
        if (feeResponse && feeResponse.total) {
          setShippingFee(Number(feeResponse.total));
        } else {
          setShippingFee(0);
          setShippingFeeError('Không thể tính phí vận chuyển. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('Error calculating shipping fee:', error);
        setShippingFee(0);
        setShippingFeeError('Không thể tính phí vận chuyển. Phí sẽ được tính khi giao hàng.');
      } finally {
        setLoadingShippingFee(false);
      }
    };
    
    calculateShippingFee();
  }, [selectedAddressId, shippingAddresses, cart]);
  
  // Calculate automatic discount when cart total changes
  useEffect(() => {
    const calculateAutomaticDiscount = async () => {
      if (!cart || !cartItems || cartItems.length === 0) {
        setAutomaticDiscount(0);
        setAutomaticDiscountInfo(null);
        return;
      }
      
      const cartTotal = cart.totalAmount || cart.total || 0;
      if (cartTotal <= 0) {
        setAutomaticDiscount(0);
        setAutomaticDiscountInfo(null);
        return;
      }
      
      try {
        const discountResponse = await promotionService.calculateDiscount({
          totalAmount: cartTotal,
          items: cartItems,
        });
        
        if (discountResponse && discountResponse.applicable && discountResponse.discount > 0) {
          setAutomaticDiscount(Number(discountResponse.discount));
          setAutomaticDiscountInfo(discountResponse);
        } else {
          setAutomaticDiscount(0);
          setAutomaticDiscountInfo(null);
        }
      } catch (error) {
        console.error('Error calculating automatic discount:', error);
        setAutomaticDiscount(0);
        setAutomaticDiscountInfo(null);
      }
    };
    
    calculateAutomaticDiscount();
  }, [cart, cartItems]);
  
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const newAddress = await shippingAddressService.createAddress(addressForm);
      setShippingAddresses([...shippingAddresses, newAddress]);
      setSelectedAddressId(newAddress.idShippingAddress || newAddress.id);
      setShowAddressForm(false);
      setAddressForm({
        recipientName: '',
        phoneNumber: '',
        address: '',
        isDefault: false,
      });
    } catch (error) {
      console.error('Error creating address:', error);
      alert(error?.message || 'Không thể tạo địa chỉ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (!cart || (!cart.cartItems && !cart.items) || (cart.cartItems && cart.cartItems.length === 0) || (cart.items && cart.items.length === 0)) {
      setError('Giỏ hàng trống');
      return;
    }

    if (!paymentMethod) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create order - ensure shippingAddressId is a number
      const order = await ordersService.checkout({
        shippingAddressId: Number(selectedAddressId),
        paymentMethod: paymentMethod,
        notes: notes && notes.trim() !== '' ? notes.trim() : undefined,
        promotionCode: promotionValid && promotionCode ? promotionCode.trim() : undefined,
      });

      // If payment method is PAYOS, create payment link and redirect
      if (paymentMethod === 'PAYOS') {
        try {
          const orderId = order.idOrder || order.id;
          if (!orderId) {
            throw new Error('Không tìm thấy ID đơn hàng');
          }

          // Create PayOS payment link
          const paymentLink = await paymentService.createPayOSPaymentLink(orderId);
          
          // Redirect to PayOS payment page
          if (paymentLink.paymentLinkUrl) {
            window.location.href = paymentLink.paymentLinkUrl;
            return; // Don't set submitting to false here, as we're redirecting
          } else {
            throw new Error('Không thể tạo link thanh toán');
          }
        } catch (paymentError) {
          console.error('Error creating payment link:', paymentError);
          let paymentErrorMessage = 'Không thể tạo link thanh toán. Vui lòng thử lại.';
          
          // Extract error message from various error formats
          if (paymentError?.message) {
            paymentErrorMessage = paymentError.message;
          } else if (paymentError?.response?.data?.message) {
            paymentErrorMessage = paymentError.response.data.message;
          } else if (paymentError?.responseData?.message) {
            paymentErrorMessage = paymentError.responseData.message;
          } else if (paymentError?.response?.data?.error) {
            paymentErrorMessage = paymentError.response.data.error;
          }
          
          // Check for specific PayOS configuration errors
          if (paymentErrorMessage.includes('credentials') || 
              paymentErrorMessage.includes('configured') ||
              paymentErrorMessage.includes('PayOS')) {
            paymentErrorMessage = 'PayOS chưa được cấu hình đúng. Vui lòng liên hệ admin hoặc thử phương thức thanh toán khác.';
          }
          
          setError(paymentErrorMessage);
          setSubmitting(false);
          
          // Show error alert
          alert(`Lỗi: ${paymentErrorMessage}`);
          return;
        }
      }

      // For CASH payment, redirect to orders page
      alert('Đặt hàng thành công!');
      setCurrentPage('orders');
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Extract error message
      let errorMessage = 'Không thể đặt hàng. Vui lòng thử lại.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.responseData?.message) {
        errorMessage = error.responseData.message;
      } else if (error?.errors) {
        // Validation errors
        const errorMessages = Object.values(error.errors).flat();
        errorMessage = errorMessages.join(', ');
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

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

  if (error && !cart) {
    return (
      <section style={{ padding: '4rem 0' }}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#dc3545', fontSize: '1.125rem', marginBottom: '1rem' }}>{error}</p>
            <button onClick={() => setCurrentPage('cart')} style={styles.buttonPrimary}>
              Quay về giỏ hàng
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!cart || (!cart.cartItems && !cart.items) || (cart.cartItems && cart.cartItems.length === 0) || (cart.items && cart.items.length === 0)) {
    return (
      <section style={{ padding: '4rem 0' }}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6c757d', fontSize: '1.125rem', marginBottom: '1.5rem' }}>Giỏ hàng trống</p>
            <button onClick={() => setCurrentPage('shop')} style={styles.buttonPrimary}>
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </section>
    );
  }

  const cartItems = cart?.cartItems || cart?.items || [];
  const cartTotal = cart?.totalAmount || cart?.total || 0;
  const totalDiscount = promotionDiscount + automaticDiscount;
  const finalTotal = Math.max(0, cartTotal + shippingFee - totalDiscount);

  return (
    <section style={{ padding: '4rem 0', backgroundColor: '#f8f8f8' }}>
      <div style={styles.container}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Thanh toán</h2>

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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left: Shipping Address & Order Items & Payment */}
          <div>
            {/* Shipping Address Section */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={24} /> Địa chỉ giao hàng
              </h3>

              {/* Existing Addresses */}
              {shippingAddresses.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  {shippingAddresses.map(address => (
                    <div
                      key={address.idShippingAddress || address.id}
                      onClick={() => setSelectedAddressId(address.idShippingAddress || address.id)}
                      style={{
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        border: selectedAddressId === (address.idShippingAddress || address.id) 
                          ? '2px solid #007bff' 
                          : '1px solid #dee2e6',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        backgroundColor: selectedAddressId === (address.idShippingAddress || address.id) 
                          ? '#e0f7ff' 
                          : 'white',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <strong>{address.recipientName}</strong>
                            {address.isDefault && (
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#28a745',
                                color: 'white',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p style={{ color: '#6c757d', marginBottom: '0.25rem' }}>{address.phoneNumber}</p>
                          <p style={{ color: '#495057' }}>{address.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Button */}
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  style={{
                    ...styles.buttonSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={20} /> Thêm địa chỉ mới
                </button>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <form onSubmit={handleCreateAddress} style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #dee2e6', borderRadius: '0.5rem', backgroundColor: '#f8f9fa' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Địa chỉ giao hàng mới</h4>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                      Tên người nhận *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={addressForm.recipientName}
                      onChange={handleAddressFormChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={addressForm.phoneNumber}
                      onChange={handleAddressFormChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                      Địa chỉ *
                    </label>
                    <textarea
                      name="address"
                      value={addressForm.address}
                      onChange={handleAddressFormChange}
                      required
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.25rem',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressFormChange}
                      id="isDefault"
                    />
                    <label htmlFor="isDefault" style={{ cursor: 'pointer', color: '#495057' }}>
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        ...styles.buttonPrimary,
                        flex: 1,
                        padding: '0.75rem',
                        opacity: submitting ? 0.6 : 1,
                        cursor: submitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {submitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setAddressForm({
                          recipientName: '',
                          phoneNumber: '',
                          address: '',
                          isDefault: false,
                        });
                      }}
                      style={{
                        ...styles.buttonSecondary,
                        padding: '0.75rem'
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Order Items Section */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={24} /> Sản phẩm trong đơn hàng
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cartItems.map(item => {
                  const productName = item.productName || item.product?.productName || item.name || 'Sản phẩm không xác định';
                  const productPrice = item.productPrice || item.price || item.product?.price || 0;
                  const quantity = item.quantity || item.qty || 0;
                  const itemTotal = item.subtotal || (productPrice * quantity);
                  const productImage = item.productImageUrl || item.productImage || item.product?.imageUrl || item.imageUrl;

                  return (
                    <div
                      key={item.idCartItem || item.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.5rem'
                      }}
                    >
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
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#212529' }}>{productName}</h4>
                        <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          {formatPrice(productPrice)} × {quantity}
                        </p>
                        <p style={{ fontWeight: '600', color: '#007bff' }}>
                          {formatPrice(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method & Notes Section */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', marginTop: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={24} /> Phương thức thanh toán
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                  Chọn phương thức thanh toán *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.25rem',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="CASH">Thanh toán khi nhận hàng (COD)</option>
                  <option value="PAYOS">Thanh toán online qua PayOS</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                  Ghi chú (Tùy chọn)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Thêm ghi chú cho đơn hàng..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.25rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              {/* Promotion Code Section */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #dee2e6' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Mã giảm giá
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá"
                    disabled={loadingPromotion || promotionValid}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.25rem',
                      fontSize: '1rem',
                      opacity: (loadingPromotion || promotionValid) ? 0.6 : 1,
                    }}
                  />
                  {!promotionValid ? (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!promotionCode || promotionCode.trim() === '') {
                          setPromotionError('Vui lòng nhập mã giảm giá');
                          return;
                        }
                        
                        try {
                          setLoadingPromotion(true);
                          setPromotionError(null);
                          
                          const cartTotal = cart.totalAmount || cart.total || 0;
                          const validateResponse = await promotionService.validatePromotion({
                            code: promotionCode.trim(),
                            totalAmount: cartTotal,
                          });
                          
                          if (validateResponse && validateResponse.valid) {
                            setPromotionValid(true);
                            setPromotionDiscount(Number(validateResponse.discount || 0));
                            setPromotionError(null);
                          } else {
                            setPromotionValid(false);
                            setPromotionDiscount(0);
                            setPromotionError(validateResponse?.message || 'Mã giảm giá không hợp lệ');
                          }
                        } catch (error) {
                          console.error('Error validating promotion:', error);
                          setPromotionValid(false);
                          setPromotionDiscount(0);
                          setPromotionError(error?.message || 'Không thể xác thực mã giảm giá. Vui lòng thử lại.');
                        } finally {
                          setLoadingPromotion(false);
                        }
                      }}
                      disabled={loadingPromotion || !promotionCode || promotionCode.trim() === '' || promotionValid}
                      style={{
                        ...styles.buttonSecondary,
                        padding: '0.75rem 1.5rem',
                        opacity: (loadingPromotion || !promotionCode || promotionCode.trim() === '' || promotionValid) ? 0.6 : 1,
                        cursor: (loadingPromotion || !promotionCode || promotionCode.trim() === '' || promotionValid) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {loadingPromotion ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPromotionCode('');
                        setPromotionValid(false);
                        setPromotionDiscount(0);
                        setPromotionError(null);
                      }}
                      style={{
                        ...styles.buttonSecondary,
                        padding: '0.75rem 1.5rem',
                      }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                {promotionError && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc3545' }}>
                    {promotionError}
                  </div>
                )}
                {promotionValid && promotionDiscount > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#28a745', fontWeight: '600' }}>
                    Mã giảm giá "{promotionCode}" đã được áp dụng: -{formatPrice(promotionDiscount)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                Tóm tắt đơn hàng
              </h3>

              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#495057' }}>
                  <span>Tạm tính</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#495057' }}>
                  <span>Phí vận chuyển</span>
                  {loadingShippingFee ? (
                    <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>Đang tính...</span>
                  ) : shippingFeeError ? (
                    <span style={{ color: '#dc3545', fontSize: '0.875rem' }}>Tính khi giao hàng</span>
                  ) : shippingFee > 0 ? (
                    <span>{formatPrice(shippingFee)}</span>
                  ) : (
                    <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>Tính khi giao hàng</span>
                  )}
                </div>
                {shippingFeeError && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#dc3545' }}>
                    {shippingFeeError}
                  </div>
                )}
                {automaticDiscount > 0 && automaticDiscountInfo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#28a745' }}>
                    <span>Giảm giá tự động</span>
                    <span>-{formatPrice(automaticDiscount)}</span>
                  </div>
                )}
                {promotionDiscount > 0 && promotionValid && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#28a745' }}>
                    <span>Mã giảm giá ({promotionCode})</span>
                    <span>-{formatPrice(promotionDiscount)}</span>
                  </div>
                )}
                {totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #dee2e6', color: '#28a745', fontWeight: '600' }}>
                    <span>Tổng giảm giá</span>
                    <span>-{formatPrice(totalDiscount)}</span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Tổng cộng</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#28a745' }}>
                  {formatPrice(finalTotal)}
                </span>
              </div>

              {error && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '0.25rem',
                  marginBottom: '1rem',
                  border: '1px solid #f5c6cb',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || !selectedAddressId || !paymentMethod}
                style={{
                  ...styles.buttonPrimary,
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  opacity: (submitting || !selectedAddressId || !paymentMethod) ? 0.6 : 1,
                  cursor: (submitting || !selectedAddressId || !paymentMethod) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size={20} color="white" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Đặt hàng
                  </>
                )}
              </button>

              <button
                onClick={() => setCurrentPage('cart')}
                style={{
                  ...styles.buttonSecondary,
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                Quay về giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;

