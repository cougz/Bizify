/**
 * Validate an email address
 * @param email Email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password meets minimum requirements
 * @param password Password to validate
 * @param minLength Minimum length (default: 8)
 * @returns True if the password meets requirements, false otherwise
 */
export const isValidPassword = (password: string, minLength: number = 8): boolean => {
  if (!password || password.length < minLength) return false;
  
  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
};

/**
 * Validate a phone number
 * @param phone Phone number to validate
 * @returns True if the phone number is valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the cleaned phone number has a valid length
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Validate a URL
 * @param url URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Validate a credit card number using Luhn algorithm
 * @param cardNumber Credit card number to validate
 * @returns True if the credit card number is valid, false otherwise
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  // Remove all non-numeric characters
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate a date is in the future
 * @param date Date to validate
 * @returns True if the date is in the future, false otherwise
 */
export const isFutureDate = (date: string | Date): boolean => {
  const dateToCheck = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  // Reset time to midnight for comparison
  today.setHours(0, 0, 0, 0);
  dateToCheck.setHours(0, 0, 0, 0);
  
  return dateToCheck > today;
};

/**
 * Validate a string is not empty
 * @param value String to validate
 * @returns True if the string is not empty, false otherwise
 */
export const isNotEmpty = (value: string): boolean => {
  return value !== undefined && value !== null && value.trim() !== '';
};

/**
 * Validate a number is positive
 * @param value Number to validate
 * @returns True if the number is positive, false otherwise
 */
export const isPositive = (value: number): boolean => {
  return value > 0;
};

/**
 * Validate a number is non-negative
 * @param value Number to validate
 * @returns True if the number is non-negative, false otherwise
 */
export const isNonNegative = (value: number): boolean => {
  return value >= 0;
};
