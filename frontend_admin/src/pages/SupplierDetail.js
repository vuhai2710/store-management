import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Table,
  Statistic,
  Row,
  Col,
  Spin,
  Typography,
  Button,
  Space,
  Tag,
  DatePicker,
  message,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { suppliersService } from "../services/suppliersService";
import { importOrderService } from "../services/importOrderService";
import { formatDate } from "../utils/formatUtils";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [importOrders, setImportOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState(null);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalAmount: 0,
    averageOrderValue: 0,
    lastOrderDate: null,
  });

  useEffect(() => {
    fetchSupplierDetail();
    fetchImportOrders();
  }, [id]);

  const fetchSupplierDetail = async () => {
    try {
      setLoading(true);
      const data = await suppliersService.getSupplierById(id);
      setSupplier(data);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      message.error("Không thể tải thông tin nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const fetchImportOrders = async (
    page = 1,
    pageSize = 10,
    dates = dateRange
  ) => {
    try {
      setOrdersLoading(true);

      const params = {
        pageNo: page,
        pageSize,
      };

      let response;

      if (dates && dates.length === 2) {

        params.supplierId = id;
        params.startDate = dates[0]
          .startOf("day")
          .format("YYYY-MM-DDTHH:mm:ss");
        params.endDate = dates[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss");
        response = await importOrderService.getImportOrderHistory(params);
      } else {

        response = await importOrderService.getImportOrdersBySupplier(
          id,
          params
        );
      }

      setImportOrders(response.content || []);
      setPagination({
        current: response.pageNo || 1,
        pageSize: response.pageSize || 10,
        total: response.totalElements || 0,
      });

      calculateStatistics(response.content || [], response.totalElements || 0);
    } catch (error) {
      console.error("Error fetching import orders:", error);
      message.error("Không thể tải lịch sử giao dịch");
    } finally {
      setOrdersLoading(false);
    }
  };

  const calculateStatistics = (orders, totalOrders) => {
    const totalAmount = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalAmount / orders.length : 0;
    const lastOrderDate =
      orders.length > 0
        ? orders.reduce((latest, order) => {
            const orderDate = new Date(order.orderDate || order.createdAt);
            return orderDate > latest ? orderDate : latest;
          }, new Date(0))
        : null;

    setStatistics({
      totalOrders,
      totalAmount,
      averageOrderValue,
      lastOrderDate,
    });
  };

  const handleTableChange = (paginationConfig) => {
    fetchImportOrders(paginationConfig.current, paginationConfig.pageSize);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    fetchImportOrders(1, pagination.pageSize, dates);
  };

  const handlePrintOrder = async (orderId) => {
    try {
      const blob = await importOrderService.exportImportOrderToPdf(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `phieu-nhap-hang-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Xuất phiếu nhập hàng thành công!");
    } catch (error) {
      message.error("Xuất phiếu nhập hàng thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã đơn nhập",
      dataIndex: "idImportOrder",
      key: "idImportOrder",
      render: (text) => <Text strong>#{text}</Text>,
    },
    {
      title: "Ngày nhập",
      key: "orderDate",
      render: (_, record) =>
        formatDate(record.orderDate || record.createdAt, "DD/MM/YYYY HH:mm"),
    },
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (text) => text || "N/A",
    },
    {
      title: "Số sản phẩm",
      key: "itemCount",
      render: (_, record) => record.importOrderDetails?.length || 0,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <Text strong style={{ color: "#1890ff" }}>
          {amount ? `${Number(amount).toLocaleString("vi-VN")} VNĐ` : "0 VNĐ"}
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/import-orders/${record.idImportOrder}`)}>
            Xem chi tiết
          </Button>
          <Button
            type="text"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintOrder(record.idImportOrder)}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Title level={4}>Không tìm thấy nhà cung cấp</Title>
          <Button type="primary" onClick={() => navigate("/suppliers")}>
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      { }
      <div style={{ marginBottom: "24px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/suppliers")}
          style={{ marginBottom: "16px" }}>
          Quay lại
        </Button>
        <Title level={2} style={{ marginBottom: 0 }}>
          Chi tiết nhà cung cấp: {supplier.supplierName}
        </Title>
      </div>

      { }
      <Card title="Thông tin nhà cung cấp" style={{ marginBottom: "24px" }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label="ID">
            {supplier.idSupplier}
          </Descriptions.Item>
          <Descriptions.Item label="Tên nhà cung cấp">
            <Text strong>{supplier.supplierName}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {supplier.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {supplier.phoneNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {supplier.address || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      { }
      <Card
        title={
          <>
            <BarChartOutlined /> Thống kê giao dịch
          </>
        }
        style={{ marginBottom: "24px" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Tổng đơn nhập hàng"
              value={statistics.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Tổng giá trị giao dịch"
              value={statistics.totalAmount}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              formatter={(value) => Number(value).toLocaleString("vi-VN")}
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Giá trị trung bình/đơn"
              value={statistics.averageOrderValue}
              suffix="VNĐ"
              precision={0}
              formatter={(value) => Number(value).toLocaleString("vi-VN")}
              valueStyle={{ color: "#faad14" }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Đơn nhập gần nhất"
              value={
                statistics.lastOrderDate
                  ? formatDate(statistics.lastOrderDate, "DD/MM/YYYY")
                  : "Chưa có"
              }
              prefix={<CalendarOutlined />}
            />
          </Col>
        </Row>
      </Card>

      { }
      <Card
        title="Lịch sử giao dịch"
        extra={
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            style={{ width: 280 }}
          />
        }>
        <Table
          columns={columns}
          dataSource={importOrders}
          rowKey="idImportOrder"
          pagination={pagination}
          loading={ordersLoading}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          locale={{
            emptyText: "Chưa có giao dịch nào với nhà cung cấp này",
          }}
        />
      </Card>
    </div>
  );
};

export default SupplierDetail;
