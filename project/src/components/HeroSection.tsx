import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-white to-purple-50 py-20 overflow-hidden bg-dotted-pattern">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('homepage.heroTitle')}
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              {t('homepage.heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!user ? (
                <>
                  <Link
                    to="/subscribe"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    {t('homepage.ctaStartFree')}
                  </Link>
                  <Link
                    to="/community"
                    className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                  >
                    {t('homepage.ctaJoinCommunity')}
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {t('homepage.ctaGoToDashboard')}
                </Link>
              )}
            </div>
          </div>

          {/* Placeholder Visual */}
          <div className="flex justify-center">
            <div className="w-full max-w-md h-64 bg-gray-200 rounded-xl shadow-inner flex items-center justify-center text-gray-500">
              [ Video or Image Placeholder ]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
