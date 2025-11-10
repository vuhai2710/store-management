import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, Input, Row, Select, Typography, message } from "antd";
import UserTable from "../components/users/UserTable";
import {
  fetchUsers,
  setUsersFilters,
  setUsersPagination,
  deleteUser,
  activateUser,      // thêm
  deactivateUser,    // thêm
} from "../store/slices/usersSlice";
import UserForm from "../components/users/UserForm"; // thêm

const { Title } = Typography;

const Users = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((s) => s.users) || {};
  const {
    users = [],
    loading = false,
    pagination = { current: 1, pageSize: 10, total: 0 },
    filters = { sortBy: "idUser", sortDirection: "ASC", isActive: null },
  } = usersState;

  const [searchText, setSearchText] = useState("");

  // State modal chỉnh sửa
  const [openForm, setOpenForm] = useState(false);   // thêm
  const [editingUser, setEditingUser] = useState(null); // thêm

  // Load danh sách
  useEffect(() => {
    dispatch(
      fetchUsers({
        pageNo: Math.max(1, pagination.current), // đảm bảo >= 1
        pageSize: pagination.pageSize,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        isActive: filters.isActive,
      })
    );
    // Log để thấy API gọi
    console.debug("[Users] fetchUsers dispatched", {
      pageNo: Math.max(1, pagination.current),
      pageSize: pagination.pageSize,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      isActive: filters.isActive,
    });
  }, [dispatch, pagination.current, pagination.pageSize, filters.sortBy, filters.sortDirection, filters.isActive]);

  // Tìm kiếm client-side theo username/email (FE filter đơn giản)
  const filteredData = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    if (!searchText) return list;
    const lower = searchText.toLowerCase();
    return list.filter(
      (u) =>
        u.username?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
    );
  }, [users, searchText]);

  const handleTableChange = (pager, tableFilters, sorter) => {
    const newSortBy = sorter?.field || "idUser";
    const newSortDir = sorter?.order === "descend" ? "DESC" : "ASC";
    // Antd trả current 1-based, giữ nguyên
    dispatch(setUsersPagination({ current: pager.current || 1, pageSize: pager.pageSize || 10 }));
    dispatch(setUsersFilters({ sortBy: newSortBy, sortDirection: newSortDir }));

    // isActive filter từ table
    if (tableFilters?.isActive && tableFilters.isActive.length > 0) {
      const v = tableFilters.isActive[0];
      dispatch(setUsersFilters({ isActive: v === true || v === "true" }));
    }
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    setOpenForm(true);
  };

  const handleDelete = async (record) => {
    try {
      await dispatch(deleteUser(record.idUser)).unwrap();
      message.success("Đã xóa người dùng");
      // optional: đồng bộ phân trang
      dispatch(fetchUsers({
        pageNo: Math.max(1, pagination.current),
        pageSize: pagination.pageSize,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        isActive: filters.isActive,
      }));
    } catch (e) {
      message.error(e || "Xóa người dùng thất bại");
    }
  };

  const handleActivate = async (record) => {          // thêm
    try {
      await dispatch(activateUser(record.idUser)).unwrap();
      message.success("Đã kích hoạt người dùng");
    } catch (e) {
      message.error(e || "Kích hoạt người dùng thất bại");
    }
  };

  const handleDeactivate = async (record) => {        // thêm
    try {
      await dispatch(deactivateUser(record.idUser)).unwrap();
      message.success("Đã vô hiệu hóa người dùng");
    } catch (e) {
      message.error(e || "Vô hiệu hóa người dùng thất bại");
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý người dùng
          </Title>
        </Col>
      </Row>

      {/* Bọc bảng trong container cho phép kéo ngang */}
      <Card bodyStyle={{ padding: 12 }}>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} md={8}>
            <Input.Search
              allowClear
              placeholder="Tìm theo username hoặc email"
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Lọc theo trạng thái"
              value={
                filters.isActive === null
                  ? undefined
                  : filters.isActive
                  ? "active"
                  : "inactive"
              }
              style={{ width: "100%" }}
              onChange={(val) =>
                dispatch(setUsersFilters({ isActive: val === undefined ? null : val === "active" }))
              }
              options={[
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Vô hiệu" },
              ]}
            />
          </Col>
        </Row>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <UserTable
            data={filteredData}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
            onEdit={handleEdit}
            onActivate={handleActivate}        // gắn handler
            onDeactivate={handleDeactivate}    // gắn handler
            onDelete={handleDelete}
            onRefresh={() =>
              dispatch(
                fetchUsers({
                  pageNo: Math.max(1, pagination.current),
                  pageSize: pagination.pageSize,
                  sortBy: filters.sortBy,
                  sortDirection: filters.sortDirection,
                  isActive: filters.isActive,
                })
              )
            }
          />
        </div>
      </Card>

      {/* Modal chỉnh sửa */}
      <UserForm
        open={openForm}
        user={editingUser}
        onClose={() => {
          setOpenForm(false);
          setEditingUser(null);
        }}
      />
    </div>
  );
};

export default Users;