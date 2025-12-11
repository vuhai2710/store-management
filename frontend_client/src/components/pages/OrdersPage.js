// src/components/pages/OrdersPage.js
import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  X,
  Eye,
  XCircle,
  CheckCircle,
  CreditCard,
  RotateCcw,
  ShoppingCart,
  AlertCircle,
  Star,
  Clock,
  CheckCircle2,
} from "lucide-react";
import styles from "../../styles/styles";
import LoadingSpinner from "../common/LoadingSpinner";
import { ordersService } from "../../services/ordersService";
import { paymentService } from "../../services/paymentService";
import { cartService } from "../../services/cartService";
import { reviewService } from "../../services/reviewService";
import { useReturnService } from "../../hooks/useReturnService";
import {
  formatPrice,
  formatDate,
  formatOrderStatus,
  parseBackendDate,
} from "../../utils/formatUtils";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "../../constants/orderStatus";

const OrdersPage = ({
  setCurrentPage,
  setSelectedOrderId,
  setSelectedReturnId,
  reloadCart,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingPayOSLink, setIsCreatingPayOSLink] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [hasActiveReturn, setHasActiveReturn] = useState(false);
  const [returnPeriodDays, setReturnPeriodDays] = useState(7);
  const [checkingReturn, setCheckingReturn] = useState(false);

  // New states for reviews and return request details
  const [orderReviews, setOrderReviews] = useState({}); // Map orderDetailId -> review
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [returnRequestInfo, setReturnRequestInfo] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] =
    useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const {
    hasActiveReturnRequest,
    getReturnPeriodDays,
    getReturnRequestByOrderId,
  } = useReturnService();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedOrder]);

  // Load return period days on mount
  useEffect(() => {
    const loadReturnPeriod = async () => {
      const days = await getReturnPeriodDays();
      setReturnPeriodDays(days);
    };
    loadReturnPeriod();
  }, [getReturnPeriodDays]);

  // Check if order has active return request when viewing order detail
  useEffect(() => {
    const checkActiveReturn = async () => {
      if (selectedOrder && selectedOrder.status === "COMPLETED") {
        setCheckingReturn(true);

        // Check active return request (boolean)
        const hasActive = await hasActiveReturnRequest(
          selectedOrder.idOrder || selectedOrder.id
        );
        setHasActiveReturn(hasActive);

        // Get detailed return request info (with status)
        const returnInfo = await getReturnRequestByOrderId(
          selectedOrder.idOrder || selectedOrder.id
        );
        setReturnRequestInfo(returnInfo);

        setCheckingReturn(false);
      } else {
        setHasActiveReturn(false);
        setReturnRequestInfo(null);
      }
    };
    checkActiveReturn();
  }, [selectedOrder, hasActiveReturnRequest, getReturnRequestByOrderId]);

  // Fetch reviews for order products when viewing COMPLETED order
  useEffect(() => {
    const fetchOrderReviews = async () => {
      if (
        selectedOrder &&
        selectedOrder.status === "COMPLETED" &&
        selectedOrder.orderDetails
      ) {
        setLoadingReviews(true);
        try {
          // Get user's reviews
          const myReviewsData = await reviewService.getMyReviews({
            pageNo: 1,
            pageSize: 1000,
          });
          const myReviews = myReviewsData?.content || [];

          // Create a map of orderDetailId -> review
          const reviewsMap = {};
          myReviews.forEach((review) => {
            const orderDetailId = review.orderDetailId || review.idOrderDetail;
            if (orderDetailId) {
              reviewsMap[orderDetailId] = review;
            }
          });

          setOrderReviews(reviewsMap);
        } catch (error) {
          console.error("Error fetching reviews:", error);
          setOrderReviews({});
        } finally {
          setLoadingReviews(false);
        }
      } else {
        setOrderReviews({});
      }
    };
    fetchOrderReviews();
  }, [selectedOrder]);

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
        console.error("Error fetching orders:", error);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [pageNo, statusFilter]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
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
      alert("Hủy đơn hàng thành công");
    } catch (error) {
      console.error("Error canceling order:", error);
      alert(error?.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm("Bạn đã nhận được hàng chưa? Xác nhận đã nhận hàng?")) {
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
      alert("Xác nhận nhận hàng thành công");
    } catch (error) {
      console.error("Error confirming delivery:", error);
      alert(
        error?.message || "Không thể xác nhận nhận hàng. Vui lòng thử lại."
      );
    }
  };

  const handleViewOrderDetail = async (orderId) => {
    try {
      const orderDetail = await ordersService.getMyOrderById(orderId);
      setSelectedOrder(orderDetail);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      alert(error?.message || "Không thể tải chi tiết đơn hàng.");
    }
  };

  const handleBuyAgain = async (order) => {
    if (!order || !order.orderDetails || order.orderDetails.length === 0) {
      alert("Không có sản phẩm để mua lại.");
      return;
    }

    try {
      setIsAddingToCart(true);
      let successCount = 0;
      let failCount = 0;
      let failedProducts = [];

      for (const detail of order.orderDetails) {
        // Backend trả về idProduct, không phải productId
        const productId =
          detail.idProduct || detail.productId || detail.product?.idProduct;
        const quantity = detail.quantity || detail.qty || 1;
        const productName =
          detail.productName || detail.productNameSnapshot || "Sản phẩm";

        if (productId) {
          try {
            await cartService.addToCart({ productId, quantity });
            successCount++;
          } catch (err) {
            console.error(`Error adding product ${productId} to cart:`, err);
            failCount++;
            failedProducts.push(productName);
          }
        } else {
          failCount++;
          failedProducts.push(productName);
        }
      }

      // Reload cart to update cart icon in header
      if (successCount > 0 && reloadCart) {
        await reloadCart();
      }

      if (successCount > 0) {
        let message = `Đã thêm ${successCount} sản phẩm vào giỏ hàng.`;
        if (failCount > 0) {
          message += `\n${failCount} sản phẩm không thể thêm (có thể hết hàng hoặc ngừng kinh doanh):\n- ${failedProducts.join(
            "\n- "
          )}`;
        }

        if (
          window.confirm(message + "\n\nBạn có muốn chuyển đến giỏ hàng không?")
        ) {
          setSelectedOrder(null);
          setCurrentPage("cart");
        }
      } else {
        alert(
          "Không thể thêm sản phẩm vào giỏ hàng.\nCó thể các sản phẩm đã hết hàng hoặc ngừng kinh doanh."
        );
      }
    } catch (error) {
      console.error("Error buying again:", error);
      alert(
        error?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại."
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle opening review modal for a product
  const handleOpenReviewModal = (detail) => {
    const orderDetailId = detail.idOrderDetail || detail.id;
    const productId =
      detail.idProduct || detail.productId || detail.product?.idProduct;
    const productName =
      detail.productName || detail.product?.productName || "Sản phẩm";

    setSelectedProductForReview({
      orderDetailId,
      productId,
      productName,
    });
    setReviewForm({ rating: 5, comment: "" });
    setShowReviewModal(true);
  };

  // Handle submitting a review
  const handleSubmitReview = async () => {
    if (!selectedProductForReview || !reviewForm.comment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.createReview(selectedProductForReview.productId, {
        orderDetailId: selectedProductForReview.orderDetailId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      // Refresh reviews for this order
      const myReviewsData = await reviewService.getMyReviews({
        pageNo: 1,
        pageSize: 1000,
      });
      const myReviews = myReviewsData?.content || [];
      const reviewsMap = {};
      myReviews.forEach((review) => {
        const orderDetailId = review.orderDetailId || review.idOrderDetail;
        if (orderDetailId) {
          reviewsMap[orderDetailId] = review;
        }
      });
      setOrderReviews(reviewsMap);

      // Close modal and reset form
      setShowReviewModal(false);
      setSelectedProductForReview(null);
      setReviewForm({ rating: 5, comment: "" });

      alert("Đánh giá đã được gửi thành công!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error?.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Get return status label
  const getReturnStatusLabel = (status) => {
    const labels = {
      REQUESTED: "Đang chờ xử lý",
      APPROVED: "Đã được duyệt",
      REJECTED: "Đã bị từ chối",
      COMPLETED: "Đã hoàn thành",
    };
    return labels[status] || status;
  };

  // Get return status color
  const getReturnStatusColor = (status) => {
    const colors = {
      REQUESTED: { bg: "#FEF3C7", text: "#92400E" },
      APPROVED: { bg: "#DBEAFE", text: "#1E40AF" },
      REJECTED: { bg: "#FEE2E2", text: "#DC2626" },
      COMPLETED: { bg: "#D1FAE5", text: "#065F46" },
    };
    return colors[status] || { bg: "#F3F4F6", text: "#374151" };
  };

  // Kiểm tra đơn hàng có trong thời gian cho phép hoàn không
  // Sử dụng order.completedAt + order.returnWindowDays (snapshot tại thời điểm hoàn thành)
  const isWithinReturnPeriod = (order) => {
    // Lấy returnWindowDays từ order (snapshot), fallback về system settings nếu không có
    const orderReturnWindowDays = order?.returnWindowDays ?? returnPeriodDays;
    
    // Ưu tiên sử dụng completedAt, fallback sang deliveredAt, rồi orderDate
    const completedAt = order?.completedAt || order?.deliveredAt;
    
    if (!completedAt) {
      // Fallback: sử dụng orderDate nếu có
      if (order?.orderDate) {
        const orderDate = parseBackendDate(order.orderDate);
        if (!orderDate) return true;
        const now = new Date();
        // Tính theo ngày, không theo giờ
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const orderDateStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        const diffTime = todayStart - orderDateStart;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= orderReturnWindowDays;
      }
      return true; // Cho phép đổi/trả nếu không có thông tin ngày
    }
    if (orderReturnWindowDays === 0) return true; // 0 = không giới hạn

    const completedDate = parseBackendDate(completedAt);
    if (!completedDate) return true;
    const now = new Date();
    // Tính theo ngày, không theo giờ
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const completedDateStart = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());
    const diffTime = todayStart - completedDateStart;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= orderReturnWindowDays;
  };

  // Tính số ngày còn lại để hoàn hàng
  // Sử dụng order.completedAt + order.returnWindowDays (snapshot tại thời điểm hoàn thành)
  const getRemainingDays = (order) => {
    // Lấy returnWindowDays từ order (snapshot), fallback về system settings nếu không có
    const orderReturnWindowDays = order?.returnWindowDays ?? returnPeriodDays;
    
    // Ưu tiên sử dụng completedAt, fallback sang deliveredAt, rồi orderDate
    const completedAt = order?.completedAt || order?.deliveredAt;
    
    if (!completedAt) {
      // Fallback: sử dụng orderDate nếu có
      if (order?.orderDate) {
        const orderDate = parseBackendDate(order.orderDate);
        if (!orderDate) return orderReturnWindowDays;
        const now = new Date();
        // Tính theo ngày, không theo giờ
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const orderDateStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        const diffTime = todayStart - orderDateStart;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, orderReturnWindowDays - diffDays);
      }
      return orderReturnWindowDays; // Trả về số ngày tối đa nếu không có thông tin
    }
    if (orderReturnWindowDays === 0) return -1; // -1 = không giới hạn

    const completedDate = parseBackendDate(completedAt);
    if (!completedDate) return orderReturnWindowDays;
    const now = new Date();
    // Tính theo ngày, không theo giờ
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const completedDateStart = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());
    const diffTime = todayStart - completedDateStart;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, orderReturnWindowDays - diffDays);
  };

  const handlePayWithPayOS = async (order) => {
    if (!order) return;

    const orderId = order.idOrder || order.id;
    if (!orderId) {
      alert("Không tìm thấy mã đơn hàng để thanh toán.");
      return;
    }

    try {
      setIsCreatingPayOSLink(true);
      const paymentData = await paymentService.createPayOSPaymentLink(orderId);

      if (paymentData && paymentData.paymentLinkUrl) {
        window.location.href = paymentData.paymentLinkUrl;
      } else {
        alert("Không nhận được liên kết thanh toán PayOS. Vui lòng thử lại.");
        setIsCreatingPayOSLink(false);
      }
    } catch (error) {
      console.error("Error creating PayOS payment link:", error);
      alert(
        error?.message ||
          "Không thể tạo liên kết thanh toán PayOS. Vui lòng thử lại."
      );
      setIsCreatingPayOSLink(false);
    }
  };

  // Filter orders by search term
  const filteredOrders = orders.filter((order) => {
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

  return (
    <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
      <div style={styles.container}>
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "2rem",
          }}>
          Đơn hàng của tôi
        </h2>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  border: "1px solid #E2E8F0",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Filter size={20} style={{ color: "#6c757d" }} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNo(1);
              }}
              style={{
                padding: "0.75rem",
                border: "1px solid #E2E8F0",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                cursor: "pointer",
              }}>
              <option value="">Tất cả trạng thái</option>
              {Object.values(ORDER_STATUS).map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
            <Package
              size={64}
              style={{ color: "#6c757d", margin: "0 auto 1rem" }}
            />
            <p
              style={{
                color: "#6c757d",
                fontSize: "1.125rem",
                marginBottom: "1.5rem",
              }}>
              Không tìm thấy đơn hàng nào
            </p>
            <button
              onClick={() => setCurrentPage("shop")}
              style={styles.buttonPrimary}>
              Bắt đầu mua sắm
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "2rem",
              }}>
              {filteredOrders.map((order) => {
                const status = order.status || ORDER_STATUS.PENDING;
                const statusColor = ORDER_STATUS_COLORS[status] || "#6c757d";
                const statusLabel = ORDER_STATUS_LABELS[status] || status;

                return (
                  <div
                    key={order.idOrder || order.id}
                    style={{
                      backgroundColor: "white",
                      padding: "1.5rem",
                      borderRadius: "0.5rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      border: "1px solid #E2E8F0",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1rem",
                      }}>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "0.5rem",
                          }}>
                          <h3
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: "bold",
                              color: "#212529",
                            }}>
                            Đơn hàng #{order.idOrder || order.id}
                          </h3>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              backgroundColor: statusColor + "20",
                              color: statusColor,
                              borderRadius: "0.25rem",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                            }}>
                            {statusLabel}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "#6c757d",
                            fontSize: "0.875rem",
                            marginBottom: "0.25rem",
                          }}>
                          Ngày đặt:{" "}
                          {formatDate(order.orderDate, "dd/MM/yyyy HH:mm")}
                        </p>
                        {order.deliveredAt && (
                          <p style={{ color: "#6c757d", fontSize: "0.875rem" }}>
                            Đã giao:{" "}
                            {formatDate(order.deliveredAt, "dd/MM/yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: "bold",
                            color: "#2563EB",
                            marginBottom: "0.5rem",
                          }}>
                          {formatPrice(
                            order.finalAmount || order.totalAmount || 0
                          )}
                        </p>
                        <button
                          onClick={() =>
                            handleViewOrderDetail(order.idOrder || order.id)
                          }
                          style={{
                            ...styles.buttonSecondary,
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}>
                          <Eye size={16} /> Xem chi tiết
                        </button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.orderDetails && order.orderDetails.length > 0 && (
                      <div
                        style={{
                          marginTop: "1rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid #E2E8F0",
                        }}>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#6c757d",
                            marginBottom: "0.5rem",
                          }}>
                          Sản phẩm: {order.orderDetails.length} sản phẩm
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                          }}>
                          {order.orderDetails
                            .slice(0, 3)
                            .map((detail, index) => (
                              <span
                                key={index}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  backgroundColor: "#F8FAFC",
                                  borderRadius: "0.25rem",
                                  fontSize: "0.875rem",
                                  color: "#495057",
                                }}>
                                {detail.productName || detail.productName} ×{" "}
                                {detail.quantity || detail.qty || 0}
                              </span>
                            ))}
                          {order.orderDetails.length > 3 && (
                            <span
                              style={{
                                fontSize: "0.875rem",
                                color: "#6c757d",
                              }}>
                              +{order.orderDetails.length - 3} sản phẩm khác
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid #E2E8F0",
                      }}>
                      {status === ORDER_STATUS.PENDING && (
                        <button
                          onClick={() =>
                            handleCancelOrder(order.idOrder || order.id)
                          }
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#fdecec",
                            color: "#dc3545",
                            border: "none",
                            borderRadius: "0.25rem",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}>
                          <XCircle size={16} /> Hủy đơn hàng
                        </button>
                      )}
                      {status === ORDER_STATUS.CONFIRMED && (
                        <button
                          onClick={() =>
                            handleConfirmDelivery(order.idOrder || order.id)
                          }
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#d4edda",
                            color: "#155724",
                            border: "none",
                            borderRadius: "0.25rem",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}>
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}>
                <button
                  onClick={() => setPageNo(pageNo - 1)}
                  disabled={pageNo === 1}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    backgroundColor: pageNo === 1 ? "#E2E8F0" : "#fff",
                    cursor: pageNo === 1 ? "not-allowed" : "pointer",
                    opacity: pageNo === 1 ? 0.5 : 1,
                  }}>
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
                        padding: "0.5rem 1rem",
                        border:
                          pageNo === pageNumber
                            ? "1px solid #2563EB"
                            : "1px solid #E2E8F0",
                        borderRadius: "0.25rem",
                        backgroundColor:
                          pageNo === pageNumber ? "#2563EB" : "#fff",
                        color: pageNo === pageNumber ? "white" : "#495057",
                        cursor: "pointer",
                      }}>
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPageNo(pageNo + 1)}
                  disabled={pageNo === totalPages}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    backgroundColor: pageNo === totalPages ? "#E2E8F0" : "#fff",
                    cursor: pageNo === totalPages ? "not-allowed" : "pointer",
                    opacity: pageNo === totalPages ? 0.5 : 1,
                  }}>
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
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "2rem",
            }}
            onClick={() => setSelectedOrder(null)}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "0.5rem",
                padding: "2rem",
                maxWidth: "800px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  Chi tiết đơn hàng #{selectedOrder.idOrder || selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    color: "#6c757d",
                  }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor:
                        ORDER_STATUS_COLORS[selectedOrder.status] + "20",
                      color: ORDER_STATUS_COLORS[selectedOrder.status],
                      borderRadius: "0.25rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                    }}>
                    {ORDER_STATUS_LABELS[selectedOrder.status] ||
                      selectedOrder.status}
                  </span>
                </p>
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Ngày đặt:</strong>{" "}
                  {formatDate(selectedOrder.orderDate, "dd/MM/yyyy HH:mm")}
                </p>

                {/* Hiển thị hạn đổi trả cho đơn COMPLETED */}
                {selectedOrder.status === "COMPLETED" && (selectedOrder.completedAt || selectedOrder.deliveredAt) && (
                  <p style={{ marginBottom: "0.5rem" }}>
                    <strong>Hạn đổi trả:</strong>{" "}
                    {(() => {
                      const returnDays = selectedOrder.returnWindowDays ?? returnPeriodDays;
                      if (returnDays === 0) return <span style={{ color: "#059669" }}>Không giới hạn</span>;
                      // Ưu tiên completedAt, fallback sang deliveredAt
                      const completedAt = selectedOrder.completedAt || selectedOrder.deliveredAt;
                      const completedDate = parseBackendDate(completedAt);
                      if (!completedDate) return <span style={{ color: "#6c757d" }}>Không xác định</span>;
                      const deadline = new Date(completedDate);
                      deadline.setDate(deadline.getDate() + returnDays);
                      // So sánh theo ngày, không theo giờ
                      const now = new Date();
                      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const deadlineEnd = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate(), 23, 59, 59);
                      const isExpired = todayStart > deadlineEnd;
                      const remainingDays = getRemainingDays(selectedOrder);
                      return (
                        <span style={{ color: isExpired ? "#DC2626" : "#059669" }}>
                          {formatDate(deadline, "dd/MM/yyyy")}
                          {isExpired ? " (Đã hết hạn)" : ` (Còn ${remainingDays} ngày)`}
                        </span>
                      );
                    })()}
                  </p>
                )}

                {/* Tóm tắt tiền */}
                {selectedOrder.totalAmount != null && (
                  <p style={{ marginBottom: "0.25rem" }}>
                    <strong>Tổng tiền hàng:</strong>{" "}
                    {formatPrice(selectedOrder.totalAmount)}
                  </p>
                )}

                {selectedOrder.discount != null &&
                  Number(selectedOrder.discount) > 0 && (
                    <p style={{ marginBottom: "0.25rem", color: "#28a745" }}>
                      <strong>Giảm giá:</strong> -
                      {formatPrice(selectedOrder.discount)}
                    </p>
                  )}

                {/* Phí giao hàng */}
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>Phí giao hàng:</strong>{" "}
                  {selectedOrder.shippingFee != null && Number(selectedOrder.shippingFee) > 0 ? (
                    <>
                      {formatPrice(selectedOrder.shippingFee)}
                      {selectedOrder.paymentMethod === "CASH" && (
                        <span style={{ color: "#6c757d", fontSize: "0.875rem", fontStyle: "italic", marginLeft: "0.5rem" }}>
                          (Người nhận thanh toán khi nhận hàng)
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ color: "#6c757d", fontSize: "0.875rem", fontStyle: "italic" }}>
                      Người nhận thanh toán khi nhận hàng
                    </span>
                  )}
                </p>

                <p
                  style={{
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}>
                  <strong>Tổng thanh toán:</strong>{" "}
                  {formatPrice(
                    selectedOrder.finalAmount || 
                    (selectedOrder.totalAmount != null 
                      ? (selectedOrder.totalAmount || 0) + (Number(selectedOrder.shippingFee) || 0) - (selectedOrder.discount || 0)
                      : 0)
                  )}
                  {selectedOrder.paymentMethod === "CASH" && (
                    <span style={{ 
                      color: "#F59E0B", 
                      fontSize: "0.875rem", 
                      marginLeft: "0.5rem",
                      fontWeight: "normal"
                    }}>
                      (Thanh toán khi nhận hàng)
                    </span>
                  )}
                </p>

                {selectedOrder.promotionCode && (
                  <p
                    style={{
                      marginBottom: "0.25rem",
                      fontSize: "0.875rem",
                      color: "#6c757d",
                    }}>
                    <strong>Mã giảm giá:</strong> {selectedOrder.promotionCode}
                  </p>
                )}

                {selectedOrder.notes && (
                  <p
                    style={{
                      marginTop: "0.25rem",
                      fontSize: "0.875rem",
                      color: "#495057",
                    }}>
                    <strong>Ghi chú:</strong> {selectedOrder.notes}
                  </p>
                )}

                {selectedOrder.shippingAddressSnapshot && (
                  <p style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                    <strong>Địa chỉ giao hàng:</strong>{" "}
                    {selectedOrder.shippingAddressSnapshot}
                  </p>
                )}
              </div>

              {selectedOrder.paymentMethod === "PAYOS" &&
                selectedOrder.status === ORDER_STATUS.PENDING && (
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #E2E8F0",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}>
                    <button
                      onClick={() => handlePayWithPayOS(selectedOrder)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#2563EB",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                      disabled={isCreatingPayOSLink}>
                      <CreditCard size={16} />
                      {isCreatingPayOSLink
                        ? "Đang tạo link PayOS..."
                        : "Thanh toán qua PayOS"}
                    </button>
                  </div>
                )}
              {/* Order Items */}
              {selectedOrder.orderDetails &&
                selectedOrder.orderDetails.length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                      }}>
                      Sản phẩm trong đơn hàng
                    </h4>

                    {/* For COMPLETED orders, show review table */}
                    {selectedOrder.status === "COMPLETED" ? (
                      <div style={{ overflowX: "auto" }}>
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ backgroundColor: "#F8FAFC" }}>
                              <th
                                style={{
                                  padding: "0.75rem",
                                  textAlign: "left",
                                  borderBottom: "2px solid #E2E8F0",
                                }}>
                                Sản phẩm
                              </th>
                              <th
                                style={{
                                  padding: "0.75rem",
                                  textAlign: "center",
                                  borderBottom: "2px solid #E2E8F0",
                                  minWidth: "120px",
                                }}>
                                Đánh giá
                              </th>
                              <th
                                style={{
                                  padding: "0.75rem",
                                  textAlign: "left",
                                  borderBottom: "2px solid #E2E8F0",
                                  minWidth: "200px",
                                }}>
                                Nhận xét
                              </th>
                              <th
                                style={{
                                  padding: "0.75rem",
                                  textAlign: "center",
                                  borderBottom: "2px solid #E2E8F0",
                                  minWidth: "120px",
                                }}>
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.orderDetails.map((detail, index) => {
                              const orderDetailId =
                                detail.idOrderDetail || detail.id;
                              const review = orderReviews[orderDetailId];
                              const hasReview = !!review;

                              return (
                                <tr
                                  key={index}
                                  style={{ borderBottom: "1px solid #E2E8F0" }}>
                                  <td style={{ padding: "0.75rem" }}>
                                    <p
                                      style={{
                                        fontWeight: "600",
                                        marginBottom: "0.25rem",
                                      }}>
                                      {detail.productName ||
                                        detail.product?.productName ||
                                        "Sản phẩm không xác định"}
                                    </p>
                                    <p
                                      style={{
                                        fontSize: "0.875rem",
                                        color: "#6c757d",
                                      }}>
                                      SL: {detail.quantity || detail.qty || 0} ×{" "}
                                      {formatPrice(
                                        detail.price || detail.productPrice || 0
                                      )}
                                    </p>
                                  </td>
                                  <td
                                    style={{
                                      padding: "0.75rem",
                                      textAlign: "center",
                                    }}>
                                    {loadingReviews ? (
                                      <span
                                        style={{
                                          color: "#6c757d",
                                          fontSize: "0.875rem",
                                        }}>
                                        Đang tải...
                                      </span>
                                    ) : hasReview ? (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          gap: "0.25rem",
                                        }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            size={16}
                                            fill={
                                              star <= review.rating
                                                ? "#ffc107"
                                                : "none"
                                            }
                                            color={
                                              star <= review.rating
                                                ? "#ffc107"
                                                : "#E2E8F0"
                                            }
                                          />
                                        ))}
                                      </div>
                                    ) : (
                                      <span
                                        style={{
                                          color: "#6c757d",
                                          fontSize: "0.875rem",
                                        }}>
                                        Chưa đánh giá
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: "0.75rem" }}>
                                    {loadingReviews ? (
                                      <span
                                        style={{
                                          color: "#6c757d",
                                          fontSize: "0.875rem",
                                        }}>
                                        —
                                      </span>
                                    ) : hasReview ? (
                                      <p
                                        style={{
                                          fontSize: "0.875rem",
                                          color: "#495057",
                                          margin: 0,
                                        }}>
                                        {review.comment || "—"}
                                      </p>
                                    ) : (
                                      <span
                                        style={{
                                          color: "#6c757d",
                                          fontSize: "0.875rem",
                                        }}>
                                        —
                                      </span>
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      padding: "0.75rem",
                                      textAlign: "center",
                                    }}>
                                    {loadingReviews ? (
                                      <span
                                        style={{
                                          color: "#6c757d",
                                          fontSize: "0.875rem",
                                        }}>
                                        —
                                      </span>
                                    ) : hasReview ? (
                                      <button
                                        disabled
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "0.25rem",
                                          padding: "0.4rem 0.75rem",
                                          backgroundColor: "#E5E7EB",
                                          color: "#6B7280",
                                          border: "none",
                                          borderRadius: "0.25rem",
                                          fontSize: "0.75rem",
                                          fontWeight: "500",
                                          cursor: "not-allowed",
                                        }}>
                                        <CheckCircle2 size={14} />
                                        Đã đánh giá
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleOpenReviewModal(detail)
                                        }
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "0.25rem",
                                          padding: "0.4rem 0.75rem",
                                          backgroundColor: "#F59E0B",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "0.25rem",
                                          fontSize: "0.75rem",
                                          fontWeight: "500",
                                          cursor: "pointer",
                                        }}
                                        onMouseOver={(e) =>
                                          (e.currentTarget.style.backgroundColor =
                                            "#D97706")
                                        }
                                        onMouseOut={(e) =>
                                          (e.currentTarget.style.backgroundColor =
                                            "#F59E0B")
                                        }>
                                        <Star size={14} />
                                        Đánh giá
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* For non-COMPLETED orders, show simple list */
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}>
                        {selectedOrder.orderDetails.map((detail, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "1rem",
                              border: "1px solid #E2E8F0",
                              borderRadius: "0.25rem",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}>
                            <div>
                              <p
                                style={{
                                  fontWeight: "600",
                                  marginBottom: "0.25rem",
                                }}>
                                {detail.productName ||
                                  detail.product?.productName ||
                                  "Sản phẩm không xác định"}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6c757d",
                                }}>
                                Số lượng: {detail.quantity || detail.qty || 0}
                              </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{ fontWeight: "600", color: "#2563EB" }}>
                                {formatPrice(
                                  detail.price || detail.productPrice || 0
                                )}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6c757d",
                                }}>
                                Tổng:{" "}
                                {formatPrice(
                                  (detail.price || detail.productPrice || 0) *
                                    (detail.quantity || detail.qty || 0)
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {/* Return/Exchange Button and Buy Again Button */}
              {(selectedOrder.status === "COMPLETED" ||
                selectedOrder.status === "CANCELED") && (
                <div
                  style={{
                    marginTop: "2rem",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}>
                  {/* Buy Again Button - for COMPLETED and CANCELED orders */}
                  <button
                    onClick={() => handleBuyAgain(selectedOrder)}
                    disabled={isAddingToCart}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      backgroundColor: isAddingToCart ? "#93C5FD" : "#2563EB",
                      color: "white",
                      border: "none",
                      borderRadius: "0.25rem",
                      fontWeight: "600",
                      cursor: isAddingToCart ? "not-allowed" : "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      !isAddingToCart &&
                      (e.currentTarget.style.backgroundColor = "#1D4ED8")
                    }
                    onMouseOut={(e) =>
                      !isAddingToCart &&
                      (e.currentTarget.style.backgroundColor = "#2563EB")
                    }>
                    <ShoppingCart size={18} />
                    {isAddingToCart ? "Đang thêm..." : "Mua lại"}
                  </button>

                  {/* Review Button - only for COMPLETED orders and when there are unreviewed products
                      Ẩn nút này vì đã có bảng đánh giá từng sản phẩm trong danh sách sản phẩm */}
                  {/* Đã chuyển sang đánh giá từng sản phẩm trong bảng, không cần nút này nữa */}

                  {/* Return/Exchange Button - only for COMPLETED orders */}
                  {selectedOrder.status === "COMPLETED" && (
                    <>
                      {checkingReturn ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "#6c757d",
                          }}>
                          <LoadingSpinner size="small" /> Đang kiểm tra...
                        </div>
                      ) : returnRequestInfo?.hasReturn ? (
                        // Show return request status based on its state
                        (() => {
                          const status =
                            returnRequestInfo.returnRequest?.status;
                          const statusColors = getReturnStatusColor(status);
                          const returnType =
                            returnRequestInfo.returnRequest?.returnType ===
                            "EXCHANGE"
                              ? "đổi"
                              : "trả";

                          // Helper function to navigate to return detail
                          const handleViewReturnDetail = () => {
                            const returnId =
                              returnRequestInfo.returnRequest?.idReturn;
                            if (returnId && setSelectedReturnId) {
                              setSelectedReturnId(returnId);
                              setCurrentPage("return-detail");
                              setSelectedOrder(null);
                            }
                          };

                          // Different UI for different statuses
                          if (
                            status === "REQUESTED" ||
                            status === "PENDING" ||
                            status === "PROCESSING"
                          ) {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "0.5rem",
                                }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: statusColors.bg,
                                    color: statusColors.text,
                                    borderRadius: "0.25rem",
                                    fontWeight: "600",
                                  }}>
                                  <Clock size={18} />
                                  Đơn đang xử lý {returnType} hàng
                                </div>
                                <button
                                  onClick={handleViewReturnDetail}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.5rem 1rem",
                                    backgroundColor: "#2563EB",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "0.25rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                  }}>
                                  <Eye size={16} />
                                  Xem quá trình đổi/trả
                                </button>
                              </div>
                            );
                          } else if (status === "APPROVED") {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "0.5rem",
                                }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: statusColors.bg,
                                    color: statusColors.text,
                                    borderRadius: "0.25rem",
                                    fontWeight: "600",
                                  }}>
                                  <CheckCircle size={18} />
                                  Yêu cầu {returnType} hàng đã được duyệt
                                </div>
                                <button
                                  onClick={handleViewReturnDetail}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.5rem 1rem",
                                    backgroundColor: "#2563EB",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "0.25rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                  }}>
                                  <Eye size={16} />
                                  Xem quá trình đổi/trả
                                </button>
                              </div>
                            );
                          } else if (status === "COMPLETED") {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "0.5rem",
                                }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: statusColors.bg,
                                    color: statusColors.text,
                                    borderRadius: "0.25rem",
                                    fontWeight: "600",
                                  }}>
                                  <CheckCircle2 size={18} />
                                  Đơn đã {returnType} hàng thành công
                                </div>
                                <button
                                  onClick={handleViewReturnDetail}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.5rem 1rem",
                                    backgroundColor: "#6B7280",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "0.25rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                  }}>
                                  <Eye size={16} />
                                  Xem chi tiết đổi/trả
                                </button>
                              </div>
                            );
                          } else if (status === "REJECTED") {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "0.5rem",
                                }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: statusColors.bg,
                                    color: statusColors.text,
                                    borderRadius: "0.25rem",
                                    fontWeight: "600",
                                  }}>
                                  <XCircle size={18} />
                                  Yêu cầu {returnType} hàng bị từ chối
                                </div>
                                {/* Allow new request if previous was rejected and still within period */}
                                {isWithinReturnPeriod(selectedOrder) && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderId(
                                        selectedOrder.idOrder ||
                                          selectedOrder.id
                                      );
                                      setCurrentPage("return-request");
                                      setSelectedOrder(null);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.5rem",
                                      padding: "0.5rem 1rem",
                                      backgroundColor: "#F59E0B",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "0.25rem",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      fontSize: "0.875rem",
                                    }}>
                                    <RotateCcw size={16} />
                                    Tạo yêu cầu mới
                                  </button>
                                )}
                              </div>
                            );
                          } else {
                            // Fallback for unknown status
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "0.75rem 1.5rem",
                                  backgroundColor: "#FEF3C7",
                                  color: "#92400E",
                                  borderRadius: "0.25rem",
                                  fontWeight: "600",
                                }}>
                                <AlertCircle size={18} />
                                Đơn đang có yêu cầu đổi/trả
                              </div>
                            );
                          }
                        })()
                      ) : !isWithinReturnPeriod(selectedOrder) ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#FEE2E2",
                            color: "#DC2626",
                            borderRadius: "0.25rem",
                            fontWeight: "600",
                          }}>
                          <AlertCircle size={18} />
                          Đã hết thời gian đổi/trả ({selectedOrder?.returnWindowDays ?? returnPeriodDays} ngày)
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "0.5rem",
                          }}>
                          <button
                            onClick={() => {
                              setSelectedOrderId(
                                selectedOrder.idOrder || selectedOrder.id
                              );
                              setCurrentPage("return-request");
                              setSelectedOrder(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.75rem 1.5rem",
                              backgroundColor: "#F59E0B",
                              color: "white",
                              border: "none",
                              borderRadius: "0.25rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#D97706")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F59E0B")
                            }>
                            <RotateCcw size={18} />
                            Yêu cầu Đổi/Trả
                          </button>
                          {getRemainingDays(selectedOrder) > 0 && (
                            <span
                              style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                              Còn {getRemainingDays(selectedOrder)} ngày để yêu
                              cầu
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isCreatingPayOSLink && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "1rem",
          }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: "2rem",
              minWidth: "260px",
              maxWidth: "90vw",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}>
            <LoadingSpinner />
            <p style={{ margin: 0, color: "#495057", textAlign: "center" }}>
              Đang tạo liên kết thanh toán PayOS. Vui lòng chờ trong giây lát...
            </p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProductForReview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "1rem",
          }}
          onClick={() => {
            setShowReviewModal(false);
            setSelectedProductForReview(null);
          }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}>
              <h3
                style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>
                Đánh giá sản phẩm
              </h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedProductForReview(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  color: "#6c757d",
                }}>
                <X size={20} />
              </button>
            </div>

            <p
              style={{
                marginBottom: "1rem",
                fontWeight: "600",
                color: "#495057",
              }}>
              {selectedProductForReview.productName}
            </p>

            {/* Rating Stars */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                }}>
                Đánh giá *
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "0.25rem",
                  alignItems: "center",
                }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm((prev) => ({ ...prev, rating: star }))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.25rem",
                    }}>
                    <Star
                      size={28}
                      fill={star <= reviewForm.rating ? "#ffc107" : "none"}
                      color={star <= reviewForm.rating ? "#ffc107" : "#E2E8F0"}
                    />
                  </button>
                ))}
                <span
                  style={{
                    marginLeft: "0.5rem",
                    color: "#6c757d",
                    fontSize: "0.875rem",
                  }}>
                  {reviewForm.rating}/5
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                }}>
                Nhận xét *
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #E2E8F0",
                  borderRadius: "0.25rem",
                  fontSize: "1rem",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Submit Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedProductForReview(null);
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#E5E7EB",
                  color: "#374151",
                  border: "none",
                  borderRadius: "0.25rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}>
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewForm.comment.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  backgroundColor:
                    submittingReview || !reviewForm.comment.trim()
                      ? "#93C5FD"
                      : "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: "0.25rem",
                  fontWeight: "600",
                  cursor:
                    submittingReview || !reviewForm.comment.trim()
                      ? "not-allowed"
                      : "pointer",
                }}>
                <Star size={16} />
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrdersPage;
