
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MapPin, Plus, Edit, Trash2, CreditCard, Truck } from "lucide-react";
import styles from "../../styles/styles";
import LoadingSpinner from "../common/LoadingSpinner";
import { cartService } from "../../services/cartService";
import { ordersService } from "../../services/ordersService";
import { shippingAddressService } from "../../services/shippingAddressService";
import { paymentService } from "../../services/paymentService";
import { ghnService } from "../../services/ghnService";
import { promotionService } from "../../services/promotionService";
import { productsService } from "../../services/productsService";
import { formatPrice, getImageUrl } from "../../utils/formatUtils";
import { useAuth } from "../../contexts/AuthContext";
import { useBuyNow } from "../../contexts/BuyNowContext";

const CheckoutPage = ({ setCurrentPage }) => {
  const { isAuthenticated } = useAuth();
  const { buyNowItem, clearBuyNow, isBuyNowMode } = useBuyNow();
  const [cart, setCart] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phoneNumber: "",
    address: "",
    isDefault: false,
  });
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");

  const [shippingFee, setShippingFee] = useState(0);
  const [loadingShippingFee, setLoadingShippingFee] = useState(false);
  const [shippingFeeError, setShippingFeeError] = useState(null);

  const [promotionCode, setPromotionCode] = useState("");
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [promotionValid, setPromotionValid] = useState(false);
  const [promotionError, setPromotionError] = useState(null);
  const [loadingPromotion, setLoadingPromotion] = useState(false);
  const [automaticDiscount, setAutomaticDiscount] = useState(0);
  const [automaticDiscountInfo, setAutomaticDiscountInfo] = useState(null);

  const [shippingPromotionCode, setShippingPromotionCode] = useState("");
  const [shippingPromotionDiscount, setShippingPromotionDiscount] = useState(0);
  const [shippingPromotionValid, setShippingPromotionValid] = useState(false);
  const [shippingPromotionError, setShippingPromotionError] = useState(null);
  const [loadingShippingPromotion, setLoadingShippingPromotion] = useState(false);

  const [autoShippingDiscount, setAutoShippingDiscount] = useState(0);
  const [autoShippingDiscountInfo, setAutoShippingDiscountInfo] = useState(null);

  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [loadingBuyNowProduct, setLoadingBuyNowProduct] = useState(false);

  const checkoutItems =
    isBuyNowMode && buyNowItem
      ? [
        {
          productId: buyNowItem.productId,
          quantity: buyNowItem.quantity,
          product: buyNowProduct || buyNowItem.product,
          price: (buyNowProduct || buyNowItem.product)?.price || 0,
        },
      ]
      : cart?.cartItems || cart?.items || [];

  const SHOP_DISTRICT_ID = 1442;

  useEffect(() => {
    const loadBuyNowProduct = async () => {
      if (!isBuyNowMode || !buyNowItem) return;

      if (buyNowItem.product && buyNowItem.product.productName) {
        setBuyNowProduct(buyNowItem.product);
        return;
      }

      try {
        setLoadingBuyNowProduct(true);
        const productData = await productsService.getProductById(
          buyNowItem.productId
        );
        setBuyNowProduct(productData);
      } catch (error) {
        console.error("Error loading buy now product:", error);
        toast.error("Không thể tải thông tin sản phẩm");
        setCurrentPage("shop");
      } finally {
        setLoadingBuyNowProduct(false);
      }
    };

    loadBuyNowProduct();
  }, [isBuyNowMode, buyNowItem, setCurrentPage]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setCurrentPage("login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!isBuyNowMode) {
          const cartData = await cartService.getCart();
          setCart(cartData);
        }

        const addressesData = await shippingAddressService.getAllAddresses();
        setShippingAddresses(addressesData || []);

        if (addressesData && addressesData.length > 0) {
          const defaultAddress = addressesData.find((addr) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(
              defaultAddress.idShippingAddress || defaultAddress.id
            );
          } else {
            setSelectedAddressId(
              addressesData[0].idShippingAddress || addressesData[0].id
            );
          }
        }
      } catch (error) {
        console.error("Error fetching checkout data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, setCurrentPage, isBuyNowMode]);

  useEffect(() => {
    const calculateShippingFee = async () => {

      const hasItems = isBuyNowMode
        ? buyNowItem && buyNowProduct
        : cart && (cart.cartItems?.length > 0 || cart.items?.length > 0);

      if (
        !selectedAddressId ||
        !hasItems ||
        !shippingAddresses ||
        shippingAddresses.length === 0
      ) {
        setShippingFee(0);
        return;
      }

      const selectedAddress = shippingAddresses.find(
        (addr) => (addr.idShippingAddress || addr.id) === selectedAddressId
      );

      if (!selectedAddress) {
        setShippingFee(0);
        return;
      }

      if (!selectedAddress.districtId || !selectedAddress.wardCode) {
        setShippingFee(0);
        setShippingFeeError(
          "Địa chỉ chưa có thông tin quận/huyện và phường/xã. Vui lòng cập nhật địa chỉ."
        );
        return;
      }

      try {
        setLoadingShippingFee(true);
        setShippingFeeError(null);

        let estimatedWeight = 0;
        let orderTotal = 0;

        if (isBuyNowMode && buyNowItem && buyNowProduct) {

          const itemWeight = buyNowProduct.weight || 1000;
          estimatedWeight = itemWeight * buyNowItem.quantity;
          orderTotal = (buyNowProduct.price || 0) * buyNowItem.quantity;
        } else {

          const cartItemsList = cart.cartItems || cart.items || [];
          estimatedWeight = cartItemsList.reduce((total, item) => {
            const itemWeight = item.weight || item.product?.weight || 1000;
            const quantity = item.quantity || item.qty || 1;
            return total + itemWeight * quantity;
          }, 0);
          orderTotal = cart.totalAmount || cart.total || 0;
        }

        const feeResponse = await ghnService.calculateShippingFee({
          fromDistrictId: SHOP_DISTRICT_ID,
          toDistrictId: selectedAddress.districtId,
          toWardCode: selectedAddress.wardCode,
          weight: Math.max(estimatedWeight, 1000),
          length: 20,
          width: 20,
          height: 20,
          insuranceValue: Math.round(orderTotal),
        });

        if (feeResponse && feeResponse.total) {
          setShippingFee(Number(feeResponse.total));
        } else {
          setShippingFee(0);
          setShippingFeeError(
            "Không thể tính phí vận chuyển. Vui lòng thử lại."
          );
        }
      } catch (error) {
        console.error("Error calculating shipping fee:", error);
        setShippingFee(0);
        setShippingFeeError(
          "Không thể tính phí vận chuyển. Phí sẽ được tính khi giao hàng."
        );
      } finally {
        setLoadingShippingFee(false);
      }
    };

    calculateShippingFee();
  }, [
    selectedAddressId,
    shippingAddresses,
    cart,
    isBuyNowMode,
    buyNowItem,
    buyNowProduct,
  ]);

  useEffect(() => {
    const calculateAutomaticDiscount = async () => {

      let orderTotal = 0;
      let items = [];

      if (isBuyNowMode && buyNowItem && buyNowProduct) {
        orderTotal = (buyNowProduct.price || 0) * buyNowItem.quantity;
        items = [
          {
            productId: buyNowItem.productId,
            quantity: buyNowItem.quantity,
            price: buyNowProduct.price,
          },
        ];
      } else if (cart) {
        const cartItemsList = cart.cartItems || cart.items || [];
        if (cartItemsList.length === 0) {
          setAutomaticDiscount(0);
          setAutomaticDiscountInfo(null);
          return;
        }
        orderTotal = cart.totalAmount || cart.total || 0;
        items = cartItemsList;
      } else {
        setAutomaticDiscount(0);
        setAutomaticDiscountInfo(null);
        return;
      }

      if (orderTotal <= 0) {
        setAutomaticDiscount(0);
        setAutomaticDiscountInfo(null);
        return;
      }

      try {
        const discountResponse = await promotionService.calculateDiscount({
          totalAmount: orderTotal,
          items: items,
        });

        if (
          discountResponse &&
          discountResponse.applicable &&
          discountResponse.discount > 0
        ) {
          setAutomaticDiscount(Number(discountResponse.discount));
          setAutomaticDiscountInfo(discountResponse);
        } else {
          setAutomaticDiscount(0);
          setAutomaticDiscountInfo(null);
        }
      } catch (error) {
        console.error("Error calculating automatic discount:", error);
        setAutomaticDiscount(0);
        setAutomaticDiscountInfo(null);
      }
    };

    calculateAutomaticDiscount();
  }, [cart, isBuyNowMode, buyNowItem, buyNowProduct]);

  useEffect(() => {
    const calculateAutoShipping = async () => {

      if (shippingFee <= 0 || shippingPromotionValid) {
        setAutoShippingDiscount(0);
        setAutoShippingDiscountInfo(null);
        return;
      }

      let orderTotal = 0;
      if (isBuyNowMode && buyNowItem && buyNowProduct) {
        orderTotal = (buyNowProduct.price || 0) * buyNowItem.quantity;
      } else if (cart) {
        orderTotal = cart.totalAmount || cart.total || 0;
      }

      if (orderTotal <= 0) {
        setAutoShippingDiscount(0);
        setAutoShippingDiscountInfo(null);
        return;
      }

      try {
        const response = await promotionService.calculateAutoShippingDiscount({
          totalAmount: orderTotal,
          shippingFee: shippingFee,
        });

        if (response && response.applicable && response.discount > 0) {
          setAutoShippingDiscount(Number(response.discount));
          setAutoShippingDiscountInfo(response);
        } else {
          setAutoShippingDiscount(0);
          setAutoShippingDiscountInfo(null);
        }
      } catch (error) {
        console.error("Error calculating auto shipping discount:", error);
        setAutoShippingDiscount(0);
        setAutoShippingDiscountInfo(null);
      }
    };

    calculateAutoShipping();
  }, [shippingFee, cart, isBuyNowMode, buyNowItem, buyNowProduct, shippingPromotionValid]);

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const newAddress = await shippingAddressService.createAddress(
        addressForm
      );
      setShippingAddresses([...shippingAddresses, newAddress]);
      setSelectedAddressId(newAddress.idShippingAddress || newAddress.id);
      setShowAddressForm(false);
      setAddressForm({
        recipientName: "",
        phoneNumber: "",
        address: "",
        isDefault: false,
      });
    } catch (error) {
      console.error("Error creating address:", error);
      toast.error(error?.message || "Không thể tạo địa chỉ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (isBuyNowMode) {
      if (!buyNowItem || !buyNowProduct) {
        setError("Không tìm thấy thông tin sản phẩm");
        return;
      }
    } else {
      if (
        !cart ||
        (!cart.cartItems && !cart.items) ||
        (cart.cartItems && cart.cartItems.length === 0) ||
        (cart.items && cart.items.length === 0)
      ) {
        setError("Giỏ hàng trống");
        return;
      }
    }

    if (!paymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let order;

      if (isBuyNowMode) {

        order = await ordersService.buyNow({
          productId: buyNowItem.productId,
          quantity: buyNowItem.quantity,
          shippingAddressId: Number(selectedAddressId),
          paymentMethod: paymentMethod,
          notes: notes && notes.trim() !== "" ? notes.trim() : undefined,
          promotionCode:
            promotionValid && promotionCode ? promotionCode.trim() : undefined,
          shippingFee: shippingFee > 0 ? shippingFee : undefined,
        });

        clearBuyNow();
      } else {

        order = await ordersService.checkout({
          shippingAddressId: Number(selectedAddressId),
          paymentMethod: paymentMethod,
          notes: notes && notes.trim() !== "" ? notes.trim() : undefined,
          promotionCode:
            promotionValid && promotionCode ? promotionCode.trim() : undefined,
          shippingFee: shippingFee > 0 ? shippingFee : undefined,
        });
      }

      if (paymentMethod === "PAYOS") {
        try {
          const orderId = order.idOrder || order.id;
          if (!orderId) {
            throw new Error("Không tìm thấy ID đơn hàng");
          }

          const paymentLink = await paymentService.createPayOSPaymentLink(
            orderId
          );

          if (paymentLink.paymentLinkUrl) {
            window.location.href = paymentLink.paymentLinkUrl;
            return;
          } else {
            throw new Error("Không thể tạo link thanh toán");
          }
        } catch (paymentError) {
          console.error("Error creating payment link:", paymentError);
          let paymentErrorMessage =
            "Không thể tạo link thanh toán. Vui lòng thử lại.";

          if (paymentError?.message) {
            paymentErrorMessage = paymentError.message;
          } else if (paymentError?.response?.data?.message) {
            paymentErrorMessage = paymentError.response.data.message;
          } else if (paymentError?.responseData?.message) {
            paymentErrorMessage = paymentError.responseData.message;
          } else if (paymentError?.response?.data?.error) {
            paymentErrorMessage = paymentError.response.data.error;
          }

          if (
            paymentErrorMessage.includes("credentials") ||
            paymentErrorMessage.includes("configured") ||
            paymentErrorMessage.includes("PayOS")
          ) {
            paymentErrorMessage =
              "PayOS chưa được cấu hình đúng. Vui lòng liên hệ admin hoặc thử phương thức thanh toán khác.";
          }

          setError(paymentErrorMessage);
          setSubmitting(false);

          toast.error(`Lỗi: ${paymentErrorMessage}`);
          return;
        }
      }

      toast.success("Đặt hàng thành công!");
      setCurrentPage("orders");
    } catch (error) {
      console.error("Error placing order:", error);

      let errorMessage = "Không thể đặt hàng. Vui lòng thử lại.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.responseData?.message) {
        errorMessage = error.responseData.message;
      } else if (error?.errors) {

        const errorMessages = Object.values(error.errors).flat();
        errorMessage = errorMessages.join(", ");
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingBuyNowProduct) {
    return (
      <section style={{ padding: "4rem 0" }}>
        <div style={styles.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}>
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (error && !isBuyNowMode && !cart) {
    return (
      <section style={{ padding: "4rem 0" }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p
              style={{
                color: "#dc3545",
                fontSize: "1.125rem",
                marginBottom: "1rem",
              }}>
              {error}
            </p>
            <button
              onClick={() => setCurrentPage("cart")}
              style={styles.buttonPrimary}>
              Quay về giỏ hàng
            </button>
          </div>
        </div>
      </section>
    );
  }

  const hasCheckoutItems = isBuyNowMode
    ? buyNowItem && buyNowProduct
    : cart && (cart.cartItems?.length > 0 || cart.items?.length > 0);

  if (!hasCheckoutItems) {
    return (
      <section style={{ padding: "4rem 0" }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p
              style={{
                color: "#6c757d",
                fontSize: "1.125rem",
                marginBottom: "1.5rem",
              }}>
              {isBuyNowMode ? "Không tìm thấy sản phẩm" : "Giỏ hàng trống"}
            </p>
            <button
              onClick={() => setCurrentPage("shop")}
              style={styles.buttonPrimary}>
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </section>
    );
  }

  const orderSubtotal =
    isBuyNowMode && buyNowProduct
      ? (buyNowProduct.price || 0) * buyNowItem.quantity
      : cart?.totalAmount || cart?.total || 0;

  const manualCodeDiscount =
    promotionValid && promotionDiscount > 0 ? promotionDiscount : 0;
  const autoPromoDiscount = automaticDiscount > 0 ? automaticDiscount : 0;
  const totalOrderDiscount = manualCodeDiscount + autoPromoDiscount;

  const manualShippingDiscount =
    shippingPromotionValid && shippingPromotionDiscount > 0
      ? Math.min(shippingPromotionDiscount, shippingFee)
      : 0;
  const autoShippingDiscountAmount =
    !shippingPromotionValid && autoShippingDiscount > 0
      ? Math.min(autoShippingDiscount, shippingFee)
      : 0;
  const shippingDiscountAmount = manualShippingDiscount + autoShippingDiscountAmount;
  const effectiveShippingFee = Math.max(0, shippingFee - shippingDiscountAmount);

  const totalDiscount = totalOrderDiscount;
  const finalTotal = Math.max(0, orderSubtotal - totalOrderDiscount + effectiveShippingFee);

  return (
    <section style={{ padding: "4rem 0", backgroundColor: "#f8f8f8" }}>
      <div style={styles.container}>
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "2rem",
          }}>
          Thanh toán
        </h2>

        {error && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              borderRadius: "0.5rem",
            }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}>
          { }
          <div>
            { }
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                marginBottom: "2rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <MapPin size={24} /> Địa chỉ giao hàng
              </h3>

              { }
              {shippingAddresses.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  {shippingAddresses.map((address) => (
                    <div
                      key={address.idShippingAddress || address.id}
                      onClick={() =>
                        setSelectedAddressId(
                          address.idShippingAddress || address.id
                        )
                      }
                      style={{
                        padding: "1rem",
                        marginBottom: "0.5rem",
                        border:
                          selectedAddressId ===
                            (address.idShippingAddress || address.id)
                            ? "2px solid #007bff"
                            : "1px solid #dee2e6",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        backgroundColor:
                          selectedAddressId ===
                            (address.idShippingAddress || address.id)
                            ? "#e0f7ff"
                            : "white",
                        transition: "all 0.3s",
                      }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginBottom: "0.5rem",
                            }}>
                            <strong>{address.recipientName}</strong>
                            {address.isDefault && (
                              <span
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  borderRadius: "0.25rem",
                                  fontSize: "0.75rem",
                                  fontWeight: "600",
                                }}>
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              color: "#6c757d",
                              marginBottom: "0.25rem",
                            }}>
                            {address.phoneNumber}
                          </p>
                          <p style={{ color: "#495057" }}>{address.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              { }
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  style={{
                    ...styles.buttonSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                    justifyContent: "center",
                  }}>
                  <Plus size={20} /> Thêm địa chỉ mới
                </button>
              )}

              { }
              {showAddressForm && (
                <form
                  onSubmit={handleCreateAddress}
                  style={{
                    marginTop: "1.5rem",
                    padding: "1.5rem",
                    border: "1px solid #dee2e6",
                    borderRadius: "0.5rem",
                    backgroundColor: "#f8f9fa",
                  }}>
                  <h4
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                    }}>
                    Địa chỉ giao hàng mới
                  </h4>

                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        color: "#495057",
                      }}>
                      Tên người nhận *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={addressForm.recipientName}
                      onChange={handleAddressFormChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.25rem",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        color: "#495057",
                      }}>
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={addressForm.phoneNumber}
                      onChange={handleAddressFormChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.25rem",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        color: "#495057",
                      }}>
                      Địa chỉ *
                    </label>
                    <textarea
                      name="address"
                      value={addressForm.address}
                      onChange={handleAddressFormChange}
                      required
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.25rem",
                        fontSize: "1rem",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressFormChange}
                      id="isDefault"
                    />
                    <label
                      htmlFor="isDefault"
                      style={{ cursor: "pointer", color: "#495057" }}>
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        ...styles.buttonPrimary,
                        flex: 1,
                        padding: "0.75rem",
                        opacity: submitting ? 0.6 : 1,
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}>
                      {submitting ? "Đang lưu..." : "Lưu địa chỉ"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setAddressForm({
                          recipientName: "",
                          phoneNumber: "",
                          address: "",
                          isDefault: false,
                        });
                      }}
                      style={{
                        ...styles.buttonSecondary,
                        padding: "0.75rem",
                      }}>
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>

            { }
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <Truck size={24} /> Sản phẩm trong đơn hàng
                {isBuyNowMode && (
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "normal",
                      color: "#28a745",
                      marginLeft: "0.5rem",
                    }}>
                    (Mua ngay)
                  </span>
                )}
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}>
                {checkoutItems.map((item, index) => {

                  const product = item.product || buyNowProduct;
                  const productName =
                    item.productName ||
                    product?.productName ||
                    product?.name ||
                    item.name ||
                    "Sản phẩm không xác định";
                  const productPrice =
                    item.productPrice || item.price || product?.price || 0;
                  const quantity = item.quantity || item.qty || 0;
                  const itemTotal = item.subtotal || productPrice * quantity;
                  const productImage =
                    item.productImageUrl ||
                    item.productImage ||
                    product?.imageUrl ||
                    item.imageUrl;

                  return (
                    <div
                      key={
                        item.idCartItem || item.id || item.productId || index
                      }
                      style={{
                        display: "flex",
                        gap: "1rem",
                        padding: "1rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.5rem",
                      }}>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          backgroundColor: "#e9ecef",
                          borderRadius: "0.25rem",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}>
                        {productImage ? (
                          <img
                            src={getImageUrl(productImage)}
                            alt={productName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📦</div>';
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                            }}>
                            📦
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            fontWeight: "600",
                            marginBottom: "0.5rem",
                            color: "#212529",
                          }}>
                          {productName}
                        </h4>
                        <p
                          style={{
                            color: "#6c757d",
                            fontSize: "0.875rem",
                            marginBottom: "0.5rem",
                          }}>
                          {formatPrice(productPrice)} × {quantity}
                        </p>
                        <p style={{ fontWeight: "600", color: "#007bff" }}>
                          {formatPrice(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            { }

          </div>

          { }
          <div>
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                position: "sticky",
                top: "2rem",
              }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                }}>
                Tóm tắt đơn hàng
              </h3>

              {/* Phương thức thanh toán gộp vào tóm tắt */}
              <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #dee2e6", paddingBottom: "1.5rem" }}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                      fontSize: "0.9375rem"
                    }}>
                    Phương thức thanh toán *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #dee2e6",
                      borderRadius: "0.5rem",
                      fontSize: "0.9375rem",
                      cursor: "pointer",
                      backgroundColor: "#fff"
                    }}>
                    <option value="CASH">Thanh toán khi nhận hàng (COD)</option>
                    <option value="PAYOS">Thanh toán online qua PayOS</option>
                  </select>
                </div>

                {/* Giảm giá tự động info */}
                {automaticDiscount > 0 && automaticDiscountInfo && (
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #dcfce7",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      marginBottom: "1rem",
                      fontSize: "0.8125rem",
                      color: "#166534",
                    }}>
                    <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>🎁 {automaticDiscountInfo.ruleName || "Khuyến mãi tự động"}</div>
                    <div>Đã giảm {formatPrice(automaticDiscount)}</div>
                  </div>
                )}

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#495057", fontSize: "0.9375rem" }}>
                    Mã giảm giá
                  </label>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <input
                      type="text"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                      placeholder="Mã giảm giá"
                      disabled={loadingPromotion || promotionValid}
                      style={{
                        flex: 1,
                        padding: "0.625rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        opacity: promotionValid ? 0.7 : 1
                      }}
                    />
                    {!promotionValid ? (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!promotionCode) return;
                          try {
                            setLoadingPromotion(true);
                            const res = await promotionService.validatePromotion({
                              code: promotionCode.trim(),
                              totalAmount: orderSubtotal,
                              expectedScope: 'ORDER',
                            });
                            if (res && res.valid) {
                              setPromotionValid(true);
                              setPromotionDiscount(Number(res.discount || 0));
                            } else {
                              toast.error(res?.message || "Mã không hợp lệ");
                            }
                          } catch (e) { toast.error("Lỗi xác thực mã"); }
                          finally { setLoadingPromotion(false); }
                        }}
                        disabled={loadingPromotion || !promotionCode}
                        style={{ ...styles.buttonSecondary, padding: "0 1rem", height: "auto", fontSize: "0.8125rem", borderRadius: "0.5rem" }}
                      >
                        {loadingPromotion ? "..." : "Áp dụng"}
                      </button>
                    ) : (
                      <button
                        onClick={() => { setPromotionCode(""); setPromotionValid(false); setPromotionDiscount(0); }}
                        style={{ border: "none", background: "#f1f5f9", color: "#64748b", padding: "0 0.75rem", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8125rem" }}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                {/* Shipping Promo Input if shipping fee > 0 */}
                {shippingFee > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", color: "#495057", fontSize: "0.9375rem" }}>
                      Mã vận chuyển
                    </label>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <input
                        type="text"
                        value={shippingPromotionCode}
                        onChange={(e) => setShippingPromotionCode(e.target.value.toUpperCase())}
                        placeholder="Mã vận chuyển"
                        disabled={loadingShippingPromotion || shippingPromotionValid}
                        style={{
                          flex: 1,
                          padding: "0.625rem",
                          border: "1px solid #dee2e6",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                          opacity: shippingPromotionValid ? 0.7 : 1
                        }}
                      />
                      {!shippingPromotionValid ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!shippingPromotionCode) return;
                            try {
                              setLoadingShippingPromotion(true);
                              const res = await promotionService.validateShippingPromotion({
                                code: shippingPromotionCode.trim(),
                                shippingFee: shippingFee,
                              });
                              if (res && res.valid) {
                                setShippingPromotionValid(true);
                                setShippingPromotionDiscount(Number(res.discount || 0));
                              } else {
                                toast.error(res?.message || "Mã không hợp lệ");
                              }
                            } catch (e) { toast.error("Lỗi xác thực mã"); }
                            finally { setLoadingShippingPromotion(false); }
                          }}
                          disabled={loadingShippingPromotion || !shippingPromotionCode}
                          style={{ ...styles.buttonSecondary, padding: "0 1rem", height: "auto", fontSize: "0.8125rem", borderRadius: "0.5rem" }}
                        >
                          {loadingShippingPromotion ? "..." : "Áp dụng"}
                        </button>
                      ) : (
                        <button
                          onClick={() => { setShippingPromotionCode(""); setShippingPromotionValid(false); setShippingPromotionDiscount(0); }}
                          style={{ border: "none", background: "#f1f5f9", color: "#64748b", padding: "0 0.75rem", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8125rem" }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                      fontSize: "0.9375rem"
                    }}>
                    Ghi chú
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Lưu ý cho shop..."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #dee2e6",
                      borderRadius: "0.5rem",
                      fontSize: "0.9375rem",
                      resize: "none",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid #dee2e6",
                  paddingBottom: "1rem",
                }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    color: "#495057",
                  }}>
                  <span>
                    Tạm tính (
                    {isBuyNowMode
                      ? "1 sản phẩm"
                      : `${checkoutItems.length} sản phẩm`}
                    )
                  </span>
                  <span>{formatPrice(orderSubtotal)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    color: "#495057",
                  }}>
                  <span>Phí vận chuyển</span>
                  {loadingShippingFee ? (
                    <span style={{ color: "#6c757d", fontSize: "0.875rem" }}>
                      Đang tính...
                    </span>
                  ) : shippingFeeError ? (
                    <span style={{ color: "#dc3545", fontSize: "0.875rem" }}>
                      Tính khi giao hàng
                    </span>
                  ) : shippingFee > 0 ? (
                    <span>{formatPrice(shippingFee)}</span>
                  ) : (
                    <span style={{ color: "#6c757d", fontSize: "0.875rem" }}>
                      Tính khi giao hàng
                    </span>
                  )}
                </div>
                {shippingFeeError && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.75rem",
                      color: "#dc3545",
                    }}>
                    {shippingFeeError}
                  </div>
                )}

                { }
                {manualShippingDiscount > 0 && shippingPromotionValid && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      color: "#17a2b8",
                    }}>
                    <span>🚚 Giảm phí vận chuyển ({shippingPromotionCode})</span>
                    <span>-{formatPrice(manualShippingDiscount)}</span>
                  </div>
                )}

                { }
                {autoShippingDiscountAmount > 0 && autoShippingDiscountInfo && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      color: "#17a2b8",
                    }}>
                    <span>
                      🚚 Freeship tự động{" "}
                      {autoShippingDiscountInfo.ruleName
                        ? `(${autoShippingDiscountInfo.ruleName})`
                        : ""}
                    </span>
                    <span>-{formatPrice(autoShippingDiscountAmount)}</span>
                  </div>
                )}

                { }
                {autoPromoDiscount > 0 && automaticDiscountInfo && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      color: "#28a745",
                    }}>
                    <span>
                      🎁 Giảm giá tự động{" "}
                      {automaticDiscountInfo.ruleName
                        ? `(${automaticDiscountInfo.ruleName})`
                        : ""}
                    </span>
                    <span>-{formatPrice(autoPromoDiscount)}</span>
                  </div>
                )}

                {manualCodeDiscount > 0 && promotionValid && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      color: "#28a745",
                    }}>
                    <span>🏷️ Mã giảm giá ({promotionCode})</span>
                    <span>-{formatPrice(manualCodeDiscount)}</span>
                  </div>
                )}

                { }
                {totalDiscount > 0 &&
                  autoPromoDiscount > 0 &&
                  manualCodeDiscount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "0.5rem",
                        paddingTop: "0.5rem",
                        borderTop: "1px dashed #28a745",
                        color: "#28a745",
                        fontWeight: "600",
                      }}>
                      <span>✨ Tổng giảm giá</span>
                      <span>-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
              </div>

              <div
                style={{
                  marginBottom: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "2px solid #dee2e6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                  Tổng cộng
                </span>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    color: "#28a745",
                  }}>
                  {formatPrice(finalTotal)}
                </span>
              </div>

              {error && (
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "0.25rem",
                    marginBottom: "1rem",
                    border: "1px solid #f5c6cb",
                    fontSize: "0.875rem",
                  }}>
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || !selectedAddressId || !paymentMethod}
                style={{
                  ...styles.buttonPrimary,
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  opacity:
                    submitting || !selectedAddressId || !paymentMethod
                      ? 0.6
                      : 1,
                  cursor:
                    submitting || !selectedAddressId || !paymentMethod
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}>
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
                onClick={() => {

                  if (isBuyNowMode) {
                    clearBuyNow();
                  }
                  setCurrentPage(isBuyNowMode ? "shop" : "cart");
                }}
                style={{
                  ...styles.buttonSecondary,
                  width: "100%",
                  padding: "0.75rem",
                  marginTop: "0.5rem",
                  fontSize: "0.875rem",
                }}>
                {isBuyNowMode ? "Tiếp tục mua sắm" : "Quay về giỏ hàng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
