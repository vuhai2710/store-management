// src/components/chat/ChatWidget.js (Admin version)
import React, { useState, useEffect, useRef } from "react";
import { MessageOutlined, CloseOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import ChatWindow from "./ChatWindow";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { authService } from "../../services/authService";
import { chatService } from "../../services/chatService";

const ChatWidget = () => {
  const [visible, setVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = useRef(null);
  const [conversations, setConversations] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const WS_URL = API_BASE_URL + "/ws";

  useEffect(() => {
    loadConversations();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const loadConversations = async () => {
    try {
      const response = await chatService.getAllConversations({
        pageNo: 1,
        pageSize: 100,
      });
      const convs = response?.content || [];
      setConversations(convs);

      // Calculate total unread count from all conversations
      const unread = convs.reduce((sum, conv) => {
        return sum + (conv.unreadCount || 0);
      }, 0);
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const connectWebSocket = () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (str) => console.log("[Admin ChatWidget WS]", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log("[Admin ChatWidget] WebSocket connected");

          // Subscribe to all conversations (admin can receive from any conversation)
          client.subscribe("/user/queue/chat", (message) => {
            try {
              const messageData = JSON.parse(message.body);

              // If message is from CUSTOMER and widget is closed, increment unread
              if (messageData.senderType === "CUSTOMER" && !visible) {
                setUnreadCount((prev) => prev + 1);

                // Update conversations list to increment unread for this conversation
                setConversations((prev) =>
                  prev.map((conv) =>
                    conv.idConversation === messageData.conversationId
                      ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                      : conv
                  )
                );
              }
            } catch (error) {
              console.error("Error parsing message:", error);
            }
          });
        },
        onStompError: (frame) => {
          console.error("[Admin ChatWidget] STOMP error:", frame);
        },
      });

      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error("[Admin ChatWidget] Error connecting WebSocket:", error);
    }
  };

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (error) {
        console.error("Error disconnecting WebSocket:", error);
      } finally {
        stompClientRef.current = null;
      }
    }
  };

  const handleOpen = () => {
    setVisible(true);
    setUnreadCount(0); // Reset unread count when opening
    // Reload conversations to get latest unread counts
    loadConversations();
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      {/* Chat Button (Bottom Right) */}
      {!visible && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}>
          <Badge count={unreadCount} offset={[-5, 5]}>
            <button
              onClick={handleOpen}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(24, 144, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(24, 144, 255, 0.4)";
              }}>
              <MessageOutlined />
            </button>
          </Badge>
        </div>
      )}

      {/* Chat Window */}
      {visible && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: Math.min(600, window.innerWidth - 40),
            height: "calc(100vh - 100px)",
            maxHeight: "700px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
          {/* Header */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#1890ff",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "8px 8px 0 0",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageOutlined style={{ fontSize: "20px" }} />
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                Chat với khách hàng
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "18px",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}>
              <CloseOutlined />
            </button>
          </div>

          {/* Chat Window Content */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ChatWindow visible={true} onClose={handleClose} isWidget={true} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
