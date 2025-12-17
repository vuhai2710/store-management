// src/components/chat/ChatWidget.js
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const WS_URL = API_BASE_URL + "/ws";

const ChatWidget = () => {
  const { isAuthenticated, user, customer } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [supportAgentName, setSupportAgentName] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const conversationIdRef = useRef(null);
  const stompClientRef = useRef(null);
  const connectingRef = useRef(false); // Track if we're currently connecting
  const connectedRef = useRef(false); // Track connection status for closures

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use instant scroll without smooth animation
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  // Track if messages have been loaded in the current widget open session
  const messagesLoadedRef = useRef(false);

  // Reset messagesLoadedRef when widget is closed
  useEffect(() => {
    if (!isOpen) {
      messagesLoadedRef.current = false;
    }
  }, [isOpen]);

  // Initialize conversation when authenticated and widget is opened
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      console.log("[ChatWidget] Widget opened, conversation:", conversation ? "exists" : "null");
      if (!conversation) {
        // No conversation yet, initialize fully
        console.log("[ChatWidget] No conversation, calling initializeConversation");
        initializeConversation();
      } else {
        // Conversation exists from early init, load messages if not already loaded
        const convId = conversation.idConversation || conversation.id;
        console.log("[ChatWidget] Conversation exists, convId:", convId, "messagesLoaded:", messagesLoadedRef.current);

        // Always load messages when widget is opened if we haven't loaded yet in this session
        if (convId && !messagesLoadedRef.current) {
          console.log("[ChatWidget] Loading messages for conversation:", convId);
          messagesLoadedRef.current = true; // Mark as loading to prevent duplicate calls
          loadMessages(convId);
        }

        // Mark conversation as viewed
        chatService
          .markConversationAsViewed(convId)
          .then(() => {
            console.log("[ChatWidget] Conversation marked as viewed");
            setUnreadCount(0); // Reset unread count when viewing
          })
          .catch((err) => {
            console.error("[ChatWidget] Error marking as viewed:", err);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOpen, conversation]);

  // *** KEY FIX: Subscribe to WebSocket immediately when authenticated ***
  // This ensures client can receive messages from admin even before opening the chat widget
  useEffect(() => {
    if (isAuthenticated && customer) {
      // Get or create conversation early to establish WebSocket subscription
      initializeEarlyConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, customer]);

  // Early initialization - just get/create conversation and connect WebSocket
  // Don't load messages until widget is opened
  const initializeEarlyConversation = async () => {
    // Prevent multiple simultaneous connection attempts
    if (connectingRef.current || connectedRef.current) {
      console.log("[ChatWidget] Already connecting or connected, skipping early init");
      return;
    }

    try {
      console.log("[ChatWidget] Early initialization - getting conversation for WebSocket subscription");

      // Get or create conversation
      let conversationData = null;
      try {
        conversationData = await chatService.getMyConversation();
      } catch (err) {
        // Fallback: create conversation if not found
        try {
          conversationData = await chatService.createConversation();
        } catch (createErr) {
          console.error("[ChatWidget] Could not get/create conversation:", createErr);
          return;
        }
      }

      if (conversationData) {
        const convId = conversationData?.idConversation || conversationData?.id;
        conversationIdRef.current = convId;
        setConversation(conversationData);

        // Connect to WebSocket for real-time messages
        // Use refs to check status instead of state (avoids stale closure)
        if (!stompClientRef.current && !connectingRef.current && !connectedRef.current) {
          connectWebSocket(convId);
        }

        console.log("[ChatWidget] Early initialization complete, connected to conversation:", convId);
      }
    } catch (error) {
      console.error("[ChatWidget] Early initialization error:", error);
    }
  };

  // Cleanup when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectWebSocket();
      setConversation(null);
      setMessages([]);
      setNewMessage("");
      setError("");
      setIsOpen(false);
      setIsMinimized(false);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stompClientRef.current) {
        try {
          stompClientRef.current.deactivate();
        } catch (error) {
          console.error("Error disconnecting WebSocket on unmount:", error);
        } finally {
          stompClientRef.current = null;
        }
      }
    };
  }, []);

  // Initialize conversation (when widget is opened)
  const initializeConversation = async () => {
    try {
      setLoading(true);
      setError("");

      // If conversation already exists from early initialization, just load messages
      if (conversation && conversationIdRef.current) {
        const convId = conversation.idConversation || conversation.id;
        await loadMessages(convId);

        // Ensure WebSocket is connected
        if (!stompClientRef.current || !connected) {
          connectWebSocket(convId);
        }

        // Mark conversation as viewed
        chatService
          .markConversationAsViewed(convId)
          .catch((err) =>
            console.error("Error marking conversation as viewed:", err)
          );
        return;
      }

      // Get or create conversation
      let conversationData = null;
      try {
        conversationData = await chatService.getMyConversation();
      } catch (err) {
        // Fallback: create conversation if not found or backend error
        conversationData = await chatService.createConversation();
      }

      setConversation(conversationData);
      const convId = conversationData?.idConversation || conversationData?.id;
      conversationIdRef.current = convId;

      // Load messages
      if (convId) {
        await loadMessages(convId);
        // Connect to WebSocket if not already connected
        if (!stompClientRef.current || !connected) {
          connectWebSocket(convId);
        }
        // Mark conversation as viewed
        chatService
          .markConversationAsViewed(convId)
          .catch((err) =>
            console.error("Error marking conversation as viewed:", err)
          );
      }
    } catch (error) {
      console.error("Error initializing conversation:", error);
      setError("Không thể khởi tạo chat. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse dd/MM/yyyy HH:mm:ss format
  const parseVietnameseDate = (dateString) => {
    if (!dateString) return null;
    try {
      // Format: "13/11/2025 19:25:46"
      const parts = dateString.split(" ");
      if (parts.length !== 2) return null;

      const [datePart, timePart] = parts;
      const [day, month, year] = datePart.split("/");
      const [hours, minutes, seconds] = timePart.split(":");

      return new Date(year, month - 1, day, hours, minutes, seconds);
    } catch (e) {
      return null;
    }
  };

  // Load messages
  const loadMessages = async (conversationId) => {
    try {
      const messagesData = await chatService.getConversationMessages(
        conversationId,
        {
          pageNo: 1,
          pageSize: 200, // Load more messages to ensure full chat history is available
        }
      );
      const msgs = messagesData?.content || [];
      setMessages(msgs);

      // Find the most recent employee/admin message to get support agent name
      const supportMsg = [...msgs]
        .reverse()
        .find((m) => m.senderType === "EMPLOYEE" || m.senderType === "ADMIN");
      if (supportMsg && supportMsg.senderName) {
        setSupportAgentName(supportMsg.senderName);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setError("Không thể tải tin nhắn. Vui lòng thử lại sau.");
    }
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (error) {
        console.error("Error disconnecting WebSocket:", error);
      } finally {
        stompClientRef.current = null;
        connectingRef.current = false;
        connectedRef.current = false;
        setConnected(false);
      }
    }
  };

  // Connect to WebSocket
  const connectWebSocket = (conversationId) => {
    // Prevent duplicate connections
    if (connectingRef.current || connectedRef.current) {
      console.log("[ChatWidget] Already connecting or connected, skipping");
      return;
    }

    try {
      connectingRef.current = true; // Mark as connecting

      // Get token
      const token = authService.getToken();
      if (!token) {
        console.error("No token found for WebSocket connection");
        setError("Vui lòng đăng nhập để sử dụng chat.");
        connectingRef.current = false;
        return;
      }

      console.log("[ChatWidget] Connecting to WebSocket for conversation:", conversationId);

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
          console.log("[ChatWidget] WebSocket connected", frame);
          connectingRef.current = false;
          connectedRef.current = true;
          setConnected(true);
          setError("");

          // Subscribe to conversation messages
          client.subscribe(`/topic/chat.${conversationId}`, (message) => {
            try {
              const messageData = JSON.parse(message.body);
              console.log("[ChatWidget] Received message via WebSocket:", messageData);

              // Update support agent name if message is from EMPLOYEE or ADMIN
              if (
                (messageData.senderType === "EMPLOYEE" ||
                  messageData.senderType === "ADMIN") &&
                messageData.senderName
              ) {
                setSupportAgentName(messageData.senderName);
              }

              // Increment unread count if message is from EMPLOYEE/ADMIN and widget is closed
              const userId = customer?.idUser || user?.idUser;
              if (
                (messageData.senderType === "EMPLOYEE" ||
                  messageData.senderType === "ADMIN") &&
                messageData.senderId !== userId
              ) {
                // Only increment if widget is completely closed (not just minimized)
                setIsOpen((currentIsOpen) => {
                  if (!currentIsOpen) {
                    setUnreadCount((prev) => prev + 1);
                  }
                  return currentIsOpen;
                });
              }

              setMessages((prev) => {
                // Check if message already exists to avoid duplicates
                const exists = prev.some(
                  (m) => m.idMessage === messageData.idMessage
                );
                if (exists) return prev;
                return [...prev, messageData];
              });
            } catch (error) {
              console.error("Error parsing message:", error);
            }
          });
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          connectingRef.current = false;
          connectedRef.current = false;
          setConnected(false);
          setError("Lỗi kết nối chat. Vui lòng thử lại.");
        },
        onWebSocketClose: () => {
          console.log("WebSocket closed");
          connectingRef.current = false;
          connectedRef.current = false;
          setConnected(false);
        },
        onDisconnect: () => {
          console.log("WebSocket disconnected");
          connectingRef.current = false;
          connectedRef.current = false;
          setConnected(false);
        },
        onWebSocketError: (event) => {
          console.error("WebSocket error:", event);
          connectingRef.current = false;
          connectedRef.current = false;
          setError("Không thể kết nối chat. Vui lòng thử lại sau.");
        },
      });

      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      connectingRef.current = false;
      connectedRef.current = false;
      setError("Không thể kết nối chat. Vui lòng thử lại sau.");
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();

    // Use ref for connection check to avoid stale closure
    if (!newMessage.trim()) {
      return;
    }

    if (!stompClientRef.current || !connectedRef.current) {
      console.log("[ChatWidget] Cannot send - not connected", {
        hasClient: !!stompClientRef.current,
        connected: connectedRef.current
      });
      setError("Chưa kết nối. Vui lòng đợi...");
      return;
    }

    if (!conversationIdRef.current) {
      setError("Chưa khởi tạo conversation. Vui lòng thử lại.");
      return;
    }

    try {
      // Backend expects senderId to be idUser (from JWT token), not idCustomer
      // CustomerDTO contains idUser field
      const userId = customer?.idUser || user?.idUser;

      console.log("[ChatWidget] Sending message:", {
        customer,
        user,
        userId,
        conversationId: conversationIdRef.current,
      });

      if (!userId) {
        console.error("[ChatWidget] Cannot determine userId:", {
          customer,
          user,
        });
        setError("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      const messageData = {
        conversationId: conversationIdRef.current,
        senderId: userId,
        senderType: "CUSTOMER",
        message: newMessage.trim(),
      };

      console.log("[ChatWidget] Message data to send:", messageData);

      // Send message via WebSocket
      stompClientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(messageData),
      });

      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  };

  // Toggle widget
  const toggleWidget = () => {
    if (isOpen) {
      // Close widget: keep WebSocket connected to receive realtime messages
      // Only reset UI state, don't disconnect or clear conversation
      setMessages([]);
      setNewMessage("");
      setError("");
      setIsOpen(false);
      setIsMinimized(false);
      // Note: Do NOT disconnect WebSocket or clear conversation
      // This allows receiving messages from admin even when widget is closed
    } else {
      // Open widget: will initialize conversation via useEffect
      setIsOpen(true);
      setIsMinimized(false);
      setUnreadCount(0); // Reset unread count when opening
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
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={toggleWidget}
              aria-label="Mở chat hỗ trợ"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#2563EB",
                color: "white",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 123, 255, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(0, 123, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 123, 255, 0.4)";
              }}>
              <MessageCircle size={28} />
            </button>
            {unreadCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  zIndex: 1001,
                }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Widget (Bottom Right) */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: isMinimized ? "300px" : "380px",
            height: isMinimized ? "60px" : "600px",
            maxWidth: "calc(100vw - 2rem)",
            maxHeight: "calc(100vh - 2rem)",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            zIndex: 1001,
            transition: "all 0.3s",
          }}>
          {/* Header */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#2563EB",
              color: "white",
              borderRadius: "0.5rem 0.5rem 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={toggleMinimize}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MessageCircle size={20} />
              <span style={{ fontWeight: "600", fontSize: "1rem" }}>
                Chat với Admin
              </span>
              {connected && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#28a745",
                    marginLeft: "0.5rem",
                  }}
                  title="Đã kết nối"
                />
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimize();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}>
                {isMinimized ? (
                  <Maximize2 size={18} />
                ) : (
                  <Minimize2 size={18} />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWidget();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Chat Header - Hiển thị đang chat với ai */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "#e9ecef",
                  borderBottom: "1px solid #E2E8F0",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#495057",
                }}>
                {supportAgentName ? (
                  <>
                    Đang chat với <strong>{supportAgentName}</strong>
                  </>
                ) : (
                  <>
                    Đang chat với <strong>Hỗ trợ</strong>
                  </>
                )}
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onWheel={(e) => {
                  // Prevent scroll propagation to parent page
                  const container = e.currentTarget;
                  const { scrollTop, scrollHeight, clientHeight } = container;
                  const isAtTop = scrollTop === 0;
                  const isAtBottom =
                    Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

                  // Only allow propagation if scrolling beyond boundaries
                  const scrollingUp = e.deltaY < 0;
                  const scrollingDown = e.deltaY > 0;

                  if (
                    (isAtTop && scrollingUp) ||
                    (isAtBottom && scrollingDown)
                  ) {
                    // Allow propagation when at boundaries
                    return;
                  }

                  // Stop propagation when scrolling within content
                  e.stopPropagation();
                }}
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  backgroundColor: "#F8FAFC",
                  maxHeight: "100%",
                  position: "relative",
                }}>
                {loading && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#6c757d",
                      padding: "2rem",
                    }}>
                    Đang tải tin nhắn...
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      borderRadius: "0.25rem",
                      fontSize: "0.875rem",
                      marginBottom: "0.5rem",
                    }}>
                    {error}
                  </div>
                )}

                {messages.length === 0 && !loading && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#6c757d",
                      padding: "2rem",
                    }}>
                    <p>Chưa có tin nhắn nào.</p>
                    <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                      Hãy gửi tin nhắn để bắt đầu chat với admin!
                    </p>
                  </div>
                )}

                {messages.map((message, index) => {
                  const isCustomer = message.senderType === "CUSTOMER";
                  const userId = customer?.idUser || user?.idUser;
                  const isMyMessage = isCustomer && message.senderId === userId;

                  // Helper function để render nội dung tin nhắn (hỗ trợ link và ảnh)
                  const renderMessageContent = (text) => {
                    // Regex để detect URL
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    // Regex để detect URL ảnh
                    const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

                    const parts = text.split(urlRegex);

                    return parts.map((part, i) => {
                      if (urlRegex.test(part)) {
                        // Nếu là URL ảnh, hiển thị ảnh
                        if (imageRegex.test(part)) {
                          return (
                            <div key={i} style={{ marginTop: "0.5rem" }}>
                              <img
                                src={part}
                                alt="Hình ảnh"
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                  borderRadius: "0.25rem",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(part, "_blank")}
                              />
                            </div>
                          );
                        }
                        // Nếu là link thường, hiển thị link
                        return (
                          <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: isMyMessage ? "#fff" : "#2563EB",
                              textDecoration: "underline",
                              wordBreak: "break-all",
                            }}>
                            {part}
                          </a>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    });
                  };

                  // Format thời gian
                  const formatTime = (dateString) => {
                    if (!dateString) return "";
                    try {
                      const date = new Date(dateString);
                      if (isNaN(date.getTime())) return "";
                      return date.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch (e) {
                      return "";
                    }
                  };

                  return (
                    <div
                      key={message.idMessage || index}
                      style={{
                        display: "flex",
                        justifyContent: isMyMessage ? "flex-end" : "flex-start",
                        marginBottom: "0.5rem",
                      }}>
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "0.75rem 1rem",
                          borderRadius: "0.5rem",
                          backgroundColor: isMyMessage ? "#2563EB" : "white",
                          color: isMyMessage ? "white" : "#495057",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            lineHeight: 1.5,
                            wordWrap: "break-word",
                          }}>
                          {renderMessageContent(message.message)}
                        </div>
                        {message.createdAt && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              opacity: 0.7,
                              marginTop: "0.25rem",
                              textAlign: "right",
                            }}>
                            {(() => {
                              try {
                                const date = parseVietnameseDate(
                                  message.createdAt
                                );
                                if (date && !isNaN(date.getTime())) {
                                  return date.toLocaleString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                                }
                                return "";
                              } catch (e) {
                                return "";
                              }
                            })()}
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
                  padding: "1rem",
                  borderTop: "1px solid #E2E8F0",
                  display: "flex",
                  gap: "0.5rem",
                }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                  aria-label="Nội dung tin nhắn"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    backgroundColor: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="submit"
                  disabled={!connected || !newMessage.trim()}
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor:
                      connected && newMessage.trim() ? "#2563EB" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor:
                      connected && newMessage.trim()
                        ? "pointer"
                        : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: connected && newMessage.trim() ? 1 : 0.6,
                  }}
                  aria-label="Gửi tin nhắn">
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
