import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Descriptions, Typography, Spin, message, Image, Row, Col, Tag, Rate, Empty, Pagination, Popconfirm, Button, Space, Modal, Input } from "antd";
import { StarOutlined, DeleteOutlined } from "@ant-design/icons";
import { fetchProductById, clearCurrentProduct } from "../store/slices/productsSlice";
import { fetchProductReviews, deleteReview, clearProductReviews, replyToReview } from "../store/slices/reviewsSlice";
import { productsService } from "../services/productsService";
import ImageLightbox from "../components/common/ImageLightbox";
import StatusBadge from "../components/common/StatusBadge";
import { formatCurrency, formatDate, getImageUrl } from "../utils/formatUtils";
import { usePagination } from "../hooks/usePagination";

const { Title } = Typography;

const STATUS_MAP = {
  IN_STOCK: { text: "Còn hàng", color: "green" },
  OUT_OF_STOCK: { text: "Hết hàng", color: "red" },
};

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((s) => s.products || {});
  const { productReviews } = useSelector((s) => s.reviews || {});
  const [productImages, setProductImages] = useState([]);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [selectedReviewForReply, setSelectedReviewForReply] = useState(null);

  // Pagination cho reviews
  const {
    currentPage: reviewPage,
    pageSize: reviewPageSize,
    setTotal: setReviewTotal,
    handlePageChange: handleReviewPageChange,
    pagination: reviewPagination,
  } = usePagination(1, 5);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id)));
      loadProductImages(Number(id));
      loadProductReviews(Number(id), reviewPage, reviewPageSize);
    }
    return () => {
      dispatch(clearCurrentProduct());
      dispatch(clearProductReviews());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (id && reviewPage) {
      loadProductReviews(Number(id), reviewPage, reviewPageSize);
    }
  }, [id, reviewPage, reviewPageSize]);

  useEffect(() => {
    if (productReviews.pagination.totalElements) {
      setReviewTotal(productReviews.pagination.totalElements);
    }
  }, [productReviews.pagination.totalElements, setReviewTotal]);

  useEffect(() => {
    if (error?.message) message.error(error.message);
  }, [error]);

  const loadProductImages = async (productId) => {
    try {
      const images = await productsService.getProductImages(productId);
      setProductImages(Array.isArray(images) ? images : []);
    } catch (error) {
      console.error("Error loading product images:", error);
      setProductImages([]);
    }
  };

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  const loadProductReviews = async (productId, pageNo, pageSize) => {
    try {
      await dispatch(fetchProductReviews({ productId, pageNo, pageSize, sortBy: "createdAt", sortDirection: "DESC" })).unwrap();
    } catch (error) {
      console.error("Error loading product reviews:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      message.success("Xóa đánh giá thành công!");
      // Reload reviews
      if (id) {
        loadProductReviews(Number(id), reviewPage, reviewPageSize);
      }
    } catch (error) {
      message.error(error || "Xóa đánh giá thất bại!");
    }
  };

  const openReplyModal = (review) => {
    setSelectedReviewForReply(review);
    setReplyContent(review.adminReply || "");
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedReviewForReply || !replyContent.trim()) {
      message.warning("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      await dispatch(
        replyToReview({ reviewId: selectedReviewForReply.idReview, adminReply: replyContent.trim() })
      ).unwrap();
      message.success("Trả lời đánh giá thành công!");
      setReplyModalVisible(false);
      setSelectedReviewForReply(null);
      setReplyContent("");
    } catch (error) {
      message.error(error || "Trả lời đánh giá thất bại!");
    }
  };

  // Tính trung bình rating
  const averageRating = productReviews.list.length > 0
    ? productReviews.list.reduce((sum, review) => sum + (review.rating || 0), 0) / productReviews.list.length
    : 0;

  if (loading && !current) return <Spin />;

  const allImages = [
    ...(current?.imageUrl
      ? [{ url: getImageUrl(current.imageUrl), alt: current.productName }]
      : []),
    ...productImages.map((img) => ({
      url: getImageUrl(img.imageUrl),
      alt: current?.productName || "Product",
    })),
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <Title level={3}>Chi tiết sản phẩm</Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Thông tin sản phẩm">
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="ID">{current?.idProduct}</Descriptions.Item>
              <Descriptions.Item label="Tên">{current?.productName}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">{current?.categoryName}</Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">{current?.brand || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">{current?.supplierName || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Giá">
                {current?.price ? formatCurrency(current.price) : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho">{current?.stockQuantity || 0}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <StatusBadge status={current?.status} statusMap={STATUS_MAP} />
              </Descriptions.Item>
              <Descriptions.Item label="Mã sản phẩm">{current?.productCode || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Loại mã">{current?.codeType || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="SKU">{current?.sku || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{current?.description || "N/A"}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Ảnh sản phẩm">
            {allImages.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    style={{
                      width: "150px",
                      height: "150px",
                      cursor: "pointer",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      preview={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Typography.Text type="secondary">Chưa có ảnh</Typography.Text>
            )}
          </Card>
        </Col>
      </Row>

      <ImageLightbox
        images={allImages}
        currentIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
      />

      {/* Reviews Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <StarOutlined />
                <span>Đánh giá sản phẩm</span>
                {productReviews.pagination.totalElements > 0 && (
                  <Tag color="blue">
                    {productReviews.pagination.totalElements} đánh giá
                    {averageRating > 0 && ` • ${averageRating.toFixed(1)}/5`}
                  </Tag>
                )}
              </Space>
            }
          >
            {productReviews.loading ? (
              <Spin />
            ) : productReviews.list.length === 0 ? (
              <Empty description="Chưa có đánh giá nào" />
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  {productReviews.list.map((review) => (
                    <Card
                      key={review.idReview}
                      size="small"
                      style={{ marginBottom: 12 }}
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          onClick={() => openReplyModal(review)}
                        >
                          {review.adminReply ? "Sửa trả lời" : "Trả lời"}
                        </Button>,
                        <Popconfirm
                          title="Bạn có chắc muốn xóa đánh giá này?"
                          onConfirm={() => handleDeleteReview(review.idReview)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} size="small">
                            Xóa
                          </Button>
                        </Popconfirm>,
                      ]}
                    >
                      <Space direction="vertical" style={{ width: "100%" }} size="small">
                        <Space>
                          <Rate disabled value={review.rating} />
                          <Typography.Text strong>{review.customerName || "Khách hàng"}</Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {review.createdAt ? formatDate(review.createdAt) : ""}
                          </Typography.Text>
                        </Space>
                        {review.comment && (
                          <Typography.Paragraph style={{ margin: 0, marginTop: 8 }}>
                            {review.comment}
                          </Typography.Paragraph>
                        )}
                        {review.adminReply && (
                          <Card
                            size="small"
                            type="inner"
                            title="Phản hồi từ cửa hàng"
                            style={{ marginTop: 8, backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}
                          >
                            <Typography.Paragraph style={{ margin: 0 }}>{review.adminReply}</Typography.Paragraph>
                          </Card>
                        )}
                      </Space>
                    </Card>
                  ))}
                </div>
                {productReviews.pagination.totalPages > 1 && (
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <Pagination
                      current={reviewPagination.current}
                      pageSize={reviewPagination.pageSize}
                      total={reviewPagination.total}
                      onChange={(page, size) => handleReviewPageChange(page, size)}
                      showSizeChanger
                      pageSizeOptions={["5", "10", "20"]}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={selectedReviewForReply?.customerName ? `Trả lời đánh giá của ${selectedReviewForReply.customerName}` : "Trả lời đánh giá"}
        open={replyModalVisible}
        onOk={handleSubmitReply}
        onCancel={() => {
          setReplyModalVisible(false);
          setSelectedReviewForReply(null);
          setReplyContent("");
        }}
        okText="Gửi trả lời"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={4}
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Nhập nội dung phản hồi tới khách hàng..."
        />
      </Modal>
    </div>
  );
};

export default ProductDetail;


