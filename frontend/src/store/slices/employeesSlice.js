import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeesService } from '../../services/employeesService';

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeesService.getEmployees(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi tải danh sách nhân viên');
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeesService.getEmployeeById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi tải chi tiết nhân viên');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeesService.createEmployee(employeeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi tạo nhân viên');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      const response = await employeesService.updateEmployee(id, employeeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi cập nhật nhân viên');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await employeesService.deleteEmployee(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi xóa nhân viên');
    }
  }
);

const initialState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  sort: {
    sortBy: 'idEmployee',
    sortDirection: 'DESC',
  },
  filters: {},
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSort: (state, action) => {
      state.sort = { ...state.sort, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.data;
        state.pagination.total = action.payload.total;
        // Nếu BE trả về page/pageSize đã chuẩn hóa, có thể sync current/pageSize:
        if (action.payload.page) state.pagination.current = action.payload.page;
        if (action.payload.pageSize) state.pagination.pageSize = action.payload.pageSize;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.employees.findIndex((e) => e.idEmployee === updated.idEmployee);
        if (idx !== -1) state.employees[idx] = updated;
        if (state.currentEmployee?.idEmployee === updated.idEmployee) {
          state.currentEmployee = updated;
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        const removedId = action.payload;
        state.employees = state.employees.filter((e) => e.idEmployee !== removedId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const {
  clearError,
  clearCurrentEmployee,
  setFilters,
  setPagination,
  setSort,
} = employeesSlice.actions;
export default employeesSlice.reducer;


