import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const categoriesService = {
  getAll: async () => {
    // Ưu tiên /categories/all (trả về mảng)
    try {
      const resp = await api.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
      return unwrap(resp); // -> array
    } catch {
      // Fallback: phân trang rồi lấy content
      const resp = await api.get(API_ENDPOINTS.CATEGORIES.BASE, {
        params: { pageNo: 1, pageSize: 1000, sortBy: "idCategory", sortDirection: "ASC" },
      });
      const data = unwrap(resp);
      return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
    }
  },
};