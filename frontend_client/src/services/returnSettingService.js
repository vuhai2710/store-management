import api from "./api";

export const returnSettingService = {

  getReturnWindowDays: async () => {
    try {
      const response = await api.get("/settings/homepage-policy");
      return response.data?.returnWindowDays || response?.returnWindowDays || 7;
    } catch (error) {
      console.error("Failed to get return window days:", error);
      return 7;
    }
  },
};

export default returnSettingService;
