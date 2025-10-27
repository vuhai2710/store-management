/**
 * Helper để xử lý response và error từ API
 */

export const handleApiError = (error) => {
  if (error.errors) {
    // Validation errors từ Spring Boot
    const errorMessages = Object.entries(error.errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join("\n");
    return errorMessages;
  }

  return error.message || "Có lỗi xảy ra";
};

export const handleApiSuccess = (response, defaultMessage = "Thành công") => {
  return response.message || defaultMessage;
};

/**
 * Format data để gửi lên server
 */
export const formatRequestData = (data) => {
  // Loại bỏ các trường undefined hoặc null
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Parse JWT token để lấy thông tin
 */
export const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Kiểm tra JWT token có hết hạn chưa
 */
export const isTokenExpired = (token) => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Lấy role từ token
 */
export const getRoleFromToken = (token) => {
  const decoded = parseJwt(token);
  return decoded?.role || null;
};

/**
 * Kiểm tra user có role cụ thể không
 */
export const hasRole = (requiredRole) => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const role = getRoleFromToken(token);
  return role === requiredRole;
};

/**
 * Kiểm tra user có một trong các roles không
 */
export const hasAnyRole = (requiredRoles = []) => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const role = getRoleFromToken(token);
  return requiredRoles.includes(role);
};
