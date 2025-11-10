import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productsService } from "../../services/productsService";
import { handleApiError } from "../../utils/apiHelper";

// List (pageable)
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params, { rejectWithValue }) => {
    try {
      const res = await productsService.getProductsPaginated(params);
      return res;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// List theo nhà cung cấp
export const fetchProductsBySupplier = createAsyncThunk(
  "products/fetchProductsBySupplier",
  async ({ supplierId, pageNo = 1, pageSize = 10, sortBy = "idProduct", sortDirection = "ASC" }, { rejectWithValue }) => {
    try {
      const res = await productsService.getProductsBySupplier(supplierId, { pageNo, pageSize, sortBy, sortDirection });
      return res;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// GET by id
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await productsService.getProductById(id);
      return res;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// CREATE
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await productsService.createProduct(payload);
      return res;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// UPDATE
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await productsService.updateProduct(id, data);
      return res;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// DELETE
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await productsService.deleteProduct(id);
      return id;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const initialState = {
  list: [],
  pagination: { pageNo: 1, pageSize: 10, totalElements: 0, totalPages: 0 },
  current: null,
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductError: (state) => { state.error = null; },
    clearCurrentProduct: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    const fulfillPage = (state, action) => {
      state.loading = false;
      const page = action.payload || {};
      state.list = page.content || [];
      state.pagination = {
        pageNo: ((page.pageNo ?? 0) + 1),
        pageSize: page.pageSize ?? 10,
        totalElements: page.totalElements ?? 0,
        totalPages: page.totalPages ?? 0,
      };
    };
    const rejectPage = (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    };

    builder
      // list
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, fulfillPage)
      .addCase(fetchProducts.rejected, rejectPage)

      .addCase(fetchProductsBySupplier.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProductsBySupplier.fulfilled, fulfillPage)
      .addCase(fetchProductsBySupplier.rejected, rejectPage)

      // get by id
      .addCase(fetchProductById.pending, (s) => { s.loading = true; s.error = null; s.current = null; })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchProductById.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      // create
      .addCase(createProduct.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createProduct.fulfilled, (s, a) => {
        s.loading = false;
        if (a.payload) s.list.unshift(a.payload);
      })
      .addCase(createProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      // update
      .addCase(updateProduct.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateProduct.fulfilled, (s, a) => {
        s.loading = false;
        const updated = a.payload;
        const idx = s.list.findIndex((p) => p.idProduct === updated?.idProduct);
        if (idx !== -1) s.list[idx] = updated;
        if (s.current && s.current.idProduct === updated?.idProduct) s.current = updated;
      })
      .addCase(updateProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      // delete
      .addCase(deleteProduct.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.loading = false;
        const id = a.payload;
        s.list = s.list.filter((p) => p.idProduct !== id);
        if (s.current?.idProduct === id) s.current = null;
      })
      .addCase(deleteProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; });
  },
});

export const { clearProductError, clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
