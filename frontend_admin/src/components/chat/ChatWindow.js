import React, { useEffect, useState, useRef } from "react";
import {
  Drawer,
  List,
  Input,
  Button,
  Space,
  Avatar,
  Typography,
  Spin,
  Empty,
  Tag,
  Badge,
} from "antd";
import { SendOutlined, UserOutlined, DownOutlined } from "@ant-design/icons";
import { chatService } from "../../services/chatService";
import { message } from "antd";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { authService } from "../../services/authService";

const { Text } = Typography;

const ChatWindow = ({ visible, onClose, isWidget = false }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const conversationsContainerRef = useRef(null);
  const lastConversationIdRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const WS_URL = API_BASE_URL + "/ws";

  useEffect(() => {
    if (visible) {
      loadConversations();
      ensureWebSocketConnected();
    } else {
      // Unsubscribe when closing drawer but keep connection for quick reopen
      unsubscribeFromConversation();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.idConversation);
      subscribeToConversation(selectedConversation.idConversation);

      // Clear unread count for this conversation immediately in UI
      setConversations((prev) =>
        prev.map((conv) =>
          conv.idConversation === selectedConversation.idConversation
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );

      // Mark conversation as viewed via API
      chatService
        .markConversationAsViewed(selectedConversation.idConversation)
        .then(() => {
          // Reload conversations after a short delay to get updated unread counts from backend
          setTimeout(() => {
            loadConversations();
          }, 1000);
        })
        .catch((err) => {
          console.error("Error marking conversation as viewed:", err);
        });
    } else {
      unsubscribeFromConversation();
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      try {
        unsubscribeFromConversation();
        if (stompClientRef.current) {
          stompClientRef.current.deactivate();
        }
      } catch (e) {
        // no-op
      } finally {
        stompClientRef.current = null;
        subscriptionRef.current = null;
      }
    };
  }, []);

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const response = await chatService.getAllConversations({
        pageNo: 1,
        pageSize: 50,
      });
      setConversations(response?.content || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      message.error("Không thể tải danh sách cuộc hội thoại");
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await chatService.getConversationMessages(
        conversationId,
        {
          pageNo: 1,
          pageSize: 100,
        }
      );
      setMessages(response?.content || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      message.error("Không thể tải tin nhắn");
    } finally {
      setMessagesLoading(false);
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use instant scroll without smooth animation to avoid interruption
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
    setIsAtBottom(true);
    setHasNewMessages(false);
  };

  // Auto scroll similar to client chat: scroll to bottom whenever messages change
  useEffect(() => {
    if (!selectedConversation || messages.length === 0) {
      return;
    }

    // Small delay to ensure DOM is updated before scrolling
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);

    return () => clearTimeout(timer);
  }, [messages, selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      if (!stompClientRef.current || !connected) {
        message.error("Chưa kết nối chat realtime");
        return;
      }

      const user = authService.getUserFromStorage?.() || null;
      const userId = user?.idUser;

      console.log("[ChatWindow] Sending message:", {
        user,
        userId,
        conversationId: selectedConversation.idConversation,
      });

      if (!userId) {
        console.error("[ChatWindow] Cannot determine userId:", { user });
        message.error("Không xác định được người dùng");
        return;
      }

      const senderType =
        Array.isArray(user?.roles) && user.roles.includes("ADMIN")
          ? "ADMIN"
          : "EMPLOYEE";

      const messageData = {
        conversationId: selectedConversation.idConversation,
        senderId: userId,
        senderType,
        message: messageText.trim(),
      };

      console.log("[ChatWindow] Message data to send:", messageData);

      const body = JSON.stringify(messageData);

      stompClientRef.current.publish({
        destination: "/app/chat.send",
        body,
      });

      setMessageText("");
      scrollToBottom();

      // Reload conversations after sending to update unread counts from backend
      setTimeout(() => {
        loadConversations();
      }, 500);
    } catch (error) {
      message.error("Gửi tin nhắn thất bại");
    } finally {
      setSending(false);
    }
  };

  const ensureWebSocketConnected = () => {
    if (stompClientRef.current && connected) return;

    const token = authService.getToken?.();
    if (!token) {
      setConnected(false);
      return;
    }

    // Create SockJS and STOMP client
    const socket = new SockJS(`${WS_URL}?token=${encodeURIComponent(token)}`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        setConnected(true);
        // Resubscribe current conversation after reconnect
        if (selectedConversation?.idConversation) {
          subscribeToConversation(selectedConversation.idConversation);
        }
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onWebSocketError: () => setConnected(false),
    });

    client.activate();
    stompClientRef.current = client;
  };

  const subscribeToConversation = (conversationId) => {
    if (!stompClientRef.current || !connected || !conversationId) return;

    // Clear previous subscription
    unsubscribeFromConversation();

    subscriptionRef.current = stompClientRef.current.subscribe(
      `/topic/chat.${conversationId}`,
      (messageFrame) => {
        try {
          const messageData = JSON.parse(messageFrame.body);

          // Add message to messages list
          setMessages((prev) => {
            const exists = prev.some(
              (m) => m.idMessage === messageData.idMessage
            );
            if (exists) return prev;
            return [...prev, messageData];
          });

          // If message is from CUSTOMER and not in selected conversation, increment unread
          if (messageData.senderType === "CUSTOMER") {
            setConversations((prev) =>
              prev.map((conv) => {
                if (
                  conv.idConversation === conversationId &&
                  selectedConversation?.idConversation !== conversationId
                ) {
                  return { ...conv, unreadCount: (conv.unreadCount || 0) + 1 };
                }
                return conv;
              })
            );
          }
        } catch (e) {
          // ignore
        }
      }
    );
  };

  const unsubscribeFromConversation = () => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (e) {
        // ignore
      } finally {
        subscriptionRef.current = null;
      }
    }
  };

  // Content component (reusable for both Drawer and Widget)
  const chatContent = (
    <div
      onWheelCapture={(e) => {
        // Prevent page scroll when using the wheel on header/footer areas
        const target = e.target;
        if (
          (messagesContainerRef.current &&
            messagesContainerRef.current.contains(target)) ||
          (conversationsContainerRef.current &&
            conversationsContainerRef.current.contains(target))
        ) {
          return;
        }
        e.stopPropagation();
        e.preventDefault();
      }}
      style={{
        display: "flex",
        flexDirection: window.innerWidth < 768 ? "column" : "row",
        height: isWidget ? "100%" : "calc(100vh - 100px)",
      }}>
      {/* Conversations List */}
      <div
        ref={conversationsContainerRef}
        style={{
          width: window.innerWidth < 768 ? "100%" : "200px",
          minWidth: window.innerWidth < 768 ? "unset" : "150px",
          maxHeight: window.innerWidth < 768 ? "200px" : "100%",
          borderRight: window.innerWidth < 768 ? "none" : "1px solid #f0f0f0",
          borderBottom: window.innerWidth < 768 ? "1px solid #f0f0f0" : "none",
          paddingRight: window.innerWidth < 768 ? "0" : "12px",
          paddingBottom: window.innerWidth < 768 ? "12px" : "0",
          marginBottom: window.innerWidth < 768 ? "12px" : "0",
          overflowY: "auto",
        }}>
        <div
          style={{
            marginBottom: "16px",
            fontWeight: "bold",
            fontSize: window.innerWidth < 768 ? "14px" : "16px",
          }}>
          {window.innerWidth < 768 ? "Chat" : "Cuộc hội thoại"}
        </div>
        {conversationsLoading && conversations.length === 0 ? (
          <Spin />
        ) : conversations.length === 0 ? (
          <Empty description="Chưa có cuộc hội thoại nào" />
        ) : (
          <List
            dataSource={conversations}
            renderItem={(conversation) => (
              <List.Item
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedConversation?.idConversation ===
                      conversation.idConversation
                      ? "#e6f7ff"
                      : "transparent",
                  padding: "12px",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedConversation(conversation)}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                      <Text strong>{conversation.customerName}</Text>
                      {conversation.unreadCount > 0 && (
                        <Badge count={conversation.unreadCount} />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        ellipsis
                        style={{ fontSize: "12px", color: "#666" }}>
                        {conversation.lastMessage || "Chưa có tin nhắn"}
                      </Text>
                      <div>
                        <Tag
                          color={
                            conversation.status === "OPEN" ? "green" : "default"
                          }
                          size="small">
                          {conversation.status === "OPEN" ? "Mở" : "Đóng"}
                        </Tag>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: window.innerWidth < 768 ? "0" : "16px",
          minWidth: 0,
        }}>
        {selectedConversation ? (
          <>
            <div
              style={{
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: "1px solid #f0f0f0",
              }}>
              <div style={{ marginBottom: "8px" }}>
                <Text strong style={{ fontSize: "16px" }}>
                  Đang chat với: {selectedConversation.customerName}
                </Text>
              </div>
              <div>
                <Tag
                  color={
                    selectedConversation.status === "OPEN" ? "green" : "default"
                  }>
                  {selectedConversation.status === "OPEN"
                    ? "Đang mở"
                    : "Đã đóng"}
                </Tag>
                {connected ? (
                  <Tag color="green">Đã kết nối</Tag>
                ) : (
                  <Tag color="default">Mất kết nối</Tag>
                )}
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              onWheel={(e) => {
                // Prevent scroll propagation to parent page
                const container = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = container;
                const canScroll = scrollHeight > clientHeight;

                if (!canScroll) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }

                const isAtTop = scrollTop === 0;
                const isAtBottom =
                  Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

                // Only allow propagation if scrolling beyond boundaries
                const scrollingUp = e.deltaY < 0;
                const scrollingDown = e.deltaY > 0;

                if ((isAtTop && scrollingUp) || (isAtBottom && scrollingDown)) {
                  // Allow propagation when at boundaries
                  return;
                }

                // Stop propagation when scrolling within content
                e.stopPropagation();
              }}
              onScroll={(e) => {
                const container = e.currentTarget;
                const distanceFromBottom =
                  container.scrollHeight -
                  container.clientHeight -
                  container.scrollTop;
                const atBottom = distanceFromBottom <= 50;
                setIsAtBottom(atBottom);
                if (atBottom) {
                  setHasNewMessages(false);
                }
              }}
              style={{
                flex: 1,
                overflowY: "auto",
                overscrollBehavior: "contain",
                padding: "16px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                marginBottom: "16px",
                position: "relative",
              }}>
              {messagesLoading ? (
                <Spin />
              ) : messages.length === 0 ? (
                <Empty description="Chưa có tin nhắn nào" />
              ) : (
                messages.map((msg) => {
                  const isCustomer = msg.senderType === "CUSTOMER";

                  // Helper để render nội dung (hỗ trợ link và ảnh)
                  const renderContent = (text) => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
                    const parts = text.split(urlRegex);

                    return parts.map((part, i) => {
                      if (urlRegex.test(part)) {
                        if (imageRegex.test(part)) {
                          return (
                            <div key={i} style={{ marginTop: "4px" }}>
                              <img
                                src={part}
                                alt="Hình ảnh"
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(part, "_blank")}
                              />
                            </div>
                          );
                        }
                        return (
                          <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: isCustomer ? "#1890ff" : "#fff",
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
                      const date = parseVietnameseDate(dateString);
                      if (date && !isNaN(date.getTime())) {
                        return date.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                      return "";
                    } catch (e) {
                      return "";
                    }
                  };

                  return (
                    <div
                      key={msg.idMessage}
                      style={{
                        marginBottom: "16px",
                        display: "flex",
                        justifyContent: isCustomer ? "flex-start" : "flex-end",
                      }}>
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          backgroundColor: isCustomer ? "#fff" : "#1890ff",
                          color: isCustomer ? "#000" : "#fff",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          wordWrap: "break-word",
                        }}>
                        {/* Show sender name for admin/employee messages */}
                        {!isCustomer && msg.senderName && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "bold",
                              opacity: 0.9,
                              marginBottom: "4px",
                            }}>
                            {msg.senderName}{" "}
                            {msg.senderRole && `(${msg.senderRole})`}
                          </div>
                        )}
                        <div style={{ lineHeight: 1.5 }}>
                          {renderContent(msg.message)}
                        </div>
                        {msg.createdAt && (
                          <div
                            style={{
                              fontSize: "10px",
                              opacity: 0.7,
                              marginTop: "4px",
                              textAlign: "right",
                            }}>
                            {(() => {
                              try {
                                const date = parseVietnameseDate(msg.createdAt);
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
                })
              )}
              <div ref={messagesEndRef} />
              {hasNewMessages && !isAtBottom && (
                <Button
                  size="small"
                  shape="circle"
                  type="primary"
                  icon={<DownOutlined />}
                  onClick={scrollToBottom}
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 16,
                    transform: "translateX(-50%)",
                    zIndex: 10,
                  }}
                />
              )}
            </div>

            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Nhập tin nhắn..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onPressEnter={handleSendMessage}
                disabled={sending || selectedConversation.status !== "OPEN"}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={sending}
                disabled={
                  !messageText.trim() || selectedConversation.status !== "OPEN"
                }>
                Gửi
              </Button>
            </Space.Compact>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}>
            <Empty description="Chọn một cuộc hội thoại để bắt đầu chat" />
          </div>
        )}
      </div>
    </div>
  );

  // Return Drawer if not widget mode, otherwise return just the content
  return isWidget ? (
    chatContent
  ) : (
    <Drawer
      title="Chat với khách hàng"
      placement="right"
      width={Math.min(600, window.innerWidth - 40)}
      onClose={onClose}
      open={visible}
      closable={true}>
      {chatContent}
    </Drawer>
  );
};

export default ChatWindow;
