import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { suppliersService } from '../../services/suppliersService';

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await suppliersService.getAllSuppliers();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi lấy danh sách nhà cung cấp');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await suppliersService.createSupplier(supplierData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi tạo nhà cung cấp');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, supplierData }, { rejectWithValue }) => {
    try {
      const response = await suppliersService.updateSupplier(id, supplierData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi cập nhật nhà cung cấp');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (supplierId, { rejectWithValue }) => {
    try {
      await suppliersService.deleteSupplier(supplierId);
      return supplierId;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi xóa nhà cung cấp');
    }
  }
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState: {
    suppliers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = suppliersSlice.actions;
export default suppliersSlice.reducer;


