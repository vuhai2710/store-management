import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const userService = {
  /**
   * Upload avatar
   * POST /api/v1/users/avatar
   * Content-Type: multipart/form-data
   * @param {File} avatar - Avatar file
   * @returns {Promise<UserDTO>}
   */
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

  /**
   * Update avatar
   * PUT /api/v1/users/avatar
   * Content-Type: multipart/form-data
   * @param {File} avatar - Avatar file
   * @returns {Promise<UserDTO>}
   */
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

  /**
   * Delete avatar
   * DELETE /api/v1/users/avatar
   * @returns {Promise<void>}
   */
  deleteAvatar: async () => {
    const resp = await api.delete(API_ENDPOINTS.USERS.AVATAR);
    return unwrap(resp);
  },

  /**
   * Get my profile
   * GET /api/v1/users/profile
   * @returns {Promise<UserDTO>}
   */
  getMyProfile: async () => {
    const resp = await api.get(API_ENDPOINTS.USERS.PROFILE);
    return unwrap(resp);
  },
};








