import api from "./api";

/**
 * Service để quản lý System Settings (Admin)
 * Backend chỉ hỗ trợ 1 API: /settings/return-window
 */
export const systemSettingService = {
  /**
   * Lấy số ngày cho phép đổi/trả hàng
   * GET /api/v1/settings/return-window
   * @returns {Promise<number>} số ngày
   */
  getReturnWindow: async () => {
    const response = await api.get("/settings/return-window");
    // Response: { code: 200, message: "...", data: { days: number } }
    return response.data?.days || response?.days || 7;
  },

  /**
   * Cập nhật số ngày cho phép đổi/trả hàng
   * PUT /api/v1/settings/return-window?days=<number>
   * @param {number} days số ngày mới
   * @returns {Promise<object>} response từ server
   */
  updateReturnWindow: async (days) => {
    const response = await api.put(`/settings/return-window?days=${days}`);
    return response.data || response;
  },

  getHomepagePolicy: async () => {
    const response = await api.get("/settings/homepage-policy");
    return response.data || response;
  },

  getAutoFreeShippingPromotion: async () => {
    const response = await api.get("/settings/auto-free-shipping-promotion");
    return response.data?.code ?? response?.code ?? null;
  },

  updateAutoFreeShippingPromotion: async (code) => {
    const normalized = code == null ? "" : String(code).trim();
    const qs = normalized ? `?code=${encodeURIComponent(normalized)}` : "";
    const response = await api.put(`/settings/auto-free-shipping-promotion${qs}`);
    return response.data || response;
  },
};

export default systemSettingService;
