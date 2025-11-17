import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const ghnService = {
  /**
   * Get provinces
   * GET /api/v1/ghn/provinces
   * @returns {Promise<GHNProvinceDTO[]>}
   */
  getProvinces: async () => {
    const resp = await api.get(API_ENDPOINTS.GHN.PROVINCES);
    return unwrap(resp);
  },

  /**
   * Get districts by province
   * GET /api/v1/ghn/districts?provinceId={provinceId}
   * @param {number} provinceId - Province ID
   * @returns {Promise<GHNDistrictDTO[]>}
   */
  getDistricts: async (provinceId) => {
    const params = { provinceId };
    const resp = await api.get(API_ENDPOINTS.GHN.DISTRICTS, { params });
    return unwrap(resp);
  },

  /**
   * Get wards by district
   * GET /api/v1/ghn/wards?districtId={districtId}
   * @param {number} districtId - District ID
   * @returns {Promise<GHNWardDTO[]>}
   */
  getWards: async (districtId) => {
    const params = { districtId };
    const resp = await api.get(API_ENDPOINTS.GHN.WARDS, { params });
    return unwrap(resp);
  },

  /**
   * Calculate shipping fee
   * POST /api/v1/ghn/calculate-fee
   * @param {Object} request - Calculate fee request
   * @param {number} request.fromDistrictId - From district ID
   * @param {number} request.toDistrictId - To district ID
   * @param {number} request.toWardCode - To ward code
   * @param {number} request.weight - Weight (grams)
   * @param {number} request.length - Length (cm)
   * @param {number} request.width - Width (cm)
   * @param {number} request.height - Height (cm)
   * @param {number} request.codAmount - COD amount (VND)
   * @param {number} request.serviceId - Service ID (optional)
   * @returns {Promise<GHNCalculateFeeResponseDTO>}
   */
  calculateShippingFee: async (request) => {
    const resp = await api.post(API_ENDPOINTS.GHN.CALCULATE_FEE, request);
    return unwrap(resp);
  },

  /**
   * Get shipping services
   * GET /api/v1/ghn/services?fromDistrictId={fromDistrictId}&toDistrictId={toDistrictId}
   * @param {number} fromDistrictId - From district ID
   * @param {number} toDistrictId - To district ID
   * @returns {Promise<GHNServiceDTO[]>}
   */
  getShippingServices: async (fromDistrictId, toDistrictId) => {
    const params = { fromDistrictId, toDistrictId };
    const resp = await api.get(API_ENDPOINTS.GHN.SERVICES, { params });
    return unwrap(resp);
  },
};
