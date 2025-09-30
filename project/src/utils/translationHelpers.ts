// Translation helper utilities for dynamic content

export const interpolateTranslation = (template: string, variables: Record<string, string | number> = {}): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
};

// Enhanced translation function that handles interpolation
export const translateWithInterpolation = (
  t: (key: string, fallback?: string) => string,
  key: string,
  variables: Record<string, string | number> = {},
  fallback?: string
): string => {
  const template = t(key, fallback);
  return interpolateTranslation(template, variables);
};

// Helper for pluralization (basic implementation)
export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

// Helper for formatting numbers based on locale
export const formatNumber = (num: number, language: string): string => {
  try {
    return new Intl.NumberFormat(getLocaleFromLanguage(language)).format(num);
  } catch {
    return num.toString();
  }
};

// Helper for formatting dates based on locale
export const formatDate = (date: Date | string, language: string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(getLocaleFromLanguage(language)).format(dateObj);
  } catch {
    return date.toString();
  }
};

// Helper for formatting currency based on locale
export const formatCurrency = (amount: number, language: string, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat(getLocaleFromLanguage(language), {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
};

// Map language codes to locales
const getLocaleFromLanguage = (language: string): string => {
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'ko': 'ko-KR',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
  };
  
  return localeMap[language] || 'en-US';
};

// Helper for RTL languages (if needed in the future)
export const isRTL = (language: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
};

// Helper for getting language direction
export const getLanguageDirection = (language: string): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};