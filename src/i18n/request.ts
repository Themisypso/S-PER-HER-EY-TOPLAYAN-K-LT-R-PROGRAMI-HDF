import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['tr', 'en', 'de', 'fr', 'es', 'ja', 'ko', 'pt', 'ar', 'ru'];
export const defaultLocale = 'tr';

export default getRequestConfig(async () => {
  // Check if user has a language preference in cookie
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  // Accept-language fallback
  const acceptLanguage = headers().get('accept-language');
  let browserLocale = defaultLocale;
  
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (locales.includes(preferred)) {
      browserLocale = preferred;
    }
  }

  const locale = locales.includes(localeCookie as string) 
    ? localeCookie 
    : browserLocale;

  try {
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default
    };
  } catch (error) {
    // Fallback to default locale if messages are missing
    return {
      locale: defaultLocale,
      messages: (await import(`../messages/${defaultLocale}.json`)).default
    };
  }
});
