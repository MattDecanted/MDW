import React from 'react';
import { Wine, Youtube, Instagram, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Wine className="w-8 h-8 text-amber-600" />
              <span className="text-xl font-bold">Matt Decanted</span>
            </div>
            <p className="text-gray-300 mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-amber-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-amber-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-amber-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('translation.footer.quickLinks', 'Quick Links')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="/courses" className="text-gray-300 hover:text-amber-600 transition-colors">
                  {t('translation.nav.courses', 'Courses')}
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-amber-600 transition-colors">
                  {t('translation.footer.aboutMatt', 'About Matt')}
                </a>
              </li>
              <li>
                <a href="/lead-magnet" className="text-gray-300 hover:text-amber-600 transition-colors">
                  {t('translation.footer.freeWineGuide', 'Free Wine Guide')}
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('translation.footer.community', 'Community')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-600 transition-colors">
                  {t('translation.footer.blindTastingSessions', 'Blind Tasting Sessions')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-600 transition-colors">
                  {t('translation.footer.winebackWednesday', 'Wineback Wednesday')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-600 transition-colors">
                  {t('translation.footer.discussionForum', 'Discussion Forum')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            {t('translation.common.copyright', '© 2025 Matt Decanted. All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
