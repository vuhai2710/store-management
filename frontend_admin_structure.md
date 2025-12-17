# Tài liệu cấu trúc Frontend Admin

## I. OVERVIEW
- **Tên project**: `react-erp-electronics-store` (theo `frontend_admin/package.json`)
- **Mục tiêu**: Frontend quản trị (Admin/Employee) cho hệ thống quản lý cửa hàng.
- **Tech stack (theo `package.json` và mã nguồn)**
  - **React**: `18.2.0`
  - **Build tool**: Create React App (`react-scripts 5.0.1`)
  - **Router**: `react-router-dom 6.20.1` (dùng `BrowserRouter`, `Routes`, `Route`, `Navigate`)
  - **UI library**: Ant Design (`antd 5.12.8`), locale `vi_VN`
  - **State management**: Redux Toolkit (`@reduxjs/toolkit`), `react-redux`
  - **HTTP client**: Axios (`axios 1.6.2`) qua instance `src/services/api.js`
  - **Khác**:
    - `dayjs` (format ngày), `xlsx` (export excel), chart libs (`chart.js`, `recharts`, `react-chartjs-2`)
    - Realtime/chat: `@stomp/stompjs`, `sockjs-client`
- **Entry point**: `src/index.js`
  - Wrap `App` với:
    - `Provider store={store}` (Redux)
    - `BrowserRouter` (Router)
    - `ConfigProvider locale={viVN}` (Ant Design locale)
- **Chiến lược layout global**
  - Layout chính nằm trong `src/App.js`:
    - Khi đã đăng nhập (và không phải CUSTOMER): render `Layout` (AntD) gồm:
      - `AppSidebar` (`src/components/layout/AppSidebar.js`)
      - `AppHeader` (`src/components/layout/AppHeader.js`)
      - `Content` chứa `Breadcrumbs` + `Routes`
      - `FloatingChatButton` (chat)
  - Khi **chưa đăng nhập**: chỉ render `PublicRoutes` (login/register/unauthorized).

## II. FOLDER STRUCTURE
> Cây thư mục dưới đây lấy từ `frontend_admin/src/`.

```
src/
├── App.js
├── index.js
├── index.css
├── styles/
│   └── responsive.css
├── components/
│   ├── layout/
│   ├── common/
│   ├── chat/
│   ├── products/
│   ├── orders/
│   ├── orderReturns/
│   ├── categories/
│   ├── customers/
│   ├── suppliers/
│   ├── users/
│   ├── employees/ (không thấy folder riêng; logic nằm trong pages + store/slices)
│   ├── dashboard/
│   ├── importOrders/
│   ├── shipments/
│   └── promotions/
├── pages/
│   ├── Dashboard.js
│   ├── Login.js
│   ├── Register.js
│   ├── Unauthorized.js
│   ├── Profile.js
│   ├── Orders.js
│   ├── OrderDetail.js
│   ├── Products.js
│   ├── ProductDetail.js
│   ├── ProductReviews.js
│   ├── Categories.js
│   ├── Customers.js
│   ├── CustomerDetail.js
│   ├── Inventory.js
│   ├── Suppliers.js
│   ├── SupplierDetail.js
│   ├── ImportOrders.js
│   ├── ImportOrderDetail.js
│   ├── ShipmentDetail.js
│   ├── Employees.js
│   ├── EmployeeDetail.js
│   ├── Finance.js
│   ├── Reports.js
│   ├── Promotions.js
│   ├── Users.js
│   ├── ExportInvoices.js
│   ├── ImportInvoices.js
│   ├── orderReturns/
│   └── system/
├── services/
├── store/
│   ├── store.js
│   └── slices/
├── hooks/
├── utils/
└── constants/
```

### Ý nghĩa các thư mục top-level
- **`components/`**
  - **Mục đích**: UI component tái sử dụng hoặc theo module.
  - **Ví dụ**:
    - `components/layout/`: `AppHeader`, `AppSidebar`
    - `components/common/`: `ProtectedRoute`, `Breadcrumbs`, `EmptyState`, `LoadingSkeleton`, notification components...
    - `components/products/`: `ProductForm` (form CRUD sản phẩm)
  - **Tính chất**: vừa shared (common/layout), vừa feature-specific (products/orders/...)

- **`pages/`**
  - **Mục đích**: Page-level components gắn trực tiếp với route trong `App.js`.
  - **Tính chất**: feature-specific

- **`services/`**
  - **Mục đích**: tầng gọi API (axios instance + các service theo domain).
  - **Ví dụ file**:
    - `api.js` (axios instance + interceptors)
    - `productsService.js`, `ordersService.js`, `invoiceService.js`, ...
  - **Tính chất**: shared (toàn app)

- **`store/`**
  - **Mục đích**: Redux store + slices.
  - **Ví dụ**:
    - `store.js` cấu hình `configureStore`
    - `slices/*Slice.js` quản lý state theo module
  - **Tính chất**: shared

- **`hooks/`**
  - **Mục đích**: custom hooks.
  - **Ví dụ**:
    - `useAuth.js` (đồng bộ auth từ token/localStorage/API)
    - `usePagination.js` (state + object `pagination` cho AntD Table)
    - `useDebounce.js`
  - **Tính chất**: shared

- **`utils/`**
  - **Mục đích**: helper thuần JS.
  - **Ví dụ**: `apiHelper.js` (token helpers/role check), `exportUtils.js`, `formatUtils.js`, `validationUtils.js`

- **`constants/`**
  - **Mục đích**: constant/enum/config.
  - **Ví dụ**:
    - `roles.js` (USER_ROLES)
    - `apiEndpoints.js` (map endpoint)
    - `index.js` export + `APP_CONFIG` (bao gồm `CLIENT_URL`)

## III. ROUTING STRUCTURE
- **Router library**: `react-router-dom` v6 (`Routes/Route/Navigate`).
- **Router mount**: `src/index.js` dùng `BrowserRouter` bọc `App`.

### Public routes (khi chưa đăng nhập)
Định nghĩa trong `PublicRoutes` (trong `src/App.js`):
- `/login` → `pages/Login`
- `/register` → `pages/Register`
- `/unauthorized` → `pages/Unauthorized`
- `*` → redirect `/login`

### Protected routes (khi đã đăng nhập)
Định nghĩa trong `src/App.js` bên trong layout:
- `/` → redirect `/dashboard`
- `/dashboard` → `pages/Dashboard` (mọi role)
- `/profile` → `pages/Profile` (mọi role)
- `/orders` → `pages/Orders` (ADMIN, EMPLOYEE)
- `/orders/:id` → `pages/OrderDetail` (ADMIN, EMPLOYEE)
- `/order-returns` → `pages/orderReturns/ReturnListPage` (ADMIN, EMPLOYEE)
- `/order-returns/:id` → `pages/orderReturns/ReturnDetailPage` (ADMIN, EMPLOYEE)
- `/products` → `pages/Products` (ADMIN, EMPLOYEE)
- `/products/:id` → `pages/ProductDetail` (ADMIN, EMPLOYEE)
- `/products/:productId/reviews` → `pages/ProductReviews` (ADMIN, EMPLOYEE)
- `/customers` → `pages/Customers` (ADMIN, EMPLOYEE)
- `/customers/:id` → `pages/CustomerDetail` (ADMIN, EMPLOYEE)
- `/inventory` → `pages/Inventory` (ADMIN, EMPLOYEE)
- `/categories` → `pages/Categories` (ADMIN, EMPLOYEE)
- `/suppliers` → `pages/Suppliers` (ADMIN, EMPLOYEE)
- `/suppliers/:id` → `pages/SupplierDetail` (ADMIN, EMPLOYEE)
- `/import-orders` → `pages/ImportOrders` (ADMIN, EMPLOYEE)
- `/import-orders/:id` → `pages/ImportOrderDetail` (ADMIN, EMPLOYEE)
- `/shipments/:id` → `pages/ShipmentDetail` (ADMIN, EMPLOYEE)
- `/promotions` → `pages/Promotions` (ADMIN, EMPLOYEE)
- `/employees` → `pages/Employees` (ADMIN)
- `/employees/:id` → `pages/EmployeeDetail` (ADMIN)
- `/finance` → `pages/Finance` (ADMIN)
- `/reports` → `pages/Reports` (ADMIN)
- `/users` → `pages/Users` (ADMIN)
- `/settings` → `pages/system/ReturnSettingPage` (ADMIN)
- `/invoices/export` → `pages/ExportInvoices` (ADMIN)
- `/invoices/import` → `pages/ImportInvoices` (ADMIN)
- `*` → redirect `/dashboard`

### Nested routes
- Không dùng nested routes theo kiểu `<Route element={<Layout/>}>...`.
- Một số route “có dạng nested” chỉ là path nhiều segment (ví dụ `/products/:productId/reviews`, `/invoices/export`).

### Protected routes / role-based
- Component: `src/components/common/ProtectedRoute.js`
  - Kiểm tra `authService.isAuthenticated()` (token trong localStorage)
  - Nếu không auth → `Navigate /login`
  - Nếu có `allowedRoles` mà không thoả → `Navigate /unauthorized`
- Role constants: `USER_ROLES` trong `src/constants/roles.js`.

### Luồng redirect giữa Admin ↔ Client
- Trong `src/App.js` + `pages/Login.js`:
  - Nếu user role = `CUSTOMER` → redirect sang `APP_CONFIG.CLIENT_URL` (mặc định `http://localhost:3003`) kèm `?token=...`.

## IV. STATE MANAGEMENT
- **Redux Toolkit** tại `src/store/store.js`.
- **Slices (theo `store.js`)**
  - `auth`: đăng nhập, user, loading
  - `orders`: danh sách đơn, filters, pagination
  - `products`: danh sách sản phẩm, pagination
  - `customers`, `inventory`, `employees`, `finance`, `suppliers`, `users`, `categories`, `importOrders`, `shipments`, `notifications`, `reviews`, `promotions`

### Data flow điển hình (Redux thunk)
- Page dispatch action (ví dụ `fetchProducts(params)` trong `pages/Products.js`).
- Slice gọi service tương ứng (ví dụ `productsService` — chi tiết nằm trong `src/services/productsService.js`).
- Kết quả trả về được lưu vào Redux state: `list/orders/...` + `loading` + `pagination`.
- Page dùng `useSelector` để lấy `list`, `loading`, `pagination` và render.

### Auth state
- Hook `src/hooks/useAuth.js`:
  - Khi mount: đọc token (localStorage)
  - Nếu token expired (qua `isTokenExpired` trong `utils/apiHelper.js`) → dispatch `logout`
  - Nếu có user trong localStorage → dispatch `setUser(storedUser)`; sau đó gọi `authService.getCurrentUser()` ở background
  - Nếu không có user local → gọi API `/users/profile`

## V. API LAYER
- **Axios instance**: `src/services/api.js`
  - `baseURL`: `process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1'`
  - `timeout`: 10000
  - `withCredentials: true`
  - **Request interceptor**:
    - Attach `Authorization: Bearer <token>` từ `localStorage.getItem('token')`
    - Log request (`console.log`) kèm params/data
  - **Response interceptor**:
    - Log response + duration
    - Unwrap dạng `ApiResponse { code, message, data }` → trả `response.data = response.data.data`
  - **Error handling**:
    - Chuẩn hoá lỗi thành object `{ message, errors, status, ... }`
    - Nếu `401`: xoá `token/user` và redirect `window.location.href = '/login'` (nếu chưa ở /login)

- **Cấu trúc service files** (`src/services/`)
  - Theo domain: `productsService.js`, `ordersService.js`, `customersService.js`, `invoiceService.js`, ...
  - Auth: `authService.js`

- **Cách truyền params**
  - **Query params**: thường dùng `api.get('/endpoint', { params: { pageNo, pageSize, ... } })` (quan sát qua usage từ pages/slices).
  - **Path params**: các endpoint dạng `/resource/:id` (ví dụ: `navigate('/orders/:id')`, `api.put(`/users/${userId}`)` trong `authService`).

## VI. COMMON PATTERNS
### 1) Pagination
- Hook: `src/hooks/usePagination.js`
  - Quản lý `currentPage`, `pageSize`, `total`.
  - Trả object `pagination` theo format AntD Table.
- Ở page (ví dụ `pages/Products.js`):
  - Gọi thunk với `{ pageNo: currentPage, pageSize }`
  - Đồng bộ total từ Redux (`pagination.totalElements`) về hook `setTotal()`.

### 2) Filters/Search
- Dùng state local + debounce:
  - Hook: `useDebounce`.
  - Ví dụ `pages/Products.js`:
    - Keyword search `searchKeyword` → `debouncedKeyword`
    - Brand `brand` → `debouncedBrand`
    - Price range `minPrice/maxPrice` cũng debounce
  - Khi filter đổi thường `resetPagination()` về trang 1.

### 3) Forms
- AntD `Form` + controlled inputs.
- CRUD thường mở trong `Modal` và render form component (ví dụ `ProductForm` trong `Products.js`).

### 4) Toast/Notification
- Chủ yếu dùng AntD `message` (`message.success/error/loading`), ví dụ trong `Products.js`, `Orders.js`, `Login.js`.
- Notifications (real-time): có `notificationsSlice` + `components/common/NotificationCenter` (header gọi `NotificationCenter`).

### 5) Loading/Error state
- Loading từ Redux slice + UI:
  - `LoadingSkeleton`/`EmptyState` (table)
  - `message.loading({ key })` trong `Orders.js`.
- Error hiển thị bằng `message.error(...)` hoặc vùng error trong UI (Login).

## VII. MODULE MAPPING (VERY IMPORTANT)
> Bảng dưới đây map theo **route trong `src/App.js`** và file page/service liên quan. Service/slice nêu theo việc import/dispatch trong page.

| Feature / Chức năng | Page component (file) | State/API sử dụng (chính) | Route |
|---|---|---|---|
| Đăng nhập | `src/pages/Login.js` | `authSlice.login`, `authService.forgotPassword`, redirect theo role | `/login` |
| Đăng ký | `src/pages/Register.js` | `authService.register` hoặc thunk trong `authSlice` (tuỳ implement) | `/register` |
| Dashboard | `src/pages/Dashboard.js` | `dashboardService` (file có tồn tại) + slices liên quan | `/dashboard` |
| Hồ sơ cá nhân | `src/pages/Profile.js` | `authService.getCurrentUser/updateProfile/uploadAvatar` | `/profile` |
| Quản lý đơn hàng | `src/pages/Orders.js` | `ordersSlice.fetchOrders`, `invoiceService.printExportInvoice` (dynamic import), `useAdminReturnService` | `/orders` |
| Chi tiết đơn hàng | `src/pages/OrderDetail.js` | `ordersService`/`ordersSlice` | `/orders/:id` |
| Đổi/Trả hàng | `src/pages/orderReturns/ReturnListPage.jsx` | hook `useAdminReturnService` + service đổi trả | `/order-returns` |
| Chi tiết đổi/trả | `src/pages/orderReturns/ReturnDetailPage.jsx` | hook/service đổi trả | `/order-returns/:id` |
| Quản lý sản phẩm | `src/pages/Products.js` | `productsSlice.fetchProducts/deleteProduct/fetchProductsBySupplier`, `categoriesService`, `suppliersService` | `/products` |
| Chi tiết sản phẩm | `src/pages/ProductDetail.js` | `productsService`/slice | `/products/:id` |
| Đánh giá sản phẩm | `src/pages/ProductReviews.js` | `reviewsService`/slice | `/products/:productId/reviews` |
| Quản lý danh mục | `src/pages/Categories.js` | `categoriesSlice` + `categoriesService` | `/categories` |
| Quản lý khách hàng | `src/pages/Customers.js` | `customersSlice` + `customersService` | `/customers` |
| Chi tiết khách hàng | `src/pages/CustomerDetail.js` | `customersService` | `/customers/:id` |
| Quản lý kho | `src/pages/Inventory.js` | `inventorySlice` + `inventoryService` + `inventoryTransactionService` | `/inventory` |
| Nhà cung cấp | `src/pages/Suppliers.js` | `suppliersSlice` + `suppliersService` | `/suppliers` |
| Chi tiết nhà cung cấp | `src/pages/SupplierDetail.js` | `suppliersService` | `/suppliers/:id` |
| Đơn nhập hàng | `src/pages/ImportOrders.js` | `importOrdersSlice` + `importOrderService` | `/import-orders` |
| Chi tiết đơn nhập | `src/pages/ImportOrderDetail.js` | `importOrderService` | `/import-orders/:id` |
| Vận đơn | `src/pages/ShipmentDetail.js` | `shipmentsSlice` + `shipmentService` | `/shipments/:id` |
| Nhân viên | `src/pages/Employees.js` | `employeesSlice` + `employeesService` | `/employees` |
| Chi tiết nhân viên | `src/pages/EmployeeDetail.js` | `employeesService` | `/employees/:id` |
| Tài chính | `src/pages/Finance.js` | `financeSlice` + `financeService` | `/finance` |
| Báo cáo | `src/pages/Reports.js` | `reportService` | `/reports` |
| Khuyến mãi | `src/pages/Promotions.js` | `promotionsSlice` + `promotionsService` | `/promotions` |
| Quản lý người dùng | `src/pages/Users.js` | `usersSlice` + `usersService` | `/users` |
| Cấu hình hệ thống (đổi/trả) | `src/pages/system/ReturnSettingPage.jsx` | `systemSettingService` | `/settings` |
| Hóa đơn xuất | `src/pages/ExportInvoices.js` | `invoiceService` | `/invoices/export` |
| Hóa đơn nhập | `src/pages/ImportInvoices.js` | `invoiceService` | `/invoices/import` |

## VIII. KNOWN ISSUES / RISK AREAS (IF FOUND)
> Chỉ liệt kê, **không sửa code**.

- **Redirect sang frontend_client kèm token trên URL** (`?token=...`)
  - Rủi ro lộ token qua history/log/referrer nếu dùng production.
- **Axios response unwrapping** trong `services/api.js`
  - Interceptor thay đổi `response.data` thành `response.data.data`. Nếu có nơi kỳ vọng nhận nguyên `ApiResponse` có thể gây nhầm.
- **Tự động redirect khi 401** (admin)
  - `api.js` redirect `/login` ngay trong interceptor → có thể khó xử lý một số màn hình muốn bắt lỗi 401 để hiển thị UI riêng.
- **Menu role filtering vs route protection**
  - `AppSidebar` lọc menu theo role, nhưng route vẫn phải dựa `ProtectedRoute` để an toàn (hiện đã có).
- **Logging request/response bằng `console.log`**
  - Có thể gây noise và lộ dữ liệu trong môi trường production.

## IX. HOW TO EXTEND SAFELY
### Thêm page mới
- **Nên làm**:
  - Tạo file page trong `src/pages/YourNewPage.js`
  - Nếu có UI reusable: tạo component trong `src/components/<feature>/...`
  - Thêm `Route` trong `src/App.js` (kèm `ProtectedRoute` + `allowedRoles` nếu cần)
  - Thêm menu item trong `src/components/layout/AppSidebar.js` (kèm `roles`)

### Thêm API mới
- **Nên làm**:
  - Tạo service file trong `src/services/<domain>Service.js` dùng `api` từ `services/api.js`
  - Nếu dữ liệu cần global state: tạo slice trong `src/store/slices/<domain>Slice.js` và thêm vào `store.js`
  - Page dispatch thunk (Redux) hoặc gọi service trực tiếp (tuỳ pattern module hiện tại)

### Thêm filter/search/pagination
- **Nên làm**:
  - Dùng `useDebounce` cho input để tránh gọi API liên tục.
  - Dùng `usePagination` và reset về page 1 khi filter đổi.

### Không nên làm
- **Không** thay đổi shape `response.data` tuỳ tiện ngoài interceptor, vì hiện nhiều nơi dựa vào unwrapping.
- **Không** đưa logic redirect role vào nhiều nơi rải rác; ưu tiên tập trung ở `App.js`/`Login.js` như hiện tại.

---
**Trạng thái**: Đã tạo tài liệu cấu trúc Frontend Admin (`frontend_admin_structure.md`).
