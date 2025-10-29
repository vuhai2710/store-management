import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customersService } from "../../services/customersService";

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params, { rejectWithValue }) => {
    try {
      // If customerType filter is provided, use getCustomersByType endpoint
      if (params?.customerType) {
        const response = await customersService.getCustomersByType(
          params.customerType
        );
        // Transform to match expected format
        return {
          data: response, // getCustomersByType returns array directly
          total: response.length,
        };
      }
      // Otherwise use normal getCustomers with pagination
      const response = await customersService.getCustomers(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Lỗi khi tải danh sách khách hàng"
      );
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await customersService.getCustomerById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi tải chi tiết khách hàng"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customersService.createCustomer(customerData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi tạo khách hàng"
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const response = await customersService.updateCustomer(id, customerData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật khách hàng"
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await customersService.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi xóa khách hàng"
      );
    }
  }
);

const initialState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    search: "",
    status: null,
  },
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
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
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload?.data || [];
        state.pagination.total = action.payload?.total || 0;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.customers = []; // Set to empty array on error
        state.error = action.payload;
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (
          state.currentCustomer &&
          state.currentCustomer.id === action.payload.id
        ) {
          state.currentCustomer = action.payload;
        }
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(
          (customer) => customer.id !== action.payload
        );
        state.pagination.total -= 1;
      });
  },
});

export const { clearError, clearCurrentCustomer, setFilters, setPagination } =
  customersSlice.actions;
export default customersSlice.reducer;
