import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { shipmentService } from "../../services/shipmentService";

export const fetchShipmentById = createAsyncThunk(
  "shipments/fetchShipmentById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await shipmentService.getShipmentById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải thông tin vận đơn");
    }
  }
);

export const fetchShipmentByOrderId = createAsyncThunk(
  "shipments/fetchShipmentByOrderId",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await shipmentService.getShipmentByOrderId(orderId);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải thông tin vận đơn");
    }
  }
);

export const trackShipment = createAsyncThunk(
  "shipments/trackShipment",
  async (id, { rejectWithValue }) => {
    try {
      const res = await shipmentService.trackShipment(id);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tracking vận đơn");
    }
  }
);

export const syncShipmentWithGHN = createAsyncThunk(
  "shipments/syncShipmentWithGHN",
  async (id, { rejectWithValue }) => {
    try {
      const res = await shipmentService.syncWithGHN(id);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi đồng bộ với GHN");
    }
  }
);

export const createGHNShipmentForOrder = createAsyncThunk(
  "shipments/createGHNShipmentForOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await shipmentService.createGHNShipmentForOrder(orderId);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tạo vận đơn GHN");
    }
  }
);

const initialState = {
  currentShipment: null,
  tracking: null,
  loading: false,
  error: null,
};

const shipmentsSlice = createSlice({
  name: "shipments",
  initialState,
  reducers: {
    clearCurrentShipment: (state) => {
      state.currentShipment = null;
      state.tracking = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchShipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload;
        state.error = null;
      })
      .addCase(fetchShipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchShipmentByOrderId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipmentByOrderId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload;
        state.error = null;
      })
      .addCase(fetchShipmentByOrderId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(trackShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trackShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.tracking = action.payload;
        state.error = null;
      })
      .addCase(trackShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(syncShipmentWithGHN.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncShipmentWithGHN.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload;
        state.error = null;
      })
      .addCase(syncShipmentWithGHN.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGHNShipmentForOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGHNShipmentForOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload;
        state.error = null;
      })
      .addCase(createGHNShipmentForOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentShipment } = shipmentsSlice.actions;
export default shipmentsSlice.reducer;
