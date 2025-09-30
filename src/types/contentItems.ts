// Content Items Types for Multilingual Content Management

export type ContentItemType = 'blind_tasting' | 'short_course';

export type SupportedLanguage = 'en' | 'ko' | 'zh' | 'ja' | 'da';

export interface ContentItem {
  id: string;
  slug: string;
  type: ContentItemType;
  
  // Admin labels (internal use)
  admin_label_en: string;
  admin_label_ko?: string;
  admin_label_zh?: string;
  admin_label_ja?: string;
  admin_label_da?: string;
  
  // User labels (frontend display)
  user_label_en: string;
  user_label_ko?: string;
  user_label_zh?: string;
  user_label_ja?: string;
  user_label_da?: string;
  
  // Descriptions (optional)
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_ja?: string;
  description_da?: string;
  
  // Access control
  subscriber_only: boolean;
  is_active: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ContentItemFormData {
  slug: string;
  type: ContentItemType;
  
  // Admin labels
  admin_label_en: string;
  admin_label_ko: string;
  admin_label_zh: string;
  admin_label_ja: string;
  admin_label_da: string;
  
  // User labels
  user_label_en: string;
  user_label_ko: string;
  user_label_zh: string;
  user_label_ja: string;
  user_label_da: string;
  
  // Descriptions
  description_en: string;
  description_ko: string;
  description_zh: string;
  description_ja: string;
  description_da: string;
  
  // Settings
  subscriber_only: boolean;
  is_active: boolean;
}

// Helper functions for content items
export const getLocalizedLabel = (
  item: ContentItem,
  language: SupportedLanguage,
  isAdmin: boolean = false
): string => {
  const labelType = isAdmin ? 'admin_label' : 'user_label';
  const labelKey = `${labelType}_${language}` as keyof ContentItem;
  const fallbackKey = `${labelType}_en` as keyof ContentItem;
  
  return (item[labelKey] as string) || (item[fallbackKey] as string) || item.slug;
};

export const getLocalizedDescription = (
  item: ContentItem,
  language: SupportedLanguage
): string => {
  const descKey = `description_${language}` as keyof ContentItem;
  const fallbackKey = 'description_en' as keyof ContentItem;
  
  return (item[descKey] as string) || (item[fallbackKey] as string) || '';
};

export const getContentTypeLabel = (type: ContentItemType, language: SupportedLanguage): string => {
  const labels = {
    blind_tasting: {
      en: 'Blind Tasting',
      ko: '블라인드 테이스팅',
      zh: '盲品',
      ja: 'ブラインドテイスティング',
      da: 'Blindsmagning'
    },
    short_course: {
      en: 'Short Course',
      ko: '단기 코스',
      zh: '短期课程',
      ja: 'ショートコース',
      da: 'Kort Kursus'
    }
  };
  
  return labels[type][language] || labels[type].en;
};

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
];