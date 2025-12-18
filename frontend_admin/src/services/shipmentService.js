import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const shipmentService = {

  getShipmentById: async (id) => {
    const response = await api.get(API_ENDPOINTS.SHIPMENTS.BY_ID(id));
    return unwrap(response);
  },

  getShipmentByOrderId: async (orderId) => {
    const response = await api.get(API_ENDPOINTS.SHIPMENTS.BY_ORDER_ID(orderId));
    return unwrap(response);
  },

  trackShipment: async (id) => {
    const response = await api.get(API_ENDPOINTS.SHIPMENTS.TRACK(id));
    return unwrap(response);
  },

  syncWithGHN: async (id) => {
    const response = await api.post(API_ENDPOINTS.SHIPMENTS.SYNC_GHN(id));
    return unwrap(response);
  },

  createGHNShipmentForOrder: async (orderId) => {
    const response = await api.post(API_ENDPOINTS.SHIPMENTS.CREATE_GHN_FOR_ORDER(orderId));
    return unwrap(response);
  },
};
