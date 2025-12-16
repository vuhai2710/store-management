import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { promotionsService } from "../../services/promotionsService";

// Async thunks cho Promotions
export const fetchPromotions = createAsyncThunk(
  "promotions/fetchPromotions",
  async ({ pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC", keyword, scope }, { rejectWithValue }) => {
    try {
      const response = await promotionsService.getAllPromotions({ pageNo, pageSize, sortBy, sortDirection, keyword, scope });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Lấy danh sách mã giảm giá thất bại");
    }
  }
);

export const createPromotion = createAsyncThunk(
  "promotions/createPromotion",
  async (promotionData, { rejectWithValue }) => {
    try {
      const response = await promotionsService.createPromotion(promotionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Tạo mã giảm giá thất bại");
    }
  }
);

export const updatePromotion = createAsyncThunk(
  "promotions/updatePromotion",
  async ({ id, promotionData }, { rejectWithValue }) => {
    try {
      const response = await promotionsService.updatePromotion(id, promotionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Cập nhật mã giảm giá thất bại");
    }
  }
);

export const deletePromotion = createAsyncThunk(
  "promotions/deletePromotion",
  async (id, { rejectWithValue }) => {
    try {
      await promotionsService.deletePromotion(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Xóa mã giảm giá thất bại");
    }
  }
);

// Async thunks cho Promotion Rules
export const fetchPromotionRules = createAsyncThunk(
  "promotions/fetchPromotionRules",
  async ({ pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" }, { rejectWithValue }) => {
    try {
      const response = await promotionsService.getAllPromotionRules({ pageNo, pageSize, sortBy, sortDirection });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Lấy danh sách quy tắc giảm giá thất bại");
    }
  }
);

export const createPromotionRule = createAsyncThunk(
  "promotions/createPromotionRule",
  async (ruleData, { rejectWithValue }) => {
    try {
      const response = await promotionsService.createPromotionRule(ruleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Tạo quy tắc giảm giá thất bại");
    }
  }
);

export const updatePromotionRule = createAsyncThunk(
  "promotions/updatePromotionRule",
  async ({ id, ruleData }, { rejectWithValue }) => {
    try {
      const response = await promotionsService.updatePromotionRule(id, ruleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Cập nhật quy tắc giảm giá thất bại");
    }
  }
);

export const deletePromotionRule = createAsyncThunk(
  "promotions/deletePromotionRule",
  async (id, { rejectWithValue }) => {
    try {
      await promotionsService.deletePromotionRule(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Xóa quy tắc giảm giá thất bại");
    }
  }
);

const initialState = {
  promotions: {
    list: [],
    pagination: {
      pageNo: 1,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
  },
  rules: {
    list: [],
    pagination: {
      pageNo: 1,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
  },
};

const promotionsSlice = createSlice({
  name: "promotions",
  initialState,
  reducers: {
    clearPromotions: (state) => {
      state.promotions = initialState.promotions;
    },
    clearRules: (state) => {
      state.rules = initialState.rules;
    },
  },
  extraReducers: (builder) => {
    builder
      // Promotions
      .addCase(fetchPromotions.pending, (state) => {
        state.promotions.loading = true;
        state.promotions.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.promotions.loading = false;
        state.promotions.list = action.payload?.content || action.payload?.list || [];
        state.promotions.pagination = {
          pageNo: action.payload?.pageNo || 1,
          pageSize: action.payload?.pageSize || 10,
          totalElements: action.payload?.totalElements || 0,
          totalPages: action.payload?.totalPages || 0,
        };
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.promotions.loading = false;
        state.promotions.error = action.payload;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.promotions.list.unshift(action.payload);
        state.promotions.pagination.totalElements += 1;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        const index = state.promotions.list.findIndex((p) => p.idPromotion === action.payload.idPromotion);
        if (index !== -1) {
          state.promotions.list[index] = action.payload;
        }
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.promotions.list = state.promotions.list.filter((p) => p.idPromotion !== action.payload);
        state.promotions.pagination.totalElements = Math.max(0, state.promotions.pagination.totalElements - 1);
      })
      // Rules
      .addCase(fetchPromotionRules.pending, (state) => {
        state.rules.loading = true;
        state.rules.error = null;
      })
      .addCase(fetchPromotionRules.fulfilled, (state, action) => {
        state.rules.loading = false;
        state.rules.list = action.payload?.content || action.payload?.list || [];
        state.rules.pagination = {
          pageNo: action.payload?.pageNo || 1,
          pageSize: action.payload?.pageSize || 10,
          totalElements: action.payload?.totalElements || 0,
          totalPages: action.payload?.totalPages || 0,
        };
      })
      .addCase(fetchPromotionRules.rejected, (state, action) => {
        state.rules.loading = false;
        state.rules.error = action.payload;
      })
      .addCase(createPromotionRule.fulfilled, (state, action) => {
        state.rules.list.unshift(action.payload);
        state.rules.pagination.totalElements += 1;
      })
      .addCase(updatePromotionRule.fulfilled, (state, action) => {
        const index = state.rules.list.findIndex((r) => r.idRule === action.payload.idRule);
        if (index !== -1) {
          state.rules.list[index] = action.payload;
        }
      })
      .addCase(deletePromotionRule.fulfilled, (state, action) => {
        state.rules.list = state.rules.list.filter((r) => r.idRule !== action.payload);
        state.rules.pagination.totalElements = Math.max(0, state.rules.pagination.totalElements - 1);
      });
  },
});

export const { clearPromotions, clearRules } = promotionsSlice.actions;
export default promotionsSlice.reducer;

