import api from "./api";

/**
 * Service để lấy cấu hình Return Window từ backend
 */
export const returnSettingService = {
  /**
   * Lấy số ngày cho phép đổi/trả hàng
   * @returns {Promise<number>} số ngày
   */
  getReturnWindowDays: async () => {
    try {
      const response = await api.get("/order-returns/config");
      return response.data?.allowedDays || response?.allowedDays || 7;
    } catch (error) {
      console.error("Failed to get return window days:", error);
      return 7; // Default 7 days
    }
  },
};

export default returnSettingService;
