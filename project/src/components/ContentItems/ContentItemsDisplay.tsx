import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase, safeQuery } from '../../lib/supabaseClient';
import { 
  ContentItem, 
  SupportedLanguage,
  getLocalizedLabel,
  getLocalizedDescription,
  getContentTypeLabel
} from '../../types/contentItems';
import { 
  Video, 
  BookOpen, 
  Lock, 
  Crown, 
  Star, 
  Play, 
  Calendar,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';

interface ContentItemsDisplayProps {
  showTitle?: boolean;
  maxItems?: number;
  typeFilter?: 'all' | 'blind_tasting' | 'short_course';
  className?: string;
}

const ContentItemsDisplay: React.FC<ContentItemsDisplayProps> = ({
  showTitle = true,
  maxItems,
  typeFilter = 'all',
  className = ''
}) => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContentItems();
  }, [user]);

  const loadContentItems = async () => {
    // Mock data when Supabase not connected
    const mockData: ContentItem[] = [
      {
        id: '1',
        slug: 'matts-blind-tastings',
        type: 'blind_tasting',
        admin_label_en: 'Matt\'s Blind Tastings (Admin)',
        admin_label_ko: '맷의 블라인드 테이스팅 (관리자)',
        admin_label_zh: '马特的盲品 (管理员)',
        admin_label_ja: 'マットのブラインドテイスティング (管理者)',
        admin_label_da: 'Matts Blindsmagning (Admin)',
        user_label_en: 'Matt\'s Blind Tastings',
        user_label_ko: '맷의 블라인드 테이스팅',
        user_label_zh: '马特的盲品',
        user_label_ja: 'マットのブラインドテイスティング',
        user_label_da: 'Matts Blindsmagning',
        description_en: 'Weekly blind tasting sessions with Matt to test your palate and learn from fellow wine enthusiasts',
        description_ko: '맷과 함께하는 주간 블라인드 테이스팅 세션으로 미각을 테스트하고 동료 와인 애호가들로부터 배워보세요',
        description_zh: '与马特一起进行的每周盲品会，测试您的味觉并向其他葡萄酒爱好家学习',
        description_ja: 'マットと一緒に行う週次ブラインドテイスティングセッションで、味覚をテストし、仲間のワイン愛好家から学びましょう',
        description_da: 'Ugentlige blindsmagninger med Matt for at teste din gane og lære af andre vinentusiaster',
        subscriber_only: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        slug: 'short-courses',
        type: 'short_course',
        admin_label_en: 'Short Courses (Admin)',
        admin_label_ko: '단기 코스 (관리자)',
        admin_label_zh: '短期课程 (管理员)',
        admin_label_ja: 'ショートコース (管理者)',
        admin_label_da: 'Korte Kurser (Admin)',
        user_label_en: 'Short Courses',
        user_label_ko: '단기 코스',
        user_label_zh: '短期课程',
        user_label_ja: 'ショートコース',
        user_label_da: 'Korte Kurser',
        description_en: 'Focused mini-courses covering specific wine topics in digestible sessions',
        description_ko: '소화하기 쉬운 세션으로 특정 와인 주제를 다루는 집중적인 미니 코스',
        description_zh: '专注于特定葡萄酒主题的迷你课程，以易于消化的课程形式呈现',
        description_ja: '特定のワイントピックを消化しやすいセッションで扱う集中的なミニコース',
        description_da: 'Fokuserede mini-kurser, der dækker specifikke vinemner i fordøjelige sessioner',
        subscriber_only: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        slug: 'premium-masterclasses',
        type: 'short_course',
        admin_label_en: 'Premium Masterclasses (Admin)',
        admin_label_ko: '프리미엄 마스터클래스 (관리자)',
        admin_label_zh: '高级大师班 (管理员)',
        admin_label_ja: 'プレミアムマスタークラス (管理者)',
        admin_label_da: 'Premium Masterklasser (Admin)',
        user_label_en: 'Premium Masterclasses',
        user_label_ko: '프리미엄 마스터클래스',
        user_label_zh: '高级大师班',
        user_label_ja: 'プレミアムマスタークラス',
        user_label_da: 'Premium Masterklasser',
        description_en: 'Advanced wine education sessions exclusively for premium subscribers',
        description_ko: '프리미엄 구독자만을 위한 고급 와인 교육 세션',
        description_zh: '专为高级订阅者提供的高级葡萄酒教育课程',
        description_ja: 'プレミアム購読者専用の高度なワイン教育セッション',
        description_da: 'Avancerede vinuddannelsessessioner udelukkende for premium-abonnenter',
        subscriber_only: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    const data = await safeQuery(
      () => supabase!.from('content_items').select('*').eq('is_active', true).order('created_at'),
      mockData
    );

    // Filter by type if specified
    let filteredData = data;
    if (typeFilter !== 'all') {
      filteredData = data.filter(item => item.type === typeFilter);
    }

    // Apply max items limit
    if (maxItems) {
      filteredData = filteredData.slice(0, maxItems);
    }

    setContentItems(filteredData);
    setLoading(false);
  };

  const canAccessItem = (item: ContentItem): boolean => {
    if (!item.subscriber_only) return true;
    if (!user || !profile) return false;
    
    // Admin always has access
    if (profile.role === 'admin') return true;
    
    // Check if user has active subscription
    return profile.role === 'subscriber' && profile.subscription_status === 'active';
  };

  const getAccessBadge = (item: ContentItem) => {
    if (!item.subscriber_only) {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          {t('contentItems.freeAccess', 'Free Access')}
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center">
        <Crown className="w-3 h-3 mr-1" />
        {t('contentItems.subscriberOnly', 'Subscriber Only')}
      </span>
    );
  };

  const getTypeIcon = (type: ContentItemType) => {
    switch (type) {
      case 'blind_tasting':
        return <Video className="w-5 h-5 text-purple-600" />;
      case 'short_course':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (contentItems.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('contentItems.noContent', 'No content available')}
        </h3>
        <p className="text-gray-600">
          {t('contentItems.checkBackSoon', 'Check back soon for new content!')}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('contentItems.featuredContent', 'Featured Content')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('contentItems.exploreSpecial', 'Explore special wine education content and experiences')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentItems.map((item) => {
          const hasAccess = canAccessItem(item);
          const userLabel = getLocalizedLabel(item, language as SupportedLanguage, false);
          const description = getLocalizedDescription(item, language as SupportedLanguage);
          const typeLabel = getContentTypeLabel(item.type, language as SupportedLanguage);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                !hasAccess ? 'opacity-75' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getTypeIcon(item.type)}
                    <span className="ml-2 text-sm font-medium text-gray-600">{typeLabel}</span>
                  </div>
                  {getAccessBadge(item)}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {userLabel}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {hasAccess 
                    ? description 
                    : t('contentItems.subscriberOnlyDescription', 'This content is available to subscribers only. Upgrade to access exclusive wine education content.')
                  }
                </p>

                {/* Mock content details */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  {item.type === 'blind_tasting' ? (
                    <>
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{t('contentItems.weeklySession', 'Weekly sessions')}</span>
                      <span className="mx-2">•</span>
                      <Users className="w-4 h-4 mr-1" />
                      <span>{t('contentItems.liveInteraction', 'Live interaction')}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{t('contentItems.shortFormat', '15-30 min sessions')}</span>
                      <span className="mx-2">•</span>
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{t('contentItems.focusedLearning', 'Focused learning')}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {hasAccess ? (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                      <Play className="w-4 h-4 mr-2" />
                      {item.type === 'blind_tasting' 
                        ? t('contentItems.joinSession', 'Join Session')
                        : t('contentItems.startCourse', 'Start Course')
                      }
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-gray-400">
                        <Lock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{t('contentItems.locked', 'Locked')}</span>
                      </div>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                        <Crown className="w-4 h-4 mr-2" />
                        {t('contentItems.upgrade', 'Upgrade')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA for non-subscribers */}
      {contentItems.some(item => item.subscriber_only) && 
       (!user || !profile || (profile.role !== 'admin' && profile.role !== 'subscriber')) && (
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center">
          <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('contentItems.unlockPremium', 'Unlock Premium Content')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('contentItems.upgradeMessage', 'Get access to exclusive blind tastings and premium masterclasses with Matt')}
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto">
            <Star className="w-5 h-5 mr-2" />
            {t('contentItems.upgradeNow', 'Upgrade Now')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentItemsDisplay;