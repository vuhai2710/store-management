import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { hasAnyRole } from "../../utils/apiHelper";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  if (!authService.isAuthenticated()) {

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {

    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
