import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Table,
  Space,
  Button,
  message,
  Spin,
} from "antd";
import { PrinterOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchImportOrderById } from "../store/slices/importOrdersSlice";
import { importOrderService } from "../services/importOrderService";
import { formatDate } from "../utils/formatUtils";

const { Title, Text } = Typography;

const ImportOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentImportOrder, loading } = useSelector((state) => state.importOrders);

  useEffect(() => {
    if (id) {
      dispatch(fetchImportOrderById(Number(id)));
    }
  }, [dispatch, id]);

  const handlePrintImportOrder = async () => {
    if (!id) return;
    try {
      const blob = await importOrderService.exportImportOrderToPdf(Number(id));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `phieu-nhap-hang-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Xuất phiếu nhập hàng thành công!");
    } catch (error) {
      message.error("Xuất phiếu nhập hàng thất bại!");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentImportOrder) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/import-orders")}>
          Quay lại
        </Button>
        <Card style={{ marginTop: "16px" }}>
          <Text>Không tìm thấy đơn nhập hàng</Text>
        </Card>
      </div>
    );
  }

  const importOrderDetailsColumns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (record) => (
        <div>
          <Text strong>{record.productName || record.product?.productName || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.productCode || record.product?.productCode || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity) => <Text>{quantity || 0}</Text>,
    },
    {
      title: "Giá nhập",
      dataIndex: "importPrice",
      key: "importPrice",
      width: 150,
      render: (importPrice) => (
        <Text>{importPrice ? `${Number(importPrice).toLocaleString("vi-VN")} VNĐ` : "0 VNĐ"}</Text>
      ),
    },
    {
      title: "Thành tiền",
      key: "subtotal",
      width: 150,
      render: (record) => {
        // Ưu tiên sử dụng subtotal từ API, nếu không có thì tính từ quantity * importPrice
        const subtotal = record.subtotal || (record.quantity || 0) * (record.importPrice || 0);
        return <Text strong>{Number(subtotal).toLocaleString("vi-VN")} VNĐ</Text>;
      },
    },
  ];

  const importOrderId = currentImportOrder.idImportOrder || id;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "16px" }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/import-orders")}>
            Quay lại
          </Button>
          <Title level={1} style={{ margin: 0 }}>
            Chi tiết đơn nhập hàng #{importOrderId}
          </Title>
        </Space>
        <Space style={{ marginTop: "16px" }}>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrintImportOrder}>
            In phiếu nhập hàng
          </Button>
        </Space>
      </div>

      <Card title="Thông tin đơn nhập hàng" style={{ marginBottom: "16px" }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã đơn nhập">
            <Text strong>#{importOrderId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày nhập">
            {formatDate(
              currentImportOrder.orderDate ??
                currentImportOrder.createdAt ??
                currentImportOrder.created_at,
              "DD/MM/YYYY HH:mm:ss"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp">
            {currentImportOrder.supplierName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ nhà cung cấp">
            {currentImportOrder.supplierAddress || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {currentImportOrder.supplierPhone || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {currentImportOrder.supplierEmail || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Nhân viên">
            {currentImportOrder.employeeName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
              {currentImportOrder.totalAmount
                ? `${Number(currentImportOrder.totalAmount).toLocaleString("vi-VN")} VNĐ`
                : "0 VNĐ"}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Chi tiết sản phẩm">
        <Table
          columns={importOrderDetailsColumns}
          dataSource={currentImportOrder.importOrderDetails || []}
          rowKey={(record, index) => record.idProduct || index}
          pagination={false}
          summary={(pageData) => {
            // Sử dụng subtotal từ API hoặc tính từ quantity * importPrice
            const total = pageData.reduce(
              (sum, record) => sum + (record.subtotal || (record.quantity || 0) * (record.importPrice || 0)),
              0
            );
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Tổng cộng:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                      {Number(total).toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default ImportOrderDetail;


