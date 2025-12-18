import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data ?? resp;

export const chatService = {

  createConversation: async () => {
    try {
      const response = await api.post(API_ENDPOINTS.CHAT.CONVERSATIONS);
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  getMyConversation: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CHAT.MY_CONVERSATION);
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  getConversationMessages: async (
    conversationId,
    { pageNo = 1, pageSize = 50 } = {}
  ) => {
    try {
      const params = { pageNo, pageSize };
      const response = await api.get(
        API_ENDPOINTS.CHAT.CONVERSATION_MESSAGES(conversationId),
        { params }
      );
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  closeConversation: async (conversationId) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.CHAT.CLOSE_CONVERSATION(conversationId)
      );
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  markConversationAsViewed: async (conversationId) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.CHAT.MARK_VIEWED(conversationId)
      );
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },
};
