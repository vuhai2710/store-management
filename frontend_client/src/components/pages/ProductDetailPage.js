// src/components/pages/ProductDetailPage.js
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Minus,
  Plus,
  ShoppingBag,
  Edit,
  Trash2,
  Star,
  User,
  MessageCircle,
} from "lucide-react";
import styles from "../../styles/styles";
import StarRating from "../layout/StarRating";
import ProductCard from "../shared/ProductCard";
import LoadingSpinner from "../common/LoadingSpinner";
import ReviewSection from "../common/ReviewSection";
import { productsService } from "../../services/productsService";
import { promotionService } from "../../services/promotionService";
import { getImageUrl, formatPrice, formatDate } from "../../utils/formatUtils";
import {
  INVENTORY_STATUS,
  INVENTORY_STATUS_LABELS,
  INVENTORY_STATUS_COLORS,
} from "../../constants/inventoryStatus";
import { useAuth } from "../../hooks/useAuth";
import { useBuyNow } from "../../contexts/BuyNowContext";
import { reviewService } from "../../services/reviewService";
import { ordersService } from "../../services/ordersService";

const ProductDetailPage = ({
  productId,
  cart,
  setCurrentPage,
  handleAddToCart,
  handleViewProductDetail,
}) => {
  const { isAuthenticated, customer, user } = useAuth();
  const { setBuyNow } = useBuyNow();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [canReview, setCanReview] = useState(false); // Check if user can review this product
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const addToCartButtonRef = useRef(null);

  // User orders for review
  const [userOrders, setUserOrders] = useState([]);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsTotalElements, setReviewsTotalElements] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    orderDetailId: null,
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [orderDetailsForReview, setOrderDetailsForReview] = useState([]); // Order details that can be reviewed

  // Automatic promotion discount for this product (single-item order approximation)
  const [autoDiscount, setAutoDiscount] = useState(0);
  const [autoDiscountInfo, setAutoDiscountInfo] = useState(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Yêu cầu ID sản phẩm");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const productData = await productsService.getProductById(productId);
        setProduct(productData);

        // Fetch product images
        try {
          const imagesData = await productsService.getProductImages(productId);
          setImages(imagesData || []);
        } catch (imageError) {
          console.error("Error fetching images:", imageError);
          setImages([]);
        }

        // Fetch related products
        try {
          const relatedData = await productsService.getRelatedProducts(
            productId,
            { limit: 4 }
          );
          setRelatedProducts(relatedData || []);
        } catch (relatedError) {
          console.error("Error fetching related products:", relatedError);
          setRelatedProducts([]);
        }

        // Fetch similar products (recommendations)
        try {
          const similarData = await productsService.getSimilarProducts(
            productId
          );
          setSimilarProducts(similarData || []);
        } catch (similarError) {
          console.error("Error fetching similar products:", similarError);
          setSimilarProducts([]);
        }

        // Check if user can review this product (only if authenticated and has purchased)
        if (isAuthenticated) {
          try {
            // Get all completed orders
            const ordersData = await ordersService.getMyOrders({
              pageNo: 1,
              pageSize: 100,
              status: "COMPLETED",
            });
            const completedOrders = ordersData?.content || [];

            // Save user orders for ReviewSection component
            setUserOrders(completedOrders);

            // Get user's reviews to filter out already reviewed products
            let myReviewedOrderDetailIds = new Set();
            try {
              const myReviewsData = await reviewService.getMyReviews({
                pageNo: 1,
                pageSize: 1000,
              });
              const myReviews = myReviewsData?.content || [];
              myReviewedOrderDetailIds = new Set(
                myReviews.map((r) => r.orderDetailId || r.idOrderDetail)
              );
            } catch (reviewError) {
              console.error("Error fetching my reviews:", reviewError);
            }

            // Check if any completed order contains this product
            const currentProductId = productId ? Number(productId) : null;
            const orderDetails = [];
            completedOrders.forEach((order) => {
              order.orderDetails?.forEach((detail) => {
                const detailProductId =
                  detail.idProduct ||
                  detail.product?.idProduct ||
                  detail.product?.id;
                const orderDetailId = detail.idOrderDetail || detail.id;

                // Only include if:
                // 1. Product matches current product
                // 2. Order detail has not been reviewed yet
                if (
                  detailProductId &&
                  Number(detailProductId) === currentProductId &&
                  !myReviewedOrderDetailIds.has(orderDetailId)
                ) {
                  orderDetails.push({
                    idOrderDetail: orderDetailId,
                    orderId: order.idOrder || order.id,
                    productId: detailProductId,
                    quantity: detail.quantity || detail.qty || 1,
                    hasReview: false,
                  });
                }
              });
            });

            setOrderDetailsForReview(orderDetails);
            setCanReview(orderDetails.length > 0);
          } catch (orderError) {
            console.error("Error checking purchase status:", orderError);
            setCanReview(false);
            setOrderDetailsForReview([]);
            setUserOrders([]);
          }
        } else {
          setCanReview(false);
          setOrderDetailsForReview([]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isAuthenticated]);

  // Calculate automatic discount for this product (approximate: single product order)
  useEffect(() => {
    const calculateProductAutoDiscount = async () => {
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
      } catch (discountError) {
        console.error(
          "Error calculating product automatic discount:",
          discountError
        );
        setAutoDiscount(0);
        setAutoDiscountInfo(null);
      }
    };

    calculateProductAutoDiscount();
  }, [isAuthenticated, product]);

  // Fetch reviews when page changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;

      try {
        setReviewsLoading(true);
        const reviewsData = await reviewService.getProductReviews(productId, {
          pageNo: reviewsPage,
          pageSize: 10,
          sortBy: "createdAt",
          sortDirection: "DESC",
        });

        setReviews(reviewsData?.content || []);
        setReviewsTotalPages(reviewsData?.totalPages || 1);
        setReviewsTotalElements(reviewsData?.totalElements || 0);
      } catch (reviewError) {
        console.error("Error fetching reviews:", reviewError);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, reviewsPage]);

  // Set default orderDetailId when orderDetailsForReview changes
  useEffect(() => {
    if (orderDetailsForReview.length > 0) {
      setReviewForm((prev) => {
        // Only set if not already set and form is not visible
        if (!prev.orderDetailId && !showReviewForm && !editingReviewId) {
          return {
            ...prev,
            orderDetailId: orderDetailsForReview[0].idOrderDetail,
          };
        }
        return prev;
      });
    }
  }, [orderDetailsForReview, showReviewForm, editingReviewId]);

  const handleQuantityChange = (delta) => {
    setQty((prev) => {
      const newQty = prev + delta;
      // Min 1, max stockQuantity
      if (newQty < 1) return 1;
      if (stockQuantity > 0 && newQty > stockQuantity) return stockQuantity;
      return newQty;
    });
  };

  const handleCreateReview = async () => {
    if (!reviewForm.orderDetailId || !reviewForm.comment.trim()) {
      toast.warning("Vui lòng điền đầy đủ thông tin đánh giá");
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.createReview(productId, {
        orderDetailId: reviewForm.orderDetailId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      // Refresh reviews
      const reviewsData = await reviewService.getProductReviews(productId, {
        pageNo: reviewsPage,
        pageSize: 10,
        sortBy: "createdAt",
        sortDirection: "DESC",
      });

      setReviews(reviewsData?.content || []);
      setReviewsTotalPages(reviewsData?.totalPages || 1);
      setReviewsTotalElements(reviewsData?.totalElements || 0);

      // Reset form
      setShowReviewForm(false);
      setReviewForm({
        orderDetailId: orderDetailsForReview[0]?.idOrderDetail || null,
        rating: 5,
        comment: "",
      });

      toast.success("Đánh giá đã được gửi thành công!");
    } catch (error) {
      console.error("Error creating review:", error);
      toast.error(
        error?.message || "Không thể tạo đánh giá. Vui lòng thử lại."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateReview = async (reviewId) => {
    if (!reviewForm.comment.trim()) {
      toast.warning("Vui lòng điền đầy đủ thông tin đánh giá");
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.updateReview(reviewId, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      // Refresh reviews
      const reviewsData = await reviewService.getProductReviews(productId, {
        pageNo: reviewsPage,
        pageSize: 10,
        sortBy: "createdAt",
        sortDirection: "DESC",
      });

      setReviews(reviewsData?.content || []);
      setReviewsTotalPages(reviewsData?.totalPages || 1);
      setReviewsTotalElements(reviewsData?.totalElements || 0);

      // Reset form
      setEditingReviewId(null);
      setShowReviewForm(false);
      setReviewForm({
        orderDetailId: orderDetailsForReview[0]?.idOrderDetail || null,
        rating: 5,
        comment: "",
      });

      toast.success("Đánh giá đã được cập nhật thành công!");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error(
        error?.message || "Không thể cập nhật đánh giá. Vui lòng thử lại."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);

      // Refresh reviews
      const reviewsData = await reviewService.getProductReviews(productId, {
        pageNo: reviewsPage,
        pageSize: 10,
        sortBy: "createdAt",
        sortDirection: "DESC",
      });

      setReviews(reviewsData?.content || []);
      setReviewsTotalPages(reviewsData?.totalPages || 1);
      setReviewsTotalElements(reviewsData?.totalElements || 0);

      toast.success("Đánh giá đã được xóa thành công!");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(
        error?.message || "Không thể xóa đánh giá. Vui lòng thử lại."
      );
    }
  };

  const handleAddToCartClick = async () => {
    if (!isAuthenticated) {
      setCurrentPage("login");
      return;
    }

    if (!product) {
      toast.warning("Không tìm thấy thông tin sản phẩm");
      return;
    }

    try {
      const productWithQty = {
        ...product,
        qty,
        quantity: qty,
        idProduct: product.idProduct || product.id,
        productId: product.idProduct || product.id,
      };
      await handleAddToCart(productWithQty, addToCartButtonRef.current);
      // Don't show alert here - let App.js handle it
    } catch (error) {
      // Error is already handled in App.js
      console.error("Error adding to cart:", error);
    }
  };

  /**
   * handleBuyNow - Xử lý khi user nhấn "Mua Ngay"
   * 
   * LUỒNG MỚI (giống Shopee/Lazada):
   * 1. KHÔNG tạo đơn hàng ngay
   * 2. Lưu productId + quantity vào BuyNowContext
   * 3. Điều hướng sang trang Checkout
   * 4. Tại Checkout, user chọn địa chỉ, phương thức thanh toán, xem phí ship
   * 5. User nhấn "Đặt hàng" → lúc này mới gọi API tạo đơn
   */
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setCurrentPage("login");
      return;
    }

    if (!product) {
      toast.warning("Không tìm thấy thông tin sản phẩm");
      return;
    }

    const productIdValue = product.idProduct || product.id;
    
    // Kiểm tra số lượng hợp lệ
    if (qty < 1) {
      toast.warning("Số lượng phải lớn hơn 0");
      return;
    }

    // Kiểm tra tồn kho
    const stockQuantity = product.stockQuantity || 0;
    if (qty > stockQuantity) {
      toast.warning(`Chỉ còn ${stockQuantity} sản phẩm trong kho`);
      return;
    }

    // Lưu thông tin sản phẩm vào BuyNowContext
    // KHÔNG gọi API tạo đơn hàng ở đây
    setBuyNow({
      productId: productIdValue,
      quantity: qty,
      product: {
        idProduct: productIdValue,
        productName: product.productName || product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
        weight: product.weight || 1000, // Default 1kg if not specified
      },
    });

    // Điều hướng sang trang Checkout
    // Tại đây user sẽ:
    // - Xem lại sản phẩm
    // - Chọn địa chỉ giao hàng
    // - Xem phí vận chuyển GHN
    // - Chọn phương thức thanh toán (COD / PayOS)
    // - Nhấn "Đặt hàng" để tạo đơn
    setCurrentPage("checkout");
  };

  // Get item in cart
  const itemInCart = cart.find((item) => {
    const itemProductId =
      item.productId || item.product?.idProduct || item.product?.id;
    const currentProductId = product?.idProduct || product?.id;
    return itemProductId === currentProductId;
  });

  // Get main image
  const getMainImage = () => {
    if (images && images.length > 0) {
      const selectedImage = images[selectedImageIndex] || images[0];
      return getImageUrl(selectedImage.imageUrl || selectedImage.url);
    }
    if (product?.imageUrl) {
      return getImageUrl(product.imageUrl);
    }
    return null;
  };

  const mainImage = getMainImage();
  const productName = product?.productName || product?.name || "";
  const productPrice = product?.price || 0;
  const finalProductPrice = Math.max(0, productPrice - (autoDiscount || 0));
  const productStatus =
    product?.status || product?.inventoryStatus || INVENTORY_STATUS.IN_STOCK;
  const isOutOfStock = productStatus === INVENTORY_STATUS.OUT_OF_STOCK;
  const stockQuantity = product?.stockQuantity || 0;
  const headerAverageRating = product?.averageRating || 0;
  const headerReviewCount = product?.reviewCount || 0;

  // --- Helpers cho khu vực Tabs ---
  const DescriptionBlock = () => (
    <div
      style={{
        padding: "1.5rem",
        border: "1px solid #E2E8F0",
        borderRadius: "0.5rem",
        backgroundColor: "#fff",
      }}>
      <h4
        style={{
          fontWeight: "bold",
          fontSize: "1.25rem",
          marginBottom: "1rem",
          borderBottom: "2px solid #2563EB",
          display: "inline-block",
          paddingBottom: "0.25rem",
        }}>
        Mô tả sản phẩm
      </h4>
      <p
        style={{
          lineHeight: 1.6,
          color: "#495057",
          marginBottom: "1.5rem",
          whiteSpace: "pre-wrap",
        }}>
        {product?.description || product?.desc || "Chưa có mô tả"}
      </p>
      {product?.productCode && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "#F8FAFC",
            borderRadius: "0.25rem",
          }}>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#6c757d",
              marginBottom: "0.5rem",
            }}>
            <strong>Mã sản phẩm:</strong> {product.productCode}
          </p>
          {product?.brand && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6c757d",
                marginBottom: "0.5rem",
              }}>
              <strong>Thương hiệu:</strong> {product.brand}
            </p>
          )}
          {product?.categoryName && (
            <p style={{ fontSize: "0.875rem", color: "#6c757d" }}>
              <strong>Danh mục:</strong> {product.categoryName}
            </p>
          )}
        </div>
      )}
    </div>
  );

  const ReviewsBlock = () => {
    // Only show review section if user can review (has purchased and received)
    if (!isAuthenticated) {
      return (
        <div
          style={{
            padding: "1.5rem",
            border: "1px solid #E2E8F0",
            borderRadius: "0.5rem",
            backgroundColor: "#fff",
            textAlign: "center",
          }}>
          <p style={{ color: "#6c757d", marginBottom: "1rem" }}>
            Vui lòng đăng nhập và mua sản phẩm để đánh giá.
          </p>
          <button
            onClick={() => setCurrentPage("login")}
            style={{
              ...styles.buttonPrimary,
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
            }}>
            Đăng nhập
          </button>
        </div>
      );
    }

    if (!canReview) {
      return (
        <div
          style={{
            padding: "1.5rem",
            border: "1px solid #E2E8F0",
            borderRadius: "0.5rem",
            backgroundColor: "#fff",
            textAlign: "center",
          }}>
          <p style={{ color: "#6c757d", marginBottom: "1rem" }}>
            Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành
            công.
          </p>
          <button
            onClick={() => setCurrentPage("shop")}
            style={{
              ...styles.buttonPrimary,
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
            }}>
            Mua sản phẩm
          </button>
        </div>
      );
    }

    // Calculate average rating from reviews
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
          reviews.length
        : product?.rating || 0;

    const currentUserId =
      customer?.idCustomer ||
      user?.idUser ||
      user?.id ||
      customer?.idUser ||
      customer?.id;

    return (
      <div
        style={{
          padding: "1.5rem",
          border: "1px solid #E2E8F0",
          borderRadius: "0.5rem",
          backgroundColor: "#fff",
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}>
          <h4 style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
            Đánh giá khách hàng ({reviewsTotalElements})
          </h4>
          {!showReviewForm && !editingReviewId && (
            <button
              onClick={() => {
                setShowReviewForm(true);
                setReviewForm({
                  orderDetailId:
                    orderDetailsForReview[0]?.idOrderDetail || null,
                  rating: 5,
                  comment: "",
                });
              }}
              style={{
                ...styles.buttonPrimary,
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
              <MessageCircle size={16} />
              Viết đánh giá
            </button>
          )}
        </div>

        {/* Average Rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
            gap: "1rem",
            borderBottom: "1px solid #e9ecef",
            paddingBottom: "1rem",
          }}>
          <div
            style={{ fontSize: "3rem", fontWeight: "bold", color: "#2563EB" }}>
            {averageRating.toFixed(1)}
          </div>
          <div>
            <StarRating rating={averageRating} />
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6c757d",
                marginTop: "0.5rem",
              }}>
              Dựa trên {reviewsTotalElements} đánh giá
            </p>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              border: "1px solid #E2E8F0",
              borderRadius: "0.5rem",
              backgroundColor: "#F8FAFC",
            }}>
            <h5
              style={{
                fontWeight: "bold",
                fontSize: "1.125rem",
                marginBottom: "1rem",
              }}>
              {editingReviewId ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
            </h5>

            {orderDetailsForReview.length > 1 && !editingReviewId && (
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}>
                  Chọn đơn hàng *
                </label>
                <select
                  value={reviewForm.orderDetailId || ""}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      orderDetailId: Number(e.target.value),
                    }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    fontSize: "1rem",
                  }}>
                  <option value="">-- Chọn đơn hàng --</option>
                  {orderDetailsForReview.map((orderDetail) => (
                    <option
                      key={orderDetail.idOrderDetail}
                      value={orderDetail.idOrderDetail}>
                      Đơn hàng #{orderDetail.orderId} - Số lượng:{" "}
                      {orderDetail.quantity}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                  gap: "0.5rem",
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
                      size={32}
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

            <div style={{ marginBottom: "1rem" }}>
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
                required
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
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

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  if (editingReviewId) {
                    handleUpdateReview(editingReviewId);
                  } else {
                    handleCreateReview();
                  }
                }}
                disabled={submittingReview || !reviewForm.comment.trim()}
                style={{
                  ...styles.buttonPrimary,
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  opacity:
                    submittingReview || !reviewForm.comment.trim() ? 0.6 : 1,
                  cursor:
                    submittingReview || !reviewForm.comment.trim()
                      ? "not-allowed"
                      : "pointer",
                }}>
                {submittingReview
                  ? "Đang xử lý..."
                  : editingReviewId
                  ? "Cập nhật"
                  : "Gửi đánh giá"}
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReviewId(null);
                  setReviewForm({
                    orderDetailId:
                      orderDetailsForReview[0]?.idOrderDetail || null,
                    rating: 5,
                    comment: "",
                  });
                }}
                disabled={submittingReview}
                style={{
                  ...styles.buttonSecondary,
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                }}>
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "2rem",
            }}>
            <LoadingSpinner />
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "2rem", color: "#6c757d" }}>
            <MessageCircle
              size={48}
              style={{ margin: "0 auto 1rem", opacity: 0.3 }}
            />
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Hãy là người đầu tiên đánh giá sản phẩm này!
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {reviews.map((review) => {
              const isMyReview = review.idCustomer === currentUserId;
              const reviewDate = formatDate(review.createdAt, "dd/MM/yyyy");
              const canEdit = isMyReview;

              return (
                <div
                  key={review.idReview || review.id}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.5rem",
                    backgroundColor: isMyReview ? "#F8FAFC" : "#fff",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "1rem",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          backgroundColor: "#2563EB",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "1.25rem",
                        }}>
                        <User size={24} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#212529",
                            marginBottom: "0.25rem",
                          }}>
                          {review.customerName || "Khách hàng"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.25rem",
                          }}>
                          <StarRating rating={review.rating || 0} />
                          <span
                            style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                            {review.rating}/5
                          </span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                          {reviewDate}
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => {
                            setEditingReviewId(review.idReview || review.id);
                            setShowReviewForm(true);
                            setReviewForm({
                              orderDetailId:
                                review.idOrderDetail ||
                                orderDetailsForReview[0]?.idOrderDetail ||
                                null,
                              rating: review.rating || 5,
                              comment: review.comment || "",
                            });
                          }}
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            border: "none",
                            borderRadius: "0.25rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteReview(review.idReview || review.id)
                          }
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#ffebee",
                            color: "#d32f2f",
                            border: "none",
                            borderRadius: "0.25rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p
                    style={{
                      color: "#495057",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}>
                    {review.comment}
                  </p>
                </div>
              );
            })}

            {/* Pagination */}
            {reviewsTotalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "1rem",
                }}>
                <button
                  onClick={() =>
                    setReviewsPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={reviewsPage === 1}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    backgroundColor: reviewsPage === 1 ? "#F8FAFC" : "#fff",
                    color: reviewsPage === 1 ? "#6c757d" : "#495057",
                    cursor: reviewsPage === 1 ? "not-allowed" : "pointer",
                    opacity: reviewsPage === 1 ? 0.6 : 1,
                  }}>
                  Trước
                </button>
                <span style={{ padding: "0.5rem 1rem", color: "#495057" }}>
                  Trang {reviewsPage} / {reviewsTotalPages}
                </span>
                <button
                  onClick={() =>
                    setReviewsPage((prev) =>
                      Math.min(reviewsTotalPages, prev + 1)
                    )
                  }
                  disabled={reviewsPage === reviewsTotalPages}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    backgroundColor:
                      reviewsPage === reviewsTotalPages ? "#F8FAFC" : "#fff",
                    color:
                      reviewsPage === reviewsTotalPages ? "#6c757d" : "#495057",
                    cursor:
                      reviewsPage === reviewsTotalPages
                        ? "not-allowed"
                        : "pointer",
                    opacity: reviewsPage === reviewsTotalPages ? 0.6 : 1,
                  }}>
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const InformationBlock = () => (
    <div
      style={{
        padding: "1.5rem",
        border: "1px solid #E2E8F0",
        borderRadius: "0.5rem",
        backgroundColor: "#fff",
      }}>
      <h4
        style={{
          fontWeight: "bold",
          fontSize: "1.25rem",
          marginBottom: "1rem",
        }}>
        Vận chuyển & Đổi trả
      </h4>
      <p style={{ lineHeight: 1.6, color: "#495057", marginBottom: "1.5rem" }}>
        Chúng tôi cung cấp miễn phí vận chuyển cho tất cả đơn hàng trên 500.000₫
        trên toàn quốc. Thời gian giao hàng thường từ 3-7 ngày làm việc tùy theo
        khu vực.
      </p>
      <p style={{ lineHeight: 1.6, color: "#495057" }}>
        Chấp nhận đổi trả trong vòng 30 ngày kể từ khi nhận hàng, với điều kiện
        sản phẩm chưa sử dụng và còn nguyên bao bì.
      </p>
    </div>
  );

  if (loading) {
    return (
      <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
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

  if (error || !product) {
    return (
      <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p
              style={{
                color: "#dc3545",
                fontSize: "1.125rem",
                marginBottom: "1rem",
              }}>
              {error || "Không tìm thấy sản phẩm"}
            </p>
            <button
              onClick={() => setCurrentPage("shop")}
              style={styles.buttonPrimary}>
              Quay về cửa hàng
            </button>
          </div>
        </div>
      </section>
    );
  }

  // --- Main Render ---
  return (
    <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
      <div style={styles.container}>
        {/* Breadcrumb */}
        <div style={{ color: "#6c757d", marginBottom: "2rem" }}>
          <button
            onClick={() => setCurrentPage("home")}
            style={{ ...styles.navLink, color: "#2563EB", padding: 0 }}>
            Trang chủ
          </button>{" "}
          /
          <button
            onClick={() => setCurrentPage("shop")}
            style={{ ...styles.navLink, color: "#2563EB", padding: 0 }}>
            {" "}
            Cửa hàng
          </button>{" "}
          /<span> {productName}</span>
        </div>

        {/* Product Details Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            marginBottom: "4rem",
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}>
          {/* Image Gallery (Left) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1/1",
                backgroundColor: "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                overflow: "hidden",
              }}>
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={productName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ fontSize: "10rem", opacity: 0.5 }}>📦</div>
              )}
            </div>
            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  width: "100%",
                  justifyContent: "center",
                }}>
                {images.slice(0, 5).map((image, index) => {
                  const imageUrl = getImageUrl(image.imageUrl || image.url);
                  return (
                    <div
                      key={image.idImage || index}
                      onClick={() => setSelectedImageIndex(index)}
                      style={{
                        width: "80px",
                        height: "80px",
                        backgroundColor: "#e9ecef",
                        borderRadius: "0.25rem",
                        opacity: selectedImageIndex === index ? 1 : 0.6,
                        cursor: "pointer",
                        border:
                          selectedImageIndex === index
                            ? "2px solid #2563EB"
                            : "none",
                        overflow: "hidden",
                      }}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${productName} ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info (Right) */}
          <div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                lineHeight: "1.2",
              }}>
              {productName}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1rem",
              }}>
              <StarRating rating={headerAverageRating} />
              <span style={{ color: "#6c757d", fontSize: "0.875rem" }}>
                ({headerReviewCount} đánh giá)
              </span>
              <span
                style={{
                  color: INVENTORY_STATUS_COLORS[productStatus] || "#28a745",
                  fontWeight: "600",
                  marginLeft: "1rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  backgroundColor:
                    (INVENTORY_STATUS_COLORS[productStatus] || "#28a745") +
                    "20",
                }}>
                {INVENTORY_STATUS_LABELS[productStatus] || "Còn hàng"}
                {stockQuantity > 0 && ` (${stockQuantity} sản phẩm có sẵn)`}
              </span>
            </div>

            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#dc3545",
                marginBottom: "1rem",
              }}>
              {autoDiscount > 0 ? (
                <>
                  <span
                    style={{
                      fontSize: "1.25rem",
                      color: "#6c757d",
                      textDecoration: "line-through",
                      marginRight: "0.75rem",
                    }}>
                    {formatPrice(productPrice)}
                  </span>
                  <span>{formatPrice(finalProductPrice)}</span>
                </>
              ) : (
                formatPrice(productPrice)
              )}
            </p>

            {autoDiscount > 0 && autoDiscountInfo && (
              <p
                style={{
                  color: "#28a745",
                  fontWeight: "600",
                  marginTop: "-0.75rem",
                  marginBottom: "1rem",
                  fontSize: "0.95rem",
                }}>
                Đang áp dụng giảm giá tự động: -{formatPrice(autoDiscount)}
              </p>
            )}

            <p
              style={{
                color: "#495057",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
              }}>
              {product.description || product.desc || "Chưa có mô tả"}
            </p>

            {/* Quantity Control */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                marginBottom: "2rem",
                padding: "1rem",
                border: "1px solid #E2E8F0",
                borderRadius: "0.5rem",
              }}>
              <div style={{ fontWeight: "bold", color: "#495057" }}>
                Số lượng:
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "1px solid #E2E8F0",
                  borderRadius: "0.25rem",
                }}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={qty <= 1}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.5rem",
                    cursor: qty <= 1 ? "not-allowed" : "pointer",
                    opacity: qty <= 1 ? 0.5 : 1,
                  }}>
                  <Minus size={18} />
                </button>
                <span
                  style={{
                    padding: "0 0.5rem",
                    fontWeight: "bold",
                    minWidth: "2rem",
                    textAlign: "center",
                  }}>
                  {qty}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={isOutOfStock || qty >= stockQuantity}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.5rem",
                    cursor:
                      isOutOfStock || qty >= stockQuantity
                        ? "not-allowed"
                        : "pointer",
                    opacity: isOutOfStock || qty >= stockQuantity ? 0.5 : 1,
                  }}>
                  <Plus size={18} />
                </button>
              </div>
              {itemInCart && (
                <span style={{ color: "#2563EB", fontSize: "0.875rem" }}>
                  ({itemInCart.quantity || itemInCart.qty || 0} trong giỏ hàng)
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <button
                ref={addToCartButtonRef}
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
                style={{
                  ...styles.buttonSecondary,
                  padding: "1rem 2rem",
                  fontSize: "1.125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  opacity: isOutOfStock ? 0.5 : 1,
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                }}>
                <ShoppingBag size={20} /> THÊM VÀO GIỎ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || buyNowLoading}
                style={{
                  ...styles.buttonPrimary,
                  padding: "1rem 2rem",
                  fontSize: "1.125rem",
                  opacity: isOutOfStock || buyNowLoading ? 0.5 : 1,
                  cursor:
                    isOutOfStock || buyNowLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}>
                {buyNowLoading ? (
                  <>
                    <LoadingSpinner size={20} color="white" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  "MUA NGAY"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs: Description, Information, Reviews (Bottom) */}
        <div style={{ marginBottom: "4rem" }}>
          {/* Tab Navigations */}
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid #e9ecef",
              marginBottom: "1.5rem",
            }}>
            {["description", "information", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "1rem 1.5rem",
                  border: "none",
                  background: "none",
                  fontWeight: activeTab === tab ? "bold" : "normal",
                  color: activeTab === tab ? "#2563EB" : "#495057",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid #2563EB"
                      : "2px solid transparent",
                  cursor: "pointer",
                  fontSize: "1.125rem",
                  transition: "color 0.3s, border-bottom 0.3s",
                }}>
                {tab === "description"
                  ? "Mô tả"
                  : tab === "information"
                  ? "Thông tin"
                  : tab === "reviews"
                  ? "Đánh giá"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "description" && <DescriptionBlock />}
            {activeTab === "information" && <InformationBlock />}
            {activeTab === "reviews" && (
              <div style={{ padding: "1rem 0" }}>
                <ReviewSection productId={productId} userOrders={userOrders} />
              </div>
            )}
          </div>
        </div>

        {/* Similar Products (Recommendations) */}
        {similarProducts.length > 0 && (
          <div style={{ marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                textAlign: "center",
              }}>
              Sản phẩm tương tự
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}>
              {similarProducts.map((similar) => (
                <ProductCard
                  key={similar.idProduct || similar.id}
                  product={similar}
                  handleAddToCart={handleAddToCart}
                  handleViewProductDetail={handleViewProductDetail}
                />
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                textAlign: "center",
              }}>
              Sản phẩm liên quan
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}>
              {relatedProducts.map((related) => (
                <ProductCard
                  key={related.idProduct || related.id}
                  product={related}
                  handleAddToCart={handleAddToCart}
                  handleViewProductDetail={handleViewProductDetail}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetailPage;
