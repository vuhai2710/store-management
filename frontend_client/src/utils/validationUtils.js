/**
 * Validation Utilities
 */

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Vietnamese phone: 10 digits starting with 0, or 11 digits starting with 84
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  const digits = phone.replace(/\D/g, '');
  return phoneRegex.test(digits) || (digits.length === 10 && digits.startsWith('0'));
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default: 4)
 * @returns {boolean}
 */
export const isValidPassword = (password, minLength = 4) => {
  if (!password) return false;
  return password.length >= minLength;
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @param {number} minLength - Minimum length (default: 4)
 * @returns {boolean}
 */
export const isValidUsername = (username, minLength = 4) => {
  if (!username) return false;
  // Username should be alphanumeric and underscore, min 4 chars
  const usernameRegex = /^[a-zA-Z0-9_]{4,}$/;
  return usernameRegex.test(username) && username.length >= minLength;
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean}
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate number
 * @param {string|number} value - Value to validate
 * @returns {boolean}
 */
export const isNumber = (value) => {
  if (value === null || value === undefined) return false;
  return !isNaN(Number(value));
};

/**
 * Validate positive number
 * @param {string|number} value - Value to validate
 * @returns {boolean}
 */
export const isPositiveNumber = (value) => {
  if (!isNumber(value)) return false;
  return Number(value) > 0;
};

/**
 * Validate non-negative number
 * @param {string|number} value - Value to validate
 * @returns {boolean}
 */
export const isNonNegativeNumber = (value) => {
  if (!isNumber(value)) return false;
  return Number(value) >= 0;
};

/**
 * Get validation error message
 * @param {string} field - Field name
 * @param {string} rule - Validation rule
 * @returns {string}
 */
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









