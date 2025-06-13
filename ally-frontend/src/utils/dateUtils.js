/**
 * Date utility functions for handling timezone-safe date operations
 * Ensures all dates remain in local timezone to prevent off-by-one day issues
 */

/**
 * Format a Date object for API calls in YYYY-MM-DD format
 * Preserves local timezone instead of converting to UTC
 * @param {Date} date - The date to format
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateForAPI = (date) => {
  if (!date || !(date instanceof Date)) {
    throw new Error('Invalid date provided to formatDateForAPI');
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a Date object for API calls in YYYY-MM-DDTHH:mm:ss format
 * Preserves local timezone instead of converting to UTC
 * @param {Date} date - The date to format
 * @returns {string} - DateTime string in YYYY-MM-DDTHH:mm:ss format
 */
export const formatDateTimeForAPI = (date) => {
  if (!date || !(date instanceof Date)) {
    throw new Error('Invalid date provided to formatDateTimeForAPI');
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Create a date at the start of day in local timezone
 * @param {Date} date - The date to reset to start of day
 * @returns {Date} - New date object at start of day
 */
export const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Create a date at the end of day in local timezone
 * @param {Date} date - The date to set to end of day
 * @returns {Date} - New date object at end of day
 */
export const getEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Check if a date is today in local timezone
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is today
 */
export const isToday = (date) => {
  const today = new Date();
  return formatDateForAPI(date) === formatDateForAPI(today);
};

/**
 * Check if a date is in the past (before today) in local timezone
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is in the past
 */
export const isPastDate = (date) => {
  const today = getStartOfDay(new Date());
  const checkDate = getStartOfDay(date);
  return checkDate < today;
};

/**
 * Parse time slot string (like "09:00 AM") to hour in 24-hour format
 * @param {string} timeSlot - Time slot string (e.g., "09:00 AM", "02:00 PM")
 * @returns {number} - Hour in 24-hour format (0-23)
 */
export const parseTimeSlotToHour = (timeSlot) => {
  const [timeStr, period] = timeSlot.split(' ');
  const [hours] = timeStr.split(':');
  let hour24 = parseInt(hours);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return hour24;
};

/**
 * Check if a time slot is in the past for a given date
 * @param {Date} date - The date to check
 * @param {string} timeSlot - Time slot string (e.g., "09:00 AM")
 * @returns {boolean} - True if the time slot is in the past
 */
export const isPastTimeSlot = (date, timeSlot) => {
  // If the date is not today, use regular date comparison
  if (!isToday(date)) {
    return isPastDate(date);
  }
  
  // For today, check if the time slot has passed
  const now = new Date();
  const slotHour = parseTimeSlotToHour(timeSlot);
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // If slot hour is less than current hour, it's in the past
  if (slotHour < currentHour) {
    return true;
  }
  
  // If slot hour equals current hour, check if we're past the slot start time
  // (Assuming slots start at the top of the hour, so 2:00 PM slot is unavailable after 2:00 PM)
  if (slotHour === currentHour && currentMinutes > 0) {
    return true;
  }
  
  return false;
};

/**
 * Filter available time slots to remove past slots for today
 * @param {Date} selectedDate - The selected date
 * @param {string[]} timeSlots - Array of time slot strings
 * @returns {string[]} - Filtered array of available time slots
 */
export const filterPastTimeSlots = (selectedDate, timeSlots) => {
  if (!isToday(selectedDate)) {
    return timeSlots; // No filtering needed for future dates
  }
  
  return timeSlots.filter(timeSlot => !isPastTimeSlot(selectedDate, timeSlot));
};