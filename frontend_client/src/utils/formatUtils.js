
export const parseBackendDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;

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

  const directParse = new Date(date);
  if (!isNaN(directParse.getTime())) {
    const year = directParse.getFullYear();
    if (year >= 2000 && year <= 2100) {
      return directParse;
    }
  }

  return null;
};

export const formatPrice = (price, currency = "₫") => {
  if (price == null || price === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(price) + " " + currency;
};

export const formatDate = (date, format = "dd/MM/yyyy") => {
  if (!date) return "-";

  const d = parseBackendDate(date);
  if (!d || isNaN(d.getTime())) return "-";

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

export const formatPhone = (phone) => {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  } else if (digits.length === 11 && digits.startsWith("0")) {
    return digits.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  }
  return phone;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const apiBaseUrl =
    process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1";
  const baseUrl = apiBaseUrl.replace("/api/v1", "");

  const path = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
  return `${baseUrl}/${path}`;
};

export const formatOrderStatus = (status) => {
  const statusLabels = {
    PENDING: "Đang chờ",
    CONFIRMED: "Đã xác nhận",
    COMPLETED: "Hoàn thành",
    CANCELED: "Đã hủy",
  };
  return statusLabels[status] || status;
};

export const formatInventoryStatus = (status) => {
  const statusLabels = {
    IN_STOCK: "Còn hàng",
    OUT_OF_STOCK: "Hết hàng",
    COMING_SOON: "Sắp về",
  };
  return statusLabels[status] || status;
};
