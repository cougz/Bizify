/**
 * Utility functions for formatting data
 */

/**
 * Format a date string or Date object to a readable date format
 * @param date Date string or Date object
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Format a number as currency
 * @param amount Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'USD'
): string => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number with commas
 * @param num Number to format
 * @returns Formatted number string
 */
export const formatNumber = (
  num: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string => {
  if (num === null || num === undefined) return '';
  
  return new Intl.NumberFormat('en-US', options).format(num);
};

/**
 * Format a phone number
 * @param phone Phone number string
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if we can't format it
  return phone;
};

/**
 * Truncate text to a specified length
 * @param text Text to truncate
 * @param length Maximum length
 * @returns Truncated text
 */
export const truncateText = (
  text: string | null | undefined,
  length: number = 50
): string => {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return `${text.slice(0, length)}...`;
};

/**
 * Format a status string to title case
 * @param status Status string
 * @returns Formatted status
 */
export const formatStatus = (status: string | null | undefined): string => {
  if (!status) return '';
  
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};
