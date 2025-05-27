// Frontend utilities for handling multilingual content

export type Locale = 'vi' | 'en';

export const DEFAULT_LOCALE: Locale = 'vi';

export const SUPPORTED_LOCALES: Locale[] = ['vi', 'en'];

export const LOCALE_LABELS = {
  vi: 'Tiếng Việt',
  en: 'English',
} as const;

// Enhanced API fetch with locale support
export const fetchWithLocale = async (
  endpoint: string, 
  locale: Locale = DEFAULT_LOCALE,
  options: RequestInit = {}
) => {
  const url = new URL(endpoint, import.meta.env.VITE_API_URL || 'http://localhost:3000');
  url.searchParams.set('locale', locale);
  url.searchParams.set('fallback-locale', DEFAULT_LOCALE);

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Utility function to get localized content
export const getLocalizedContent = <T>(
  content: T | { [key in Locale]?: T },
  locale: Locale = DEFAULT_LOCALE
): T | undefined => {
  if (!content) return undefined;
  
  // If content is already localized object
  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    const localizedContent = content as { [key in Locale]?: T };
    return localizedContent[locale] || localizedContent[DEFAULT_LOCALE];
  }
  
  // If content is direct value
  return content as T;
};

// Format price with locale-specific formatting
export const formatPrice = (price: number, locale: Locale = DEFAULT_LOCALE): string => {
  const currency = locale === 'vi' ? 'VND' : 'USD';
  const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency,
  });
  
  return formatter.format(price);
};

// Format date with locale-specific formatting
export const formatDate = (date: Date | string, locale: Locale = DEFAULT_LOCALE): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeCode = locale === 'vi' ? 'vi-VN' : 'en-US';
  
  return dateObj.toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get browser preferred locale
export const getBrowserLocale = (): Locale => {
  const browserLang = navigator.language || navigator.languages?.[0];
  if (browserLang?.startsWith('vi')) return 'vi';
  return 'en';
};

// Validate if locale is supported
export const isValidLocale = (locale: string): locale is Locale => {
  return SUPPORTED_LOCALES.includes(locale as Locale);
};

// Get locale from various sources with priority
export const detectLocale = (): Locale => {
  // 1. Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get('locale');
  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }

  // 2. Check localStorage
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && isValidLocale(savedLocale)) {
    return savedLocale;
  }

  // 3. Check browser preference
  const browserLocale = getBrowserLocale();
  
  // 4. Fall back to default
  return browserLocale || DEFAULT_LOCALE;
};

// Save locale preference
export const saveLocalePreference = (locale: Locale): void => {
  localStorage.setItem('locale', locale);
};

// Update URL with locale
export const updateUrlLocale = (locale: Locale): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('locale', locale);
  window.history.pushState({}, '', url.toString());
};
