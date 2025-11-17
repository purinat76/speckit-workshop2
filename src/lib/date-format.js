// @ts-nocheck
/**
 * DATE FORMATTING UTILITIES
 * Handles date formatting for album groups and display
 */

/**
 * Format date to YYYY-MM group format
 * @param {Date|number} date - Date object or timestamp
 * @returns {string} Formatted date (YYYY-MM)
 */
function formatToGroupDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format YYYY-MM group date to human-readable format
 * @param {string} groupDate - Group date (YYYY-MM)
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date (e.g., "June 2025")
 */
function formatGroupDate(groupDate, locale = 'en-US') {
  const [year, month] = groupDate.split('-');
  const date = new Date(year, parseInt(month) - 1, 1);

  return date.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format timestamp to display format
 * @param {number} timestamp - Milliseconds since epoch
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date (e.g., "Nov 17, 2025")
 */
function formatTimestamp(timestamp, locale = 'en-US') {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format timestamp to full date-time
 * @param {number} timestamp - Milliseconds since epoch
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date-time (e.g., "Nov 17, 2025, 2:30 PM")
 */
function formatDateTime(timestamp, locale = 'en-US') {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get time ago string (e.g., "2 hours ago")
 * @param {number} timestamp - Milliseconds since epoch
 * @returns {string} Relative time string
 */
function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatTimestamp(timestamp);
}

export {
  formatToGroupDate,
  formatGroupDate,
  formatTimestamp,
  formatDateTime,
  formatTimeAgo,
};
