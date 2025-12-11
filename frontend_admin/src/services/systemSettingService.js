import api from "./api";

/**
 * Service để quản lý System Settings (Admin)
 */
export const systemSettingService = {
  /**
   * Lấy số ngày cho phép đổi/trả hàng
   * @returns {Promise<number>} số ngày
   */
  getReturnWindow: async () => {
    const response = await api.get("/settings/return-window");
    return response.data?.days || response?.days || 7;
  },

  /**
   * Cập nhật số ngày cho phép đổi/trả hàng
   * @param {number} days số ngày mới
   * @returns {Promise<object>} response từ server
   */
  updateReturnWindow: async (days) => {
    const response = await api.put(`/settings/return-window?days=${days}`);
    return response.data || response;
  },

  /**
   * Lấy số ngày cho phép hoàn tiền
   * @returns {Promise<number>} số ngày
   */
  getRefundWindow: async () => {
    const response = await api.get("/settings/refund-window");
    return response.data?.days || response?.days || 7;
  },

  /**
   * Cập nhật số ngày cho phép hoàn tiền
   * @param {number} days số ngày mới
   * @returns {Promise<object>} response từ server
   */
  updateRefundWindow: async (days) => {
    const response = await api.put(`/settings/refund-window?days=${days}`);
    return response.data || response;
  },

  /**
   * Lấy số ngày cho phép đổi kích thước
   * @returns {Promise<number>} số ngày
   */
  getExchangeSizeWindow: async () => {
    const response = await api.get("/settings/exchange-size-window");
    return response.data?.days || response?.days || 7;
  },

  /**
   * Cập nhật số ngày cho phép đổi kích thước
   * @param {number} days số ngày mới
   * @returns {Promise<object>} response từ server
   */
  updateExchangeSizeWindow: async (days) => {
    const response = await api.put(
      `/settings/exchange-size-window?days=${days}`
    );
    return response.data || response;
  },

  /**
   * Lấy số giờ cho phép sửa đánh giá
   * @returns {Promise<number>} số giờ
   */
  getReviewEditWindow: async () => {
    const response = await api.get("/settings/review-edit-window");
    return response.data?.hours || response?.hours || 24;
  },

  /**
   * Cập nhật số giờ cho phép sửa đánh giá
   * @param {number} hours số giờ mới
   * @returns {Promise<object>} response từ server
   */
  updateReviewEditWindow: async (hours) => {
    const response = await api.put(
      `/settings/review-edit-window?hours=${hours}`
    );
    return response.data || response;
  },
};

export default systemSettingService;
