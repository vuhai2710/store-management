import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

/**
 * Notification Service
 * Handles all notification-related API calls
 * Backend API: /api/v1/notifications
 */
export const notificationService = {
  /**
   * Get all notifications
   * GET /api/v1/notifications
   * @param {Object} params - Query parameters
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "createdAt")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "DESC")
   * @returns {Promise<PageResponse<NotificationDTO>>}
   */
  getNotifications: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params: queryParams });
    return unwrap(response);
  },

  /**
   * Get unread notifications
   * GET /api/v1/notifications/unread
   * @param {Object} params - Query parameters
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @returns {Promise<PageResponse<NotificationDTO>>}
   */
  getUnreadNotifications: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
    };

    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD, { params: queryParams });
    return unwrap(response);
  },

  /**
   * Get unread count
   * GET /api/v1/notifications/unread-count
   * @returns {Promise<number>}
   */
  getUnreadCount: async () => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return unwrap(response);
  },

  /**
   * Mark notification as read
   * PUT /api/v1/notifications/{id}/mark-read
   * @param {number} id - Notification ID
   * @returns {Promise<NotificationDTO>}
   */
  markAsRead: async (id) => {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return unwrap(response);
  },

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/mark-all-read
   * @returns {Promise<void>}
   */
  markAllAsRead: async () => {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return unwrap(response);
  },

  /**
   * Delete notification
   * DELETE /api/v1/notifications/{id}
   * @param {number} id - Notification ID
   * @returns {Promise<void>}
   */
  deleteNotification: async (id) => {
    const response = await api.delete(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
    return unwrap(response);
  },
};


