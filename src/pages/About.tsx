import React from 'react';
import SEOHead from '../components/SEO/SEOHead';
import { useTranslation } from 'react-i18next';
import { Wine, Heart, Users, Award } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="About Matt Decanted - Wine Educator & Certified Sommelier"
        description="Meet Matt Decanted, certified sommelier and wine educator passionate about making wine education accessible. Learn about his authentic approach to wine teaching and industry experience."
        keywords="Matt Decanted, wine educator, certified sommelier, wine instructor, wine expert, authentic wine education"
        ogType="website"
        schemaData={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Matt Decanted',
          jobTitle: 'Wine Educator & Certified Sommelier',
          description: 'Certified sommelier and wine educator passionate about authentic, accessible wine education',
          knowsAbout: ['Wine Education', 'Sommelier Training', 'Wine Tasting', 'Viticulture', 'Enology'],
          alumniOf: 'Court of Master Sommeliers'
        }}
      />
      
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('about.whoIsMatt')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('about.meetWineEducator')}
          </p>
        </div>

        {/* Matt's Character */}
        <div className="text-center mb-16">
          <div className="mx-auto mb-8 w-48 h-48 bg-amber-200 rounded-full flex items-center justify-center">
            <Wine className="w-24 h-24 text-amber-700" />
          </div>
          <p className="text-lg text-gray-600 italic">
            "{t('about.signatureLook')}"
          </p>
        </div>

        {/* Story Section */}
        <div className="prose prose-lg mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.theStory')}</h2>
          <p className="text-gray-600 mb-6">{t('about.storyParagraph1')}</p>
          <p className="text-gray-600 mb-6">{t('about.storyParagraph2')}</p>
          <p className="text-gray-600 mb-6">{t('about.storyParagraph3')}</p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: <Heart />,
              title: t('about.authentic'),
              desc: t('about.authenticDesc'),
            },
            {
              icon: <Users />,
              title: t('about.inclusive'),
              desc: t('about.inclusiveDesc'),
            },
            {
              icon: <Wine />,
              title: t('about.educational'),
              desc: t('about.educationalDesc'),
            },
            {
              icon: <Award />,
              title: t('about.expert') || 'Expert',
              desc:
                t('about.expertDesc') ||
                'Years of industry experience combined with continuous learning ensure you get accurate, up-to-date information.',
            },
          ].map(({ icon, title, desc }, i) => (
            <div key={i} className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {React.cloneElement(icon, { className: 'w-8 h-8 text-amber-600' })}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default About;
