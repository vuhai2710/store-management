import api from "./api";

export const systemSettingService = {

  getReturnWindow: async () => {
    const response = await api.get("/settings/return-window");

    return response.data?.days || response?.days || 7;
  },

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
