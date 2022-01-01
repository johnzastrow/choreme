/**
 * Convert date to formated string.
 *
 * @param {Date} date
 */
export function formatDate(date: Date) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', dateOptions)
}
