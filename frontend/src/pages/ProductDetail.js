import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Descriptions, Image, Tag, Space, Button } from 'antd';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/slices/productsSlice';

const { Title } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, loading } = useSelector((state) => state.products);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentProduct) {
    return <div>Không tìm thấy sản phẩm</div>;
  }

  return (
    <div>
      <div className="page-header">
        <Title level={1}>{currentProduct.name}</Title>
        <Space>
          <Button icon={<EditOutlined />}>Chỉnh sửa</Button>
          <Button icon={<UploadOutlined />}>Upload hình ảnh</Button>
        </Space>
      </div>

      <Card title="Thông tin sản phẩm">
        <Descriptions column={2}>
          <Descriptions.Item label="Tên sản phẩm">
            {currentProduct.name}
          </Descriptions.Item>
          <Descriptions.Item label="Mã sản phẩm">
            {currentProduct.sku}
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            <Tag color="blue">{currentProduct.category}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Giá bán">
            <strong>{currentProduct.price?.toLocaleString('vi-VN')} VNĐ</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Giá nhập">
            {currentProduct.cost?.toLocaleString('vi-VN')} VNĐ
          </Descriptions.Item>
          <Descriptions.Item label="Tồn kho">
            <Tag color={currentProduct.stock > 10 ? 'success' : 'warning'}>
              {currentProduct.stock}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={currentProduct.status === 'active' ? 'success' : 'default'}>
              {currentProduct.status === 'active' ? 'Hoạt động' : 'Ngừng bán'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {currentProduct.description || 'Không có mô tả'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {currentProduct.image && (
        <Card title="Hình ảnh sản phẩm" style={{ marginTop: '16px' }}>
          <Image
            width={200}
            src={currentProduct.image}
            alt={currentProduct.name}
          />
        </Card>
      )}
    </div>
  );
};

export default ProductDetail;


