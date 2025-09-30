import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';

type Language = 'en' | 'ko' | 'zh' | 'es' | 'fr' | 'de' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper function to get nested translation value
const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const translations = {
  en,
  ko: {
    // Navigation
    nav: {
      home: '홈',
      courses: '코스',
      dashboard: '대시보드',
      about: '소개',
      admin: '관리자',
      community: '커뮤니티',
    },
    
    // Community
    community: {
      title: 'Matt Decanted 커뮤니티',
      subtitle: '와인 애호가들과 연결하고, 테이스팅 노트를 공유하며, 함께 배워보세요',
      // Add more Korean translations as needed
    },
  },
  // Add other languages with nested structure as needed
};

const availableLanguages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
];

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to English
    const saved = localStorage.getItem('matt_decanted_language');
    return (saved as Language) || 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('matt_decanted_language', language);
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const currentTranslations = translations[language] || translations.en;
    
    // Try to get nested value from current language
    let translation = getNestedValue(currentTranslations, key);
    
    if (translation) {
      return translation;
    }
    
    // Fallback to English if translation doesn't exist
    const englishTranslation = getNestedValue(translations.en, key);
    if (englishTranslation) {
      return englishTranslation;
    }
    
    // Return fallback or key if no translation found
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};