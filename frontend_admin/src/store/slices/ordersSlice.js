import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ordersService } from "../../services/ordersService";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params, { rejectWithValue }) => {
    try {
      const pageResponse = await ordersService.getOrders(params);

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

      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;

        const pageResponse = action.payload;
        if (pageResponse && pageResponse.content) {
          state.orders = pageResponse.content || [];

          state.pagination.current = (pageResponse.pageNo || 0) + 1;
          state.pagination.pageSize = pageResponse.pageSize || 10;
          state.pagination.total = pageResponse.totalElements || 0;
          state.pagination.totalPages = pageResponse.totalPages || 0;
        } else {

          state.orders = Array.isArray(pageResponse) ? pageResponse : [];
          state.pagination.total = state.orders.length;
        }
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.orders = [];
        state.error = action.payload;
      })

      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;

        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createOrder.fulfilled, (state, action) => {
        const newOrder = action.payload;
        state.orders.unshift(newOrder);
        state.pagination.total += 1;
      })

      .addCase(updateOrder.fulfilled, (state, action) => {

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

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
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

      .addCase(deleteOrder.fulfilled, (state, action) => {

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
