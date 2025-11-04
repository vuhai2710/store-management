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
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchProducts, deleteProduct, fetchProductsBySupplier } from "../store/slices/productsSlice";
import ProductForm from "../components/products/ProductForm";
import { usePagination } from "../hooks/usePagination";
import { categoriesService } from "../services/categoriesService";
import { suppliersService } from "../services/suppliersService";

const { Title, Text } = Typography;

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, pagination } = useSelector((state) => state.products || {});

  // usePagination(v1): trả về currentPage/pageSize/total + handlers
  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,
    // handlePageSizeChange, // bỏ vì không dùng
    resetPagination,
    pagination: tablePagination,
  } = usePagination(1, 10);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Filters
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [brand, setBrand] = useState("");
  const [supplierId, setSupplierId] = useState(null);
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();

  // Sort (quản lý riêng vì hook không xử lý sorter)
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

  const fetchList = useCallback(() => {
    if (supplierId) {
      // dùng endpoint /products/supplier/{supplierId}
      dispatch(
        fetchProductsBySupplier({
          supplierId,
          pageNo: currentPage,
          pageSize,
          sortBy,
          sortDirection,
        })
      );
    } else {
      dispatch(
        fetchProducts({
          pageNo: currentPage,
          pageSize,
          sortBy,
          sortDirection,
          code: code?.trim() || undefined,
          name: name?.trim() || undefined,
          categoryId: categoryId || undefined,
          brand: brand?.trim() || undefined,
          minPrice: minPrice != null ? Number(minPrice) : undefined,
          maxPrice: maxPrice != null ? Number(maxPrice) : undefined,
        })
      );
    }
  }, [
    dispatch,
    supplierId,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    code,
    name,
    categoryId,
    brand,
    minPrice,
    maxPrice,
  ]);

  // Khi đổi nhà cung cấp → về trang 1 và fetch lại
  useEffect(() => {
    if (supplierId != null) {
      handlePageChange(1, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId]);

  // Tải danh sách khi page/sort đổi
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Đồng bộ total từ Redux vào hook để Table hiển thị đúng
  useEffect(() => {
    setTotal(pagination.totalElements || 0);
  }, [pagination.totalElements, setTotal]);

  // Nút Tìm kiếm: quay về trang 1 và để effect tự fetch
  const onSearch = () => {
    handlePageChange(1, pageSize);
  };

  // Nút Xóa lọc: reset filters + reset phân trang + reset sort
  const onResetFilters = () => {
    setCode("");
    setName("");
    setCategoryId(null);
    setBrand("");
    setSupplierId(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy("idProduct");
    setSortDirection("ASC");
    resetPagination();
  };

  // Table onChange: đổi trang/kích thước + cập nhật sorter
  const onTableChange = (p, _filters, sorter) => {
    handlePageChange(p.current, p.pageSize);
    if (sorter && sorter.field) {
      setSortBy(sorter.field);
      setSortDirection(sorter.order === "descend" ? "DESC" : "ASC");
    }
  };

  // Handlers cho CRUD modal/bảng
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

  const handleView = (idProduct) => {
    navigate(`/products/${idProduct}`);
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "idProduct", key: "idProduct", width: 80, sorter: true },
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
      { title: "Tồn", dataIndex: "stockQuantity", key: "stockQuantity", sorter: true },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (st) =>
          st === "IN_STOCK" ? <Tag color="green">IN_STOCK</Tag> : <Tag color="red">OUT_OF_STOCK</Tag>,
      },
      { title: "Code", dataIndex: "productCode", key: "productCode" },
      { title: "Code Type", dataIndex: "codeType", key: "codeType" },
      { title: "SKU", dataIndex: "sku", key: "sku" },
      {
        title: "Hành động",
        key: "actions",
        fixed: "right",
        width: 170,
        render: (_, record) => (
          <Space>
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record.idProduct)} />
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
            <Popconfirm
              title="Xóa sản phẩm?"
              onConfirm={() => handleDelete(record.idProduct)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <Title level={2}>Quản lý Sản phẩm</Title>
        <Text>Danh sách, lọc, tạo/sửa/xóa sản phẩm</Text>
      </div>

      <Card style={{ marginBottom: 12 }}>
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Mã sản phẩm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tên sản phẩm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Danh mục"
              value={categoryId}
              onChange={setCategoryId}
              allowClear
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="label"
              options={categories.map((c) => ({ value: c.idCategory, label: c.categoryName }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Nhà cung cấp"
              value={supplierId}
              onChange={setSupplierId}
              allowClear
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="label"
              options={suppliers.map((s) => ({ value: s.idSupplier, label: s.supplierName }))}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Thương hiệu"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={12} sm={6} md={4}>
            <InputNumber
              placeholder="Giá từ"
              value={minPrice}
              onChange={setMinPrice}
              min={0}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <InputNumber
              placeholder="Giá đến"
              value={maxPrice}
              onChange={setMaxPrice}
              min={0}
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Space wrap>
              <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onResetFilters}>
                Xóa lọc
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Thêm sản phẩm
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
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
            total: pagination.totalElements, // luôn bám theo Redux
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ProductForm
          product={editingProduct}
          onSuccess={() => {
            setIsModalVisible(false);
            fetchList();
          }}
        />
      </Modal>
    </div>
  );
};

export default Products;
