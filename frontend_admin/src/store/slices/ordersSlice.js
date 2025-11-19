import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ordersService } from "../../services/ordersService";

// Async thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params, { rejectWithValue }) => {
    try {
      const pageResponse = await ordersService.getOrders(params);
      // Backend returns PageResponse with: content, pageNo (0-indexed), pageSize, totalElements, totalPages, etc.
      return pageResponse;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.message || "Lỗi khi tải danh sách đơn hàng"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const order = await ordersService.getOrderById(id);
      return order;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.message || "Lỗi khi tải chi tiết đơn hàng"
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const order = await ordersService.createOrder(orderData);
      return order;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.message || "Lỗi khi tạo đơn hàng"
      );
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      const response = await ordersService.updateOrder(id, orderData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật đơn hàng"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const order = await ordersService.updateOrderStatus(id, status);
      return order;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hàng"
      );
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await ordersService.deleteOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi xóa đơn hàng"
      );
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: null,
    customerId: null,
    dateRange: null,
  },
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns PageResponse: { content, pageNo (0-indexed), pageSize, totalElements, totalPages, ... }
        const pageResponse = action.payload;
        if (pageResponse && pageResponse.content) {
          state.orders = pageResponse.content || [];
          // Convert 0-indexed pageNo to 1-indexed for frontend
          state.pagination.current = (pageResponse.pageNo || 0) + 1;
          state.pagination.pageSize = pageResponse.pageSize || 10;
          state.pagination.total = pageResponse.totalElements || 0;
          state.pagination.totalPages = pageResponse.totalPages || 0;
        } else {
          // Fallback: if not PageResponse, treat as array
          state.orders = Array.isArray(pageResponse) ? pageResponse : [];
          state.pagination.total = state.orders.length;
        }
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.orders = []; // Set to empty array on error
        state.error = action.payload;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns OrderDTO directly
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create order
      .addCase(createOrder.fulfilled, (state, action) => {
        const newOrder = action.payload;
        state.orders.unshift(newOrder);
        state.pagination.total += 1;
      })
      // Update order (deprecated - backend doesn't support direct update)
      .addCase(updateOrder.fulfilled, (state, action) => {
        // This should not be called as backend doesn't support direct update
        const updatedOrder = action.payload;
        const orderId = updatedOrder.idOrder || updatedOrder.id;
        const index = state.orders.findIndex(
          (order) => (order.idOrder || order.id) === orderId
        );
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.currentOrder && (state.currentOrder.idOrder || state.currentOrder.id) === orderId) {
          state.currentOrder = updatedOrder;
        }
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        // Backend uses idOrder, not id
        const orderId = updatedOrder.idOrder || updatedOrder.id;
        const index = state.orders.findIndex(
          (order) => (order.idOrder || order.id) === orderId
        );
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.currentOrder && (state.currentOrder.idOrder || state.currentOrder.id) === orderId) {
          state.currentOrder = updatedOrder;
        }
      })
      // Delete order (deprecated - backend doesn't support deletion)
      .addCase(deleteOrder.fulfilled, (state, action) => {
        // This should not be called as backend doesn't support deletion
        const orderId = action.payload;
        state.orders = state.orders.filter(
          (order) => (order.idOrder || order.id) !== orderId
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const { clearError, clearCurrentOrder, setFilters, setPagination } =
  ordersSlice.actions;
export default ordersSlice.reducer;
