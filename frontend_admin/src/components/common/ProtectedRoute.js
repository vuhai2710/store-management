/**
 * ProtectedRoute Component
 * Bảo vệ routes yêu cầu authentication và authorization
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { hasAnyRole } from "../../utils/apiHelper";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  // Kiểm tra authentication
  if (!authService.isAuthenticated()) {
    // Redirect về login và lưu location để quay lại sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra authorization nếu có yêu cầu roles
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    // Redirect về trang unauthorized hoặc dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
