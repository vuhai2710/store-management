import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Descriptions, Typography, Spin, message, Image, Row, Col, Tag } from "antd";
import { fetchProductById, clearCurrentProduct } from "../store/slices/productsSlice";
import { productsService } from "../services/productsService";
import ImageLightbox from "../components/common/ImageLightbox";
import StatusBadge from "../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../utils/formatUtils";

const { Title } = Typography;

const STATUS_MAP = {
  IN_STOCK: { text: "Còn hàng", color: "green" },
  OUT_OF_STOCK: { text: "Hết hàng", color: "red" },
};

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((s) => s.products || {});
  const [productImages, setProductImages] = useState([]);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id)));
      loadProductImages(Number(id));
    }
    return () => dispatch(clearCurrentProduct());
  }, [id, dispatch]);

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

  if (loading && !current) return <Spin />;

  const allImages = [
    ...(current?.imageUrl ? [{ url: current.imageUrl, alt: current.productName }] : []),
    ...productImages.map((img) => ({ url: img.imageUrl, alt: current?.productName || "Product" })),
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
    </div>
  );
};

export default ProductDetail;


