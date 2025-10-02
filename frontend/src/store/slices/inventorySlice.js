import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService } from '../../services/inventoryService';

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải dữ liệu kho');
    }
  }
);

export const fetchSuppliers = createAsyncThunk(
  'inventory/fetchSuppliers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getSuppliers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách nhà cung cấp');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'inventory/createSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createSupplier(supplierData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo nhà cung cấp');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'inventory/updateSupplier',
  async ({ id, supplierData }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateSupplier(id, supplierData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật nhà cung cấp');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'inventory/deleteSupplier',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryService.deleteSupplier(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa nhà cung cấp');
    }
  }
);

const initialState = {
  inventory: [],
  suppliers: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    warehouse: null,
    category: null,
    stockStatus: null,
  },
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.data;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload.data;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.suppliers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload);
        state.pagination.total -= 1;
      });
  },
});

export const { clearError, setFilters, setPagination } = inventorySlice.actions;
export default inventorySlice.reducer;


