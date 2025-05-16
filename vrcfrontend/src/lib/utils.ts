// Patch: Minimal cn utility to unblock build
export function cn(...args: any[]): string {
  return args.filter(Boolean).join(' ');
}

/**
 * Format a date string into a localized format
 * @param dateString - ISO date string or Date object
 * @param locale - Locale code (defaults to 'vi-VN')
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date, locale: string = 'vi-VN'): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  return date.toLocaleDateString(locale, options);
}

/**
 * Format a date range (start and end date)
 * @param startDate - Start date string
 * @param endDate - End date string
 * @param locale - Locale code (defaults to 'vi-VN')
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: string, endDate: string, locale: string = 'vi-VN'): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Same day event
  if (startDate === endDate) {
    return formatDate(start, locale);
  }
  
  // Multi-day event
  return `${formatDate(start, locale)} - ${formatDate(end, locale)}`;
}
