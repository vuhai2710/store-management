import React, { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { reviewService } from "../../services/reviewService";
import LoadingSpinner from "../common/LoadingSpinner";
import { parseBackendDate } from "../../utils/formatUtils";

const formatReviewDate = (createdAt) => {
  if (!createdAt) return "-";

  const date = parseBackendDate(createdAt);
  if (!date || isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ReviewSection = ({ productId, userOrders = [] }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
  });
  const [ratingFilter, setRatingFilter] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const [selectedOrderDetail, setSelectedOrderDetail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [reviewedOrderDetailIds, setReviewedOrderDetailIds] = useState(
    new Set()
  );

  const eligibleOrders = userOrders.filter(
    (order) =>
      order.status === "COMPLETED" &&
      order.orderDetails?.some((detail) => {
        const detailProductId =
          detail.idProduct ||
          detail.productId ||
          (detail.product && (detail.product.idProduct || detail.product.id));
        const orderDetailId = detail.idOrderDetail || detail.id;

        return (
          detailProductId &&
          Number(detailProductId) === Number(productId) &&
          !reviewedOrderDetailIds.has(orderDetailId)
        );
      })
  );

  const fetchMyReviews = async () => {
    try {
      const myReviewsData = await reviewService.getMyReviews({
        pageNo: 1,
        pageSize: 1000,
      });
      const myReviews = myReviewsData?.content || [];
      const reviewedIds = new Set(
        myReviews.map((r) => r.orderDetailId || r.idOrderDetail)
      );
      setReviewedOrderDetailIds(reviewedIds);
    } catch (error) {
      console.error("Error fetching my reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchMyReviews();
  }, [productId, pagination.currentPage, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        pageNo: pagination.currentPage,
        pageSize: pagination.pageSize,
        rating: ratingFilter,
      };
      const response = await reviewService.getProductReviews(productId, params);
      setReviews(response.content || []);
      setPagination({
        ...pagination,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 1,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedOrderDetail) {
      setError("Vui lòng chọn đơn hàng");
      return;
    }

    if (!comment.trim()) {
      setError("Vui lòng nhập nhận xét");
      return;
    }

    try {
      setSubmitLoading(true);
      if (editingReview) {

        await reviewService.updateReview(editingReview.idReview, {
          rating,
          comment: comment.trim(),
        });
        setSuccess("Cập nhật đánh giá thành công!");
      } else {

        await reviewService.createReview(productId, {
          orderDetailId: parseInt(selectedOrderDetail),
          rating,
          comment: comment.trim(),
        });
        setSuccess("Đánh giá thành công!");
      }

      setSelectedOrderDetail("");
      setRating(5);
      setComment("");
      setEditingReview(null);
      setShowReviewForm(false);

      fetchReviews();
      fetchMyReviews();
    } catch (error) {
      setError(error.response?.data?.message || "Có lỗi xảy ra khi đánh giá");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      setSuccess("Xóa đánh giá thành công!");
      fetchReviews();
    } catch (error) {
      setError(error.response?.data?.message || "Không thể xóa đánh giá");
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            fill={star <= rating ? "#fadb14" : "none"}
            stroke={star <= rating ? "#fadb14" : "#d9d9d9"}
            className={
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }
            onClick={() =>
              interactive && onRatingChange && onRatingChange(star)
            }
          />
        ))}
      </div>
    );
  };

  const isWithin24Hours = (createdAt) => {
    const reviewDate = parseBackendDate(createdAt);
    if (!reviewDate || isNaN(reviewDate.getTime())) return false;
    const now = new Date();
    const hoursDiff = (now - reviewDate) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  const canEditOrDelete = (review) => {
    return isWithin24Hours(review.createdAt) && review.editCount < 1;
  };

  const avgRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      ).toFixed(1)
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

      {}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{avgRating}</div>
            <div className="mb-2">
              {renderStars(Math.round(parseFloat(avgRating)))}
            </div>
            <div className="text-sm text-gray-600">
              {reviews.length} đánh giá
            </div>
          </div>
          <div className="flex-1">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3 mb-2">
                <button
                  onClick={() =>
                    setRatingFilter(ratingFilter === star ? null : star)
                  }
                  className={`flex items-center gap-1 text-sm ${ratingFilter === star
                    ? "text-yellow-500 font-semibold"
                    : "text-gray-600"
                    }`}>
                  {star} <Star size={14} fill="#fadb14" stroke="#fadb14" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0
                        }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      {eligibleOrders.length > 0 && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <MessageSquare size={20} />
          Viết đánh giá
        </button>
      )}

      {}
      {showReviewForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
            </h3>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setEditingReview(null);
                setRating(5);
                setComment("");
                setError("");
              }}
              className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmitReview}>
            {!editingReview && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Chọn đơn hàng <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedOrderDetail}
                  onChange={(e) => setSelectedOrderDetail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required>
                  <option value="">-- Chọn đơn hàng --</option>
                  {eligibleOrders.map((order) =>
                    order.orderDetails
                      .filter((detail) => {
                        const detailProductId =
                          detail.idProduct ||
                          detail.productId ||
                          (detail.product &&
                            (detail.product.idProduct || detail.product.id));
                        const orderDetailId = detail.idOrderDetail || detail.id;

                        return (
                          detailProductId &&
                          Number(detailProductId) === Number(productId) &&
                          !reviewedOrderDetailIds.has(orderDetailId)
                        );
                      })
                      .map((detail) => (
                        <option
                          key={detail.idOrderDetail}
                          value={detail.idOrderDetail}>
                          Đơn hàng #{order.idOrder} - {detail.productName}
                        </option>
                      ))
                  )}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Đánh giá <span className="text-red-500">*</span>
              </label>
              {renderStars(rating, true, setRating)}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Nhận xét <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                required
              />
              <div className="text-sm text-gray-500 mt-1">
                {comment.length}/500 ký tự
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
                {submitLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {editingReview ? "Cập nhật" : "Gửi đánh giá"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setRating(5);
                  setComment("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Chưa có đánh giá nào cho sản phẩm này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.idReview}
              className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold mb-1">
                    {review.customerName}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating)}
                    {review.editCount > 0 && (
                      <span className="text-xs text-gray-500">
                        (Đã chỉnh sửa)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatReviewDate(review.createdAt)}
                  </div>
                </div>
                {canEditOrDelete(review) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Chỉnh sửa (chỉ trong 24h, 1 lần)">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.idReview)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Xóa (chỉ trong 24h)">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700 mb-3">{review.comment}</p>
              {review.adminReply && (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={16} className="text-blue-600 mt-1" />
                    <div>
                      <div className="font-semibold text-sm text-blue-900 mb-1">
                        Phản hồi từ Shop
                      </div>
                      <p className="text-gray-700">{review.adminReply}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage - 1,
                  })
                }
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Trước
              </button>
              <span className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage + 1,
                  })
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
