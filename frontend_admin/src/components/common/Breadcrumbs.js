import React from "react";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const routeLabels = {
    dashboard: "Dashboard",
    orders: "Đơn hàng",
    products: "Sản phẩm",
    customers: "Khách hàng",
    categories: "Danh mục",
    inventory: "Kho hàng",
    "import-orders": "Đơn nhập hàng",
    shipments: "Vận đơn",
    suppliers: "Nhà cung cấp",
    employees: "Nhân viên",
    finance: "Tài chính",
    reports: "Báo cáo",
    users: "Người dùng",
  };

  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined /> Trang chủ
        </Link>
      ),
    },
  ];

  pathnames.forEach((value, index) => {
    const route = `/${pathnames.slice(0, index + 1).join("/")}`;
    const label = routeLabels[value] || value;
    const isLast = index === pathnames.length - 1;

    breadcrumbItems.push({
      title: isLast ? (
        <span>{label}</span>
      ) : (
        <Link to={route}>{label}</Link>
      ),
    });
  });

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ marginBottom: "16px" }}
    />
  );
};

export default Breadcrumbs;
