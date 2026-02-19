/**
 * Frontend Validation Utilities
 * These validations run on the client side before form submission
 */

/**
 * Validate email format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate mobile number (supports multiple formats)
 * Accepts: +1234567890, 1234567890, (123) 456-7890, 123-456-7890
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateMobile = (mobile) => {
  // Remove all non-digit characters for validation
  const digitsOnly = mobile.replace(/\D/g, '');

  // Check if it has 10-15 digits (international format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Validate name (must have at least 2 characters, letters and spaces only)
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name.trim());
};

/**
 * Validate price (must be positive number)
 * @param {number|string} price - Price to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0;
};

/**
 * Validate quantity (must be positive integer)
 * @param {number|string} quantity - Quantity to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateQuantity = (quantity) => {
  const numQty = parseInt(quantity, 10);
  return Number.isInteger(numQty) && numQty > 0;
};

/**
 * Validate item name (must have at least 2 characters)
 * @param {string} itemName - Item name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateItemName = (itemName) => {
  return itemName.trim().length >= 2;
};

/**
 * Validate selected items array
 * @param {Array} items - Array of selected items
 * @returns {Object} - {valid: boolean, errors: Array}
 */
export const validateItems = (items) => {
  const errors = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Please add at least one item to your order');
    return { valid: false, errors };
  }

  items.forEach((item, index) => {
    if (!validateItemName(item.itemName)) {
      errors.push(`Item ${index + 1}: Name must be at least 2 characters`);
    }
    if (!validatePrice(item.price)) {
      errors.push(`Item ${index + 1}: Price must be a positive number`);
    }
    if (!validateQuantity(item.quantity)) {
      errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate entire order form
 * @param {Object} formData - Form data object
 * @returns {Object} - {valid: boolean, errors: Object}
 */
export const validateOrderForm = (formData) => {
  const errors = {};

  // Validate name
  if (!formData.name || !validateName(formData.name)) {
    errors.name = 'Please enter a valid name (at least 2 characters, letters only)';
  }

  // Validate email
  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate mobile
  if (!formData.mobile || !validateMobile(formData.mobile)) {
    errors.mobile = 'Please enter a valid mobile number (10-15 digits)';
  }

  // Validate items
  const itemsValidation = validateItems(formData.items);
  if (!itemsValidation.valid) {
    errors.items = itemsValidation.errors;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format mobile number for display (adds spaces/dashes)
 * @param {string} mobile - Raw mobile number
 * @returns {string} - Formatted mobile number
 */
export const formatMobile = (mobile) => {
  const digitsOnly = mobile.replace(/\D/g, '');

  // Format as: +1 (234) 567-8900 (US format as example)
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  return mobile; // Return as-is if not standard format
};

/**
 * Sanitize string input (prevent XSS)
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 500); // Limit length
};
