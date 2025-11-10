# Hướng Dẫn Tích Hợp PayOS Payment Gateway

## Mục Lục

1. [Giới thiệu và Setup](#1-giới-thiệu-và-setup)
2. [Sơ đồ luồng xử lý tổng quan](#2-sơ-đồ-luồng-xử-lý-tổng-quan)
3. [Backend Implementation (Spring Boot)](#3-backend-implementation-spring-boot)
4. [Frontend Implementation (ReactJS)](#4-frontend-implementation-reactjs)
5. [Testing và Debugging](#5-testing-và-debugging)
6. [Security Best Practices](#6-security-best-practices)

---

## 1. Giới thiệu và Setup

### 1.1. Giới thiệu PayOS

PayOS là một cổng thanh toán trực tuyến tại Việt Nam, cho phép khách hàng thanh toán qua:
- QR Code từ các ứng dụng ngân hàng
- Chuyển khoản ngân hàng
- Ví điện tử

### 1.2. Đăng ký tài khoản PayOS

1. Truy cập https://my.payos.vn
2. Đăng ký tài khoản mới
3. Xác thực email và hoàn tất đăng ký

### 1.3. Lấy Credentials từ PayOS Dashboard

1. Đăng nhập vào https://my.payos.vn
2. Vào mục **API Keys** hoặc **Cài đặt**
3. Copy các thông tin sau:
   - **Client ID**: ID ứng dụng của bạn
   - **API Key**: Key để authenticate khi gọi PayOS API
   - **Checksum Key**: Key để verify webhook signature (HMAC)

### 1.4. Cấu hình môi trường Local

#### 4.1. Cài đặt ngrok

**Windows:**
```bash
# Download từ https://ngrok.com/download
# Hoặc sử dụng Chocolatey
choco install ngrok
```

**Mac/Linux:**
```bash
# Download từ https://ngrok.com/download
# Hoặc sử dụng Homebrew (Mac)
brew install ngrok
```

#### 4.2. Chạy ngrok để expose backend

```bash
# Chạy ngrok để expose port 8080 (Spring Boot)
ngrok http 8080
```

Ngrok sẽ hiển thị URL như sau:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8080
```

**Copy HTTPS URL** (ví dụ: `https://abc123.ngrok.io`)

#### 4.3. Cập nhật PayOS Webhook URL

1. Vào PayOS dashboard → **Webhook Settings**
2. Cập nhật Webhook URL: `https://abc123.ngrok.io/api/v1/payments/payos/webhook`
3. Lưu cấu hình

#### 4.4. Cập nhật application.yaml

Mở file `src/main/resources/application.yaml` và cập nhật:

```yaml
payos:
  client-id: "YOUR_CLIENT_ID"  # Thay bằng Client ID từ PayOS
  api-key: "YOUR_API_KEY"       # Thay bằng API Key từ PayOS
  checksum-key: "YOUR_CHECKSUM_KEY"  # Thay bằng Checksum Key từ PayOS
  webhook-url: "https://abc123.ngrok.io/api/v1/payments/payos/webhook"  # Ngrok URL
  return-url: "http://localhost:3000/payment/success"  # ReactJS frontend
  cancel-url: "http://localhost:3000/payment/cancel"   # ReactJS frontend
  environment: "sandbox"  # sandbox hoặc production
  base-url: "https://api-merchant.payos.vn"  # PayOS API base URL
```

---

## 2. Sơ đồ luồng xử lý tổng quan

### 2.1. Sequence Diagram

```
User (Frontend)          Backend (Spring Boot)          PayOS
    |                            |                        |
    |-- 1. Create Order -------->|                        |
    |   (paymentMethod: PAYOS)   |                        |
    |                            |                        |
    |<-- 2. Order Created -------|                        |
    |   (orderId)                |                        |
    |                            |                        |
    |-- 3. Create Payment Link ->|                        |
    |   POST /payments/payos/    |                        |
    |   create/{orderId}         |                        |
    |                            |                        |
    |                            |-- 4. Create Payment ->|
    |                            |   Link API Call        |
    |                            |                        |
    |                            |<-- 5. Payment Link ----|
    |                            |   (paymentLinkUrl)     |
    |                            |                        |
    |<-- 6. Payment Link URL ----|                        |
    |                            |                        |
    |-- 7. Redirect to PayOS --->|--------------------->|
    |   (paymentLinkUrl)         |                        |
    |                            |                        |
    |                            |                        |
    |<-- 8. Payment Page --------|<---------------------|
    |                            |                        |
    |-- 9. Complete Payment ---->|--------------------->|
    |                            |                        |
    |                            |<-- 10. Webhook --------|
    |                            |   (Payment Result)     |
    |                            |                        |
    |                            |-- 11. Update Order ---|
    |                            |   (Status, Stock)      |
    |                            |                        |
    |<-- 12. Redirect to --------|<---------------------|
    |   Success/Cancel Page      |                        |
    |                            |                        |
    |-- 13. Check Order Status ->|                        |
    |   (Polling)                |                        |
    |                            |                        |
    |<-- 14. Order Status -------|                        |
```

### 2.2. Các bước chính

1. **User tạo order** với `paymentMethod = PAYOS`
2. **Backend tạo order** với status = PENDING (không trừ stock)
3. **Frontend gọi API** tạo payment link
4. **Backend gọi PayOS API** tạo payment link
5. **Frontend hiển thị** payment link/QR code hoặc redirect
6. **User thanh toán** trên PayOS
7. **PayOS gửi webhook** về backend
8. **Backend cập nhật** order status và trừ stock
9. **PayOS redirect** về frontend
10. **Frontend hiển thị** kết quả

---

## 3. Backend Implementation (Spring Boot)

### 3.1. Sơ đồ luồng xử lý Backend chi tiết

#### 3.1.1. Tạo Order với PayOS

**Flow:**
```
User Request → OrderController.checkout() → OrderService.createOrderFromCart()
```

**Logic:**
1. User gọi `POST /api/v1/orders/checkout` với `paymentMethod: "PAYOS"`
2. OrderService tạo order với:
   - `status = PENDING`
   - `paymentMethod = PAYOS`
   - **KHÔNG trừ stock** (chờ thanh toán thành công)
   - **KHÔNG tạo inventory transaction** (chờ webhook)
3. Trả về `orderId`

**Code Example:**
```java
// OrderServiceImpl.java
if (request.getPaymentMethod() != Order.PaymentMethod.PAYOS) {
    // Trừ stock ngay cho các phương thức khác
    product.setStockQuantity(product.getStockQuantity() - quantity);
} else {
    // PAYOS: Không trừ stock, chờ webhook xác nhận
    log.info("Payment method is PAYOS. Stock will be deducted when payment is confirmed via webhook.");
}
```

#### 3.1.2. Tạo Payment Link

**Flow:**
```
Frontend Request → PaymentController.createPaymentLink() → PayOSService.createPaymentLink() → PayOS API
```

**Logic:**
1. Frontend gọi `POST /api/v1/payments/payos/create/{orderId}`
2. Backend:
   - Lấy order từ database
   - Validate: order phải có `paymentMethod = PAYOS`, `status = PENDING`
   - Gọi `PayOSService.createPaymentLink(order)`
3. PayOSService:
   - Build `PayOSPaymentRequestDto` từ order
   - Gọi PayOS API: `POST /v2/payment-requests`
   - Headers: `x-client-id`, `x-api-key`
   - Body: JSON với orderCode, amount, description, items, returnUrl, cancelUrl
4. PayOS trả về:
   - `paymentLinkId`: ID của payment link
   - `checkoutUrl`: URL để thanh toán
5. Backend:
   - Lưu `paymentLinkId` vào `order.paymentLinkId`
   - Trả về `paymentLinkUrl` cho frontend

**API Endpoint:**
```http
POST /api/v1/payments/payos/create/{orderId}
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "code": 200,
  "message": "Tạo payment link thành công",
  "data": {
    "paymentLinkUrl": "https://pay.payos.vn/web/...",
    "paymentLinkId": "abc123",
    "orderId": 123,
    "qrCode": "data:image/png;base64,..." // Optional
  }
}
```

#### 3.1.3. Xử lý Webhook

**Flow:**
```
PayOS → PaymentController.webhook() → Verify Signature → Update Order → Return 200 OK
```

**Logic chi tiết:**

1. **Nhận webhook request:**
   - PayOS gửi POST request đến `/api/v1/payments/payos/webhook`
   - Body: JSON với code, desc, data, signature

2. **Verify HMAC signature:**
   ```java
   // Algorithm: HMAC SHA256
   // Key: checksumKey từ PayOSConfig
   // Data: JSON string của request body (không format)
   boolean isValid = payOSService.verifyWebhookSignature(requestBody, signature);
   ```
   - **Bắt buộc verify** để đảm bảo webhook đến từ PayOS thật
   - Nếu signature không hợp lệ → Reject và return 200 OK (để PayOS không retry)

3. **Parse webhook data:**
   ```java
   PayOSWebhookDto webhookDto = objectMapper.readValue(requestBody, PayOSWebhookDto.class);
   String paymentLinkId = webhookDto.getData().getPaymentLinkId();
   ```

4. **Tìm order:**
   ```java
   Order order = orderRepository.findByPaymentLinkId(paymentLinkId)
       .orElseThrow(() -> new EntityNotFoundException("Order not found"));
   ```

5. **Kiểm tra duplicate webhook:**
   - Nếu `order.status != PENDING` → Bỏ qua (đã xử lý rồi)
   - Tránh xử lý duplicate webhook

6. **Cập nhật order status:**
   - Nếu `code = "00"` (thành công):
     - `order.status = CONFIRMED`
     - Trừ stock từ các sản phẩm
     - Tạo inventory transactions (OUT)
   - Nếu `code != "00"` (thất bại):
     - `order.status = CANCELED`
     - Không trừ stock

7. **Return 200 OK:**
   - Luôn return 200 OK để PayOS không retry
   - Log error nếu có để debug

**Webhook Request Body Example:**
```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 123456,
    "amount": 100000,
    "description": "Thanh toan don hang #123",
    "accountNumber": "1234567890",
    "reference": "PAYOS-123456",
    "transactionDateTime": "2024-01-01T10:00:00Z",
    "currency": "VND",
    "paymentLinkId": "abc123",
    "code": "00",
    "desc": "success"
  },
  "signature": "HMAC_SHA256_SIGNATURE"
}
```

#### 3.1.4. Check Payment Status

**Endpoint:**
```http
GET /api/v1/payments/payos/status/{orderId}
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "code": 200,
  "message": "Lấy trạng thái thanh toán thành công",
  "data": {
    "orderId": 123,
    "status": "CONFIRMED",
    "paymentMethod": "PAYOS",
    "paymentLinkId": "abc123",
    "finalAmount": 100000
  }
}
```

### 3.2. API Endpoints Summary

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/v1/payments/payos/create/{orderId}` | Required | Tạo payment link |
| POST | `/api/v1/payments/payos/webhook` | Public | Nhận webhook từ PayOS |
| GET | `/api/v1/payments/payos/return` | Public | Redirect sau khi thanh toán thành công |
| GET | `/api/v1/payments/payos/cancel` | Public | Redirect khi hủy thanh toán |
| GET | `/api/v1/payments/payos/status/{orderId}` | Required | Check payment status |

---

## 4. Frontend Implementation (ReactJS)

### 4.1. Sơ đồ luồng xử lý Frontend chi tiết

#### 4.1.1. Checkout Flow

**Steps:**
1. User chọn "Thanh toán PayOS" trong checkout
2. Gọi API tạo order: `POST /api/v1/orders/checkout`
3. Nhận `orderId` từ response
4. Gọi API tạo payment link: `POST /api/v1/payments/payos/create/{orderId}`
5. Nhận `paymentLinkUrl` từ response

**Code Example:**
```javascript
// PaymentButton.jsx
const handlePayOSPayment = async () => {
  try {
    // 1. Tạo order
    const orderResponse = await axios.post('/api/v1/orders/checkout', {
      paymentMethod: 'PAYOS',
      shippingAddressId: selectedAddressId
    });
    
    const orderId = orderResponse.data.data.idOrder;
    
    // 2. Tạo payment link
    const paymentResponse = await axios.post(
      `/api/v1/payments/payos/create/${orderId}`
    );
    
    const paymentLinkUrl = paymentResponse.data.data.paymentLinkUrl;
    
    // 3. Redirect đến PayOS
    window.location.href = paymentLinkUrl;
    
  } catch (error) {
    console.error('Error creating payment link:', error);
    // Show error message
  }
};
```

#### 4.1.2. Payment Flow

**Option 1: Redirect (Recommended)**
```javascript
// Redirect user đến PayOS payment page
window.location.href = paymentLinkUrl;
```

**Option 2: Open in New Window**
```javascript
// Mở payment link trong popup
const paymentWindow = window.open(
  paymentLinkUrl,
  'PayOS Payment',
  'width=800,height=600'
);
```

**Option 3: Display QR Code (if available)**
```javascript
// Hiển thị QR code nếu PayOS trả về
if (paymentResponse.data.data.qrCode) {
  setQrCode(paymentResponse.data.data.qrCode);
  setShowQrModal(true);
}
```

#### 4.1.3. Return/Cancel Handling

**Payment Success Page (`/payment/success`):**
```javascript
// PaymentSuccess.jsx
import { useSearchParams, useNavigate } from 'react-router-dom';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  
  useEffect(() => {
    if (orderId) {
      // Check order status
      checkOrderStatus(orderId);
    }
  }, [orderId]);
  
  const checkOrderStatus = async (orderId) => {
    try {
      const response = await axios.get(
        `/api/v1/payments/payos/status/${orderId}`
      );
      
      const status = response.data.data.status;
      
      if (status === 'CONFIRMED') {
        // Show success message
        setMessage('Thanh toán thành công!');
      } else if (status === 'PENDING') {
        // Still pending, start polling
        startPolling(orderId);
      }
    } catch (error) {
      console.error('Error checking order status:', error);
    }
  };
  
  return (
    <div>
      <h1>Thanh toán thành công!</h1>
      <p>Đơn hàng #{orderId} đã được thanh toán thành công.</p>
      <button onClick={() => navigate('/orders')}>
        Xem đơn hàng
      </button>
    </div>
  );
}
```

**Payment Cancel Page (`/payment/cancel`):**
```javascript
// PaymentCancel.jsx
function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  return (
    <div>
      <h1>Thanh toán đã bị hủy</h1>
      <p>Bạn đã hủy thanh toán cho đơn hàng #{orderId}.</p>
      <button onClick={() => navigate('/cart')}>
        Quay lại giỏ hàng
      </button>
    </div>
  );
}
```

#### 4.1.4. Status Polling (Optional)

**Use Case:** Nếu webhook chậm, frontend có thể polling để check order status

```javascript
// Polling function
const startPolling = (orderId) => {
  const interval = setInterval(async () => {
    try {
      const response = await axios.get(
        `/api/v1/payments/payos/status/${orderId}`
      );
      
      const status = response.data.data.status;
      
      if (status === 'CONFIRMED' || status === 'CANCELED') {
        // Stop polling
        clearInterval(interval);
        
        if (status === 'CONFIRMED') {
          // Show success
          setMessage('Thanh toán thành công!');
        } else {
          // Show cancel
          setMessage('Thanh toán đã bị hủy.');
        }
      }
    } catch (error) {
      console.error('Error polling order status:', error);
    }
  }, 3000); // Poll every 3 seconds
  
  // Stop polling after 2 minutes
  setTimeout(() => {
    clearInterval(interval);
  }, 120000);
};
```

### 4.2. React Component Examples

#### PaymentButton Component
```javascript
// PaymentButton.jsx
import { useState } from 'react';
import axios from 'axios';

function PaymentButton({ orderData, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  
  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create order
      const orderResponse = await axios.post('/api/v1/orders/checkout', {
        ...orderData,
        paymentMethod: 'PAYOS'
      });
      
      const orderId = orderResponse.data.data.idOrder;
      
      // Create payment link
      const paymentResponse = await axios.post(
        `/api/v1/payments/payos/create/${orderId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const paymentLinkUrl = paymentResponse.data.data.paymentLinkUrl;
      
      // Redirect to PayOS
      window.location.href = paymentLinkUrl;
      
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="payos-button"
    >
      {loading ? 'Đang xử lý...' : 'Thanh toán PayOS'}
    </button>
  );
}
```

### 4.3. API Integration Setup

**Axios Configuration:**
```javascript
// api/config.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 5. Testing và Debugging

### 5.1. Setup môi trường test

1. **Đăng ký tài khoản PayOS** tại https://my.payos.vn
2. **Lấy credentials:**
   - Client ID
   - API Key
   - Checksum Key
3. **Cấu hình `application.yaml`** với credentials
4. **Cài đặt ngrok:** `ngrok http 8080`
5. **Copy ngrok HTTPS URL** và cập nhật vào PayOS webhook URL
6. **Cập nhật `application.yaml`** với ngrok URL

### 5.2. Test tạo Payment Link

**Step 1: Tạo order với PayOS**
```bash
POST http://localhost:8080/api/v1/orders/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentMethod": "PAYOS",
  "shippingAddressId": 1
}
```

**Step 2: Tạo payment link**
```bash
POST http://localhost:8080/api/v1/payments/payos/create/{orderId}
Authorization: Bearer {token}
```

**Step 3: Verify response**
- Response phải có `paymentLinkUrl`
- Mở `paymentLinkUrl` trong browser để test thanh toán

### 5.3. Test Webhook Callback

#### Option 1: Sử dụng PayOS Webhook Testing Tool

1. Vào PayOS dashboard → **Webhook Testing**
2. Chọn event: "Payment Success" hoặc "Payment Failed"
3. PayOS sẽ gửi test webhook đến URL đã cấu hình
4. Check backend logs để verify webhook được nhận

#### Option 2: Test thủ công với Postman

**Generate HMAC Signature:**
```java
// Java code để generate signature
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

String checksumKey = "YOUR_CHECKSUM_KEY";
String data = "{\"code\":\"00\",\"desc\":\"success\",\"data\":{...}}";

Mac mac = Mac.getInstance("HmacSHA256");
SecretKeySpec secretKeySpec = new SecretKeySpec(
    checksumKey.getBytes(StandardCharsets.UTF_8),
    "HmacSHA256"
);
mac.init(secretKeySpec);

byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
String signature = Base64.getEncoder().encodeToString(hashBytes);
```

**Postman Request:**
```http
POST http://localhost:8080/api/v1/payments/payos/webhook
Content-Type: application/json

{
  "code": "00",
  "desc": "success",
  "data": {
    "paymentLinkId": "abc123",
    "orderCode": 123456,
    "amount": 100000,
    ...
  },
  "signature": "GENERATED_SIGNATURE"
}
```

#### Option 3: Test với ngrok webhook inspector

1. Ngrok tự động log tất cả requests đến webhook URL
2. Vào http://localhost:4040 để xem ngrok dashboard
3. Copy request từ ngrok và test lại

### 5.4. Test các Scenarios

#### Scenario 1: Payment Success
- Thanh toán thành công trên PayOS
- Verify:
  - Webhook được gửi về backend
  - Order status = CONFIRMED
  - Stock đã được trừ
  - Inventory transaction được tạo

#### Scenario 2: Payment Failed
- Hủy thanh toán trên PayOS
- Verify:
  - Webhook với code != "00"
  - Order status = CANCELED
  - Stock không bị trừ

#### Scenario 3: Payment Timeout
- Không thanh toán trong 15 phút
- Payment link hết hạn
- Test tạo lại payment link cho order

#### Scenario 4: Invalid Webhook Signature
- Gửi webhook với signature sai
- Verify backend reject và return error
- Check logs

#### Scenario 5: Duplicate Webhook
- PayOS có thể gửi webhook nhiều lần
- Verify backend xử lý idempotent (không update order 2 lần)

### 5.5. Debugging Tips

#### Enable Logging
```yaml
# application.yaml
logging:
  level:
    com.storemanagement.service.PayOSService: DEBUG
    com.storemanagement.controller.PaymentController: DEBUG
```

#### Check Logs
- Payment link creation logs
- Webhook received logs
- Signature verification logs
- Order update logs

#### Common Issues và Solutions

**Issue 1: Webhook không nhận được**
- Check ngrok đang chạy: `curl http://localhost:4040/api/tunnels`
- Check webhook URL trong PayOS dashboard đúng chưa
- Check firewall/antivirus không block
- Test với ngrok webhook inspector

**Issue 2: Signature verification failed**
- Verify Checksum Key đúng
- Check HMAC algorithm (SHA256)
- Verify data format (JSON string không format)
- Log signature để compare

**Issue 3: Payment link không tạo được**
- Check Client ID và API Key đúng
- Check PayOS API base URL (sandbox vs production)
- Check request body format theo PayOS API docs
- Check network connection

**Issue 4: Order status không update**
- Check webhook handler logs
- Verify order được tìm thấy theo paymentLinkId
- Check transaction rollback issues
- Verify database connection

### 5.6. Test Checklist

- [ ] Payment link được tạo thành công
- [ ] Payment link URL hợp lệ và mở được
- [ ] Webhook được nhận khi thanh toán thành công
- [ ] Webhook được nhận khi thanh toán thất bại
- [ ] Order status update đúng (CONFIRMED/CANCELED)
- [ ] Stock được trừ khi thanh toán thành công
- [ ] Stock không bị trừ khi thanh toán thất bại
- [ ] Inventory transaction được tạo
- [ ] Signature verification hoạt động đúng
- [ ] Invalid signature bị reject
- [ ] Duplicate webhook được xử lý idempotent
- [ ] Error handling cho các edge cases

---

## 6. Security Best Practices

### 6.1. Webhook Signature Verification

**Bắt buộc verify signature** để đảm bảo webhook đến từ PayOS thật:

```java
// PayOSServiceImpl.java
public boolean verifyWebhookSignature(String data, String signature) {
    Mac mac = Mac.getInstance("HmacSHA256");
    SecretKeySpec secretKeySpec = new SecretKeySpec(
        payOSConfig.getChecksumKey().getBytes(StandardCharsets.UTF_8),
        "HmacSHA256"
    );
    mac.init(secretKeySpec);
    
    byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    String calculatedSignature = Base64.getEncoder().encodeToString(hashBytes);
    
    return calculatedSignature.equals(signature);
}
```

### 6.2. Secure Storage của Credentials

**Không commit credentials vào git:**
- Sử dụng environment variables
- Hoặc `.gitignore` file chứa credentials
- Production: Sử dụng secret management service

### 6.3. HTTPS Requirements

- **Production:** Phải sử dụng HTTPS
- **Local Development:** Sử dụng ngrok (cung cấp HTTPS)

### 6.4. Rate Limiting

- Thêm rate limiting cho webhook endpoint để tránh DDoS
- Sử dụng Spring Security hoặc rate limiting library

### 6.5. Idempotent Webhook Handling

- Kiểm tra order status trước khi update
- Tránh xử lý duplicate webhook
- Log tất cả webhook requests để audit

---

## Kết luận

Tài liệu này cung cấp hướng dẫn chi tiết để tích hợp PayOS payment gateway vào hệ thống store management. 

**Lưu ý quan trọng:**
- Luôn test với PayOS sandbox trước khi deploy production
- Verify webhook signature trong mọi trường hợp
- Xử lý các edge cases (timeout, duplicate webhook, etc.)
- Log đầy đủ để debug

**Tài liệu tham khảo:**
- PayOS API Documentation: https://payos.vn/docs/api/
- PayOS Dashboard: https://my.payos.vn

















