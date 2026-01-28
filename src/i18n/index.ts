import type { Messages, Locale } from '../types/options';
import { ko } from './ko';
import { en } from './en';

const locales: Record<Locale, Messages> = {
  ko,
  en,
};

export function getMessages(locale: Locale): Messages {
  return locales[locale] || locales.ko;
}

/**
 * 메시지 템플릿에서 변수 치환
 * 예: formatMessage('답글 {count}개', { count: 3 }) => '답글 3개'
 */
export function formatMessage(
  template: string,
  params: Record<string, string | number> = {}
): string {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key) => String(params[key] ?? `{${key}}`)
  );
}

export { ko, en };
