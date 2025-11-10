# Chat Module - Real-time Chat System

## Tổng quan

Module Real-time Chat cho phép Customer chat trực tiếp với Admin/Employee sử dụng WebSocket + STOMP protocol.

**Công nghệ:**
- Backend: Spring Boot + WebSocket + STOMP
- Protocol: STOMP over WebSocket (với SockJS fallback)
- Frontend: ReactJS + SockJS + Stomp.js

**Phân quyền:**
- **CUSTOMER:** Tạo conversation, gửi và nhận tin nhắn
- **ADMIN, EMPLOYEE:** Xem tất cả conversations, trả lời tin nhắn, đóng conversations

**Base URL:** `/api/v1/chat`

**WebSocket Endpoint:** `/ws`

---

## Architecture

### Message Flow

```
1. Client connects to /ws (WebSocket handshake)
2. Client subscribes to /topic/chat.{conversationId}
3. Client sends message to /app/chat.send
4. Server saves message to database
5. Server broadcasts message to /topic/chat.{conversationId}
6. All subscribers receive message in real-time
```

### CORS Configuration

Backend hỗ trợ 2 frontend ports:
- **Customer Frontend:** http://localhost:3003
- **Admin/Employee Frontend:** http://localhost:3000

---

## REST API Endpoints

### 1. Tạo Conversation (Customer)

**Endpoint:** `POST /api/v1/chat/conversations`

**Authorization:** Bearer Token (CUSTOMER)

**Request:** Không cần body (lấy userId từ JWT token)

**Response:**
```json
{
  "code": 200,
  "message": "Tạo cuộc hội thoại thành công",
  "data": {
    "idConversation": 1,
    "idCustomer": 1,
    "customerName": "Nguyễn Văn A",
    "status": "OPEN",
    "lastMessage": null,
    "lastMessageTime": null,
    "unreadCount": 0,
    "createdAt": "2025-01-11T10:00:00",
    "updatedAt": "2025-01-11T10:00:00"
  }
}
```

---

### 2. Lấy Conversation của Customer

**Endpoint:** `GET /api/v1/chat/conversations/my`

**Authorization:** Bearer Token (CUSTOMER)

**Response:** Giống như endpoint tạo conversation

**Logic:** 
- Nếu đã có conversation OPEN, trả về conversation đó
- Nếu chưa có, tự động tạo mới

---

### 3. Lấy tất cả Conversations (Admin/Employee)

**Endpoint:** `GET /api/v1/chat/conversations`

**Authorization:** Bearer Token (ADMIN, EMPLOYEE)

**Query Parameters:**

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 20 | Số lượng mỗi trang |

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách cuộc hội thoại thành công",
  "data": {
    "content": [
      {
        "idConversation": 1,
        "idCustomer": 1,
        "customerName": "Nguyễn Văn A",
        "status": "OPEN",
        "lastMessage": "Xin chào, tôi cần hỗ trợ",
        "lastMessageTime": "2025-01-11T10:05:00",
        "unreadCount": 0,
        "createdAt": "2025-01-11T10:00:00",
        "updatedAt": "2025-01-11T10:05:00"
      }
    ],
    "pageNo": 1,
    "pageSize": 20,
    "totalElements": 10,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true,
    "hasNext": false,
    "hasPrevious": false,
    "isEmpty": false
  }
}
```

---

### 4. Lấy lịch sử tin nhắn

**Endpoint:** `GET /api/v1/chat/conversations/{id}/messages`

**Authorization:** Bearer Token (CUSTOMER, ADMIN, EMPLOYEE)

**Path Parameters:**
- `id`: ID của conversation

**Query Parameters:**

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 50 | Số lượng mỗi trang |

**Response:**
```json
{
  "code": 200,
  "message": "Lấy lịch sử tin nhắn thành công",
  "data": {
    "content": [
      {
        "idMessage": 1,
        "conversationId": 1,
        "senderId": 1,
        "senderType": "CUSTOMER",
        "senderName": "Nguyễn Văn A",
        "message": "Xin chào, tôi cần hỗ trợ",
        "createdAt": "2025-01-11T10:00:00"
      },
      {
        "idMessage": 2,
        "conversationId": 1,
        "senderId": 2,
        "senderType": "EMPLOYEE",
        "senderName": "Nhân viên Hỗ trợ",
        "message": "Xin chào! Tôi có thể giúp gì cho bạn?",
        "createdAt": "2025-01-11T10:01:00"
      }
    ],
    "pageNo": 1,
    "pageSize": 50,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

---

### 5. Đóng Conversation

**Endpoint:** `PUT /api/v1/chat/conversations/{id}/close`

**Authorization:** Bearer Token (ADMIN, EMPLOYEE)

**Path Parameters:**
- `id`: ID của conversation

**Response:**
```json
{
  "code": 200,
  "message": "Đóng cuộc hội thoại thành công",
  "data": null
}
```

---

## WebSocket Integration

### 1. Connect to WebSocket

**Endpoint:** `ws://localhost:8080/ws`

**Protocol:** STOMP over SockJS

**Authentication:** JWT token (gửi qua query parameter hoặc header)

---

### 2. Subscribe to Conversation

Sau khi connect, subscribe để nhận tin nhắn realtime:

**Destination:** `/topic/chat.{conversationId}`

Ví dụ: `/topic/chat.1`

---

### 3. Send Message

Gửi tin nhắn qua WebSocket:

**Destination:** `/app/chat.send`

**Payload:**
```json
{
  "conversationId": 1,
  "senderId": 1,
  "senderType": "CUSTOMER",
  "message": "Xin chào!"
}
```

**senderType Values:**
- `CUSTOMER`: Khách hàng
- `EMPLOYEE`: Nhân viên
- `ADMIN`: Quản trị viên

---

### 4. Receive Message

Khi có tin nhắn mới, tất cả subscribers của `/topic/chat.{conversationId}` sẽ nhận được:

```json
{
  "idMessage": 3,
  "conversationId": 1,
  "senderId": 1,
  "senderType": "CUSTOMER",
  "senderName": "Nguyễn Văn A",
  "message": "Xin chào!",
  "createdAt": "2025-01-11T10:05:00"
}
```

---

## Frontend Integration (ReactJS)

### Installation

```bash
npm install sockjs-client @stomp/stompjs
```

### Example Implementation

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class ChatService {
  constructor() {
    this.stompClient = null;
    this.conversationId = null;
  }

  // Kết nối WebSocket
  connect(token, conversationId, onMessageReceived) {
    this.conversationId = conversationId;
    
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP:', str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        
        // Subscribe to conversation topic
        this.stompClient.subscribe(
          `/topic/chat.${conversationId}`,
          (message) => {
            const chatMessage = JSON.parse(message.body);
            onMessageReceived(chatMessage);
          }
        );
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });
    
    this.stompClient.activate();
  }

  // Gửi tin nhắn
  sendMessage(senderId, senderType, message) {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = {
        conversationId: this.conversationId,
        senderId: senderId,
        senderType: senderType,
        message: message
      };
      
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(chatMessage)
      });
    }
  }

  // Ngắt kết nối
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}

export default new ChatService();
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import chatService from './services/ChatService';

function ChatComponent({ conversationId, userId, userType, token }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Load lịch sử tin nhắn
    fetch(`http://localhost:8080/api/v1/chat/conversations/${conversationId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setMessages(data.data.content);
    });

    // Kết nối WebSocket
    chatService.connect(token, conversationId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    // Cleanup khi component unmount
    return () => {
      chatService.disconnect();
    };
  }, [conversationId, token]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      chatService.sendMessage(userId, userType, inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.idMessage} className={`message ${msg.senderType}`}>
            <strong>{msg.senderName}:</strong> {msg.message}
            <span className="time">{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={handleSendMessage}>Gửi</button>
      </div>
    </div>
  );
}

export default ChatComponent;
```

---

## Testing với Browser Console

### 1. Connect to WebSocket

```javascript
// Load SockJS và STOMP từ CDN (nếu test trên browser console)
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

// Connect
stompClient.connect({}, function(frame) {
  console.log('Connected:', frame);
  
  // Subscribe
  stompClient.subscribe('/topic/chat.1', function(message) {
    console.log('Received:', JSON.parse(message.body));
  });
});
```

### 2. Send Message

```javascript
stompClient.send('/app/chat.send', {}, JSON.stringify({
  conversationId: 1,
  senderId: 1,
  senderType: 'CUSTOMER',
  message: 'Hello from browser console!'
}));
```

---

## Error Handling

### Common Errors

**401 Unauthorized:**
- Token không hợp lệ hoặc đã hết hạn
- Cần login lại để lấy token mới

**404 Not Found:**
- Conversation không tồn tại
- Kiểm tra lại conversationId

**403 Forbidden:**
- Không có quyền truy cập conversation này
- Customer chỉ được truy cập conversation của mình
- Admin/Employee có thể truy cập tất cả

**WebSocket Connection Failed:**
- Kiểm tra CORS configuration
- Kiểm tra WebSocket endpoint: /ws
- Kiểm tra SockJS fallback có hoạt động không

---

## Database Schema

### chat_conversations

| Column | Type | Description |
|--------|------|-------------|
| id_conversation | INT | Primary key |
| id_customer | INT | Foreign key to customers |
| status | ENUM | OPEN / CLOSED |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật (tự động) |

### chat_messages

| Column | Type | Description |
|--------|------|-------------|
| id_message | INT | Primary key |
| id_conversation | INT | Foreign key to chat_conversations |
| sender_id | INT | ID của user (customer/employee/admin) |
| sender_type | ENUM | CUSTOMER / EMPLOYEE / ADMIN |
| message | TEXT | Nội dung tin nhắn |
| created_at | TIMESTAMP | Thời gian gửi |

---

## Tips và Best Practices

1. **Reconnection:** Implement auto-reconnect khi WebSocket bị disconnect
2. **Heartbeat:** Gửi ping/pong để keep connection alive
3. **Message Queue:** Queue messages nếu connection bị mất, gửi lại khi reconnect
4. **Notification:** Hiển thị notification khi có tin nhắn mới
5. **Typing Indicator:** Có thể thêm feature "đang nhập..." (typing indicator)
6. **Read Receipts:** Có thể thêm feature đánh dấu đã đọc

---

## Liên hệ

Nếu có thắc mắc về Chat Module, vui lòng liên hệ team Backend.








