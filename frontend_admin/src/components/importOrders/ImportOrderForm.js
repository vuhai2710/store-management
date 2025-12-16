import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  Table,
  InputNumber,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Alert,
} from "antd";
import { PlusOutlined, MinusOutlined, SearchOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { createImportOrder } from "../../store/slices/importOrdersSlice";
import { productsService } from "../../services/productsService";
import { suppliersService } from "../../services/suppliersService";

const { Option } = Select;
const { Text } = Typography;

const ImportOrderForm = ({ importOrder, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [brandFilter, setBrandFilter] = useState(null);

  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [prodsRes, sups] = await Promise.all([
          productsService.getProductsPaginated({ pageNo: 1, pageSize: 1000 }),
          suppliersService.getAllSuppliers(),
        ]);
        setProducts(prodsRes?.content || prodsRes || []);
        setSuppliers(Array.isArray(sups) ? sups : []);
      } catch (error) {
        console.error("Error loading meta:", error);
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  // Get unique brands from products
  const uniqueBrands = useMemo(() => {
    const brands = products
      .map((p) => p.brand)
      .filter((b) => b && b.trim() !== "");
    return [...new Set(brands)].sort();
  }, [products]);

  // Filter products based on search and brand
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchKeyword && searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.productName && p.productName.toLowerCase().includes(keyword)) ||
          (p.productCode && p.productCode.toLowerCase().includes(keyword)) ||
          (p.sku && p.sku.toLowerCase().includes(keyword))
      );
    }

    if (brandFilter) {
      filtered = filtered.filter((p) => p.brand === brandFilter);
    }

    return filtered;
  }, [products, searchKeyword, brandFilter]);

  useEffect(() => {
    if (importOrder) {
      form.setFieldsValue({
        idSupplier: importOrder.idSupplier,
      });
      setOrderItems(importOrder.importOrderDetails || []);
    } else {
      form.resetFields();
      setOrderItems([]);
    }
  }, [importOrder, form]);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || price <= 0) {
      message.warning("Vui lòng chọn sản phẩm, số lượng và giá");
      return;
    }

    const existingItemIndex = orderItems.findIndex(
      (item) => item.idProduct === selectedProduct.idProduct
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].price = price;
      updatedItems[existingItemIndex].subtotal =
        updatedItems[existingItemIndex].quantity * price;
      setOrderItems(updatedItems);
    } else {
      const newItem = {
        idProduct: selectedProduct.idProduct,
        productName: selectedProduct.productName,
        productCode: selectedProduct.productCode,
        price: price,
        quantity: quantity,
        subtotal: price * quantity,
      };
      setOrderItems([...orderItems, newItem]);
    }

    setSelectedProduct(null);
    setQuantity(1);
    setPrice(0);
  };

  const handleRemoveItem = (productId) => {
    setOrderItems(orderItems.filter((item) => item.idProduct !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const updatedItems = orderItems.map((item) => {
      if (item.idProduct === productId) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.price * newQuantity,
        };
      }
      return item;
    });
    setOrderItems(updatedItems);
  };

  const handlePriceChange = (productId, newPrice) => {
    const updatedItems = orderItems.map((item) => {
      if (item.idProduct === productId) {
        return {
          ...item,
          price: newPrice,
          subtotal: newPrice * item.quantity,
        };
      }
      return item;
    });
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const handleSubmit = async (values) => {
    if (orderItems.length === 0) {
      message.warning("Vui lòng thêm ít nhất một sản phẩm");
      return;
    }

    const payload = {
      idSupplier: values.idSupplier,
      importOrderDetails: orderItems.map((item) => ({
        idProduct: item.idProduct,
        quantity: item.quantity,
        importPrice: item.price,
      })),
    };

    try {
      await dispatch(createImportOrder(payload)).unwrap();
      message.success("Tạo đơn nhập hàng thành công!");
      onSuccess && onSuccess();
    } catch (e) {
      const fieldErrors = e?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        form.setFields(
          Object.entries(fieldErrors).map(([name, errMsg]) => ({
            name,
            errors: [String(errMsg)],
          }))
        );
      }
      message.error(e?.message || "Dữ liệu không hợp lệ");
    }
  };

  const itemColumns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div>
          <Text strong>{record.productName || record.product?.productName}</Text>
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
      width: 120,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.idProduct, value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Giá nhập",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price, record) => (
        <InputNumber
          min={0}
          value={price}
          onChange={(value) => handlePriceChange(record.idProduct, value)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      width: 150,
      render: (subtotal) => (
        <Text strong>
          {Number(subtotal || 0).toLocaleString("vi-VN")} VNĐ
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<MinusOutlined />}
          onClick={() => handleRemoveItem(record.idProduct)}
        />
      ),
    },
  ];

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="idSupplier"
        label="Nhà cung cấp"
        rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
      >
        <Select
          placeholder="Chọn nhà cung cấp"
          loading={loadingMeta}
          showSearch
          optionFilterProp="label"
        >
          {suppliers.map((supplier) => (
            <Option key={supplier.idSupplier} value={supplier.idSupplier} label={supplier.supplierName}>
              {supplier.supplierName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Divider orientation="left">Danh sách sản phẩm</Divider>

      <Card size="small" style={{ marginBottom: 16 }}>
        {/* Search and filter section */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo tên, mã sản phẩm..."
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo thương hiệu"
              allowClear
              style={{ width: "100%" }}
              value={brandFilter}
              onChange={(value) => setBrandFilter(value)}
            >
              {uniqueBrands.map((brand) => (
                <Option key={brand} value={brand}>
                  {brand}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Tìm thấy {filteredProducts.length} sản phẩm
            </Text>
          </Col>
        </Row>

        <Space style={{ marginBottom: 16, width: "100%" }} direction="vertical" size="small">
          <Row gutter={[12, 12]} align="bottom">
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 4 }}>
                <Text strong>Sản phẩm</Text>
              </div>
              <Select
                placeholder="Chọn sản phẩm"
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="label"
                value={selectedProduct?.idProduct}
                onChange={(value) => {
                  const product = products.find((p) => p.idProduct === value);
                  setSelectedProduct(product);
                  if (product) {
                    setPrice(product.price || 0);
                  }
                }}
                loading={loadingMeta}
              >
                {filteredProducts.map((product) => (
                  <Option
                    key={product.idProduct}
                    value={product.idProduct}
                    label={product.productName}
                  >
                    {product.productName} - {product.productCode || "N/A"}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <div style={{ marginBottom: 4 }}>
                <Text strong>Số lượng nhập</Text>
                <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                  (Cộng vào tồn kho)
                </Text>
              </div>
              <InputNumber
                placeholder="Nhập số lượng"
                min={1}
                value={quantity}
                onChange={setQuantity}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={12} md={5}>
              <div style={{ marginBottom: 4 }}>
                <Text strong>Giá nhập (VNĐ)</Text>
                <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                  (Giá mua từ NCC, làm giá bán mặc định)
                </Text>
              </div>
              <InputNumber
                placeholder="Nhập giá"
                min={0}
                value={price}
                onChange={setPrice}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} md={3}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem} style={{ marginTop: 20 }}>
                Thêm
              </Button>
            </Col>
          </Row>
          <Alert
            message="Lưu ý"
            description="Số lượng nhập sẽ được cộng vào tồn kho hiện tại của sản phẩm. Giá nhập sẽ được cập nhật làm giá bán của sản phẩm."
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        </Space>

        <Table
          columns={itemColumns}
          dataSource={orderItems}
          rowKey={(record) => record.idProduct}
          pagination={false}
          size="small"
        />

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Text strong style={{ fontSize: "16px" }}>
            Tổng tiền: {Number(calculateTotal()).toLocaleString("vi-VN")} VNĐ
          </Text>
        </div>
      </Card>

      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Space>
          <Button onClick={() => onSuccess && onSuccess()}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Tạo đơn nhập hàng
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default ImportOrderForm;
