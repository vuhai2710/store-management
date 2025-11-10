# Notification Module - Hướng dẫn API

## Tổng quan

Module quản lý thông báo (Notifications) cho users trong hệ thống. Hỗ trợ cả **in-app notifications** (lưu trong DB) và **email notifications** (gửi tự động).

**Base URL:** `/api/v1/notifications`

**Authentication:** Required (tất cả users: ADMIN, EMPLOYEE, CUSTOMER)

```
Authorization: Bearer {JWT_TOKEN}
```

**Đặc điểm:**
- Mỗi user chỉ xem được notifications của chính mình
- Hỗ trợ đánh dấu đã đọc / chưa đọc
- Tự động gửi email cho các thông báo quan trọng
- Reference đến đối tượng liên quan (Order, Product, Customer...)

---

## Danh sách Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/notifications` | Lấy tất cả notifications của tôi |
| GET | `/api/v1/notifications/unread` | Lấy notifications chưa đọc |
| GET | `/api/v1/notifications/unread-count` | Đếm số lượng chưa đọc |
| PUT | `/api/v1/notifications/{id}/mark-read` | Đánh dấu đã đọc |
| PUT | `/api/v1/notifications/mark-all-read` | Đánh dấu tất cả là đã đọc |
| DELETE | `/api/v1/notifications/{id}` | Xóa notification |

---

## Các loại Notification

### NotificationType

| Type | Mô tả | Người nhận |
|------|-------|-----------|
| `ORDER_STATUS` | Thay đổi trạng thái đơn hàng | Customer |
| `LOW_STOCK` | Cảnh báo hàng tồn kho thấp | Admin, Employee |
| `NEW_ORDER` | Đơn hàng mới | Admin, Employee |
| `NEW_CUSTOMER` | Khách hàng mới đăng ký | Admin |
| `INVENTORY_UPDATE` | Cập nhật tồn kho (nhập/xuất) | Admin, Employee |
| `PROMOTION` | Khuyến mãi, ưu đãi | Customer |

### ReferenceType

| Type | Mô tả |
|------|-------|
| `ORDER` | Liên quan đến đơn hàng |
| `PRODUCT` | Liên quan đến sản phẩm |
| `CUSTOMER` | Liên quan đến khách hàng |
| `IMPORT_ORDER` | Liên quan đến đơn nhập hàng |
| `OTHER` | Khác |

---

## 1. Lấy tất cả notifications

### Thông tin Endpoint

- **URL:** `GET /api/v1/notifications`
- **Authentication:** Required

### Query Parameters

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| pageNo | Integer | No | 1 | Số trang |
| pageSize | Integer | No | 10 | Số lượng mỗi trang |
| sortBy | String | No | "createdAt" | Trường sắp xếp |
| sortDirection | String | No | "DESC" | Hướng sắp xếp |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy danh sách thông báo thành công",
  "data": {
    "content": [
      {
        "idNotification": 1,
        "idUser": 5,
        "username": "customer1",
        "notificationType": "ORDER_STATUS",
        "title": "Đơn hàng #123 đã được xác nhận",
        "message": "Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.",
        "referenceType": "ORDER",
        "referenceId": 123,
        "isRead": false,
        "sentEmail": true,
        "createdAt": "2025-11-09T16:00:00"
      }
    ],
    "pageNo": 1,
    "pageSize": 10,
    "totalElements": 25,
    "totalPages": 3,
    "isLast": false
  }
}
```

---

## 2. Lấy notifications chưa đọc

### Thông tin Endpoint

- **URL:** `GET /api/v1/notifications/unread`
- **Authentication:** Required

### Query Parameters

| Parameter | Type | Default |
|-----------|------|---------|
| pageNo | Integer | 1 |
| pageSize | Integer | 10 |

### Response

Giống endpoint #1, nhưng chỉ trả về notifications có `isRead = false`

---

## 3. Đếm số lượng chưa đọc

### Thông tin Endpoint

- **URL:** `GET /api/v1/notifications/unread-count`
- **Authentication:** Required

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Lấy số lượng thông báo chưa đọc thành công",
  "data": 5
}
```

**Use case:** Hiển thị badge số lượng notifications chưa đọc trên UI

---

## 4. Đánh dấu đã đọc

### Thông tin Endpoint

- **URL:** `PUT /api/v1/notifications/{id}/mark-read`
- **Authentication:** Required

### Path Parameters

| Parameter | Type | Mô tả |
|-----------|------|-------|
| id | Integer | ID của notification |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Đánh dấu đã đọc thành công",
  "data": {
    "idNotification": 1,
    "isRead": true,
    ...
  }
}
```

---

## 5. Đánh dấu tất cả là đã đọc

### Thông tin Endpoint

- **URL:** `PUT /api/v1/notifications/mark-all-read`
- **Authentication:** Required

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Đánh dấu tất cả thông báo là đã đọc thành công",
  "data": null
}
```

---

## 6. Xóa notification

### Thông tin Endpoint

- **URL:** `DELETE /api/v1/notifications/{id}`
- **Authentication:** Required

### Path Parameters

| Parameter | Type | Mô tả |
|-----------|------|-------|
| id | Integer | ID của notification |

### Response

**Status Code:** `200 OK`

```json
{
  "code": 200,
  "message": "Xóa thông báo thành công",
  "data": null
}
```

---

## Email Notifications

### Khi nào gửi email?

Email tự động được gửi cho các notification types sau:
- `ORDER_STATUS`: Khi trạng thái đơn hàng thay đổi
- `LOW_STOCK`: Cảnh báo hàng sắp hết
- `NEW_ORDER`: Đơn hàng mới (cho admin/employee)

### Format email

Email được gửi với HTML template đẹp, bao gồm:
- Tiêu đề thông báo
- Nội dung chi tiết
- Link đến đối tượng liên quan (nếu có)

### Cấu hình email

Email được cấu hình trong `application.yaml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME:your-email@gmail.com}
    password: ${EMAIL_PASSWORD:your-app-password}
```

---

## Tích hợp với Frontend

### Real-time notifications

**Polling approach:**

```javascript
// Poll unread count mỗi 30 giây
setInterval(async () => {
  const response = await fetch('/api/v1/notifications/unread-count', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  updateBadge(data.data); // Update UI badge
}, 30000);
```

### Click notification → Navigate

```javascript
function handleNotificationClick(notification) {
  // Đánh dấu đã đọc
  await markAsRead(notification.idNotification);
  
  // Navigate dựa trên referenceType
  switch(notification.referenceType) {
    case 'ORDER':
      router.push(`/orders/${notification.referenceId}`);
      break;
    case 'PRODUCT':
      router.push(`/products/${notification.referenceId}`);
      break;
    // ...
  }
}
```

---

## Best Practices

1. **Pagination**: Luôn sử dụng pagination, không load hết notifications
2. **Badge update**: Poll `/unread-count` định kỳ (30s - 1 phút)
3. **Mark as read**: Đánh dấu đã đọc khi user click vào notification
4. **Cleanup**: Định kỳ xóa notifications cũ (> 30 ngày)

---

## Error Handling

### 401 Unauthorized
- Token không hợp lệ hoặc hết hạn

### 403 Forbidden
- Cố gắng truy cập notification của user khác

### 404 Not Found
- Notification không tồn tại hoặc đã bị xóa

---

## Liên hệ

Nếu có thắc mắc về Notification Module, vui lòng liên hệ team Backend.






