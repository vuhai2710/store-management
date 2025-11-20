import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

/**
 * Shipment Service
 * Handles all shipment-related API calls
 * Backend API: /api/v1/shipments
 */
export const shipmentService = {
  /**
   * Get shipment by ID
   * GET /api/v1/shipments/{id}
   * @param {number} id - Shipment ID
   * @returns {Promise<ShipmentDTO>}
   */
  getShipmentById: async (id) => {
    const response = await api.get(API_ENDPOINTS.SHIPMENTS.BY_ID(id));
    return unwrap(response);
  },

  /**
   * Get shipment by order ID
   * GET /api/v1/shipments/order/{orderId}
   * @param {number} orderId - Order ID
   * @returns {Promise<ShipmentDTO>}
   */
  getShipmentByOrderId: async (orderId) => {
    const response = await api.get(API_ENDPOINTS.SHIPMENTS.BY_ORDER_ID(orderId));
    return unwrap(response);
  },

  /**
   * Track shipment
   * GET /api/v1/shipments/{id}/track
   * @param {number} id - Shipment ID
   * @returns {Promise<GHNTrackingDTO>}
   */
  trackShipment: async (id) => {
    const response = await api.get(API_ENDPOINTS.SHIPMENTS.TRACK(id));
    return unwrap(response);
  },

  /**
   * Sync shipment with GHN
   * POST /api/v1/shipments/{id}/sync-ghn
   * @param {number} id - Shipment ID
   * @returns {Promise<ShipmentDTO>}
   */
  syncWithGHN: async (id) => {
    const response = await api.post(API_ENDPOINTS.SHIPMENTS.SYNC_GHN(id));
    return unwrap(response);
  },
};


