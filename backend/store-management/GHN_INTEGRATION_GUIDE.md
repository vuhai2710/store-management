# Hướng Dẫn Tích Hợp GHN (Giao Hàng Nhanh) API - Môi Trường DEV

## Mục Lục

1. [Giới thiệu và Setup](#1-giới-thiệu-và-setup)
2. [Sơ đồ luồng xử lý tổng quan](#2-sơ-đồ-luồng-xử-lý-tổng-quan)
3. [Backend Implementation (Spring Boot)](#3-backend-implementation-spring-boot)
4. [Frontend Integration (ReactJS)](#4-frontend-integration-reactjs)
5. [Testing và Debugging](#5-testing-và-debugging)
6. [Security Best Practices](#6-security-best-practices)

---

## 1. Giới thiệu và Setup

### 1.1. Giới thiệu GHN

GHN (Giao Hàng Nhanh) là một trong những đơn vị vận chuyển hàng đầu tại Việt Nam, cung cấp dịch vụ giao hàng nhanh chóng và đáng tin cậy.

**Tính năng chính:**
- Tính phí vận chuyển tự động
- Tạo đơn hàng vận chuyển
- Tracking đơn hàng real-time
- Webhook cập nhật trạng thái tự động
- In vận đơn PDF

### 1.2. Đăng ký tài khoản GHN

1. Truy cập https://khachhang.ghn.vn
2. Đăng ký tài khoản mới
3. Xác thực email và hoàn tất đăng ký
4. Đăng nhập vào dashboard

### 1.3. Lấy Credentials từ GHN Dashboard

1. **Lấy Token API:**
   - Vào **Thông tin cá nhân** → **Token API**
   - Copy Token API (đây là token để authenticate khi gọi GHN API)

2. **Lấy Shop ID:**
   - Vào **Quản lý cửa hàng**
   - Copy Shop ID của cửa hàng bạn

### 1.4. Cấu hình môi trường Local (DEV)

#### 1.4.1. Cài đặt ngrok

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

#### 1.4.2. Chạy ngrok để expose backend

```bash
# Chạy ngrok để expose port 8080 (Spring Boot)
ngrok http 8080
```

Ngrok sẽ hiển thị URL như sau:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8080
```

**Copy HTTPS URL** (ví dụ: `https://abc123.ngrok.io`)

#### 1.4.3. Cập nhật GHN Webhook URL

1. Vào GHN dashboard → **Cài đặt** → **Webhook**
2. Cập nhật Webhook URL: `https://abc123.ngrok.io/api/v1/ghn/webhook`
3. Lưu cấu hình

#### 1.4.4. Cập nhật application.yaml

Mở file `src/main/resources/application.yaml` và cập nhật:

```yaml
ghn:
  token: "YOUR_GHN_TOKEN"  # Thay bằng Token API từ GHN dashboard
  shop-id: 12345  # Thay bằng Shop ID từ GHN dashboard
  base-url: "https://dev-online-gateway.ghn.vn"  # GHN Sandbox API URL
  webhook-url: "https://abc123.ngrok.io/api/v1/ghn/webhook"  # Ngrok URL
  enabled: true  # Feature flag: true để bật GHN, false để tắt
  environment: "sandbox"  # sandbox (DEV) hoặc production
```

**Lưu ý quan trọng:**
- Môi trường DEV sử dụng GHN Sandbox: `https://dev-online-gateway.ghn.vn`
- Môi trường Production sử dụng: `https://online-gateway.ghn.vn`
- Feature flag `enabled` cho phép bật/tắt GHN integration dễ dàng

---

## 2. Sơ đồ luồng xử lý tổng quan

### 2.1. Sequence Diagram - Tạo đơn hàng với GHN

```
User (Frontend)          Backend (Spring Boot)          GHN API
    |                            |                        |
    |-- 1. Checkout -------->|                        |
    |   (với shipping address)  |                        |
    |                            |                        |
    |                            |-- 2. Calculate Fee -->|
    |                            |   (Tính phí vận chuyển)|
    |                            |                        |
    |                            |<-- 3. Fee Response ---|
    |                            |   (shippingFee)        |
    |                            |                        |
    |<-- 4. Order Created -------|                        |
    |   (với shippingFee)        |                        |
    |                            |                        |
    |                            |-- 5. Create GHN Order->|
    |                            |   (Tạo đơn GHN)        |
    |                            |                        |
    |                            |<-- 6. GHN Order Code --|
    |                            |   (order_code)          |
    |                            |                        |
    |                            |-- 7. Save Shipment ---|
    |                            |   (ghnOrderCode)       |
```

### 2.2. Sequence Diagram - Webhook từ GHN

```
GHN API                  Backend (Spring Boot)          Database
    |                            |                        |
    |-- 1. Webhook ------------>|                        |
    |   (Status Update)          |                        |
    |                            |                        |
    |                            |-- 2. Find Shipment --->|
    |                            |   (theo ghnOrderCode)  |
    |                            |                        |
    |                            |<-- 3. Shipment -------|
    |                            |                        |
    |                            |-- 4. Update Shipment ->|
    |                            |   (ghnStatus, etc.)    |
    |                            |                        |
    |                            |-- 5. Sync Order ------->|
    |                            |   (Order.status)       |
    |                            |                        |
    |<-- 6. 200 OK --------------|                        |
```

### 2.3. Các bước chính

1. **User checkout:**
   - Chọn shipping address
   - Backend tính phí vận chuyển từ GHN
   - Tạo Order với shipping fee

2. **Tạo đơn GHN:**
   - Sau khi tạo Order thành công
   - Backend tự động tạo đơn hàng trên GHN
   - Lưu `ghnOrderCode` vào Shipment

3. **GHN xử lý:**
   - GHN nhận đơn và bắt đầu vận chuyển
   - Cập nhật trạng thái trên hệ thống GHN

4. **Webhook cập nhật:**
   - GHN gửi webhook khi có cập nhật trạng thái
   - Backend cập nhật Shipment và Order

5. **Tracking:**
   - User có thể xem tracking real-time
   - Backend sync với GHN API khi cần

---

## 3. Backend Implementation (Spring Boot)

### 3.1. Cấu trúc Module GHN

```
src/main/java/com/storemanagement/
├── config/
│   └── GHNConfig.java              # Configuration class
├── controller/
│   ├── GHNController.java          # REST endpoints cho GHN
│   └── GHNWebhookController.java   # Webhook handler
├── service/
│   ├── GHNService.java             # Service interface
│   └── impl/
│       └── GHNServiceImpl.java     # Service implementation
├── dto/
│   └── ghn/
│       ├── GHNBaseResponseDto.java
│       ├── GHNCalculateFeeRequestDto.java
│       ├── GHNCalculateFeeResponseDto.java
│       ├── GHNCreateOrderRequestDto.java
│       ├── GHNCreateOrderResponseDto.java
│       ├── GHNOrderInfoDto.java
│       ├── GHNTrackingDto.java
│       ├── GHNWebhookDto.java
│       ├── GHNServiceDto.java
│       ├── GHNExpectedDeliveryTimeRequestDto.java
│       ├── GHNExpectedDeliveryTimeResponseDto.java
│       └── GHNUpdateOrderRequestDto.java
└── model/
    └── Shipment.java                # Đã có GHN fields (V8 migration)
```

### 3.2. GHN Configuration

**File:** `src/main/java/com/storemanagement/config/GHNConfig.java`

```java
@Configuration
@ConfigurationProperties(prefix = "ghn")
@Data
public class GHNConfig {
    private String token;           // Token API từ GHN
    private Integer shopId;         // Shop ID từ GHN
    private String baseUrl;         // API base URL
    private String webhookUrl;      // Webhook URL
    private Boolean enabled;        // Feature flag
    private String environment;     // sandbox hoặc production
}
```

**Logic:**
- Đọc cấu hình từ `application.yaml`
- Cung cấp RestTemplate bean cho GHN API calls
- Feature flag `enabled` cho phép bật/tắt GHN dễ dàng

### 3.3. GHN Service Layer

**File:** `src/main/java/com/storemanagement/service/GHNService.java`

**Các methods chính:**

1. **getProvinces()** - Lấy danh sách tỉnh/thành phố
2. **getDistricts(Integer provinceId)** - Lấy danh sách quận/huyện
3. **getWards(Integer districtId)** - Lấy danh sách phường/xã
4. **calculateShippingFee(GHNCalculateFeeRequestDto)** - Tính phí vận chuyển
5. **createOrder(GHNCreateOrderRequestDto)** - Tạo đơn hàng GHN
6. **getOrderInfo(String ghnOrderCode)** - Lấy thông tin đơn hàng
7. **cancelOrder(String ghnOrderCode, String reason)** - Hủy đơn hàng
8. **getShippingServices(Integer fromDistrictId, Integer toDistrictId)** - Lấy dịch vụ vận chuyển
9. **getExpectedDeliveryTime(GHNExpectedDeliveryTimeRequestDto)** - Lấy thời gian giao hàng dự kiến
10. **trackOrder(String ghnOrderCode)** - Theo dõi đơn hàng
11. **printOrder(String ghnOrderCode)** - In vận đơn (PDF)
12. **updateOrder(GHNUpdateOrderRequestDto)** - Cập nhật đơn hàng

**Logic chung cho tất cả methods:**

```java
// 1. Kiểm tra GHN enabled
if (!ghnService.isEnabled()) {
    // Return default/mock values hoặc throw exception
}

// 2. Build headers với Token và ShopId
HttpHeaders headers = buildHeaders();
headers.set("Token", ghnConfig.getToken());
headers.set("ShopId", String.valueOf(ghnConfig.getShopId()));

// 3. Gọi GHN API
ResponseEntity<GHNBaseResponseDto<T>> response = ghnRestTemplate.exchange(
    url,
    HttpMethod.POST/GET,
    requestEntity,
    new ParameterizedTypeReference<GHNBaseResponseDto<T>>() {}
);

// 4. Parse response và xử lý lỗi
GHNBaseResponseDto<T> responseBody = response.getBody();
if (responseBody == null || responseBody.getCode() != 200) {
    throw new RuntimeException("GHN API error: " + responseBody.getMessage());
}

// 5. Return data
return responseBody.getData();
```

### 3.4. GHN Controller

**File:** `src/main/java/com/storemanagement/controller/GHNController.java`

**Endpoints:**

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/v1/ghn/provinces` | CUSTOMER+ | Lấy danh sách tỉnh/thành |
| GET | `/api/v1/ghn/districts?provinceId={id}` | CUSTOMER+ | Lấy danh sách quận/huyện |
| GET | `/api/v1/ghn/wards?districtId={id}` | CUSTOMER+ | Lấy danh sách phường/xã |
| POST | `/api/v1/ghn/calculate-fee` | CUSTOMER+ | Tính phí vận chuyển |
| POST | `/api/v1/ghn/create-order` | ADMIN/EMPLOYEE | Tạo đơn hàng GHN |
| GET | `/api/v1/ghn/orders/{ghnOrderCode}` | ADMIN/EMPLOYEE | Lấy thông tin đơn hàng |
| DELETE | `/api/v1/ghn/orders/{ghnOrderCode}` | ADMIN/EMPLOYEE | Hủy đơn hàng |
| GET | `/api/v1/ghn/services?fromDistrictId={id}&toDistrictId={id}` | CUSTOMER+ | Lấy dịch vụ vận chuyển |
| POST | `/api/v1/ghn/expected-delivery-time` | CUSTOMER+ | Lấy thời gian giao hàng dự kiến |
| GET | `/api/v1/ghn/track/{ghnOrderCode}` | CUSTOMER+ | Theo dõi đơn hàng |
| GET | `/api/v1/ghn/print/{ghnOrderCode}` | ADMIN/EMPLOYEE | In vận đơn (PDF) |
| PUT | `/api/v1/ghn/orders` | ADMIN/EMPLOYEE | Cập nhật đơn hàng |

### 3.5. GHN Webhook Handler

**File:** `src/main/java/com/storemanagement/controller/GHNWebhookController.java`

**Endpoint:** `POST /api/v1/ghn/webhook`

**Logic xử lý webhook:**

```java
@PostMapping("/webhook")
@Transactional
public ResponseEntity<Map<String, String>> webhook(@RequestBody GHNWebhookDto webhookDto) {
    // 1. Tìm Shipment theo ghnOrderCode
    Shipment shipment = shipmentRepository.findByGhnOrderCode(webhookDto.getOrderCode())
        .orElse(null);
    
    if (shipment == null) {
        // Shipment không tồn tại → Return 200 OK (để GHN không retry)
        return ResponseEntity.ok(Map.of("status", "warning", "message", "Shipment not found"));
    }
    
    // 2. Cập nhật Shipment với thông tin từ webhook
    shipment.setGhnStatus(webhookDto.getStatus());
    shipment.setGhnUpdatedAt(LocalDateTime.now());
    if (webhookDto.getNote() != null) {
        shipment.setGhnNote(webhookDto.getNote());
    }
    
    // 3. Sync Shipment.shippingStatus với ghnStatus
    syncShippingStatus(shipment, webhookDto.getStatus());
    // Mapping:
    // - ready_to_pick, picking → PREPARING
    // - picked, storing, transporting, sorting, delivering → SHIPPED
    // - delivered → DELIVERED
    
    // 4. Sync Order.status nếu cần
    syncOrderStatus(shipment.getOrder(), webhookDto.getStatus());
    // - delivered → Order.status = COMPLETED
    // - cancel → Order.status = CANCELED
    
    // 5. Lưu Shipment
    shipmentRepository.save(shipment);
    
    // 6. Return 200 OK
    return ResponseEntity.ok(Map.of("status", "success", "message", "Webhook processed"));
}
```

**Mapping trạng thái GHN → Shipment.shippingStatus:**

| GHN Status | Shipment Status | Mô tả |
|------------|-----------------|-------|
| ready_to_pick, picking | PREPARING | Đang chuẩn bị |
| picked, storing, transporting, sorting, delivering | SHIPPED | Đã gửi hàng |
| delivered | DELIVERED | Đã giao hàng |
| cancel, delivery_fail, return_fail, exception, damage, lost | (giữ nguyên) | Lỗi/Cancel |

### 3.6. Tích hợp GHN vào Order Service

**File:** `src/main/java/com/storemanagement/service/impl/OrderServiceImpl.java`

**Logic tích hợp:**

#### 3.6.1. Trong createOrderFromCart() và createOrderDirectly()

```java
// ========== PHASE 7: GHN INTEGRATION ==========

// Tạo Shipment và tích hợp GHN (nếu có shipping address và GHN enabled)
createShipmentAndIntegrateGHN(savedOrder, shippingAddress, totalAmount);
```

**Method `createShipmentAndIntegrateGHN()`:**

```java
private void createShipmentAndIntegrateGHN(Order order, ShippingAddress shippingAddress, BigDecimal orderTotalAmount) {
    // 1. Kiểm tra đã có shipment chưa (tránh duplicate)
    if (shipmentRepository.findByOrder_IdOrder(order.getIdOrder()).isPresent()) {
        return;
    }
    
    // 2. Tạo Shipment entity cơ bản
    Shipment shipment = Shipment.builder()
        .order(order)
        .shippingStatus(Shipment.ShippingStatus.PREPARING)
        .shippingMethod(Shipment.ShippingMethod.GHN)
        .build();
    
    // 3. Nếu GHN enabled và có shipping address, thử tích hợp GHN
    if (ghnService.isEnabled() && shippingAddress != null) {
        try {
            // TODO: ShippingAddress hiện tại không có districtId và wardCode
            // Cần thêm fields này vào ShippingAddress hoặc parse từ address text
            // Hiện tại sẽ skip tính phí và tạo đơn GHN
            // Chỉ tạo Shipment cơ bản
            
        } catch (Exception e) {
            log.error("Error integrating GHN. Creating basic shipment only.", e);
            // Tiếp tục tạo Shipment cơ bản nếu GHN integration fail
        }
    }
    
    // 4. Lưu Shipment
    shipmentRepository.save(shipment);
}
```

**Lưu ý quan trọng:**
- ShippingAddress hiện tại chỉ có `address` (text), không có `districtId` và `wardCode`
- Để tính phí vận chuyển và tạo đơn GHN, cần có `districtId` và `wardCode`
- Hiện tại chỉ tạo Shipment cơ bản, chưa tính phí và tạo đơn GHN
- Có thể mở rộng sau bằng cách:
  - Thêm `districtId` và `wardCode` vào ShippingAddress (cần migration)
  - Hoặc parse address text để tìm district/ward

#### 3.6.2. Tính phí vận chuyển (Khi có đủ thông tin)

```java
// Build request để tính phí
GHNCalculateFeeRequestDto feeRequest = GHNCalculateFeeRequestDto.builder()
    .fromDistrictId(shopDistrictId)  // District của shop (từ config)
    .toDistrictId(shippingAddress.getDistrictId())
    .toWardCode(shippingAddress.getWardCode())
    .weight(calculateTotalWeight(order.getOrderDetails()))  // Tính tổng trọng lượng
    .insuranceValue(order.getFinalAmount().intValue())  // Giá trị đơn hàng
    .build();

// Gọi GHN API tính phí
GHNCalculateFeeResponseDto feeResponse = ghnService.calculateShippingFee(feeRequest);

// Lưu phí vận chuyển vào Shipment
shipment.setGhnShippingFee(feeResponse.getTotal());

// Có thể thêm shipping fee vào order.totalAmount hoặc hiển thị riêng
```

#### 3.6.3. Tạo đơn hàng GHN (Khi có đủ thông tin)

```java
// Build request để tạo đơn GHN
GHNCreateOrderRequestDto createOrderRequest = GHNCreateOrderRequestDto.builder()
    .fromDistrictId(shopDistrictId)
    .fromWardCode(shopWardCode)
    .toDistrictId(shippingAddress.getDistrictId())
    .toWardCode(shippingAddress.getWardCode())
    .toName(shippingAddress.getRecipientName())
    .toPhone(shippingAddress.getPhoneNumber())
    .toAddress(shippingAddress.getAddress())
    .weight(calculateTotalWeight(order.getOrderDetails()))
    .insuranceValue(order.getFinalAmount().intValue())
    .clientOrderCode(String.valueOf(order.getIdOrder()))  // Order ID từ hệ thống
    .items(convertOrderDetailsToGHNItems(order.getOrderDetails()))
    .build();

// Gọi GHN API tạo đơn
GHNCreateOrderResponseDto createOrderResponse = ghnService.createOrder(createOrderRequest);

// Lưu thông tin GHN vào Shipment
shipment.setGhnOrderCode(createOrderResponse.getOrderCode());
shipment.setGhnShippingFee(feeResponse.getTotal());

// Parse và lưu thời gian giao hàng dự kiến
if (createOrderResponse.getExpectedDeliveryTime() != null) {
    LocalDateTime expectedDeliveryTime = LocalDateTime.parse(
        createOrderResponse.getExpectedDeliveryTime(),
        DateTimeFormatter.ISO_DATE_TIME
    );
    shipment.setGhnExpectedDeliveryTime(expectedDeliveryTime);
}
```

### 3.7. Shipment Service

**File:** `src/main/java/com/storemanagement/service/ShipmentService.java`

**Các methods:**

1. **getShipmentById(Integer shipmentId)** - Lấy thông tin shipment
2. **getShipmentByOrderId(Integer orderId)** - Lấy shipment theo order ID
3. **syncWithGHN(Integer shipmentId)** - Đồng bộ trạng thái với GHN API
4. **getShipmentTracking(Integer shipmentId)** - Lấy thông tin tracking

**Logic syncWithGHN():**

```java
public ShipmentDto syncWithGHN(Integer shipmentId) {
    // 1. Lấy shipment từ database
    Shipment shipment = shipmentRepository.findById(shipmentId)
        .orElseThrow(() -> new EntityNotFoundException("Shipment not found"));
    
    // 2. Kiểm tra có ghnOrderCode không
    if (shipment.getGhnOrderCode() == null) {
        throw new RuntimeException("Shipment does not have GHN order code");
    }
    
    // 3. Gọi GHN API để lấy thông tin mới nhất
    GHNOrderInfoDto orderInfo = ghnService.getOrderInfo(shipment.getGhnOrderCode());
    
    // 4. Cập nhật shipment với thông tin từ GHN
    shipment.setGhnStatus(orderInfo.getStatus());
    shipment.setGhnUpdatedAt(LocalDateTime.now());
    
    // 5. Sync shippingStatus và Order.status
    syncShippingStatus(shipment, orderInfo.getStatus());
    syncOrderStatus(shipment.getOrder(), orderInfo.getStatus());
    
    // 6. Lưu shipment
    shipmentRepository.save(shipment);
    
    return shipmentMapper.toDto(shipment);
}
```

### 3.8. Shipment Controller

**File:** `src/main/java/com/storemanagement/controller/ShipmentController.java`

**Endpoints:**

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/v1/shipments/{id}` | ADMIN/EMPLOYEE | Lấy thông tin shipment |
| GET | `/api/v1/shipments/order/{orderId}` | CUSTOMER+ | Lấy shipment theo order ID |
| GET | `/api/v1/shipments/{id}/track` | CUSTOMER+ | Theo dõi vận đơn |
| POST | `/api/v1/shipments/{id}/sync-ghn` | ADMIN/EMPLOYEE | Đồng bộ với GHN |

---

## 4. Frontend Integration (ReactJS)

### 4.1. Lấy danh sách địa chỉ (Provinces, Districts, Wards)

**Code Example:**

```javascript
// Lấy danh sách tỉnh/thành phố
const getProvinces = async () => {
  try {
    const response = await axios.get('/api/v1/ghn/provinces');
    setProvinces(response.data.data);
  } catch (error) {
    console.error('Error getting provinces:', error);
  }
};

// Lấy danh sách quận/huyện
const getDistricts = async (provinceId) => {
  try {
    const response = await axios.get(`/api/v1/ghn/districts?provinceId=${provinceId}`);
    setDistricts(response.data.data);
  } catch (error) {
    console.error('Error getting districts:', error);
  }
};

// Lấy danh sách phường/xã
const getWards = async (districtId) => {
  try {
    const response = await axios.get(`/api/v1/ghn/wards?districtId=${districtId}`);
    setWards(response.data.data);
  } catch (error) {
    console.error('Error getting wards:', error);
  }
};
```

### 4.2. Tính phí vận chuyển

**Code Example:**

```javascript
const calculateShippingFee = async (fromDistrictId, toDistrictId, toWardCode, weight) => {
  try {
    const response = await axios.post('/api/v1/ghn/calculate-fee', {
      from_district_id: fromDistrictId,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      weight: weight || 1000,  // Default 1kg
      length: 20,
      width: 20,
      height: 20
    });
    
    const shippingFee = response.data.data.total;
    setShippingFee(shippingFee);
    return shippingFee;
  } catch (error) {
    console.error('Error calculating shipping fee:', error);
    // Fallback to default fee
    return 30000; // 30,000 VND default
  }
};
```

### 4.3. Tracking đơn hàng

**Code Example:**

```javascript
const trackShipment = async (shipmentId) => {
  try {
    const response = await axios.get(`/api/v1/shipments/${shipmentId}/track`);
    const tracking = response.data.data;
    
    // tracking.orderCode: Mã đơn hàng GHN
    // tracking.status: Trạng thái hiện tại
    // tracking.tracking: Lịch sử cập nhật trạng thái
    
    setTrackingInfo(tracking);
    return tracking;
  } catch (error) {
    console.error('Error tracking shipment:', error);
  }
};
```

### 4.4. Hiển thị trạng thái vận chuyển

**Code Example:**

```javascript
const getStatusLabel = (ghnStatus) => {
  const statusMap = {
    'ready_to_pick': 'Chờ lấy hàng',
    'picking': 'Đang lấy hàng',
    'picked': 'Đã lấy hàng',
    'storing': 'Đang lưu kho',
    'transporting': 'Đang vận chuyển',
    'sorting': 'Đang phân loại',
    'delivering': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'delivery_fail': 'Giao hàng thất bại',
    'cancel': 'Đã hủy'
  };
  
  return statusMap[ghnStatus] || ghnStatus;
};

// Component hiển thị tracking
const TrackingComponent = ({ tracking }) => {
  return (
    <div>
      <h3>Trạng thái: {getStatusLabel(tracking.status)}</h3>
      <ul>
        {tracking.tracking.map((event, index) => (
          <li key={index}>
            <strong>{event.time}</strong>: {event.description}
            {event.location && <span> - {event.location}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 5. Testing và Debugging

### 5.1. Setup môi trường test

1. **Đăng ký tài khoản GHN** tại https://khachhang.ghn.vn
2. **Lấy credentials:**
   - Token API
   - Shop ID
3. **Cấu hình `application.yaml`** với credentials
4. **Cài đặt ngrok:** `ngrok http 8080`
5. **Copy ngrok HTTPS URL** và cập nhật vào GHN webhook URL
6. **Cập nhật `application.yaml`** với ngrok URL

### 5.2. Test các Endpoints

#### Test 1: Lấy danh sách tỉnh/thành phố

```bash
GET http://localhost:8080/api/v1/ghn/provinces
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách tỉnh/thành phố thành công",
  "data": [
    {
      "provinceId": 201,
      "provinceName": "Hà Nội",
      "code": "HN"
    },
    ...
  ]
}
```

#### Test 2: Tính phí vận chuyển

```bash
POST http://localhost:8080/api/v1/ghn/calculate-fee
Authorization: Bearer {token}
Content-Type: application/json

{
  "from_district_id": 1442,
  "to_district_id": 1452,
  "to_ward_code": "1A0401",
  "weight": 1000,
  "length": 20,
  "width": 20,
  "height": 20
}
```

**Expected Response:**
```json
{
  "code": 200,
  "message": "Tính phí vận chuyển thành công",
  "data": {
    "total": 30000,
    "serviceFee": 25000,
    "insuranceFee": 0,
    "pickStationFee": 0,
    "courierStationFee": 0,
    "codFee": 0,
    "returnFee": 0,
    "r2sFee": 0
  }
}
```

#### Test 3: Tạo đơn hàng GHN

```bash
POST http://localhost:8080/api/v1/ghn/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "from_district_id": 1442,
  "from_ward_code": "1A0401",
  "to_district_id": 1452,
  "to_ward_code": "1A0501",
  "to_name": "Nguyễn Văn A",
  "to_phone": "0123456789",
  "to_address": "123 Đường ABC, Phường XYZ",
  "weight": 1000,
  "length": 20,
  "width": 20,
  "height": 20,
  "insurance_value": 100000,
  "client_order_code": "123"
}
```

**Expected Response:**
```json
{
  "code": 200,
  "message": "Tạo đơn hàng GHN thành công",
  "data": {
    "orderCode": "GHN123456789",
    "sortCode": "ABC123",
    "expectedDeliveryTime": "2024-01-05T10:00:00Z"
  }
}
```

#### Test 4: Tracking đơn hàng

```bash
GET http://localhost:8080/api/v1/ghn/track/GHN123456789
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "code": 200,
  "message": "Theo dõi đơn hàng thành công",
  "data": {
    "orderCode": "GHN123456789",
    "status": "delivering",
    "tracking": [
      {
        "time": "2024-01-01T10:00:00Z",
        "status": "ready_to_pick",
        "description": "Đơn hàng đã được tạo",
        "location": "Hà Nội"
      },
      {
        "time": "2024-01-02T14:00:00Z",
        "status": "picked",
        "description": "Đã lấy hàng",
        "location": "Hà Nội"
      },
      ...
    ]
  }
}
```

### 5.3. Test Webhook

#### Option 1: Sử dụng GHN Webhook Testing Tool

1. Vào GHN dashboard → **Cài đặt** → **Webhook Testing**
2. Chọn event: "Status Update"
3. GHN sẽ gửi test webhook đến URL đã cấu hình
4. Check backend logs để verify webhook được nhận

#### Option 2: Test thủ công với Postman

```bash
POST http://localhost:8080/api/v1/ghn/webhook
Content-Type: application/json

{
  "order_code": "GHN123456789",
  "status": "delivered",
  "updated_at": "2024-01-05T10:00:00Z",
  "note": "Giao hàng thành công"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Webhook processed"
}
```

#### Option 3: Test với ngrok webhook inspector

1. Ngrok tự động log tất cả requests đến webhook URL
2. Vào http://localhost:4040 để xem ngrok dashboard
3. Copy request từ ngrok và test lại

### 5.4. Test các Scenarios

#### Scenario 1: Tạo đơn hàng với GHN

1. User checkout với shipping address
2. Backend tính phí vận chuyển từ GHN
3. Tạo Order với shipping fee
4. Tạo đơn hàng GHN tự động
5. Verify:
   - Shipment được tạo với `ghnOrderCode`
   - `ghnShippingFee` được lưu
   - `ghnExpectedDeliveryTime` được lưu

#### Scenario 2: Webhook cập nhật trạng thái

1. GHN gửi webhook với status = "delivered"
2. Backend nhận webhook và cập nhật Shipment
3. Verify:
   - `Shipment.ghnStatus` = "delivered"
   - `Shipment.shippingStatus` = DELIVERED
   - `Order.status` = COMPLETED
   - `Order.deliveredAt` được set

#### Scenario 3: Tracking đơn hàng

1. User xem tracking đơn hàng
2. Backend gọi GHN API để lấy tracking info
3. Verify:
   - Hiển thị đúng trạng thái hiện tại
   - Hiển thị đầy đủ lịch sử cập nhật

#### Scenario 4: GHN Integration Disabled

1. Set `ghn.enabled = false` trong `application.yaml`
2. Tạo đơn hàng
3. Verify:
   - Shipment được tạo cơ bản (không có GHN info)
   - Không gọi GHN API
   - Order vẫn được tạo thành công

#### Scenario 5: GHN API Error

1. Simulate GHN API error (network error, invalid credentials, etc.)
2. Tạo đơn hàng
3. Verify:
   - Error được log
   - Shipment vẫn được tạo cơ bản
   - Order vẫn được tạo thành công (GHN error không block order creation)

### 5.5. Debugging Tips

#### Enable Logging

```yaml
# application.yaml
logging:
  level:
    com.storemanagement.service.GHNService: DEBUG
    com.storemanagement.controller.GHNController: DEBUG
    com.storemanagement.controller.GHNWebhookController: DEBUG
```

#### Check Logs

- GHN API calls logs
- Webhook received logs
- Shipment update logs
- Order sync logs

#### Common Issues và Solutions

**Issue 1: Webhook không nhận được**
- Check ngrok đang chạy: `curl http://localhost:4040/api/tunnels`
- Check webhook URL trong GHN dashboard đúng chưa
- Check firewall/antivirus không block
- Test với ngrok webhook inspector

**Issue 2: GHN API trả về lỗi 401 (Unauthorized)**
- Verify Token API đúng
- Verify Shop ID đúng
- Check Token còn hạn không

**Issue 3: Không tính được phí vận chuyển**
- Check có đủ thông tin: fromDistrictId, toDistrictId, toWardCode
- Verify địa chỉ hợp lệ
- Check GHN API có hỗ trợ route này không

**Issue 4: Shipment không được tạo**
- Check Order có shippingAddress không
- Check GHN enabled không
- Check logs để xem lỗi gì

**Issue 5: Webhook không cập nhật Shipment**
- Check Shipment có ghnOrderCode không
- Check webhook payload đúng format không
- Check logs để xem lỗi gì

### 5.6. Test Checklist

- [ ] Lấy danh sách tỉnh/thành phố thành công
- [ ] Lấy danh sách quận/huyện thành công
- [ ] Lấy danh sách phường/xã thành công
- [ ] Tính phí vận chuyển thành công
- [ ] Tạo đơn hàng GHN thành công
- [ ] Shipment được tạo với ghnOrderCode
- [ ] Webhook được nhận khi có cập nhật trạng thái
- [ ] Shipment được cập nhật từ webhook
- [ ] Order.status được sync đúng
- [ ] Tracking đơn hàng hoạt động
- [ ] In vận đơn (PDF) hoạt động
- [ ] Feature flag (enabled/disabled) hoạt động
- [ ] Error handling cho các edge cases

---

## 6. Security Best Practices

### 6.1. Webhook Security

**Lưu ý:**
- GHN webhook endpoint là PUBLIC (không cần authentication)
- Nên verify webhook signature nếu GHN cung cấp
- Luôn return 200 OK để GHN không retry
- Log tất cả webhook requests để audit

### 6.2. Secure Storage của Credentials

**Không commit credentials vào git:**
- Sử dụng environment variables
- Hoặc `.gitignore` file chứa credentials
- Production: Sử dụng secret management service

### 6.3. HTTPS Requirements

- **Production:** Phải sử dụng HTTPS
- **Local Development:** Sử dụng ngrok (cung cấp HTTPS)

### 6.4. Error Handling

- GHN API calls không được block order creation
- Nếu GHN API fail, log error và tiếp tục với Shipment cơ bản
- Graceful fallback cho các trường hợp lỗi

### 6.5. Idempotent Webhook Handling

- Kiểm tra Shipment đã tồn tại trước khi update
- Tránh xử lý duplicate webhook
- Log tất cả webhook requests để audit

---

## 7. Đề xuất cải tiến

### 7.1. Thêm District và Ward vào ShippingAddress

**Vấn đề hiện tại:**
- ShippingAddress chỉ có `address` (text), không có `districtId` và `wardCode`
- Không thể tính phí vận chuyển và tạo đơn GHN tự động

**Giải pháp:**
- Thêm fields `districtId` và `wardCode` vào ShippingAddress
- Tạo migration để thêm columns
- Update ShippingAddressService để lưu districtId và wardCode khi tạo address
- Update OrderService để sử dụng districtId và wardCode khi tính phí và tạo đơn GHN

### 7.2. Tính phí vận chuyển trước khi checkout

**Hiện tại:**
- Phí vận chuyển chưa được tính khi checkout
- Chỉ tạo Shipment cơ bản

**Cải tiến:**
- Thêm endpoint để tính phí vận chuyển trước khi checkout
- Frontend gọi API tính phí và hiển thị cho user
- User xác nhận phí vận chuyển trước khi đặt hàng
- Backend tính lại phí khi tạo order và lưu vào Shipment

### 7.3. Tự động tạo đơn GHN khi order được CONFIRMED

**Hiện tại:**
- Đơn GHN chưa được tạo tự động (do thiếu districtId/wardCode)

**Cải tiến:**
- Khi order status chuyển sang CONFIRMED
- Tự động tạo đơn hàng GHN
- Lưu ghnOrderCode vào Shipment
- Gửi thông báo cho user về mã vận đơn

### 7.4. Retry mechanism cho GHN API calls

**Cải tiến:**
- Thêm retry mechanism khi GHN API fail
- Exponential backoff cho retry
- Circuit breaker pattern để tránh quá tải GHN API

### 7.5. Cache danh sách địa chỉ

**Cải tiến:**
- Cache danh sách provinces, districts, wards
- Giảm số lần gọi GHN API
- Cải thiện performance

---

## Kết luận

Tài liệu này cung cấp hướng dẫn chi tiết để tích hợp GHN API vào hệ thống store management cho môi trường DEV.

**Lưu ý quan trọng:**
- Luôn test với GHN Sandbox trước khi deploy production
- ShippingAddress hiện tại chưa có districtId/wardCode, cần mở rộng để tính phí và tạo đơn GHN tự động
- Feature flag `enabled` cho phép bật/tắt GHN dễ dàng
- GHN API calls không block order creation (graceful fallback)
- Log đầy đủ để debug

**Tài liệu tham khảo:**
- GHN API Documentation: https://api.ghn.vn/
- GHN Dashboard: https://khachhang.ghn.vn
- GHN Sandbox: https://dev-online-gateway.ghn.vn











