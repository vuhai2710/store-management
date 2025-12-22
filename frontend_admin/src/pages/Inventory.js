import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  Input,
  message,
  DatePicker,
  Tabs,
  Tooltip,
} from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store/slices/productsSlice";
import { inventoryTransactionService } from "../services/inventoryTransactionService";
import { categoriesService } from "../services/categoriesService";
import { productsService } from "../services/productsService";
import { usePagination } from "../hooks/usePagination";
import { useDebounce } from "../hooks/useDebounce";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const REFERENCE_TYPES = {
  PURCHASE_ORDER: { label: "Đơn nhập hàng", color: "blue" },
  SALE_ORDER: { label: "Đơn bán hàng", color: "green" },
  ADJUSTMENT: { label: "Điều chỉnh", color: "orange" },
  SALE_RETURN: { label: "Trả hàng", color: "red" },
  SALE_EXCHANGE: { label: "Đổi hàng", color: "purple" },
};

const TRANSACTION_TYPES = {
  IN: { label: "Nhập kho", color: "green" },
  OUT: { label: "Xuất kho", color: "red" },
};

const Inventory = () => {
  const dispatch = useDispatch();
  const {
    list: products,
    loading: productsLoading,
    pagination: productsPagination,
  } = useSelector((state) => state.products || {});

  const [activeTab, setActiveTab] = useState("inventory");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [inventoryProductSearch, setInventoryProductSearch] = useState("");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState(null);
  const [inventoryBrandFilter, setInventoryBrandFilter] = useState(null);
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState(null);

  const [inventoryPagination, setInventoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inStockCount: 0,
    totalValue: 0,
  });

  const debouncedInventoryProductSearch = useDebounce(
    inventoryProductSearch,
    400
  );

  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalTransactions, setModalTransactions] = useState([]);
  const [modalTransactionsLoading, setModalTransactionsLoading] =
    useState(false);
  const [modalTransactionTypeFilter, setModalTransactionTypeFilter] =
    useState(null);
  const [modalReferenceTypeFilter, setModalReferenceTypeFilter] =
    useState(null);
  const [modalDateRange, setModalDateRange] = useState(null);

  const [allTransactions, setAllTransactions] = useState([]);
  const [allTransactionsLoading, setAllTransactionsLoading] = useState(false);
  const [historyProductNameSearch, setHistoryProductNameSearch] = useState("");
  const [historyBrandFilter, setHistoryBrandFilter] = useState(null);
  const [historyTransactionType, setHistoryTransactionType] = useState(null);
  const [historyReferenceType, setHistoryReferenceType] = useState(null);
  const [historyDateRange, setHistoryDateRange] = useState(null);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const debouncedProductName = useDebounce(historyProductNameSearch, 400);

  const {
    currentPage: modalCurrentPage,
    pageSize: modalPageSize,
    setTotal: setModalTotal,
    handlePageChange: handleModalPageChange,
    resetPagination: resetModalPagination,
    pagination: modalTablePagination,
  } = usePagination(1, 10);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoriesService.getAll();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadBrands = async () => {
      try {

        const res = await productsService.getProductsPaginated({
          pageNo: 1,
          pageSize: 1000,
        });
        const allProducts = res?.content || [];
        const uniqueBrands = [
          ...new Set(allProducts.map((p) => p.brand).filter(Boolean)),
        ].sort();
        setBrands(uniqueBrands);
      } catch (error) {
        console.error("Error loading brands:", error);
        setBrands([]);
      }
    };
    loadBrands();
  }, []);

  useEffect(() => {
    const loadInventoryStats = async () => {
      try {

        const res = await productsService.getProductsPaginated({
          pageNo: 1,
          pageSize: 10000,
        });
        const allProducts = res?.content || [];
        const total = res?.totalElements || allProducts.length;

        const lowStock = allProducts.filter(
          (p) => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) < 10
        ).length;
        const outOfStock = allProducts.filter(
          (p) => (p.stockQuantity || 0) === 0
        ).length;
        const inStock = allProducts.filter(
          (p) => (p.stockQuantity || 0) >= 10
        ).length;
        const totalValue = allProducts.reduce(
          (sum, p) => sum + (p.stockQuantity || 0) * (p.price || 0),
          0
        );

        setInventoryStats({
          totalProducts: total,
          lowStockCount: lowStock,
          outOfStockCount: outOfStock,
          inStockCount: inStock,
          totalValue: totalValue,
        });
      } catch (error) {
        console.error("Error loading inventory stats:", error);
      }
    };
    loadInventoryStats();
  }, []);

  const fetchInventoryProducts = useCallback(() => {
    dispatch(
      fetchProducts({
        pageNo: inventoryPagination.current,
        pageSize: inventoryPagination.pageSize,
        sortBy: "idProduct",
        sortDirection: "ASC",
        keyword: debouncedInventoryProductSearch?.trim() || undefined,
        categoryId: inventoryCategoryFilter || undefined,
        brand: inventoryBrandFilter || undefined,
        inventoryStatus: inventoryStatusFilter || undefined,
      })
    );
  }, [
    dispatch,
    inventoryPagination.current,
    inventoryPagination.pageSize,
    debouncedInventoryProductSearch,
    inventoryCategoryFilter,
    inventoryBrandFilter,
    inventoryStatusFilter,
  ]);

  useEffect(() => {
    if (activeTab === "inventory") {

      fetchInventoryProducts();
    }
  }, [activeTab, fetchInventoryProducts]);

  useEffect(() => {
    if (productsPagination?.totalElements !== undefined) {
      setInventoryPagination((prev) => ({
        ...prev,
        total: productsPagination.totalElements,
      }));
    }
  }, [productsPagination?.totalElements]);

  const fetchAllTransactions = useCallback(
    async (params = {}) => {
      try {
        setAllTransactionsLoading(true);

        const queryParams = {
          pageNo: params.pageNo || historyPagination.current,
          pageSize: params.pageSize || historyPagination.pageSize,
          sortBy: "transactionDate",
          sortDirection: "DESC",
        };

        if (historyTransactionType) {
          queryParams.transactionType = historyTransactionType;
        }

        if (historyReferenceType) {
          queryParams.referenceType = historyReferenceType;
        }

        if (debouncedProductName && debouncedProductName.trim()) {
          queryParams.productName = debouncedProductName.trim();
        }

        if (historyBrandFilter) {
          queryParams.brand = historyBrandFilter;
        }

        if (historyDateRange && historyDateRange.length === 2) {
          const [startDate, endDate] = historyDateRange;
          if (startDate && endDate) {
            try {
              queryParams.fromDate = startDate
                .startOf("day")
                .format("YYYY-MM-DDTHH:mm:ss");
              queryParams.toDate = endDate
                .endOf("day")
                .format("YYYY-MM-DDTHH:mm:ss");
            } catch (e) {
              console.error("Error formatting date:", e);
            }
          }
        }

        const response = await inventoryTransactionService.searchTransactions(
          queryParams
        );

        if (response && response.content) {
          setAllTransactions(response.content || []);
          setHistoryPagination((prev) => ({
            ...prev,
            total: response.totalElements || 0,
            current: params.pageNo || prev.current,
            pageSize: params.pageSize || prev.pageSize,
          }));
        } else {
          setAllTransactions([]);
          setHistoryPagination((prev) => ({ ...prev, total: 0 }));
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        message.error("Lỗi khi tải lịch sử nhập/xuất kho");
        setAllTransactions([]);
      } finally {
        setAllTransactionsLoading(false);
      }
    },
    [
      historyPagination.current,
      historyPagination.pageSize,
      debouncedProductName,
      historyBrandFilter,
      historyTransactionType,
      historyReferenceType,
      historyDateRange,
    ]
  );

  useEffect(() => {
    if (activeTab === "history") {
      fetchAllTransactions({ pageNo: 1 });
    }

  }, [
    activeTab,
    debouncedProductName,
    historyBrandFilter,
    historyTransactionType,
    historyReferenceType,
  ]);

  const fetchModalTransactions = useCallback(
    async (productId, page = 1, size = 10) => {
      if (!productId) return;

      try {
        setModalTransactionsLoading(true);
        const params = {
          productId: productId,
          pageNo: page,
          pageSize: size,
          sortBy: "transactionDate",
          sortDirection: "DESC",
        };

        if (modalTransactionTypeFilter) {
          params.transactionType = modalTransactionTypeFilter;
        }

        if (modalReferenceTypeFilter) {
          params.referenceType = modalReferenceTypeFilter;
        }

        if (modalDateRange && modalDateRange.length === 2) {
          const startDate = modalDateRange[0];
          const endDate = modalDateRange[1];
          if (startDate && endDate) {
            try {
              params.fromDate = startDate
                .startOf("day")
                .format("YYYY-MM-DDTHH:mm:ss");
              params.toDate = endDate
                .endOf("day")
                .format("YYYY-MM-DDTHH:mm:ss");
            } catch (e) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              params.fromDate = start.toISOString().slice(0, 19);
              params.toDate = end.toISOString().slice(0, 19);
            }
          }
        }

        const pageResponse =
          await inventoryTransactionService.searchTransactions(params);

        if (pageResponse && pageResponse.content) {
          setModalTransactions(pageResponse.content || []);
          setModalTotal(pageResponse.totalElements || 0);
        } else {
          setModalTransactions([]);
          setModalTotal(0);
        }
      } catch (error) {
        message.error("Lỗi khi tải lịch sử nhập/xuất kho");
        setModalTransactions([]);
      } finally {
        setModalTransactionsLoading(false);
      }
    },
    [
      modalTransactionTypeFilter,
      modalReferenceTypeFilter,
      modalDateRange,
      setModalTotal,
    ]
  );

  const handleViewHistory = (product) => {
    setSelectedProduct(product);
    setIsHistoryModalVisible(true);
    resetModalPagination();
    fetchModalTransactions(product.idProduct, 1, modalPageSize);
  };

  const handleModalTransactionTypeFilter = (value) => {
    setModalTransactionTypeFilter(value);
    if (selectedProduct) {
      resetModalPagination();
      fetchModalTransactions(selectedProduct.idProduct, 1, modalPageSize);
    }
  };

  const handleModalDateRangeChange = (dates) => {
    setModalDateRange(dates);
    if (selectedProduct) {
      resetModalPagination();
      fetchModalTransactions(selectedProduct.idProduct, 1, modalPageSize);
    }
  };

  const handleModalReferenceTypeFilter = (value) => {
    setModalReferenceTypeFilter(value);
    if (selectedProduct) {
      resetModalPagination();
      fetchModalTransactions(selectedProduct.idProduct, 1, modalPageSize);
    }
  };

  const handleModalTableChange = (p) => {
    handleModalPageChange(p.current, p.pageSize);
    if (selectedProduct) {
      fetchModalTransactions(selectedProduct.idProduct, p.current, p.pageSize);
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalVisible(false);
    setSelectedProduct(null);
    setModalTransactions([]);
    setModalTransactionTypeFilter(null);
    setModalReferenceTypeFilter(null);
    setModalDateRange(null);
  };

  const handleHistoryDateSearch = () => {
    fetchAllTransactions({ pageNo: 1 });
  };

  const handleHistoryReset = () => {
    setHistoryProductNameSearch("");
    setHistoryBrandFilter(null);
    setHistoryTransactionType(null);
    setHistoryReferenceType(null);
    setHistoryDateRange(null);
    setHistoryPagination((prev) => ({ ...prev, current: 1 }));

    setTimeout(() => {
      fetchAllTransactions({ pageNo: 1 });
    }, 0);
  };

  const handleHistoryTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    setHistoryPagination((prev) => ({ ...prev, current, pageSize }));
    fetchAllTransactions({ pageNo: current, pageSize });
  };

  const handleInventoryTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    setInventoryPagination((prev) => ({ ...prev, current, pageSize }));
  };

  const handleInventoryReset = () => {
    setInventoryProductSearch("");
    setInventoryCategoryFilter(null);
    setInventoryBrandFilter(null);
    setInventoryStatusFilter(null);
    setInventoryPagination((prev) => ({ ...prev, current: 1 }));
  };

  const productColumns = [
    {
      title: "ID",
      dataIndex: "idProduct",
      key: "idProduct",
      width: 80,
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.productCode && (
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Mã: {record.productCode}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Số lượng tồn",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 120,
      render: (quantity) => {
        const qty = quantity || 0;
        let color = "success";
        if (qty === 0) color = "error";
        else if (qty < 10) color = "warning";

        return <Tag color={color}>{qty}</Tag>;
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price) =>
        price ? `${Number(price).toLocaleString("vi-VN")} VNĐ` : "N/A",
    },
    {
      title: "Giá trị tồn kho",
      key: "inventoryValue",
      width: 150,
      render: (_, record) => {
        const quantity = record.stockQuantity || 0;
        const price = record.price || 0;
        const value = quantity * price;
        return <Text strong>{value.toLocaleString("vi-VN")} VNĐ</Text>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        if (status === "IN_STOCK") {
          return <Tag color="green">Còn hàng</Tag>;
        } else if (status === "OUT_OF_STOCK") {
          return <Tag color="red">Hết hàng</Tag>;
        }
        return <Tag>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => handleViewHistory(record)}>
          Lịch sử
        </Button>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: "ID",
      dataIndex: "idTransaction",
      key: "idTransaction",
      width: 70,
    },
    {
      title: "Ngày giờ",
      dataIndex: "transactionDate",
      key: "transactionDate",
      width: 160,
      render: (date) => {
        if (!date) return "N/A";
        return dayjs(date).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    {
      title: "Loại",
      dataIndex: "transactionType",
      key: "transactionType",
      width: 100,
      render: (type) => {
        const config = TRANSACTION_TYPES[type] || {
          label: type,
          color: "default",
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (quantity, record) => {
        const qty = quantity || 0;
        const isIn = record.transactionType === "IN";
        return (
          <Tag color={isIn ? "green" : "red"}>
            {isIn ? `+${qty}` : `-${qty}`}
          </Tag>
        );
      },
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 180,
      ellipsis: true,
      render: (name, record) => (
        <Tooltip title={name}>
          <div>
            <Text strong>{name || "N/A"}</Text>
            {record.productCode && (
              <div>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  Mã: {record.productCode}
                </Text>
              </div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 100,
      render: (sku) => sku || "N/A",
    },
    {
      title: "Loại tham chiếu",
      dataIndex: "referenceType",
      key: "referenceType",
      width: 130,
      render: (type) => {
        const config = REFERENCE_TYPES[type] || {
          label: type || "N/A",
          color: "default",
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 120,
      render: (name) => name || "Hệ thống",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 150,
      ellipsis: true,
      render: (notes) => (
        <Tooltip title={notes}>
          <span>{notes || "-"}</span>
        </Tooltip>
      ),
    },
  ];

  const tabItems = [
    {
      key: "inventory",
      label: (
        <span>
          <UnorderedListOutlined />
          Tồn kho
        </span>
      ),
      children: (
        <>
          { }
          <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
            <Col xs={24} sm={6}>
              <Card
                style={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}>
                <Statistic
                  title="Tổng sản phẩm"
                  value={inventoryStats.totalProducts}
                  prefix={<InboxOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card
                style={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}>
                <Statistic
                  title="Sắp hết hàng"
                  value={inventoryStats.lowStockCount}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: "#f97316" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card
                style={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}>
                <Statistic
                  title="Hết hàng"
                  value={inventoryStats.outOfStockCount}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: "#dc2626" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card
                style={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}>
                <Statistic
                  title="Còn hàng"
                  value={inventoryStats.inStockCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#16a34a" }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
            <Col span={24}>
              <Card
                style={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}>
                <Statistic
                  title="Tổng giá trị tồn kho"
                  value={inventoryStats.totalValue.toLocaleString("vi-VN")}
                  suffix="VNĐ"
                  valueStyle={{ color: "#2563EB", fontSize: "24px" }}
                />
              </Card>
            </Col>
          </Row>

          { }
          <Card
            style={{
              marginBottom: 16,
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
            }}
            bodyStyle={{ padding: 16 }}>
            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Tìm theo tên sản phẩm..."
                  prefix={<SearchOutlined />}
                  value={inventoryProductSearch}
                  onChange={(e) => {
                    setInventoryProductSearch(e.target.value);
                    setInventoryPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  placeholder="Danh mục"
                  value={inventoryCategoryFilter}
                  onChange={(value) => {
                    setInventoryCategoryFilter(value);
                    setInventoryPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  allowClear
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: null, label: "Tất cả danh mục" },
                    ...categories.map((c) => ({
                      value: c.idCategory,
                      label: c.categoryName,
                    })),
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  placeholder="Thương hiệu"
                  value={inventoryBrandFilter}
                  onChange={(value) => {
                    setInventoryBrandFilter(value);
                    setInventoryPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  allowClear
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: null, label: "Tất cả thương hiệu" },
                    ...brands.map((b) => ({
                      value: b,
                      label: b,
                    })),
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  placeholder="Trạng thái tồn kho"
                  value={inventoryStatusFilter}
                  onChange={(value) => {
                    setInventoryStatusFilter(value);
                    setInventoryPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  allowClear
                  style={{ width: "100%" }}>
                  <Option value={null}>Tất cả</Option>
                  <Option value="IN_STOCK">
                    <Tag color="green">Còn hàng</Tag>
                  </Option>
                  <Option value="LOW_STOCK">
                    <Tag color="orange">Sắp hết hàng</Tag>
                  </Option>
                  <Option value="OUT_OF_STOCK">
                    <Tag color="red">Hết hàng</Tag>
                  </Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={3}>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleInventoryReset}
                  style={{ width: "100%" }}>
                  Xóa lọc
                </Button>
              </Col>
            </Row>
          </Card>

          { }
          <Card
            className="table-container"
            style={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              background: "#FFFFFF",
            }}
            bodyStyle={{ padding: 16 }}>
            <Table
              columns={productColumns}
              dataSource={products || []}
              loading={productsLoading}
              rowKey="idProduct"
              pagination={{
                current: inventoryPagination.current,
                pageSize: inventoryPagination.pageSize,
                total: inventoryPagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} sản phẩm`,
              }}
              onChange={handleInventoryTableChange}
              scroll={{ x: 1200 }}
              size="middle"
            />
          </Card>
        </>
      ),
    },
    {
      key: "history",
      label: (
        <span>
          <HistoryOutlined />
          Lịch sử nhập/xuất kho
        </span>
      ),
      children: (
        <>
          { }
          <Card
            style={{
              marginBottom: 16,
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
            }}
            bodyStyle={{ padding: 16 }}>
            <Row gutter={[16, 12]}>
              { }
              <Col xs={24} sm={12} md={5}>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tên sản phẩm
                  </Text>
                </div>
                <Input
                  placeholder="Tìm theo tên sản phẩm..."
                  prefix={<SearchOutlined />}
                  value={historyProductNameSearch}
                  onChange={(e) => setHistoryProductNameSearch(e.target.value)}
                  allowClear
                />
              </Col>
              { }
              <Col xs={24} sm={12} md={4}>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Thương hiệu
                  </Text>
                </div>
                <Select
                  placeholder="Tất cả"
                  value={historyBrandFilter}
                  onChange={(value) => setHistoryBrandFilter(value)}
                  allowClear
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: null, label: "Tất cả thương hiệu" },
                    ...brands.map((b) => ({
                      value: b,
                      label: b,
                    })),
                  ]}
                />
              </Col>
              { }
              <Col xs={24} sm={12} md={4}>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Loại giao dịch
                  </Text>
                </div>
                <Select
                  placeholder="Tất cả"
                  value={historyTransactionType}
                  onChange={(value) => setHistoryTransactionType(value)}
                  allowClear
                  style={{ width: "100%" }}>
                  <Option value={null}>Tất cả</Option>
                  <Option value="IN">
                    <Tag color="green">Nhập kho</Tag>
                  </Option>
                  <Option value="OUT">
                    <Tag color="red">Xuất kho</Tag>
                  </Option>
                </Select>
              </Col>
              { }
              <Col xs={24} sm={12} md={4}>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Loại tham chiếu
                  </Text>
                </div>
                <Select
                  placeholder="Tất cả"
                  value={historyReferenceType}
                  onChange={(value) => setHistoryReferenceType(value)}
                  allowClear
                  style={{ width: "100%" }}>
                  <Option value={null}>Tất cả</Option>
                  <Option value="PURCHASE_ORDER">
                    <Tag color="blue">Đơn nhập hàng</Tag>
                  </Option>
                  <Option value="SALE_ORDER">
                    <Tag color="green">Đơn bán hàng</Tag>
                  </Option>
                  <Option value="ADJUSTMENT">
                    <Tag color="orange">Điều chỉnh</Tag>
                  </Option>
                  <Option value="SALE_RETURN">
                    <Tag color="red">Trả hàng</Tag>
                  </Option>
                  <Option value="SALE_EXCHANGE">
                    <Tag color="purple">Đổi hàng</Tag>
                  </Option>
                </Select>
              </Col>
              { }
              <Col xs={24} sm={12} md={5}>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Khoảng thời gian
                  </Text>
                </div>
                <RangePicker
                  placeholder={["Từ ngày", "Đến ngày"]}
                  format="DD/MM/YYYY"
                  value={historyDateRange}
                  onChange={(dates) => setHistoryDateRange(dates)}
                  style={{ width: "100%" }}
                />
              </Col>
              { }
              <Col xs={24} sm={12} md={2}>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    &nbsp;
                  </Text>
                </div>
                <Space>
                  <Tooltip title="Tìm theo ngày">
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={handleHistoryDateSearch}
                    />
                  </Tooltip>
                  <Tooltip title="Xóa bộ lọc">
                    <Button
                      icon={<ClearOutlined />}
                      onClick={handleHistoryReset}
                    />
                  </Tooltip>
                </Space>
              </Col>
            </Row>
          </Card>

          { }
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              background: "#FFFFFF",
            }}
            bodyStyle={{ padding: 16 }}>
            <Table
              columns={transactionColumns}
              dataSource={allTransactions}
              loading={allTransactionsLoading}
              rowKey="idTransaction"
              pagination={{
                ...historyPagination,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} giao dịch`,
              }}
              onChange={handleHistoryTableChange}
              scroll={{ x: 1400 }}
              size="middle"
            />
          </Card>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <div
        className="page-header"
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              fontWeight: 700,
              color: "#0F172A",
            }}>
            Quản lý kho hàng
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Theo dõi tồn kho và lịch sử nhập/xuất kho cho Electronics Store
          </Text>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        style={{ marginBottom: 0 }}
      />

      { }
      <Modal
        title={
          <div>
            <Text strong>Lịch sử nhập/xuất kho</Text>
            {selectedProduct && (
              <div>
                <Text type="secondary">
                  Sản phẩm: {selectedProduct.productName}
                </Text>
              </div>
            )}
          </div>
        }
        open={isHistoryModalVisible}
        onCancel={handleCloseHistoryModal}
        footer={null}
        width={1200}>
        <div
          style={{
            marginBottom: "16px",
            padding: "16px",
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Loại giao dịch"
                style={{ width: "100%" }}
                allowClear
                value={modalTransactionTypeFilter}
                onChange={handleModalTransactionTypeFilter}>
                <Option value="IN">Nhập kho</Option>
                <Option value="OUT">Xuất kho</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Loại tham chiếu"
                style={{ width: "100%" }}
                allowClear
                value={modalReferenceTypeFilter}
                onChange={handleModalReferenceTypeFilter}>
                <Option value="PURCHASE_ORDER">Đơn nhập hàng</Option>
                <Option value="SALE_ORDER">Đơn bán hàng</Option>
                <Option value="ADJUSTMENT">Điều chỉnh</Option>
                <Option value="SALE_RETURN">Trả hàng</Option>
                <Option value="SALE_EXCHANGE">Đổi hàng</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <RangePicker
                placeholder={["Từ ngày", "Đến ngày"]}
                value={modalDateRange}
                onChange={handleModalDateRangeChange}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setModalTransactionTypeFilter(null);
                  setModalReferenceTypeFilter(null);
                  setModalDateRange(null);
                  if (selectedProduct) {
                    resetModalPagination();
                    fetchModalTransactions(
                      selectedProduct.idProduct,
                      1,
                      modalPageSize
                    );
                  }
                }}
                style={{ width: "100%" }}>
                Xóa lọc
              </Button>
            </Col>
          </Row>
        </div>
        <Table
          columns={transactionColumns}
          dataSource={modalTransactions}
          loading={modalTransactionsLoading}
          rowKey="idTransaction"
          pagination={{
            ...modalTablePagination,
            current: modalCurrentPage,
            pageSize: modalPageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
          onChange={handleModalTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Modal>
    </div>
  );
};

export default Inventory;
