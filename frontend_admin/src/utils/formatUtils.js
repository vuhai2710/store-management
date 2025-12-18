import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.locale("vi");

export const formatCurrency = (amount, currency = "VNĐ") => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${currency}`;
  }
  return `${Number(amount).toLocaleString("vi-VN")} ${currency}`;
};

export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return "0";
  }
  return Number(number).toLocaleString("vi-VN");
};

export const formatDate = (date, format = "DD/MM/YYYY HH:mm") => {
  if (date === null || date === undefined || date === "") return "N/A";

  let d;

  if (typeof date === "number") {
    d = dayjs(date > 1e12 ? date : date * 1000);
  } else if (typeof date === "string") {
    const s = date.trim().replace(/(\.\d{3})\d+$/, "$1");
    const formats = [
      "DD/MM/YYYY HH:mm:ss",
      "DD/MM/YYYY HH:mm",
      "DD/MM/YYYY",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DDTHH:mm:ss",
      "YYYY-MM-DD",
    ];
    d = dayjs(s, formats, true);
    if (!d.isValid()) d = dayjs(s.replace(" ", "T"));
  } else {
    d = dayjs(date);
  }

  return d.isValid() ? d.format(format) : "N/A";
};

export const formatRelativeTime = (date) => {
  if (!date) return "N/A";
  return dayjs(date).fromNow();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return "N/A";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("84")) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }
  return `${Number(value).toFixed(decimals)}%`;
};

export const formatStatus = (status, statusMap = {}) => {
  if (!status) return { text: "N/A", color: "default" };
  const statusUpper = status.toUpperCase();
  return statusMap[statusUpper] || { text: status, color: "default" };
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1";
  const baseUrl = apiBaseUrl.replace("/api/v1", "");
  const path = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
  return `${baseUrl}/${path}`;
};
