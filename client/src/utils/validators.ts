/**
 * Utility functions for form validation
 */

/**
 * Validate an email address
 * @param email Email address to validate
 * @returns True if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password (min 8 chars, at least one letter and one number)
 * @param password Password to validate
 * @returns True if valid, false otherwise
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate a phone number
 * @param phone Phone number to validate
 * @returns True if valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  // Allow various formats like (123) 456-7890, 123-456-7890, 1234567890
  const phoneRegex = /^(\+\d{1,2}\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate a URL
 * @param url URL to validate
 * @returns True if valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate a zip/postal code (US format)
 * @param zip Zip code to validate
 * @returns True if valid, false otherwise
 */
export const isValidZip = (zip: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
};

/**
 * Validate that a string is not empty
 * @param value String to validate
 * @returns True if not empty, false otherwise
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate that a number is positive
 * @param value Number to validate
 * @returns True if positive, false otherwise
 */
export const isPositive = (value: number): boolean => {
  return value > 0;
};

/**
 * Validate that a number is non-negative
 * @param value Number to validate
 * @returns True if non-negative, false otherwise
 */
export const isNonNegative = (value: number): boolean => {
  return value >= 0;
};

/**
 * Validate that a value is within a range
 * @param value Number to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns True if within range, false otherwise
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate a date is in the future
 * @param date Date to validate
 * @returns True if in the future, false otherwise
 */
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Validate a date is in the past
 * @param date Date to validate
 * @returns True if in the past, false otherwise
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};
