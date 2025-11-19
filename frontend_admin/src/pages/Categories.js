import React, { useEffect, useState, useCallback } from "react";
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
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, deleteCategory, setFilters } from "../store/slices/categoriesSlice";
import CategoryForm from "../components/categories/CategoryForm";
import { usePagination } from "../hooks/usePagination";
import EmptyState from "../components/common/EmptyState";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { exportToExcel, exportToCSV } from "../utils/exportUtils";
import { DownloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Categories = () => {
  const dispatch = useDispatch();
  const { list: categories, loading, pagination, filters } = useSelector(
    (state) => state.categories || {}
  );

  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,
    resetPagination,
    pagination: tablePagination,
  } = usePagination(1, 5); // Default page size: 5

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchText, setSearchText] = useState(filters.categoryName || "");

  const fetchCategoriesList = useCallback(() => {
    const params = {
      pageNo: currentPage,
      pageSize,
      sortBy: "idCategory",
      sortDirection: "ASC",
    };
    if (searchText?.trim()) {
      params.name = searchText.trim(); // Backend accepts 'name' as search parameter
    }
    dispatch(fetchCategories(params));
  }, [dispatch, currentPage, pageSize, searchText]);

  useEffect(() => {
    fetchCategoriesList();
  }, [fetchCategoriesList]);

  useEffect(() => {
    setTotal(pagination.total || 0);
  }, [pagination.total, setTotal]);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalVisible(true);
  };

  const handleDeleteCategory = async (idCategory) => {
    try {
      await dispatch(deleteCategory(idCategory)).unwrap();
      message.success("Xóa danh mục thành công!");
      fetchCategoriesList();
    } catch (error) {
      message.error(error || "Xóa danh mục thất bại!");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    fetchCategoriesList();
  };

  const handleSearch = (value) => {
    setSearchText(value);
    dispatch(setFilters({ categoryName: value || null }));
    resetPagination(); // Reset về page 1
  };

  const handleTableChange = (p, _filters, sorter) => {
    handlePageChange(p.current, p.pageSize);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "idCategory",
      key: "idCategory",
      width: 80,
      render: (text) => <Text strong>#{text}</Text>,
    },
    {
      title: "Tên danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Mã tiền tố",
      dataIndex: "codePrefix",
      key: "codePrefix",
      render: (text) => <Text type="secondary">{text || "—"}</Text>,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCategory(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDeleteCategory(record.idCategory)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleExportExcel = () => {
    if (!categories || categories.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    try {
      exportToExcel(categories, `danh-muc-${new Date().toISOString().split('T')[0]}`, columns);
      message.success('Xuất file Excel thành công!');
    } catch (error) {
      message.error(error?.message || 'Xuất file Excel thất bại!');
    }
  };

  const handleExportCSV = () => {
    if (!categories || categories.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    try {
      exportToCSV(categories, `danh-muc-${new Date().toISOString().split('T')[0]}`, columns);
      message.success('Xuất file CSV thành công!');
    } catch (error) {
      message.error(error?.message || 'Xuất file CSV thất bại!');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <Title level={1}>Quản lý Danh mục</Title>
        <p>Quản lý danh mục sản phẩm</p>
      </div>

      <Card>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên danh mục"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ maxWidth: "400px" }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCategoriesList}>
              Làm mới
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
              Xuất CSV
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCategory}>
              Thêm danh mục
            </Button>
          </Space>
        </div>

        {loading && categories.length === 0 ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : (
          <Table
            columns={columns}
            dataSource={categories}
            loading={loading}
            rowKey={(record) => record.idCategory}
            pagination={{
              ...tablePagination,
              current: currentPage,
              pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} danh mục`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            locale={{
              emptyText: (
                <EmptyState
                  description="Chưa có danh mục nào"
                  actionText="Thêm danh mục"
                  showAction
                  onAction={handleCreateCategory}
                />
              ),
            }}
          />
        )}
      </Card>

      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <CategoryForm category={editingCategory} onSuccess={handleModalSuccess} />
      </Modal>
    </div>
  );
};

export default Categories;

