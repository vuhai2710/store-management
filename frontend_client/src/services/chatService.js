import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const chatService = {
  /**
   * Create conversation - Tạo conversation mới
   * POST /api/v1/chat/conversations
   * @returns {Promise<ChatConversationDTO>}
   */
  createConversation: async () => {
    try {
      const response = await api.post(API_ENDPOINTS.CHAT.CONVERSATIONS);
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get my conversation - Lấy conversation của customer
   * GET /api/v1/chat/conversations/my
   * @returns {Promise<ChatConversationDTO>}
   */
  getMyConversation: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CHAT.MY_CONVERSATION);
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get conversation messages - Lấy lịch sử tin nhắn
   * GET /api/v1/chat/conversations/{id}/messages
   * @param {number} conversationId - Conversation ID
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<ChatMessageDTO>>}
   */
  getConversationMessages: async (conversationId, {
    pageNo = 1,
    pageSize = 50,
  } = {}) => {
    try {
      const params = { pageNo, pageSize };
      const response = await api.get(API_ENDPOINTS.CHAT.CONVERSATION_MESSAGES(conversationId), { params });
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Close conversation - Đóng conversation
   * PUT /api/v1/chat/conversations/{id}/close
   * @param {number} conversationId - Conversation ID
   * @returns {Promise<void>}
   */
  closeConversation: async (conversationId) => {
    try {
      const response = await api.put(API_ENDPOINTS.CHAT.CLOSE_CONVERSATION(conversationId));
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },
};




