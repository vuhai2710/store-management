import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockData } from '../../services/mockData';

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData.suppliers);
      }, 500);
    });
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplierData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSupplier = {
          id: Date.now(),
          ...supplierData,
          createdAt: new Date().toISOString(),
        };
        resolve(newSupplier);
      }, 500);
    });
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, supplierData }) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, ...supplierData });
      }, 500);
    });
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (supplierId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(supplierId);
      }, 500);
    });
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


