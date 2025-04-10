/**
 * Format a date string to a more readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2023")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Format a currency value
 * @param value - Number to format as currency
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a phone number to a more readable format
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., "(123) 456-7890")
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // If not a standard format, return the original
  return phone;
};

/**
 * Format a number with commas
 * @param value - Number to format
 * @returns Formatted number string (e.g., "1,234")
 */
export const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a percentage value
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "12.5%")
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Truncate a string if it exceeds a certain length
 * @param text - String to truncate
 * @param length - Maximum length (default: 50)
 * @returns Truncated string with ellipsis if needed
 */
export const truncateText = (text: string, length: number = 50): string => {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.slice(0, length) + '...';
};
