import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Translation, safeQuery, isSupabaseConnected } from '../lib/supabaseClient';

interface TranslatedContent {
  [fieldName: string]: string;
}

// Stable cache to prevent unnecessary re-fetches
const translationCache = new Map<string, TranslatedContent>();

// Hook for fetching translated content from the database
export const useTranslatedContent = (
  contentType: 'course' | 'module' | 'quiz' | 'community_post',
  contentId: string,
  defaultContent: TranslatedContent
): TranslatedContent => {
  const { language } = useLanguage();
  
  // Always return default content for English
  if (language === 'en' || !contentId || !contentType) {
    return defaultContent;
  }
  
  const cacheKey = `${contentType}-${contentId}-${language}`;
  
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent>(() => {
    // Check cache first
    const cached = translationCache.get(cacheKey);
    return cached || defaultContent;
  });

  // Stable fetch function with proper dependencies
  const fetchTranslations = useCallback(async () => {
    // Check cache first
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslatedContent(cached);
      return;
    }

    // Only fetch if Supabase is connected
    if (!isSupabaseConnected()) {
      setTranslatedContent(defaultContent);
      return;
    }

    try {
      const translations = await safeQuery(
        () => supabase!
          .from('translations')
          .select('field_name, translated_text')
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('language_code', language),
        [],
        3000 // 3 second timeout
      );

      if (translations && translations.length > 0) {
        const translatedFields: TranslatedContent = { ...defaultContent };
        
        translations.forEach((translation: Translation) => {
          translatedFields[translation.field_name] = translation.translated_text;
        });

        // Cache the result
        translationCache.set(cacheKey, translatedFields);
        setTranslatedContent(translatedFields);
      } else {
        // Cache the default content to prevent re-fetching
        translationCache.set(cacheKey, defaultContent);
        setTranslatedContent(defaultContent);
      }
    } catch (error) {
      setTranslatedContent(defaultContent);
    }
  }, [contentType, contentId, language, cacheKey]); // Stable dependencies

  // Effect with stable dependencies
  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  return translatedContent;
};

// Hook for saving translations (admin use)
export const useTranslationManager = () => {
  const saveTranslation = useCallback(async (
    contentType: 'course' | 'module' | 'quiz' | 'community_post',
    contentId: string,
    languageCode: string,
    fieldName: string,
    translatedText: string
  ): Promise<boolean> => {
    if (!isSupabaseConnected()) {
      console.warn('Supabase not connected - cannot save translation');
      return false;
    }

    try {
      console.log('Saving translation:', { contentType, contentId, languageCode, fieldName });
      
      const { data, error } = await supabase!
        .from('translations')
        .upsert({
          content_type: contentType,
          content_id: contentId,
          language_code: languageCode,
          field_name: fieldName,
          translated_text: translatedText,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Translation save error:', error.message);
        throw error;
      }
      
      console.log('Translation saved successfully:', data);
      
      // Clear cache for this content
      const cacheKey = `${contentType}-${contentId}-${languageCode}`;
      translationCache.delete(cacheKey);
      
      return true;
    } catch (error: any) {
      console.error('Error saving translation:', error.message);
      return false;
    }
  }, []);

  const deleteTranslation = useCallback(async (
    contentType: 'course' | 'module' | 'quiz' | 'community_post',
    contentId: string,
    languageCode: string,
    fieldName: string
  ): Promise<boolean> => {
    if (!isSupabaseConnected()) {
      console.warn('Supabase not connected - cannot delete translation');
      return false;
    }

    try {
      const { error } = await supabase!
        .from('translations')
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('language_code', languageCode)
        .eq('field_name', fieldName);

      if (error) {
        console.error('Translation delete error:', error);
        throw error;
      }
      
      // Clear cache for this content
      const cacheKey = `${contentType}-${contentId}-${languageCode}`;
      translationCache.delete(cacheKey);
      
      return true;
    } catch (error: any) {
      console.error('Error deleting translation:', error.message);
      return false;
    }
  }, []);

  return { saveTranslation, deleteTranslation };
};