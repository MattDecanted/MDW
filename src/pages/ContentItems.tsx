import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ContentItemsDisplay from '../components/ContentItems/ContentItemsDisplay';
import { Globe, Video, BookOpen } from 'lucide-react';

const ContentItems: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('contentItems.specialContent', 'Special Wine Content')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contentItems.discoverExclusive', 'Discover exclusive wine education experiences designed to enhance your knowledge and palate')}
          </p>
        </div>

        {/* Content Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Blind Tastings Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Video className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                {t('contentItems.blindTastings', 'Blind Tastings')}
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              {t('contentItems.blindTastingsDesc', 'Test your palate and learn from Matt in interactive blind tasting sessions')}
            </p>
            <ContentItemsDisplay 
              showTitle={false}
              typeFilter="blind_tasting"
              maxItems={3}
            />
          </div>

          {/* Short Courses Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                {t('contentItems.shortCourses', 'Short Courses')}
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              {t('contentItems.shortCoursesDesc', 'Focused mini-courses covering specific wine topics in digestible sessions')}
            </p>
            <ContentItemsDisplay 
              showTitle={false}
              typeFilter="short_course"
              maxItems={3}
            />
          </div>
        </div>

        {/* All Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <Globe className="w-8 h-8 text-amber-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              {t('contentItems.allContent', 'All Special Content')}
            </h2>
          </div>
          <ContentItemsDisplay showTitle={false} />
        </div>
      </div>
    </div>
  );
};

export default ContentItems;