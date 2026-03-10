const validator = require('validator');

// Validate email
const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Validate phone number (simple US format)
const validatePhone = (phone) => {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

// Validate password strength
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas,
    errors: {
      minLength: password.length < minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers,
      hasNonalphas: !hasNonalphas
    }
  };
};

// Validate URL
const validateUrl = (url) => {
  return validator.isURL(url);
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  return input;
};

// Validate credit card (basic Luhn algorithm)
const validateCreditCard = (cardNumber) => {
  return validator.isCreditCard(cardNumber);
};

// Validate ZIP code (US)
const validateZipCode = (zipCode) => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateUrl,
  sanitizeInput,
  validateCreditCard,
  validateZipCode
};