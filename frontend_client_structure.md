# Tài liệu cấu trúc Frontend Client

## I. OVERVIEW
- **Tên project**: `techstore` (theo `frontend_client/package.json`)
- **Mục tiêu**: Frontend cho khách hàng (Customer) mua sắm, quản lý giỏ hàng, checkout, đơn hàng, đổi/trả, chat.

### Tech stack
- **React**: `19.2.0`
- **Build tool**: Create React App (`react-scripts 5.0.1`)
- **UI/Styling**:
  - Có cài `tailwindcss` (devDependencies) nhưng code hiện tại chủ yếu dùng **inline style object** (`styles` từ `src/styles/styles`), và icon từ `lucide-react`.
- **Router**:
  - **Không thấy sử dụng `react-router-dom` trong dependencies**.
  - Điều hướng chủ yếu dựa trên **state `currentPage` trong `src/App.js`** và một số thao tác `window.history.pushState/replaceState`.
  - Một số path (ví dụ `/payment/success`) được xử lý bằng cách đọc `window.location.pathname`.
- **State management**:
  - **React Context**:
    - `src/contexts/AuthContext.js` (auth & customer profile)
    - `src/contexts/BuyNowContext.js` (luồng “Mua ngay”)
  - **React local state**: rất nhiều state nằm trực tiếp trong `App.js` (cart, filter, selection, currentPage...).
- **HTTP client**: Axios (`axios 1.6.0`) qua instance `src/services/api.js`
- **Toast/notification**: `react-toastify`

### Entry point
- `src/index.js` render `<App />` (không wrap router/provider ở entry).

### Global layout strategy
- Layout được dựng trong `AppContent` (trong `src/App.js`):
  - Mặc định hiển thị `Header` và `Footer`.
  - Với trang auth (login/register): **ẩn Header/Footer** (`isAuthPage`).
  - `ChatWidget` chỉ hiển thị khi đã đăng nhập.

## II. FOLDER STRUCTURE
> Cây thư mục dưới đây lấy từ `frontend_client/src/`.

```
src/
├── App.js
├── index.js
├── index.css
├── styles/
├── components/
│   ├── layout/
│   ├── pages/
│   ├── returns/
│   ├── common/
│   ├── shared/
│   ├── ui/
│   └── chat/
├── pages/
│   └── returns/ (RequestReturnPage.jsx, ReturnHistoryPage.jsx, ReturnDetailPage.jsx)
├── contexts/
│   ├── AuthContext.js
│   └── BuyNowContext.js
├── services/
├── hooks/
├── utils/
├── constants/
└── data/
```

### Ý nghĩa các thư mục top-level
- **`components/`**
  - **Mục đích**: UI components.
  - **Đáng chú ý**:
    - `components/pages/`: các trang chính như Home/Shop/Cart/ProductDetail/Checkout/Orders/Profile...
    - `components/layout/`: `Header`, `Footer`, `StarRating`...
    - `components/common/`: loading/error boundary, protected route...
    - `components/chat/`: widget chat
  - **Tính chất**: chủ yếu feature-specific, một phần shared.

- **`pages/`**
  - **Mục đích**: hiện tại có nhóm đổi/trả đặt trong `src/pages/returns/*` (khác với nhóm `components/pages/*`).
  - **Tính chất**: feature-specific.

- **`contexts/`**
  - **Mục đích**: global state bằng React Context.
  - `AuthContext`: lưu token/user/customer và hàm login/register/logout.
  - `BuyNowContext`: lưu trạng thái “mua ngay” để checkout.

- **`services/`**
  - **Mục đích**: tầng API theo domain (`productsService`, `ordersService`, `cartService`, ...), sử dụng `api.js`.

- **`hooks/`**
  - **Mục đích**: hooks tiện ích.
  - Ví dụ: `useDebounce`, `useAuth` (re-export từ `AuthContext`).

- **`utils/`**
  - **Mục đích**: format/validation helper.

- **`constants/`**
  - **Mục đích**: endpoint constants + enum trạng thái.

- **`data/`**
  - **Mục đích**: dữ liệu fallback/initial (App.js có import `products, initialCart` từ đây).

## III. ROUTING STRUCTURE
### Router library
- **Không dùng React Router**.

### Cách điều hướng chính
- `src/App.js` quản lý state `currentPage` (string) và `renderPage()` switch-case để render component tương ứng.
- Một số trường hợp cập nhật URL bằng `window.history.pushState` (ví dụ filter category trong Shop).

### Các “route/page key” quan trọng (theo `renderPage()` trong `src/App.js`)
- `home` → `components/pages/HomePage`
- `shop` → `components/pages/ShopPage`
- `cart` → `components/pages/CartPage` (bọc `ProtectedRoute`)
- `product-detail` → `components/pages/ProductDetailPage` (dùng `selectedProductId`)
- `login` → `components/pages/LoginPage`
- `register` → `components/pages/RegisterPage`
- `checkout` → `components/pages/CheckoutPage` (bọc `ProtectedRoute`)
- `orders` → `components/pages/OrdersPage` (bọc `ProtectedRoute`)
- `profile` → `components/pages/ProfilePage` (bọc `ProtectedRoute`)
- `payment-success` → `components/pages/PaymentSuccessPage` (bọc `ProtectedRoute`)
- `payment-cancel` → `components/pages/PaymentCancelPage` (bọc `ProtectedRoute`)
- `return-request` → `pages/returns/RequestReturnPage` (bọc `ProtectedRoute`)
- `return-history` → `pages/returns/ReturnHistoryPage` (bọc `ProtectedRoute`)
- `return-detail` → `pages/returns/ReturnDetailPage` (bọc `ProtectedRoute`)

### “URL paths” được đọc trực tiếp
- Trong `App.js` có logic:
  - Nếu `window.location.pathname` bắt đầu với `/payment/success` → set `currentPage = 'payment-success'`
  - Nếu `/payment/cancel` → set `currentPage = 'payment-cancel'`
  - Đọc `categoryId` từ `window.location.search` để mở thẳng trang shop theo category.

### Protected routes
- Component: `src/components/common/ProtectedRoute.js`
  - Dùng `useAuth()` (re-export từ `contexts/AuthContext`).
  - Nếu `isLoading` → hiển thị “Đang tải...”.
  - Nếu chưa auth → `window.location.href = '/login'`.

## IV. STATE MANAGEMENT
### 1) AuthContext (global)
- File: `src/contexts/AuthContext.js`
- Trách nhiệm:
  - Load token từ storage lúc mount (`authService.getToken()`), sau đó gọi `customerService.getMyProfile()` để xác thực token và lấy profile.
  - `login(username,password,rememberMe)`:
    - Gọi `authService.login(...)`.
    - Nếu role là ADMIN/EMPLOYEE → redirect sang site admin `http://localhost:3000?token=...`.
    - Nếu CUSTOMER → gọi `customerService.getMyProfile()`, set `isAuthenticated`.
  - `register(registerData)` → gọi `authService.register()`, sau đó fetch profile.
  - `logout()` → gọi `authService.logout()`, clear state.

### 2) BuyNowContext (global)
- File: `src/contexts/BuyNowContext.js`
- Trách nhiệm:
  - Lưu `{ productId, quantity, product(optional) }` khi user nhấn “Mua ngay”.
  - CheckoutPage sẽ detect `buyNowItem` để hiển thị checkout theo mode “mua ngay” (theo comment trong context).

### 3) Local state trong App.js (trọng tâm)
- `currentPage`, `selectedProductId`, `selectedOrderId`, `selectedReturnId`
- `cart`, `cartData`, `cartLoading`
- `searchTerm` (debounce), `selectedCategory`, `selectedCategoryId`, `sortOption`
- Các state animation (flying cart)

### Data flow: API → UI (ví dụ giỏ hàng)
- Khi `isAuthenticated` chuyển sang true:
  - `App.js` gọi `cartService.getCart()` → set `cartData` và `cart`.
- Khi add/update/remove:
  - gọi service (add/update/remove) → reload cart (hoặc dùng response để set state).
- Các page con nhận handler/state qua props từ App.js.

## V. API LAYER
- **Axios instance**: `src/services/api.js`
  - `baseURL`: `process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1'`
  - `withCredentials: true`, timeout 10000.
  - **Request interceptor**:
    - Lấy token theo `rememberMe`:
      - Nếu `localStorage.rememberMe === 'true'` → token từ localStorage
      - Ngược lại ưu tiên sessionStorage rồi fallback localStorage
    - Gắn `Authorization: Bearer <token>`
    - Log request
  - **Response interceptor**:
    - Log response + duration
    - Unwrap `ApiResponse { code, message, data }` tương tự admin
  - **Error handling**:
    - Chuẩn hoá lỗi thành `{ message, errors, status, ... }`
    - Nếu `401`: xoá token/user/refreshToken nhưng **không tự redirect** (comment ghi “Let components handle it”).

- **Service files** (`src/services/`)
  - `authService.js`, `customerService.js`, `userService.js`
  - `productsService.js`, `categoriesService.js`, `reviewService.js`
  - `cartService.js`, `ordersService.js`, `promotionService.js`
  - Payment/ship: `paymentService.js`, `ghnService.js`, `shippingAddressService.js`
  - Returns: `returnSettingService.js`

- **Cách truyền params**
  - Query params dạng `{ pageNo, pageSize, sortBy, sortDirection, ... }` (thấy rõ trong `ShopPage`, `ProductDetailPage` gọi review/orders).
  - Path params: `getProductById(productId)`, `getProductImages(productId)`.

## VI. COMMON PATTERNS
### 1) Pagination
- Không có hook pagination chung.
- Thường dùng state local `pageNo/pageSize`.
  - Ví dụ `ShopPage`:
    - `pageNo` state + `pageSize=12`
    - Render pagination buttons thủ công.
  - Ví dụ `ProductDetailPage` (reviews):
    - `reviewsPage`, `pageSize=10`.

### 2) Filters/Search
- Search:
  - App.js có `searchTerm` + debounce (`useDebounce`), truyền xuống `ShopPage`.
  - `ShopPage` khi `searchTerm` thay đổi → reset `pageNo=1`, gọi `productsService.searchProductsByName`.
- Filter:
  - Category filter:
    - dùng `selectedCategoryId` và đồng bộ lên URL query `categoryId` bằng `history.pushState`.
  - Brand, price range:
    - state local + debounce min/max price (`useDebounce(minPrice,500)`...).

### 3) Forms
- Chủ yếu dùng controlled inputs/textarea/select native.
- Một số page dùng validate bằng `validationUtils`.

### 4) Toast/Notification
- `react-toastify`:
  - `App.js` gắn `<ToastContainer />`.
  - Các page dùng `toast.success/error/warning` (ví dụ `ProductDetailPage`).

### 5) Loading/Error
- Loading state theo từng page bằng `useState`:
  - `ShopPage` có `loading/error` và component `LoadingSpinner`.
  - `ProductDetailPage` có `loading/error`, `reviewsLoading`.

## VII. MODULE MAPPING (VERY IMPORTANT)
> Do không có router chuẩn, cột “Route” bên dưới dùng **page key** trong `App.js` và/hoặc URL path được đọc trực tiếp.

| Feature | Page Component | API Service (chính) | Page key / URL |
|---|---|---|---|
| Trang chủ | `src/components/pages/HomePage.js` | `productsService`, `categoriesService` (tuỳ implement) | `home` |
| Cửa hàng | `src/components/pages/ShopPage.js` | `productsService`, `categoriesService` | `shop` (+ query `?categoryId=`) |
| Chi tiết sản phẩm | `src/components/pages/ProductDetailPage.js` | `productsService`, `reviewService`, `ordersService`, `promotionService` | `product-detail` |
| Giỏ hàng | `src/components/pages/CartPage.js` | `cartService` (handlers từ `App.js`) | `cart` |
| Checkout | `src/components/pages/CheckoutPage.js` | `ordersService`, `paymentService`, `ghnService`, `shippingAddressService`, `promotionService` (tuỳ flow) | `checkout` |
| Đăng nhập | `src/components/pages/LoginPage.js` | `authService`, `customerService` (thông qua AuthContext) | `login` |
| Đăng ký | `src/components/pages/RegisterPage.js` | `authService`, `customerService` (thông qua AuthContext) | `register` |
| Đơn hàng của tôi | `src/components/pages/OrdersPage.js` | `ordersService` | `orders` |
| Yêu cầu đổi/trả | `src/pages/returns/RequestReturnPage.jsx` | service đổi/trả (liên quan `returnSettingService`/orders) | `return-request` |
| Lịch sử đổi/trả | `src/pages/returns/ReturnHistoryPage.jsx` | service đổi/trả | `return-history` |
| Chi tiết đổi/trả | `src/pages/returns/ReturnDetailPage.jsx` | service đổi/trả | `return-detail` |
| Hồ sơ khách hàng | `src/components/pages/ProfilePage.js` | `customerService`, `userService`, `shippingAddressService` | `profile` |
| Thanh toán thành công | `src/components/pages/PaymentSuccessPage.js` | `paymentService`/orders | `payment-success` hoặc URL `/payment/success` |
| Thanh toán hủy | `src/components/pages/PaymentCancelPage.js` | `paymentService`/orders | `payment-cancel` hoặc URL `/payment/cancel` |

## VIII. KNOWN ISSUES / RISK AREAS (IF FOUND)
> Chỉ liệt kê, **không sửa code**.

- **ProtectedRoute redirect sang `/login` bằng `window.location.href`**
  - Trong app thực tế, “login” là `currentPage='login'` (SPA state). Redirect URL `/login` có thể không được xử lý như React Router, tuỳ cấu hình server/hosting.
- **Routing phụ thuộc vào localStorage + window.location**
  - `currentPage` được lưu `localStorage` và restore khi load lại → có thể tạo tình huống “mắc kẹt” ở page cũ nếu data/state không còn hợp lệ.
- **Redirect giữa Client ↔ Admin kèm token trên URL**
  - Trong `AuthContext.login`, nếu role ADMIN/EMPLOYEE → redirect `http://localhost:3000?token=...`.
  - Rủi ro tương tự: lộ token qua history/referrer.
- **Axios response unwrapping**
  - Interceptor gán `response.data = response.data.data`; nếu code kỳ vọng full response wrapper sẽ dễ nhầm.
- **Nhiều state + side effects trong `App.js`**
  - `App.js` rất lớn, nhiều `useEffect` + local state → rủi ro vòng lặp gọi API/khó debug nếu thêm dependency sai.

## IX. HOW TO EXTEND SAFELY
### Thêm page mới
- **Nên làm**:
  - Tạo component page trong `src/components/pages/` (hoặc `src/pages/` nếu muốn tách theo nhóm như returns).
  - Thêm một case mới trong `renderPage()` của `src/App.js`.
  - Từ `Header`/nơi điều hướng, gọi `setCurrentPage('your-page-key')`.
- **Lưu ý**: Nếu page cần deep-link bằng URL, cần bổ sung logic đọc `window.location.pathname/search` (như payment/categoryId) — hiện chưa có router chuẩn.

### Thêm API mới
- **Nên làm**:
  - Thêm file service trong `src/services/<domain>Service.js` dùng `api` từ `services/api.js`.
  - Ở page, gọi service trực tiếp hoặc qua context (nếu là auth).

### Thêm filter/search
- **Nên làm**:
  - Debounce input (pattern hiện có: `useDebounce`).
  - Reset `pageNo=1` khi filter đổi.
  - Đồng bộ URL query nếu cần share link (pattern hiện có: `categoryId`).

### Không nên làm
- **Không** dùng `window.location.href` tuỳ tiện cho điều hướng nội bộ nếu bạn muốn giữ SPA; nên ưu tiên `setCurrentPage` hoặc chuyển hẳn sang React Router (nếu refactor trong tương lai).
- **Không** hardcode URL admin/client trong nhiều nơi; hiện có hardcode `http://localhost:3000` trong `AuthContext`.

---
**Trạng thái**: Đã tạo tài liệu cấu trúc Frontend Client (`frontend_client_structure.md`).
