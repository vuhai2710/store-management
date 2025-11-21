import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reviewsService } from "../../services/reviewsService";

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  "reviews/fetchProductReviews",
  async ({ productId, pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" }, { rejectWithValue }) => {
    try {
      const response = await reviewsService.getProductReviews(productId, { pageNo, pageSize, sortBy, sortDirection });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Lấy danh sách đánh giá thất bại");
    }
  }
);

export const replyToReview = createAsyncThunk(
  "reviews/replyToReview",
  async ({ reviewId, adminReply }, { rejectWithValue }) => {
    try {
      const response = await reviewsService.replyToReview(reviewId, adminReply);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Trả lời đánh giá thất bại");
    }
  }
);

export const fetchAllReviews = createAsyncThunk(
  "reviews/fetchAllReviews",
  async ({ pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" }, { rejectWithValue }) => {
    try {
      const response = await reviewsService.getAllReviews({ pageNo, pageSize, sortBy, sortDirection });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Lấy danh sách đánh giá thất bại");
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewsService.deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Xóa đánh giá thất bại");
    }
  }
);

const initialState = {
  productReviews: {
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
  allReviews: {
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

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearProductReviews: (state) => {
      state.productReviews = initialState.productReviews;
    },
    clearAllReviews: (state) => {
      state.allReviews = initialState.allReviews;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.productReviews.loading = true;
        state.productReviews.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.productReviews.loading = false;
        state.productReviews.list = action.payload?.content || action.payload?.list || [];
        state.productReviews.pagination = {
          pageNo: action.payload?.pageNo || 1,
          pageSize: action.payload?.pageSize || 10,
          totalElements: action.payload?.totalElements || 0,
          totalPages: action.payload?.totalPages || 0,
        };
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.productReviews.loading = false;
        state.productReviews.error = action.payload;
      })
      // Fetch all reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.allReviews.loading = true;
        state.allReviews.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.allReviews.loading = false;
        state.allReviews.list = action.payload?.content || action.payload?.list || [];
        state.allReviews.pagination = {
          pageNo: action.payload?.pageNo || 1,
          pageSize: action.payload?.pageSize || 10,
          totalElements: action.payload?.totalElements || 0,
          totalPages: action.payload?.totalPages || 0,
        };
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.allReviews.loading = false;
        state.allReviews.error = action.payload;
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        // Remove from product reviews
        state.productReviews.list = state.productReviews.list.filter((r) => r.idReview !== action.payload);
        // Remove from all reviews
        state.allReviews.list = state.allReviews.list.filter((r) => r.idReview !== action.payload);
        // Update total
        state.productReviews.pagination.totalElements = Math.max(0, state.productReviews.pagination.totalElements - 1);
        state.allReviews.pagination.totalElements = Math.max(0, state.allReviews.pagination.totalElements - 1);
      })
      // Reply to review
      .addCase(replyToReview.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated || !updated.idReview) return;

        // Update in productReviews
        const prIndex = state.productReviews.list.findIndex((r) => r.idReview === updated.idReview);
        if (prIndex !== -1) {
          state.productReviews.list[prIndex].adminReply = updated.adminReply;
        }

        // Update in allReviews
        const arIndex = state.allReviews.list.findIndex((r) => r.idReview === updated.idReview);
        if (arIndex !== -1) {
          state.allReviews.list[arIndex].adminReply = updated.adminReply;
        }
      });
  },
});

export const { clearProductReviews, clearAllReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;

