import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const ghnService = {

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

  getShippingServices: async (fromDistrictId, toDistrictId) => {
    const params = { fromDistrictId, toDistrictId };
    const resp = await api.get(API_ENDPOINTS.GHN.SERVICES, { params });
    const apiResp = unwrap(resp);
    const rawServices = apiResp?.data ?? apiResp ?? [];
    return rawServices || [];
  },
};
