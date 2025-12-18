
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;

  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  const digits = phone.replace(/\D/g, '');
  return phoneRegex.test(digits) || (digits.length === 10 && digits.startsWith('0'));
};

export const isValidPassword = (password, minLength = 4) => {
  if (!password) return false;
  return password.length >= minLength;
};

export const isValidUsername = (username, minLength = 4) => {
  if (!username) return false;

  const usernameRegex = /^[a-zA-Z0-9_]{4,}$/;
  return usernameRegex.test(username) && username.length >= minLength;
};

export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export const isNumber = (value) => {
  if (value === null || value === undefined) return false;
  return !isNaN(Number(value));
};

export const isPositiveNumber = (value) => {
  if (!isNumber(value)) return false;
  return Number(value) > 0;
};

export const isNonNegativeNumber = (value) => {
  if (!isNumber(value)) return false;
  return Number(value) >= 0;
};

export const getValidationErrorMessage = (field, rule) => {
  const messages = {
    required: `${field} không được để trống`,
    email: `${field} không hợp lệ`,
    phone: `${field} không hợp lệ`,
    password: `${field} phải có ít nhất 4 ký tự`,
    username: `${field} phải có ít nhất 4 ký tự và chỉ chứa chữ, số, dấu gạch dưới`,
    number: `${field} phải là số`,
    positiveNumber: `${field} phải là số dương`,
    nonNegativeNumber: `${field} phải là số không âm`,
    minLength: (min) => `${field} phải có ít nhất ${min} ký tự`,
    maxLength: (max) => `${field} không được vượt quá ${max} ký tự`,
  };
  return messages[rule] || `${field} không hợp lệ`;
};
