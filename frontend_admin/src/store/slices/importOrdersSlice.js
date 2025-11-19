import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { importOrderService } from "../../services/importOrderService";

// Fetch all import orders
export const fetchImportOrders = createAsyncThunk(
  "importOrders/fetchImportOrders",
  async (params, { rejectWithValue }) => {
    try {
      const res = await importOrderService.getImportOrders(params);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải danh sách đơn nhập hàng");
    }
  }
);

// Fetch import order by ID
export const fetchImportOrderById = createAsyncThunk(
  "importOrders/fetchImportOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await importOrderService.getImportOrderById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải thông tin đơn nhập hàng");
    }
  }
);

// Fetch import orders by supplier
export const fetchImportOrdersBySupplier = createAsyncThunk(
  "importOrders/fetchImportOrdersBySupplier",
  async ({ supplierId, ...params }, { rejectWithValue }) => {
    try {
      const res = await importOrderService.getImportOrdersBySupplier(supplierId, params);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải đơn nhập hàng theo nhà cung cấp");
    }
  }
);

// Fetch import order history
export const fetchImportOrderHistory = createAsyncThunk(
  "importOrders/fetchImportOrderHistory",
  async (params, { rejectWithValue }) => {
    try {
      const res = await importOrderService.getImportOrderHistory(params);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải lịch sử nhập hàng");
    }
  }
);

// Create import order
export const createImportOrder = createAsyncThunk(
  "importOrders/createImportOrder",
  async (importOrderData, { rejectWithValue }) => {
    try {
      const res = await importOrderService.createImportOrder(importOrderData);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || err?.errors || "Lỗi khi tạo đơn nhập hàng");
    }
  }
);

const initialState = {
  list: [],
  currentImportOrder: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    supplierId: null,
    startDate: null,
    endDate: null,
  },
};

const importOrdersSlice = createSlice({
  name: "importOrders",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { supplierId: null, startDate: null, endDate: null };
    },
    clearCurrentImportOrder: (state) => {
      state.currentImportOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch import orders
      .addCase(fetchImportOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportOrders.fulfilled, (state, action) => {
        state.loading = false;
        const pageResponse = action.payload;
        if (pageResponse && pageResponse.content) {
          state.list = pageResponse.content || [];
          state.pagination.current = (pageResponse.pageNo || 0) + 1;
          state.pagination.pageSize = pageResponse.pageSize || 10;
          state.pagination.total = pageResponse.totalElements || 0;
          state.pagination.totalPages = pageResponse.totalPages || 0;
        } else {
          state.list = Array.isArray(pageResponse) ? pageResponse : [];
          state.pagination.total = state.list.length;
        }
        state.error = null;
      })
      .addCase(fetchImportOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch import order by ID
      .addCase(fetchImportOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentImportOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchImportOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch import orders by supplier
      .addCase(fetchImportOrdersBySupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportOrdersBySupplier.fulfilled, (state, action) => {
        state.loading = false;
        const pageResponse = action.payload;
        if (pageResponse && pageResponse.content) {
          state.list = pageResponse.content || [];
          state.pagination.current = (pageResponse.pageNo || 0) + 1;
          state.pagination.pageSize = pageResponse.pageSize || 10;
          state.pagination.total = pageResponse.totalElements || 0;
          state.pagination.totalPages = pageResponse.totalPages || 0;
        }
        state.error = null;
      })
      .addCase(fetchImportOrdersBySupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch import order history
      .addCase(fetchImportOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        const pageResponse = action.payload;
        if (pageResponse && pageResponse.content) {
          state.list = pageResponse.content || [];
          state.pagination.current = (pageResponse.pageNo || 0) + 1;
          state.pagination.pageSize = pageResponse.pageSize || 10;
          state.pagination.total = pageResponse.totalElements || 0;
          state.pagination.totalPages = pageResponse.totalPages || 0;
        }
        state.error = null;
      })
      .addCase(fetchImportOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create import order
      .addCase(createImportOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createImportOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createImportOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentImportOrder } = importOrdersSlice.actions;
export default importOrdersSlice.reducer;


