export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;

  const phoneRegex = /^(?:\+?84|0)\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const minLength = (value, minLength) => {
  if (!value) return false;
  return String(value).length >= minLength;
};

export const maxLength = (value, maxLength) => {
  if (!value) return true;
  return String(value).length <= maxLength;
};

export const isInRange = (value, min, max) => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const isPositive = (value) => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const isNonNegative = (value) => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};
