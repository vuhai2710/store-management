import api from "./api";
import { API_ENDPOINTS } from "../constants";
import { handleApiError } from "../utils/apiHelper";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;
const normalizePage = (p) => {
  const n = Number(p);
  return Number.isFinite(n) && n >= 1 ? n : 1;
};

export const usersService = {
  getAllUsers: async (pageNo = 1, pageSize = 10, sortBy = "idUser", sortDirection = "ASC") => {
    try {
      const params = { pageNo: normalizePage(pageNo), pageSize, sortBy, sortDirection };
      console.info("Calling getAllUsers with params:", params);
      const res = await api.get(API_ENDPOINTS.USERS.BASE, { params });
      const data = unwrap(res);
      console.info("API Response getAllUsers:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getUsersByStatus: async (isActive, pageNo = 1, pageSize = 10, sortBy = "idUser", sortDirection = "ASC") => {
    try {
      const params = { isActive, pageNo: normalizePage(pageNo), pageSize, sortBy, sortDirection };
      console.info("Calling getUsersByStatus with params:", params);
      const res = await api.get(API_ENDPOINTS.USERS.STATUS, { params });
      const data = unwrap(res);
      console.info("API Response getUsersByStatus:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getUserById: async (id) => {
    try {
      console.info("Calling getUserById:", { id });
      const res = await api.get(API_ENDPOINTS.USERS.BY_ID(id));
      const data = unwrap(res);
      console.info("API Response getUserById:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateUser: async (id, userData) => {
    try {
      console.info("Calling updateUser:", { id, userData });
      const res = await api.put(API_ENDPOINTS.USERS.BY_ID(id), userData);
      const data = unwrap(res);
      console.info("API Response updateUser:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deactivateUser: async (id) => {
    try {
      console.info("Calling deactivateUser:", { id });
      const res = await api.patch(API_ENDPOINTS.USERS.DEACTIVATE(id));
      const data = unwrap(res);
      console.info("API Response deactivateUser:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  activateUser: async (id) => {
    try {
      console.info("Calling activateUser:", { id });
      const res = await api.patch(API_ENDPOINTS.USERS.ACTIVATE(id));
      const data = unwrap(res);
      console.info("API Response activateUser:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  changeUserRole: async (id, role) => {
    try {
      console.info("Calling changeUserRole:", { id, role });
      const res = await api.patch(API_ENDPOINTS.USERS.CHANGE_ROLE(id), null, { params: { role } });
      const data = unwrap(res);
      console.info("API Response changeUserRole:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteUser: async (id) => {
    try {
      console.info("Calling deleteUser:", { id });
      const res = await api.delete(API_ENDPOINTS.USERS.BY_ID(id));
      const data = unwrap(res);
      console.info("API Response deleteUser:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getMyProfile: async () => {
    try {
      console.info("Calling getMyProfile");
      const res = await api.get(API_ENDPOINTS.USERS.PROFILE);
      const data = unwrap(res);
      console.info("API Response getMyProfile:", data);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
