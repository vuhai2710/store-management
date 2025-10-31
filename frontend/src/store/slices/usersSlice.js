import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { usersService } from "../../services/usersService";

// Chuẩn hóa PageResponse về FE
const extractPage = (pageResponse) => {
  const items = Array.isArray(pageResponse?.content)
    ? pageResponse.content
    : Array.isArray(pageResponse?.items)
    ? pageResponse.items
    : Array.isArray(pageResponse?.data)
    ? pageResponse.data
    : [];

  const total =
    pageResponse?.totalElements ??
    pageResponse?.total ??
    pageResponse?.totalItems ??
    items.length;

  const toInt = (v, def = 1) => {
    const n = typeof v === "number" ? v : parseInt(v, 10);
    return Number.isFinite(n) ? n : def;
  };

  // current: nếu backend trả number=0 (0-based) -> +1
  let current = toInt(
    pageResponse?.currentPage ??
      pageResponse?.pageNo ??
      pageResponse?.page ??
      pageResponse?.number,
    1
  );
  if (current < 1) current = current + 1;

  const pageSize = toInt(
    pageResponse?.pageSize ?? pageResponse?.size ?? items.length,
    10
  );

  return { items, total, current, pageSize };
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    { pageNo = 1, pageSize = 10, sortBy = "idUser", sortDirection = "ASC", isActive = null } = {},
    { rejectWithValue }
  ) => {
    try {
      const res =
        isActive === true || isActive === false
          ? await usersService.getUsersByStatus(isActive, pageNo, pageSize, sortBy, sortDirection)
          : await usersService.getAllUsers(pageNo, pageSize, sortBy, sortDirection);
      return res;
    } catch (error) {
      return rejectWithValue(error.message || "Không thể tải danh sách người dùng");
    }
  }
);

// Thunk cập nhật user (email, isActive...)
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const res = await usersService.updateUser(id, userData);
      return res; // UserDto
    } catch (err) {
      return rejectWithValue(err.message || "Cập nhật user thất bại");
    }
  }
);

// Thunk đổi vai trò
export const changeUserRole = createAsyncThunk(
  "users/changeUserRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const res = await usersService.changeUserRole(id, role);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Đổi vai trò thất bại");
    }
  }
);

// Thunk xóa user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await usersService.deleteUser(id);
      return id; // trả về id để cập nhật state
    } catch (err) {
      return rejectWithValue(err.message || "Xóa người dùng thất bại");
    }
  }
);

// Thunk kích hoạt
export const activateUser = createAsyncThunk(
  "users/activateUser",
  async (id, { rejectWithValue }) => {
    try {
      await usersService.activateUser(id);
      return id; // trả về id để cập nhật state
    } catch (err) {
      return rejectWithValue(err.message || "Kích hoạt người dùng thất bại");
    }
  }
);

// Thunk vô hiệu hóa
export const deactivateUser = createAsyncThunk(
  "users/deactivateUser",
  async (id, { rejectWithValue }) => {
    try {
      await usersService.deactivateUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Vô hiệu hóa người dùng thất bại");
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: { current: 1, pageSize: 10, total: 0 },
  filters: { sortBy: "idUser", sortDirection: "ASC", isActive: null },
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsersFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setUsersPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const { items, total, current, pageSize } = extractPage(action.payload);
        state.users = Array.isArray(items) ? items : [];
        state.pagination = { ...state.pagination, total, current, pageSize };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi tải danh sách người dùng";
        state.users = [];
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.idUser) {
          state.users = state.users.map((u) => (u.idUser === updated.idUser ? { ...u, ...updated } : u));
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload || "Cập nhật user thất bại";
      })

      // Change role
      .addCase(changeUserRole.pending, (state) => {
        state.error = null;
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.idUser) {
          state.users = state.users.map((u) => (u.idUser === updated.idUser ? { ...u, role: updated.role } : u));
        }
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.error = action.payload || "Đổi vai trò thất bại";
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const id = action.payload;
        state.users = state.users.filter((u) => u.idUser !== id);
        state.pagination.total = Math.max(0, (state.pagination.total || 0) - 1);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload || "Xóa người dùng thất bại";
      })

      // Activate
      .addCase(activateUser.fulfilled, (state, action) => {
        const id = action.payload;
        state.users = state.users.map((u) =>
          u.idUser === id ? { ...u, isActive: true } : u
        );
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.error = action.payload || "Kích hoạt người dùng thất bại";
      })

      // Deactivate
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const id = action.payload;
        state.users = state.users.map((u) =>
          u.idUser === id ? { ...u, isActive: false } : u
        );
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.error = action.payload || "Vô hiệu hóa người dùng thất bại";
      });
  },
});

export const { setUsersFilters, setUsersPagination, clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;