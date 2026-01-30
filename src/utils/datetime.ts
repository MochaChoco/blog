import type { Messages } from '../types/options';
import { formatMessage } from '../i18n';

/**
 * Unix timestamp를 상대 시간으로 변환
 * @param timestamp - Unix timestamp (초 단위)
 * @param messages - 다국어 메시지
 */
export function timeAgo(timestamp: number, messages: Messages): string {
  const now = new Date();
  const pastDate = new Date(timestamp * 1000);
  const diffTime = now.getTime() - pastDate.getTime();

  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return formatMessage(messages.yearsAgo, { years: diffYears });
  } else if (diffMonths > 0) {
    return formatMessage(messages.monthsAgo, { months: diffMonths });
  } else if (diffDays > 0) {
    return formatMessage(messages.daysAgo, { days: diffDays });
  } else if (diffHours > 0) {
    return formatMessage(messages.hoursAgo, { hours: diffHours });
  } else if (diffMinutes > 0) {
    return formatMessage(messages.minutesAgo, { minutes: diffMinutes });
  } else {
    return messages.justNow;
  }
}

/**
 * Unix timestamp를 날짜 문자열로 변환
 */
export function formatDate(timestamp: number, locale: string = 'ko-KR'): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Unix timestamp를 날짜/시간 문자열로 변환
 */
export function formatDateTime(
  timestamp: number,
  locale: string = 'ko-KR'
): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
