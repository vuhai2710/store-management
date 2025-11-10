import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Descriptions, Typography, Spin, message } from "antd";
import { fetchProductById, clearCurrentProduct } from "../store/slices/productsSlice";

const { Title } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((s) => s.products || {});

  useEffect(() => {
    if (id) dispatch(fetchProductById(Number(id)));
    return () => dispatch(clearCurrentProduct());
  }, [id, dispatch]);

  useEffect(() => {
    if (error?.message) message.error(error.message);
  }, [error]);

  if (loading && !current) return <Spin />;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <Title level={3}>Chi tiết sản phẩm</Title>
      </div>

      <Card>
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="ID">{current?.idProduct}</Descriptions.Item>
          <Descriptions.Item label="Tên">{current?.productName}</Descriptions.Item>
          <Descriptions.Item label="Danh mục">{current?.categoryName}</Descriptions.Item>
          <Descriptions.Item label="Thương hiệu">{current?.brand}</Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp">{current?.supplierName}</Descriptions.Item>
          <Descriptions.Item label="Giá">{current?.price?.toLocaleString("vi-VN")}</Descriptions.Item>
          <Descriptions.Item label="Tồn kho">{current?.stockQuantity}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{current?.status}</Descriptions.Item>
          <Descriptions.Item label="Mã sản phẩm">{current?.productCode}</Descriptions.Item>
          <Descriptions.Item label="Loại mã">{current?.codeType}</Descriptions.Item>
          <Descriptions.Item label="SKU">{current?.sku}</Descriptions.Item>
          <Descriptions.Item label="Ảnh">
            {current?.imageUrl ? (
              <img src={current.imageUrl} alt={current.productName} style={{ maxWidth: 240 }} />
            ) : (
              "N/A"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả">{current?.description}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ProductDetail;


