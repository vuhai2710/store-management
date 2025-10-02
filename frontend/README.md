# ReactJS ERP - Hệ thống Quản lý Cửa hàng Điện tử

## Tổng quan
Hệ thống ERP hoàn chỉnh được xây dựng bằng ReactJS để quản lý toàn diện cửa hàng điện tử, bao gồm các module chức năng chính:

- **Quản lý Đơn hàng**: Dashboard, CRUD đơn hàng, theo dõi trạng thái
- **Quản lý Sản phẩm**: CRUD sản phẩm, upload hình ảnh, quản lý tồn kho
- **Quản lý Khách hàng**: Thông tin khách hàng, lịch sử mua hàng
- **Quản lý Kho**: Tồn kho, nhà cung cấp, kho hàng
- **Quản lý Nhân viên**: Thông tin nhân viên, phân quyền
- **Quản lý Tài chính**: Doanh thu, chi phí, bảng lương
- **Báo cáo**: Thống kê, biểu đồ, xuất báo cáo

## Công nghệ sử dụng

### Frontend
- **React 18**: Framework chính
- **Ant Design**: UI Component Library
- **Redux Toolkit**: State Management
- **React Router**: Routing
- **Chart.js**: Biểu đồ thống kê
- **Axios**: HTTP Client
- **Styled Components**: CSS-in-JS

### Kiến trúc
- **Modular Architecture**: Tách biệt theo module chức năng
- **Component-based**: Tái sử dụng components
- **Responsive Design**: Tương thích mobile/desktop
- **RESTful API**: Tích hợp với backend

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm >= 8.0.0

### Cài đặt dependencies
```bash
npm install
```

### Chạy ứng dụng
```bash
# Development
npm start

# Build production
npm run build

# Test
npm test
```

### Cấu hình môi trường
Tạo file `.env` trong thư mục gốc:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Cấu trúc dự án

```
src/
├── components/          # Components tái sử dụng
│   ├── common/          # Components chung
│   ├── layout/          # Layout components
│   ├── dashboard/       # Dashboard components
│   ├── orders/          # Order management
│   ├── products/        # Product management
│   ├── customers/       # Customer management
│   ├── inventory/       # Inventory management
│   ├── employees/       # Employee management
│   └── finance/         # Finance management
├── pages/               # Page components
├── store/               # Redux store
│   └── slices/         # Redux slices
├── services/            # API services
├── hooks/               # Custom hooks
├── utils/               # Utility functions
├── types/               # TypeScript types
└── constants/           # Constants
```

## Tính năng chính

### 1. Dashboard
- Thống kê tổng quan
- Biểu đồ doanh thu
- Trạng thái đơn hàng
- Top sản phẩm bán chạy
- Đơn hàng gần đây

### 2. Quản lý Đơn hàng
- Danh sách đơn hàng với filter/search
- Tạo/sửa đơn hàng
- Theo dõi trạng thái
- In hóa đơn
- Timeline trạng thái

### 3. Quản lý Sản phẩm
- CRUD sản phẩm
- Upload hình ảnh
- Quản lý tồn kho
- Phân loại sản phẩm
- Cảnh báo hết hàng

### 4. Quản lý Khách hàng
- Thông tin khách hàng
- Lịch sử mua hàng
- Phân tích hành vi
- Quản lý nhóm khách hàng

### 5. Quản lý Kho
- Tồn kho theo kho
- Nhà cung cấp
- Nhập/xuất kho
- Báo cáo tồn kho

### 6. Quản lý Nhân viên
- Thông tin nhân viên
- Phân quyền
- Theo dõi hoạt động
- Quản lý phòng ban

### 7. Quản lý Tài chính
- Doanh thu/chi phí
- Bảng lương
- Báo cáo tài chính
- Thống kê lợi nhuận

### 8. Báo cáo
- Xuất Excel/PDF
- Biểu đồ thống kê
- Báo cáo theo thời gian
- Dashboard analytics

## API Integration

Dự án được thiết kế để tích hợp với RESTful API backend:

### Authentication
```javascript
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Orders
```javascript
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
DELETE /api/orders/:id
```

### Products
```javascript
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

### Customers
```javascript
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

## Demo Account
- **Username**: admin
- **Password**: admin123

## Tính năng nâng cao

### Responsive Design
- Tương thích mobile/tablet/desktop
- Breakpoints: xs, sm, md, lg, xl
- Grid system với Ant Design

### State Management
- Redux Toolkit với async thunks
- Normalized state structure
- Optimistic updates

### Error Handling
- Global error boundary
- API error handling
- User-friendly error messages

### Performance
- Code splitting
- Lazy loading
- Memoization
- Virtual scrolling cho bảng lớn

## Mở rộng

### Thêm module mới
1. Tạo slice trong `store/slices/`
2. Tạo service trong `services/`
3. Tạo components trong `components/[module]/`
4. Tạo pages trong `pages/`
5. Thêm routes trong `App.js`

### Customization
- Theme colors trong `index.css`
- Component styles với styled-components
- Layout configuration trong `AppSidebar.js`

## Troubleshooting

### Lỗi thường gặp
1. **CORS Error**: Cấu hình backend CORS
2. **API Connection**: Kiểm tra `REACT_APP_API_URL`
3. **Build Error**: Xóa `node_modules` và `npm install` lại

### Debug
- Sử dụng Redux DevTools
- Console logs trong services
- Network tab để debug API calls

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request



