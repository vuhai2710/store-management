# Frontend - Admin Panel

## Quick Start

```bash
npm install
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

Xem chi tiết hướng dẫn setup tại: **[../FRONTEND_SETUP.md](../FRONTEND_SETUP.md)**

## Tổng quan

Hệ thống ERP hoàn chỉnh được xây dựng bằng ReactJS để quản lý toàn diện cửa hàng điện tử:

- **Quản lý Đơn hàng**: Dashboard, CRUD đơn hàng, theo dõi trạng thái
- **Quản lý Sản phẩm**: CRUD sản phẩm, upload hình ảnh, quản lý tồn kho
- **Quản lý Khách hàng**: Thông tin khách hàng, lịch sử mua hàng
- **Quản lý Kho**: Tồn kho, nhà cung cấp, kho hàng
- **Quản lý Nhân viên**: Thông tin nhân viên, phân quyền
- **Quản lý Tài chính**: Doanh thu, chi phí, bảng lương
- **Báo cáo**: Thống kê, biểu đồ, xuất báo cáo

## Công nghệ

- **React 18**: Framework chính
- **Ant Design**: UI Component Library
- **Redux Toolkit**: State Management
- **React Router**: Routing
- **Chart.js**: Biểu đồ thống kê
- **Axios**: HTTP Client

## Cấu hình

File `.env` là **OPTIONAL**. Frontend đã có default API URL là `http://localhost:8080/api/v1`.

Chỉ cần tạo file `.env` nếu backend chạy ở port khác hoặc server khác.

Xem chi tiết: **[../FRONTEND_SETUP.md](../FRONTEND_SETUP.md#-cấu-hình-optional)**

## Cấu trúc dự án

```
src/
├── components/          # Components tái sử dụng
│   ├── common/         # Components chung
│   ├── layout/         # Layout components
│   ├── dashboard/      # Dashboard components
│   ├── orders/         # Order management
│   ├── products/       # Product management
│   └── ...
├── pages/              # Page components
├── store/              # Redux store
│   └── slices/         # Redux slices
├── services/           # API services
├── hooks/              # Custom hooks
└── utils/              # Utility functions
```

## Demo Account

- **Username**: admin
- **Password**: admin123
