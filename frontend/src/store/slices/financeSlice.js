import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { financeService } from '../../services/financeService';

export const fetchFinancialData = createAsyncThunk(
  'finance/fetchFinancialData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await financeService.getFinancialData(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải dữ liệu tài chính');
    }
  }
);

export const fetchPayroll = createAsyncThunk(
  'finance/fetchPayroll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await financeService.getPayroll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải dữ liệu lương');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'finance/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await financeService.createTransaction(transactionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo giao dịch');
    }
  }
);

export const updatePayroll = createAsyncThunk(
  'finance/updatePayroll',
  async ({ id, payrollData }, { rejectWithValue }) => {
    try {
      const response = await financeService.updatePayroll(id, payrollData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật lương');
    }
  }
);

const initialState = {
  financialData: {
    revenue: 0,
    expenses: 0,
    profit: 0,
    transactions: [],
  },
  payroll: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    dateRange: null,
    type: null,
  },
};

const financeSlice = createSlice({
  name: 'finance',
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
      .addCase(fetchFinancialData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialData.fulfilled, (state, action) => {
        state.loading = false;
        state.financialData = action.payload;
        state.error = null;
      })
      .addCase(fetchFinancialData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.payroll = action.payload.data;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.financialData.transactions.unshift(action.payload);
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        const index = state.payroll.findIndex(payroll => payroll.id === action.payload.id);
        if (index !== -1) {
          state.payroll[index] = action.payload;
        }
      });
  },
});

export const { clearError, setFilters, setPagination } = financeSlice.actions;
export default financeSlice.reducer;


