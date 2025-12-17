import { useState, useCallback } from "react";
import api from "../services/api";

export const useReturnService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestReturn = useCallback(async (orderId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        `/order-returns/orders/${orderId}/return`,
        data
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request return");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestExchange = useCallback(async (orderId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        `/order-returns/orders/${orderId}/exchange`,
        data
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request exchange");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyReturns = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/order-returns/my-returns", { params });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch returns");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReturnDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/order-returns/${id}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch return detail");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const hasActiveReturnRequest = useCallback(async (orderId) => {
    try {
      const response = await api.get(
        `/order-returns/orders/${orderId}/has-active`
      );
      return response.data || response;
    } catch (err) {
      console.error("Failed to check active return request:", err);
      return false;
    }
  }, []);

  const getReturnPeriodDays = useCallback(async () => {
    try {
      const response = await api.get("/order-returns/config");
      return response.data?.allowedDays || response?.allowedDays || 7;
    } catch (err) {
      console.error("Failed to get return period days:", err);
      return 7;
    }
  }, []);

  const getReturnRequestByOrderId = useCallback(async (orderId) => {
    try {

      const response = await api.get("/order-returns/my-returns", {
        params: { pageNo: 1, pageSize: 100 },
      });
      const returns = response.data?.content || response?.content || [];
      const returnRequest = returns.find(
        (r) => r.orderId === orderId || r.order?.idOrder === orderId
      );
      return {
        hasReturn: !!returnRequest,
        returnRequest: returnRequest || null,
      };
    } catch (err) {
      console.error("Failed to get return request by order ID:", err);
      return { hasReturn: false, returnRequest: null };
    }
  }, []);

  return {
    loading,
    error,
    requestReturn,
    requestExchange,
    getMyReturns,
    getReturnDetail,
    hasActiveReturnRequest,
    getReturnPeriodDays,
    getReturnRequestByOrderId,
  };
};
