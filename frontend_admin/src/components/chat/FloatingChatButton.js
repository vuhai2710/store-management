import React, { useState } from 'react';
import { FloatButton, Badge } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../../constants/roles';
import ChatWindow from './ChatWindow';

const FloatingChatButton = () => {
  const [chatVisible, setChatVisible] = useState(false);
  const user = useSelector((state) => state.auth?.user);
  const userRole = user?.role;

  // Chỉ hiển thị cho ADMIN và EMPLOYEE
  if (!userRole || (userRole !== USER_ROLES.ADMIN && userRole !== USER_ROLES.EMPLOYEE)) {
    return null;
  }

  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
        }}
        onClick={() => setChatVisible(true)}
        tooltip="Chat với khách hàng"
      />
      {chatVisible && (
        <ChatWindow
          visible={chatVisible}
          onClose={() => setChatVisible(false)}
        />
      )}
    </>
  );
};

export default FloatingChatButton;

