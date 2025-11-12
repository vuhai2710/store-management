import React, { useEffect, useState, useRef } from 'react';
import { Drawer, List, Input, Button, Space, Avatar, Typography, Spin, Empty, Tag, Badge } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { chatService } from '../../services/chatService';
import { message } from 'antd';

const { Text } = Typography;

const ChatWindow = ({ visible, onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.idConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAllConversations({ pageNo: 1, pageSize: 50 });
      setConversations(response?.content || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      message.error('Không thể tải danh sách cuộc hội thoại');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await chatService.getConversationMessages(conversationId, {
        pageNo: 1,
        pageSize: 100,
      });
      setMessages(response?.content || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      message.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      // TODO: Implement WebSocket send message
      // For now, just show a message
      message.info('Tính năng gửi tin nhắn realtime đang được phát triển. Vui lòng sử dụng WebSocket.');
      setMessageText('');
    } catch (error) {
      message.error('Gửi tin nhắn thất bại');
    } finally {
      setSending(false);
    }
  };

  return (
    <Drawer
      title="Chat với khách hàng"
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
      closable={true}
    >
      <div style={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
        {/* Conversations List */}
        <div style={{ width: '250px', borderRight: '1px solid #f0f0f0', paddingRight: '16px' }}>
          <div style={{ marginBottom: '16px', fontWeight: 'bold' }}>Cuộc hội thoại</div>
          {loading && conversations.length === 0 ? (
            <Spin />
          ) : conversations.length === 0 ? (
            <Empty description="Chưa có cuộc hội thoại nào" />
          ) : (
            <List
              dataSource={conversations}
              renderItem={(conversation) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedConversation?.idConversation === conversation.idConversation ? '#e6f7ff' : 'transparent',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>{conversation.customerName}</Text>
                        {conversation.unreadCount > 0 && (
                          <Badge count={conversation.unreadCount} />
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <Text ellipsis style={{ fontSize: '12px', color: '#666' }}>
                          {conversation.lastMessage || 'Chưa có tin nhắn'}
                        </Text>
                        <div>
                          <Tag color={conversation.status === 'OPEN' ? 'green' : 'default'} size="small">
                            {conversation.status === 'OPEN' ? 'Mở' : 'Đóng'}
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '16px' }}>
          {selectedConversation ? (
            <>
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>{selectedConversation.customerName}</Text>
                <Tag color={selectedConversation.status === 'OPEN' ? 'green' : 'default'} style={{ marginLeft: '8px' }}>
                  {selectedConversation.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                </Tag>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  marginBottom: '16px',
                }}
              >
                {loading ? (
                  <Spin />
                ) : messages.length === 0 ? (
                  <Empty description="Chưa có tin nhắn nào" />
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.idMessage}
                      style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: msg.senderType === 'CUSTOMER' ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: msg.senderType === 'CUSTOMER' ? '#fff' : '#1890ff',
                          color: msg.senderType === 'CUSTOMER' ? '#000' : '#fff',
                        }}
                      >
                        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                          {msg.senderType === 'CUSTOMER' ? 'Khách hàng' : 'Bạn'}
                        </div>
                        <div>{msg.message}</div>
                        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onPressEnter={handleSendMessage}
                  disabled={sending || selectedConversation.status !== 'OPEN'}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  loading={sending}
                  disabled={!messageText.trim() || selectedConversation.status !== 'OPEN'}
                >
                  Gửi
                </Button>
              </Space.Compact>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Empty description="Chọn một cuộc hội thoại để bắt đầu chat" />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ChatWindow;

