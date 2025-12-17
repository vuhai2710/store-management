import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoriesService } from "../../services/categoriesService";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (params, { rejectWithValue }) => {
    try {
      const res = await categoriesService.getAllCategoriesPaginated(params);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải danh sách danh mục");
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await categoriesService.getCategoryById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải thông tin danh mục");
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await categoriesService.createCategory(categoryData);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || err?.errors || "Lỗi khi tạo danh mục");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await categoriesService.updateCategory(id, data);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || err?.errors || "Lỗi khi cập nhật danh mục");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await categoriesService.deleteCategory(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi xóa danh mục");
    }
  }
);

const initialState = {
  list: [],
  currentCategory: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    categoryName: null,
  },
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { categoryName: null };
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
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
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCategory = action.payload;
        const index = state.list.findIndex(
          (cat) => cat.idCategory === updatedCategory.idCategory
        );
        if (index !== -1) {
          state.list[index] = updatedCategory;
        }
        if (state.currentCategory && state.currentCategory.idCategory === updatedCategory.idCategory) {
          state.currentCategory = updatedCategory;
        }
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.list = state.list.filter((cat) => cat.idCategory !== deletedId);
        state.pagination.total -= 1;
        if (state.currentCategory && state.currentCategory.idCategory === deletedId) {
          state.currentCategory = null;
        }
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
