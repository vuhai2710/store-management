import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersService } from '../../services/ordersService';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ordersService.getOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersService.getOrderById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải chi tiết đơn hàng');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await ordersService.createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      const response = await ordersService.updateOrder(id, orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật đơn hàng');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await ordersService.updateOrderStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      await ordersService.deleteOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa đơn hàng');
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
  },
  filters: {
    status: null,
    customer: null,
    dateRange: null,
  },
};

const ordersSlice = createSlice({
  name: 'orders',
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
        state.orders = action.payload.data;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch order by ID
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
      // Create order
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.pagination.total += 1;
      })
      // Update order
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index].status = action.payload.status;
        }
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder.status = action.payload.status;
        }
      })
      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(order => order.id !== action.payload);
        state.pagination.total -= 1;
      });
  },
});

export const { clearError, clearCurrentOrder, setFilters, setPagination } = ordersSlice.actions;
export default ordersSlice.reducer;


