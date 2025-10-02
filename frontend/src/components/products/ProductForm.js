import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Card,
  Typography,
  message,
  Upload,
  Row,
  Col,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct } from '../../store/slices/productsSlice';
import { productsService } from '../../services/productsService';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ProductForm = ({ product, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        description: product.description,
        specifications: product.specifications,
        status: product.status,
      });

      // Prefill image preview if existing
      if (product.image) {
        setFileList([
          {
            uid: '-1',
            name: 'current-image',
            status: 'done',
            url: product.image,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [product, form]);

  const handleSubmit = async (values) => {
    try {
      const productData = {
        ...values,
        image: product?.image || null,
      };

      // Update or create the product first
      let savedProduct = null;
      if (product) {
        savedProduct = await dispatch(updateProduct({ id: product.id, productData })).unwrap();
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        savedProduct = await dispatch(createProduct(productData)).unwrap();
        message.success('Tạo sản phẩm thành công!');
      }

      // If a new local file is selected, upload it
      const hasLocalFile = fileList.some(f => !!f.originFileObj);
      if (hasLocalFile && savedProduct?.id) {
        const rawFiles = fileList
          .filter(f => !!f.originFileObj)
          .map(f => f.originFileObj);
        try {
          await productsService.uploadImages(savedProduct.id, rawFiles);
          message.success('Upload hình ảnh thành công!');
        } catch (e) {
          message.error('Upload hình ảnh thất bại');
        }
      }

      onSuccess();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const handleImageChange = ({ fileList: nextList }) => {
    setFileList(nextList);
  };

  const beforeUpload = (file) => {
    const isAllowedType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    if (!isAllowedType) {
      message.error('Chỉ chấp nhận JPG/PNG/GIF');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB');
      return Upload.LIST_IGNORE;
    }
    // Prevent auto upload, keep in list for manual submit
    return false;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Card title="Thông tin cơ bản" style={{ marginBottom: '16px' }}>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="sku"
                  label="Mã sản phẩm (SKU)"
                  rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
                >
                  <Input placeholder="Nhập mã sản phẩm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                  <Select placeholder="Chọn danh mục">
                    <Option value="smartphone">Điện thoại</Option>
                    <Option value="laptop">Laptop</Option>
                    <Option value="tablet">Máy tính bảng</Option>
                    <Option value="accessories">Phụ kiện</Option>
                    <Option value="audio">Âm thanh</Option>
                    <Option value="gaming">Gaming</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Mô tả sản phẩm"
            >
              <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
            </Form.Item>

            <Form.Item
              name="specifications"
              label="Thông số kỹ thuật"
            >
              <TextArea rows={6} placeholder="Nhập thông số kỹ thuật (JSON format)" />
            </Form.Item>
          </Card>

          <Card title="Giá và tồn kho">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="cost"
                  label="Giá nhập (VNĐ)"
                  rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Nhập giá nhập"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="price"
                  label="Giá bán (VNĐ)"
                  rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Nhập giá bán"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="stock"
                  label="Số lượng tồn kho"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Nhập số lượng"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="minStock"
                  label="Số lượng tồn kho tối thiểu"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Nhập số lượng tối thiểu"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="active">Đang bán</Option>
                    <Option value="inactive">Ngừng bán</Option>
                    <Option value="out-of-stock">Hết hàng</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Hình ảnh sản phẩm">
            <Form.Item
              name="image"
              label="Upload hình ảnh"
            >
              <Upload
                name="image"
                listType="picture-card"
                showUploadList={true}
                fileList={fileList}
                maxCount={1}
                onChange={handleImageChange}
                beforeUpload={beforeUpload}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Text type="secondary" style={{ fontSize: '12px' }}>
              Hỗ trợ định dạng: JPG, PNG, GIF
              <br />
              Kích thước tối đa: 5MB
            </Text>
          </Card>
        </Col>
      </Row>

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <Space>
          <Button onClick={() => onSuccess()}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            {product ? 'Cập nhật' : 'Tạo'} sản phẩm
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default ProductForm;


