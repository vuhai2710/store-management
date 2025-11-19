import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "../../services/notificationService";

// Fetch all notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params, { rejectWithValue }) => {
    try {
      const res = await notificationService.getNotifications(params);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải thông báo");
    }
  }
);

// Fetch unread notifications
export const fetchUnreadNotifications = createAsyncThunk(
  "notifications/fetchUnreadNotifications",
  async (params, { rejectWithValue }) => {
    try {
      const res = await notificationService.getUnreadNotifications(params);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải thông báo chưa đọc");
    }
  }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationService.getUnreadCount();
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi tải số lượng thông báo chưa đọc");
    }
  }
);

// Mark as read
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await notificationService.markAsRead(id);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi đánh dấu đã đọc");
    }
  }
);

// Mark all as read
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return null;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi đánh dấu tất cả đã đọc");
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.message || "Lỗi khi xóa thông báo");
    }
  }
);

const initialState = {
  list: [],
  unreadList: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.list = [];
      state.unreadList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
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
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch unread notifications
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const pageResponse = action.payload;
        if (pageResponse && pageResponse.content) {
          state.unreadList = pageResponse.content || [];
        } else {
          state.unreadList = Array.isArray(pageResponse) ? pageResponse : [];
        }
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        // Don't set loading for count fetch
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload || 0;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.unreadCount = 0;
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        // Update in list
        const index = state.list.findIndex(
          (n) => n.idNotification === updatedNotification.idNotification
        );
        if (index !== -1) {
          state.list[index] = updatedNotification;
        }
        // Update in unreadList
        state.unreadList = state.unreadList.filter(
          (n) => n.idNotification !== updatedNotification.idNotification
        );
        // Decrease unread count
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        // Mark all as read in list
        state.list = state.list.map((n) => ({ ...n, isRead: true }));
        // Clear unread list
        state.unreadList = [];
        // Reset unread count
        state.unreadCount = 0;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.list = state.list.filter((n) => n.idNotification !== deletedId);
        state.unreadList = state.unreadList.filter((n) => n.idNotification !== deletedId);
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
        state.pagination.total -= 1;
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;


