import { useState, useCallback } from "react";
import api from "../services/api";

export const useAdminReturnService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getReturns = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await api.get("/order-returns", { params });
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

  const approveReturn = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await api.put(`/order-returns/${id}/approve`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve return");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectReturn = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await api.put(`/order-returns/${id}/reject`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject return");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeReturn = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await api.put(`/order-returns/${id}/complete`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete return");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReturnStatus = useCallback(async (id, status, data = {}) => {
    setLoading(true);
    try {
      let response;
      switch (status) {
        case "APPROVED":
          response = await api.put(`/order-returns/${id}/approve`, data);
          break;
        case "REJECTED":
          response = await api.put(`/order-returns/${id}/reject`, data);
          break;
        case "COMPLETED":
          response = await api.put(`/order-returns/${id}/complete`, data);
          break;
        default:
          throw new Error("Invalid status");
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update return status");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getReturns,
    getReturnDetail,
    approveReturn,
    rejectReturn,
    completeReturn,
    updateReturnStatus,
  };
};
