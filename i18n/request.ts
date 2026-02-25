import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

const SUPPORTED_LOCALES = ['tr', 'en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'tr';
  // e.g. "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
  const langs = acceptLanguage
    .split(',')
    .map((s) => s.split(';')[0].trim().split('-')[0].toLowerCase());
  for (const lang of langs) {
    if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
      return lang as Locale;
    }
  }
  return 'tr';
}

export default getRequestConfig(async () => {
  const headersList = await headers();
  const locale = detectLocale(headersList.get('accept-language'));

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
