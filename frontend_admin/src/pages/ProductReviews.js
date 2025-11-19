import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Modal,
  Input,
  Rate,
  Tag,
  Tooltip,
  Typography,
  Select,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  MessageOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { reviewService } from '../services/reviewService';
import { productsService } from '../services/productsService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ProductReviews = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [product, setProduct] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [ratingFilter, setRatingFilter] = useState(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId, pagination.current, pagination.pageSize, ratingFilter]);

  const fetchProduct = async () => {
    try {
      const data = await productsService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      message.error('Không thể tải thông tin sản phẩm');
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        rating: ratingFilter,
      };
      const response = await reviewService.getProductReviews(productId, params);
      
      setReviews(response.content || []);
      setPagination({
        ...pagination,
        total: response.totalElements || 0,
      });
    } catch (error) {
      message.error('Không thể tải danh sách đánh giá');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setAdminReply(review.adminReply || '');
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async () => {
    if (!adminReply.trim()) {
      message.warning('Vui lòng nhập nội dung trả lời');
      return;
    }

    setReplyLoading(true);
    try {
      await reviewService.replyToReview(selectedReview.idReview, adminReply);
      message.success('Trả lời đánh giá thành công');
      setReplyModalVisible(false);
      setAdminReply('');
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể trả lời đánh giá');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      message.success('Xóa đánh giá thành công');
      fetchReviews();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa đánh giá');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Rate disabled value={record.rating} style={{ fontSize: 16 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Nhận xét',
      key: 'comment',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Paragraph ellipsis={{ rows: 2, expandable: true }}>
            {record.comment}
          </Paragraph>
          {record.editCount > 0 && (
            <Tag color="blue">Đã chỉnh sửa {record.editCount} lần</Tag>
          )}
          {record.adminReply && (
            <Card size="small" style={{ backgroundColor: '#f0f2f5' }}>
              <Text type="secondary" strong>Phản hồi từ Admin:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {record.adminReply}
              </Paragraph>
            </Card>
          )}
        </Space>
      ),
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'idOrder',
      key: 'idOrder',
      width: 100,
      render: (id) => <Text>#{id}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title={record.adminReply ? 'Sửa trả lời' : 'Trả lời'}>
            <Button
              type="primary"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => handleReply(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa đánh giá này?"
            onConfirm={() => handleDelete(record.idReview)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const ratingStats = reviews.reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      acc.total += 1;
      acc.sum += review.rating;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0, sum: 0 }
  );

  const avgRating = ratingStats.total > 0 ? (ratingStats.sum / ratingStats.total).toFixed(1) : 0;

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
                  Quay lại
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  Đánh giá sản phẩm: {product?.productName || 'Đang tải...'}
                </Title>
              </Space>
            </Col>
          </Row>

          {/* Statistics */}
          <Card size="small" style={{ backgroundColor: '#fafafa' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">Đánh giá trung bình</Text>
                  <Space>
                    <Title level={2} style={{ margin: 0 }}>
                      {avgRating}
                    </Title>
                    <Rate disabled value={parseFloat(avgRating)} allowHalf />
                  </Space>
                  <Text type="secondary">({ratingStats.total} đánh giá)</Text>
                </Space>
              </Col>
              {[5, 4, 3, 2, 1].map((star) => (
                <Col span={3} key={star}>
                  <Space direction="vertical" size="small">
                    <Space>
                      <Text>{star}</Text>
                      <Rate disabled value={1} count={1} style={{ fontSize: 12 }} />
                    </Space>
                    <Title level={4} style={{ margin: 0 }}>
                      {ratingStats[star]}
                    </Title>
                  </Space>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Filters */}
          <Space>
            <Select
              placeholder="Lọc theo đánh giá"
              style={{ width: 150 }}
              allowClear
              value={ratingFilter}
              onChange={setRatingFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value={5}>5 sao</Select.Option>
              <Select.Option value={4}>4 sao</Select.Option>
              <Select.Option value={3}>3 sao</Select.Option>
              <Select.Option value={2}>2 sao</Select.Option>
              <Select.Option value={1}>1 sao</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchReviews}>
              Làm mới
            </Button>
          </Space>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={reviews}
            rowKey="idReview"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>

      {/* Reply Modal */}
      <Modal
        title={selectedReview?.adminReply ? 'Sửa trả lời' : 'Trả lời đánh giá'}
        open={replyModalVisible}
        onOk={handleSubmitReply}
        onCancel={() => {
          setReplyModalVisible(false);
          setAdminReply('');
          setSelectedReview(null);
        }}
        confirmLoading={replyLoading}
        okText="Gửi"
        cancelText="Hủy"
        width={600}
      >
        {selectedReview && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card size="small" style={{ backgroundColor: '#f0f2f5' }}>
              <Space direction="vertical" size="small">
                <Text strong>{selectedReview.customerName}</Text>
                <Rate disabled value={selectedReview.rating} />
                <Paragraph style={{ marginBottom: 0 }}>{selectedReview.comment}</Paragraph>
              </Space>
            </Card>
            <TextArea
              rows={4}
              placeholder="Nhập nội dung trả lời..."
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              maxLength={500}
              showCount
            />
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ProductReviews;
