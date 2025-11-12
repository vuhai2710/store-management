import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => {
  // Backend returns { code, message, data }
  // data can be object or PageResponse
  return resp?.data?.data ?? resp?.data;
};

export const chatService = {
  // Get all conversations (Admin/Employee)
  getAllConversations: async ({ pageNo = 1, pageSize = 20 } = {}) => {
    const params = { pageNo, pageSize };
    const resp = await api.get(API_ENDPOINTS.CHAT.CONVERSATIONS, { params });
    return unwrap(resp);
  },

  // Get conversation by ID
  getConversationById: async (conversationId) => {
    const resp = await api.get(API_ENDPOINTS.CHAT.CONVERSATION_BY_ID(conversationId));
    return unwrap(resp);
  },

  // Get conversation messages
  getConversationMessages: async (conversationId, { pageNo = 1, pageSize = 50 } = {}) => {
    const params = { pageNo, pageSize };
    const resp = await api.get(API_ENDPOINTS.CHAT.CONVERSATION_MESSAGES(conversationId), { params });
    return unwrap(resp);
  },

  // Close conversation
  closeConversation: async (conversationId) => {
    const resp = await api.put(API_ENDPOINTS.CHAT.CLOSE_CONVERSATION(conversationId));
    return unwrap(resp);
  },
};

