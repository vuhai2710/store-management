import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => {

  return resp?.data?.data ?? resp?.data;
};

export const chatService = {

  getAllConversations: async ({ pageNo = 1, pageSize = 20 } = {}) => {
    const params = { pageNo, pageSize };
    const resp = await api.get(API_ENDPOINTS.CHAT.CONVERSATIONS, { params });
    return unwrap(resp);
  },

  getConversationById: async (conversationId) => {
    const resp = await api.get(
      API_ENDPOINTS.CHAT.CONVERSATION_BY_ID(conversationId)
    );
    return unwrap(resp);
  },

  getConversationMessages: async (
    conversationId,
    { pageNo = 1, pageSize = 50 } = {}
  ) => {
    const params = { pageNo, pageSize };
    const resp = await api.get(
      API_ENDPOINTS.CHAT.CONVERSATION_MESSAGES(conversationId),
      { params }
    );
    return unwrap(resp);
  },

  closeConversation: async (conversationId) => {
    const resp = await api.put(
      API_ENDPOINTS.CHAT.CLOSE_CONVERSATION(conversationId)
    );
    return unwrap(resp);
  },

  markConversationAsViewed: async (conversationId) => {
    const resp = await api.put(API_ENDPOINTS.CHAT.MARK_VIEWED(conversationId));
    return unwrap(resp);
  },

  getOrCreateConversationForCustomer: async (customerId) => {
    const resp = await api.post(
      API_ENDPOINTS.CHAT.CREATE_CONVERSATION_FOR_CUSTOMER(customerId)
    );
    return unwrap(resp);
  },
};
