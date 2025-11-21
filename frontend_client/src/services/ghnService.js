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
    const apiResp = unwrap(resp);
    const rawProvinces = apiResp?.data ?? apiResp ?? [];

    return (rawProvinces || []).map((province) => ({
      provinceId:
        province.provinceId ?? province.ProvinceID ?? province.id,
      provinceName:
        province.provinceName ?? province.ProvinceName ?? province.name,
      code: province.code ?? province.Code,
    }));
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
    const apiResp = unwrap(resp);
    const rawDistricts = apiResp?.data ?? apiResp ?? [];

    return (rawDistricts || []).map((district) => ({
      districtId:
        district.districtId ?? district.DistrictID ?? district.id,
      provinceId:
        district.provinceId ?? district.ProvinceID,
      districtName:
        district.districtName ?? district.DistrictName ?? district.name,
      code: district.code ?? district.Code,
    }));
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
    const apiResp = unwrap(resp);
    const rawWards = apiResp?.data ?? apiResp ?? [];

    return (rawWards || []).map((ward) => ({
      wardCode: ward.wardCode ?? ward.WardCode ?? ward.code,
      districtId: ward.districtId ?? ward.DistrictID,
      wardName: ward.wardName ?? ward.WardName ?? ward.name,
    }));
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
    const payload = {
      from_district_id: request.from_district_id ?? request.fromDistrictId,
      to_district_id: request.to_district_id ?? request.toDistrictId,
      to_ward_code: request.to_ward_code ?? request.toWardCode,
      weight: request.weight,
      length: request.length,
      width: request.width,
      height: request.height,
      cod_amount: request.cod_amount ?? request.codAmount,
      service_id: request.service_id ?? request.serviceId,
      insurance_value: request.insurance_value ?? request.insuranceValue,
    };
    const resp = await api.post(API_ENDPOINTS.GHN.CALCULATE_FEE, payload);
    const apiResp = unwrap(resp);
    return apiResp?.data ?? apiResp;
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
    const apiResp = unwrap(resp);
    const rawServices = apiResp?.data ?? apiResp ?? [];
    return rawServices || [];
  },
};
