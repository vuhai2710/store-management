import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Typography,
  Modal,
  message,
  Popconfirm,
  Select,
  InputNumber,
  Row,
  Col,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts,
  deleteProduct,
  restoreProduct,
  fetchProductsBySupplier,
} from "../store/slices/productsSlice";
import ProductForm from "../components/products/ProductForm";
import { usePagination } from "../hooks/usePagination";
import { useDebounce } from "../hooks/useDebounce";
import { categoriesService } from "../services/categoriesService";
import { suppliersService } from "../services/suppliersService";
import EmptyState from "../components/common/EmptyState";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { exportToExcel, exportToCSV } from "../utils/exportUtils";
import { DownloadOutlined } from "@ant-design/icons";
import { LOW_STOCK_THRESHOLD } from "../constants";

const { Title, Text } = Typography;
const { Option } = Select;

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, pagination } = useSelector(
    (state) => state.products || {}
  );

  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,

    resetPagination,
    pagination: tablePagination,
  } = usePagination(1, 5);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, 300);
  const [categoryId, setCategoryId] = useState(null);
  const [brand, setBrand] = useState("");
  const debouncedBrand = useDebounce(brand, 300);
  const [supplierId, setSupplierId] = useState(null);
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [sortBy, setSortBy] = useState("idProduct");
  const [sortDirection, setSortDirection] = useState("ASC");

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cats, sups] = await Promise.all([
          categoriesService.getAll(),
          suppliersService.getAllSuppliers(),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setSuppliers(Array.isArray(sups) ? sups : []);
      } catch {
        setCategories([]);
        setSuppliers([]);
      }
    };
    loadMeta();
  }, []);

  const fetchList = useCallback(async () => {
    try {
      if (supplierId) {
        await dispatch(
          fetchProductsBySupplier({
            supplierId: supplierId,
            pageNo: currentPage,
            pageSize,
            showDeleted,
          })
        ).unwrap();
      } else {
        await dispatch(
          fetchProducts({
            pageNo: currentPage,
            pageSize,
            sortBy,
            sortDirection,
            keyword: debouncedKeyword,
            categoryId,
            brand: debouncedBrand,
            minPrice: debouncedMinPrice,
            maxPrice: debouncedMaxPrice,
            inventoryStatus: inventoryStatusFilter,
            showDeleted,
          })
        ).unwrap();
      }
    } catch {
      message.error("Không thể tải danh sách sản phẩm");
    }
  }, [
    dispatch,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    debouncedKeyword,
    categoryId,
    debouncedBrand,
    debouncedMinPrice,
    debouncedMaxPrice,
    inventoryStatusFilter,
    supplierId,
    showDeleted,
  ]);

  useEffect(() => {
    if (supplierId != null) {
      handlePageChange(1, pageSize);
    }

  }, [supplierId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setTotal(pagination.totalElements || 0);
  }, [pagination.totalElements, setTotal]);

  useEffect(() => {
    if (debouncedKeyword !== undefined) {
      resetPagination();
    }

  }, [debouncedKeyword]);

  const onResetFilters = () => {
    setSearchKeyword("");
    setCategoryId(null);
    setBrand("");
    setSupplierId(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInventoryStatusFilter(null);
    setSortDirection("ASC");
    setShowDeleted(false);
    resetPagination();
  };

  const onTableChange = (p, _filters, sorter) => {
    handlePageChange(p.current, p.pageSize);
    if (sorter && sorter.field) {
      setSortBy(sorter.field);
      setSortDirection(sorter.order === "descend" ? "DESC" : "ASC");
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (idProduct) => {
    try {
      await dispatch(deleteProduct(idProduct)).unwrap();
      message.success("Xóa sản phẩm thành công!");
      fetchList();
    } catch (e) {
      message.error(e?.message || "Xóa sản phẩm thất bại!");
    }
  };

  const handleRestore = async (idProduct) => {
    try {
      await dispatch(restoreProduct(idProduct)).unwrap();
      message.success("Khôi phục sản phẩm thành công!");
      fetchList();
    } catch (e) {
      message.error(e?.message || "Khôi phục sản phẩm thất bại!");
    }
  };

  const handleView = (idProduct) => {
    navigate(`/products/${idProduct}`);
  };

  const handleViewReviews = (idProduct) => {
    navigate(`/products/${idProduct}/reviews`);
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "idProduct",
        key: "idProduct",
        width: 80,
        sorter: true,
      },
      {
        title: "Tên",
        dataIndex: "productName",
        key: "productName",
        sorter: true,
        render: (text, record) => (
          <a onClick={() => handleView(record.idProduct)}>{text}</a>
        ),
      },
      { title: "Danh mục", dataIndex: "categoryName", key: "categoryName" },
      { title: "Thương hiệu", dataIndex: "brand", key: "brand" },
      { title: "Nhà cung cấp", dataIndex: "supplierName", key: "supplierName" },
      {
        title: "Giá",
        dataIndex: "price",
        key: "price",
        sorter: true,
        render: (v) => (v != null ? v.toLocaleString("vi-VN") : ""),
      },
      {
        title: "Tồn",
        dataIndex: "stockQuantity",
        key: "stockQuantity",
        sorter: true,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (text, record) => (
          <Space size="middle">
            {record.isDelete ? (
              <Tag color="error">Đã xóa</Tag>
            ) : (
              <Tag
                color={
                  text === "IN_STOCK"
                    ? "success"
                    : text === "OUT_OF_STOCK"
                      ? "error"
                      : "warning"
                }
              >
                {text === "IN_STOCK"
                  ? "Còn hàng"
                  : text === "OUT_OF_STOCK"
                    ? "Hết hàng"
                    : "Ngừng kinh doanh"}
              </Tag>
            )}
          </Space>
        ),
      },
      { title: "Code", dataIndex: "productCode", key: "productCode" },
      { title: "Code Type", dataIndex: "codeType", key: "codeType" },
      { title: "SKU", dataIndex: "sku", key: "sku" },
      {
        title: "Hành động",
        key: "actions",
        fixed: "right",
        width: 200,
        render: (_, record) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/products/${record.idProduct}`)}
            />
            {!record.isDelete && (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingProduct(record);
                  setIsModalVisible(true);
                }}
              />
            )}
            {record.isDelete ? (
              <Popconfirm
                title="Bạn có chắc chắn muốn khôi phục sản phẩm này?"
                onConfirm={() => handleRestore(record.idProduct)}
              >
                <Button type="text" icon={<ReloadOutlined />} title="Khôi phục" />
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                onConfirm={() => handleDelete(record.idProduct)}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  title="Xóa"
                />
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ],
    [handleView, handleEdit, handleDelete, handleRestore, navigate]
  );

  const handleExportExcel = useCallback(() => {
    if (!columns || !list || list.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    try {
      exportToExcel(
        list,
        `san-pham-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file Excel thành công!");
    } catch (error) {
      message.error(error?.message || "Xuất file Excel thất bại!");
    }
  }, [list, columns]);

  const handleExportCSV = useCallback(() => {
    if (!columns || !list || list.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    try {
      exportToCSV(
        list,
        `san-pham-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file CSV thành công!");
    } catch (error) {
      message.error(error?.message || "Xuất file CSV thất bại!");
    }
  }, [list, columns]);

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
            Quản lý sản phẩm
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Danh sách và quản lý tồn kho sản phẩm Electronics Store
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          style={{
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
          }}>
          Thêm sản phẩm
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          marginBottom: 24,
        }}
        styles={{ body: { padding: "20px" } }}>
        <Row gutter={[16, 16]}>
          {/* Main search and selectors */}
          <Col xs={24} lg={8}>
            <Input
              placeholder="Tìm kiếm theo mã hoặc tên sản phẩm..."
              prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Danh mục"
              value={categoryId}
              onChange={(value) => {
                setCategoryId(value);
                handlePageChange(1, pageSize);
              }}
              allowClear
              style={{ width: "100%" }}
              showSearch
              size="large"
              optionFilterProp="label"
              options={categories.map((c) => ({
                value: c.idCategory,
                label: c.categoryName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Nhà cung cấp"
              value={supplierId}
              onChange={(value) => {
                setSupplierId(value);
                handlePageChange(1, pageSize);
              }}
              allowClear
              style={{ width: "100%" }}
              showSearch
              size="large"
              optionFilterProp="label"
              options={suppliers.map((s) => ({
                value: s.idSupplier,
                label: s.supplierName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Input
              placeholder="Thương hiệu"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Hiển thị sản phẩm"
              style={{ width: "100%" }}
              value={showDeleted}
              size="large"
              allowClear
              onChange={(val) => {
                setShowDeleted(val ?? false);
                resetPagination();
              }}
            >
              <Option value={false}>Sản phẩm đang bán</Option>
              <Option value={true}>Sản phẩm đã xóa</Option>
            </Select>
          </Col>

          {/* Price range and secondary filters */}
          <Col xs={12} sm={6} lg={4}>
            <InputNumber
              placeholder="Giá từ"
              value={minPrice}
              onChange={(value) => setMinPrice(value)}
              min={0}
              style={{ width: "100%" }}
              size="large"
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <InputNumber
              placeholder="Giá đến"
              value={maxPrice}
              onChange={(value) => setMaxPrice(value)}
              min={0}
              style={{ width: "100%" }}
              size="large"
            />
          </Col>

          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Trạng thái tồn kho"
              value={inventoryStatusFilter}
              onChange={(value) => {
                setInventoryStatusFilter(value);
                handlePageChange(1, pageSize);
              }}
              allowClear
              size="large"
              style={{ width: "100%" }}>
              <Option value="COMING_SOON">Hàng sắp về</Option>
              <Option value="IN_STOCK">Còn hàng</Option>
              <Option value="OUT_OF_STOCK">Hết hàng</Option>
            </Select>
          </Col>

          {/* Action Buttons */}
          <Col xs={24} lg={12}>
            <Space
              wrap
              style={{
                width: "100%",
                justifyContent: "flex-start",
              }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={onResetFilters}
                size="large"
              >
                Xóa lọc
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
                size="large"
              >
                Xuất Excel
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
                size="large"
              >
                Xuất CSV
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          background: "#FFFFFF",
        }}
        styles={{ body: { padding: 16 } }}>
        {loading && (!list || list.length === 0) ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : (
          <Table
            columns={columns}
            dataSource={list}
            loading={loading}
            rowKey="idProduct"
            onChange={onTableChange}
            pagination={{
              ...tablePagination,
              current: currentPage,
              pageSize,
              total: pagination.totalElements,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
            }}
            scroll={{ x: 1100 }}
            locale={{
              emptyText: (
                <EmptyState
                  description="Chưa có sản phẩm nào"
                  actionText="Thêm sản phẩm"
                  showAction
                  onAction={handleCreate}
                />
              ),
            }}
            size="middle"
          />
        )}
      </Card>

      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnHidden>
        <ProductForm
          product={editingProduct}
          onSuccess={() => {
            setIsModalVisible(false);
            fetchList();
          }}
        />
      </Modal>
    </div >
  );
};

export default Products;
