/**
 * Format Utilities
 * Common formatting functions for dates, currency, numbers, etc.
 */

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

/**
 * Format currency to Vietnamese Dong
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'VNĐ')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "VNĐ") => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${currency}`;
  }
  return `${Number(amount).toLocaleString("vi-VN")} ${currency}`;
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return "0";
  }
  return Number(number).toLocaleString("vi-VN");
};

/**
 * Format date to Vietnamese format
 * @param {string|Date} date - Date to format
 * @param {string} format - Date format (default: 'DD/MM/YYYY HH:mm')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "DD/MM/YYYY HH:mm") => {
  if (!date) return "N/A";
  return dayjs(date).format(format);
};

/**
 * Format date to relative time (e.g., "2 giờ trước")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return "N/A";
  return dayjs(date).fromNow();
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "N/A";
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  // Format: 0xxx xxx xxx or +84 xxx xxx xxx
  if (cleaned.startsWith("84")) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format status text with color mapping
 * @param {string} status - Status value
 * @param {Object} statusMap - Status mapping object
 * @returns {Object} { text, color }
 */
export const formatStatus = (status, statusMap = {}) => {
  if (!status) return { text: "N/A", color: "default" };
  const statusUpper = status.toUpperCase();
  return statusMap[statusUpper] || { text: status, color: "default" };
};


