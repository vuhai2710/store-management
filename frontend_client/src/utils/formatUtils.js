/**
 * Format Utilities
 */

/**
 * Format price to currency string
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol (default: '₫')
 * @returns {string}
 */
export const formatPrice = (price, currency = '₫') => {
  if (price == null || price === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(price) + ' ' + currency;
};

/**
 * Format date to string
 * @param {string|Date} date - Date to format
 * @param {string} format - Date format (default: 'dd/MM/yyyy')
 * @returns {string}
 */
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'dd/MM/yyyy HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'dd/MM/yyyy HH:mm:ss':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case 'HH:mm':
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
  if (!phone) return '';
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  // Format as 0xxx xxx xxx or +84 xxx xxx xxx
  if (digits.length === 10) {
    return digits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (digits.length === 11 && digits.startsWith('0')) {
    return digits.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
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
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get image URL from backend
 * @param {string} imagePath - Image path from backend
 * @returns {string}
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, construct URL from backend base URL
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';
  const baseUrl = apiBaseUrl.replace('/api/v1', '');
  // Remove leading slash if present
  const path = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${baseUrl}/${path}`;
};

/**
 * Format order status
 * @param {string} status - Order status
 * @returns {string}
 */
export const formatOrderStatus = (status) => {
  const statusLabels = {
    PENDING: 'Đang chờ',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Hoàn thành',
    CANCELED: 'Đã hủy',
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
    IN_STOCK: 'Còn hàng',
    OUT_OF_STOCK: 'Hết hàng',
    COMING_SOON: 'Sắp về',
  };
  return statusLabels[status] || status;
};





