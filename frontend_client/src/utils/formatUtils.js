/**
 * Format Utilities
 */

/**
 * Parse date string from backend (format: dd/MM/yyyy HH:mm:ss)
 * Backend JacksonConfig uses pattern "dd/MM/yyyy HH:mm:ss"
 * IMPORTANT: Always parse dd/MM/yyyy format FIRST because new Date() interprets as MM/dd/yyyy
 * @param {string|Date} date - Date string or Date object
 * @returns {Date|null}
 */
export const parseBackendDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;

  // PRIORITY: Parse dd/MM/yyyy HH:mm:ss format FIRST (backend format)
  if (typeof date === "string" && date.includes("/")) {
    const parts = date.split(" ");
    const datePart = parts[0];
    const timePart = parts[1] || "00:00:00";

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    if (
      day &&
      month &&
      year &&
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12
    ) {
      return new Date(
        year,
        month - 1,
        day,
        hours || 0,
        minutes || 0,
        seconds || 0
      );
    }
  }

  // Fallback: Try parsing ISO string or timestamp
  const directParse = new Date(date);
  if (!isNaN(directParse.getTime())) {
    const year = directParse.getFullYear();
    if (year >= 2000 && year <= 2100) {
      return directParse;
    }
  }

  return null;
};

/**
 * Format price to currency string
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol (default: '₫')
 * @returns {string}
 */
export const formatPrice = (price, currency = "₫") => {
  if (price == null || price === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(price) + " " + currency;
};

/**
 * Format date to string
 * @param {string|Date} date - Date to format
 * @param {string} format - Date format (default: 'dd/MM/yyyy')
 * @returns {string}
 */
export const formatDate = (date, format = "dd/MM/yyyy") => {
  if (!date) return "";

  // Use parseBackendDate to handle dd/MM/yyyy format from backend
  const d = parseBackendDate(date);
  if (!d || isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  switch (format) {
    case "dd/MM/yyyy":
      return `${day}/${month}/${year}`;
    case "dd/MM/yyyy HH:mm":
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case "dd/MM/yyyy HH:mm:ss":
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case "HH:mm":
      return `${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return "";
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");
  // Format as 0xxx xxx xxx or +84 xxx xxx xxx
  if (digits.length === 10) {
    return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  } else if (digits.length === 11 && digits.startsWith("0")) {
    return digits.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  }
  return phone;
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Get image URL from backend
 * @param {string} imagePath - Image path from backend
 * @returns {string}
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  // If already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // Otherwise, construct URL from backend base URL
  const apiBaseUrl =
    process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1";
  const baseUrl = apiBaseUrl.replace("/api/v1", "");
  // Remove leading slash if present
  const path = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
  return `${baseUrl}/${path}`;
};

/**
 * Format order status
 * @param {string} status - Order status
 * @returns {string}
 */
export const formatOrderStatus = (status) => {
  const statusLabels = {
    PENDING: "Đang chờ",
    CONFIRMED: "Đã xác nhận",
    COMPLETED: "Hoàn thành",
    CANCELED: "Đã hủy",
  };
  return statusLabels[status] || status;
};

/**
 * Format inventory status
 * @param {string} status - Inventory status
 * @returns {string}
 */
export const formatInventoryStatus = (status) => {
  const statusLabels = {
    IN_STOCK: "Còn hàng",
    OUT_OF_STOCK: "Hết hàng",
    COMING_SOON: "Sắp về",
  };
  return statusLabels[status] || status;
};
