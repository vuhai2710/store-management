// src/components/chat/ChatWidget.js
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WS_URL = API_BASE_URL.replace('http', 'ws') + '/ws';

const ChatWidget = () => {
  const { isAuthenticated, user, customer } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const conversationIdRef = useRef(null);
  const stompClientRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Initialize conversation when authenticated and widget is opened
  useEffect(() => {
    if (isAuthenticated && isOpen && !conversation) {
      initializeConversation();
    }
  }, [isAuthenticated, isOpen]);

  // Cleanup when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectWebSocket();
      setConversation(null);
      setMessages([]);
      setNewMessage('');
      setError('');
      setIsOpen(false);
      setIsMinimized(false);
    }
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stompClientRef.current) {
        try {
          stompClientRef.current.deactivate();
        } catch (error) {
          console.error('Error disconnecting WebSocket on unmount:', error);
        } finally {
          stompClientRef.current = null;
        }
      }
    };
  }, []);

  // Initialize conversation
  const initializeConversation = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Disconnect existing WebSocket if any
      disconnectWebSocket();
      
      // Get or create conversation
      const conversationData = await chatService.getMyConversation();
      setConversation(conversationData);
      const convId = conversationData.idConversation || conversationData.id;
      conversationIdRef.current = convId;
      
      // Load messages
      if (convId) {
        await loadMessages(convId);
        // Connect to WebSocket
        connectWebSocket(convId);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setError('Không thể khởi tạo chat. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Load messages
  const loadMessages = async (conversationId) => {
    try {
      const messagesData = await chatService.getConversationMessages(conversationId, {
        pageNo: 1,
        pageSize: 50,
      });
      setMessages(messagesData?.content || messagesData || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
    }
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (error) {
        console.error('Error disconnecting WebSocket:', error);
      } finally {
        stompClientRef.current = null;
        setConnected(false);
      }
    }
  };

  // Connect to WebSocket
  const connectWebSocket = (conversationId) => {
    try {
      // Get token
      const token = authService.getToken();
      if (!token) {
        console.error('No token found for WebSocket connection');
        setError('Vui lòng đăng nhập để sử dụng chat.');
        return;
      }

      // Create SockJS connection with token in query parameter
      // Backend supports token via query parameter or STOMP header
      const socket = new SockJS(`${WS_URL}?token=${encodeURIComponent(token)}`);
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // Also send token in STOMP connect headers as fallback
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        onConnect: (frame) => {
          console.log('WebSocket connected', frame);
          setConnected(true);
          setError('');
          
          // Subscribe to conversation messages
          client.subscribe(`/topic/chat.${conversationId}`, (message) => {
            try {
              const messageData = JSON.parse(message.body);
              setMessages(prev => {
                // Check if message already exists to avoid duplicates
                const exists = prev.some(m => m.idMessage === messageData.idMessage);
                if (exists) return prev;
                return [...prev, messageData];
              });
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          setConnected(false);
          setError('Lỗi kết nối chat. Vui lòng thử lại.');
        },
        onWebSocketClose: () => {
          console.log('WebSocket closed');
          setConnected(false);
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          setConnected(false);
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          setError('Không thể kết nối chat. Vui lòng thử lại sau.');
        },
      });

      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setError('Không thể kết nối chat. Vui lòng thử lại sau.');
    }
  };


  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !stompClientRef.current || !connected) {
      return;
    }

    if (!conversationIdRef.current) {
      setError('Chưa khởi tạo conversation. Vui lòng thử lại.');
      return;
    }

    try {
      // Backend expects senderId to be idUser (from JWT token), not idCustomer
      // CustomerDTO contains idUser field
      const userId = user?.idUser || customer?.idUser || user?.id || customer?.id;
      if (!userId) {
        setError('Không thể xác định người dùng. Vui lòng đăng nhập lại.');
        return;
      }
      
      const messageData = {
        conversationId: conversationIdRef.current,
        senderId: userId,
        senderType: 'CUSTOMER',
        message: newMessage.trim(),
      };

      // Send message via WebSocket
      stompClientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageData),
      });

      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  // Toggle widget
  const toggleWidget = () => {
    if (isOpen) {
      // Close widget: disconnect WebSocket and reset state
      disconnectWebSocket();
      setConversation(null);
      setMessages([]);
      setNewMessage('');
      setError('');
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      // Open widget: will initialize conversation via useEffect
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
          }}
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Widget (Bottom Right) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: isMinimized ? '300px' : '380px',
            height: isMinimized ? '60px' : '600px',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #dee2e6',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            transition: 'all 0.3s'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '0.5rem 0.5rem 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={toggleMinimize}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={20} />
              <span style={{ fontWeight: '600', fontSize: '1rem' }}>Chat với Admin</span>
              {connected && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#28a745',
                    marginLeft: '0.5rem'
                  }}
                  title="Đã kết nối"
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimize();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWidget();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  backgroundColor: '#f8f9fa'
                }}
              >
                {loading && (
                  <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                    Đang tải tin nhắn...
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f8d7da',
                      color: '#721c24',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {error}
                  </div>
                )}

                {messages.length === 0 && !loading && (
                  <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                    <p>Chưa có tin nhắn nào.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      Hãy gửi tin nhắn để bắt đầu chat với admin!
                    </p>
                  </div>
                )}

                {messages.map((message, index) => {
                  const isCustomer = message.senderType === 'CUSTOMER';
                  // Backend uses idUser (from JWT) as senderId, not idCustomer
                  const userId = user?.idUser || customer?.idUser || user?.id || customer?.id;
                  const isMyMessage = isCustomer && (message.senderId === userId);

                  return (
                    <div
                      key={message.idMessage || index}
                      style={{
                        display: 'flex',
                        justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          backgroundColor: isMyMessage ? '#007bff' : 'white',
                          color: isMyMessage ? 'white' : '#495057',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '600' }}>
                          {message.senderName || (isMyMessage ? 'Bạn' : 'Admin')}
                        </div>
                        <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                          {message.message}
                        </div>
                        {message.createdAt && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              opacity: 0.7,
                              marginTop: '0.25rem'
                            }}
                          >
                            {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                style={{
                  padding: '1rem',
                  borderTop: '1px solid #dee2e6',
                  display: 'flex',
                  gap: '0.5rem'
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={!connected}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!connected || !newMessage.trim()}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: connected && newMessage.trim() ? '#007bff' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: connected && newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: connected && newMessage.trim() ? 1 : 0.6
                  }}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

