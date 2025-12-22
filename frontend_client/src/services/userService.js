import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const userService = {

  uploadAvatar: async (avatar) => {
    const formData = new FormData();
    formData.append('avatar', avatar);
    const resp = await api.post(API_ENDPOINTS.USERS.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrap(resp);
  },

  updateAvatar: async (avatar) => {
    const formData = new FormData();
    formData.append('avatar', avatar);
    const resp = await api.put(API_ENDPOINTS.USERS.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrap(resp);
  },

  deleteAvatar: async () => {
    const resp = await api.delete(API_ENDPOINTS.USERS.AVATAR);
    return unwrap(resp);
  },

  getMyProfile: async () => {
    const resp = await api.get(API_ENDPOINTS.USERS.PROFILE);
    return unwrap(resp);
  },
};


