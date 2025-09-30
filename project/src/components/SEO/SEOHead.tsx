import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'course';
  articleData?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  courseData?: {
    provider: string;
    instructor: string;
    duration?: string;
    level?: string;
  };
  schemaData?: any;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = '/Matt_decantednk.png',
  ogType = 'website',
  articleData,
  courseData,
  schemaData
}) => {
  const fullTitle = title.includes('Matt Decanted') ? title : `${title} | Matt Decanted`;
  const currentUrl = canonicalUrl || window.location.href;
  const siteName = 'Matt Decanted - Wine Education Platform';

  // Generate schema markup
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: 'https://mattdecanted.com',
      description: 'Authentic wine education with Matt Decanted - courses, blind tastings, and community learning',
      author: {
        '@type': 'Person',
        name: 'Matt Decanted',
        jobTitle: 'Wine Educator & Certified Sommelier'
      }
    };

    if (schemaData) {
      return schemaData;
    }

    if (ogType === 'course' && courseData) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: title,
        description: description,
        provider: {
          '@type': 'Organization',
          name: courseData.provider
        },
        instructor: {
          '@type': 'Person',
          name: courseData.instructor
        },
        ...(courseData.duration && { timeRequired: courseData.duration }),
        ...(courseData.level && { courseLevel: courseData.level })
      };
    }

    if (ogType === 'article' && articleData) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        author: {
          '@type': 'Person',
          name: articleData.author || 'Matt Decanted'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Matt Decanted',
          logo: {
            '@type': 'ImageObject',
            url: `${window.location.origin}/Matt_decantednk.png`
          }
        },
        ...(articleData.publishedTime && { datePublished: articleData.publishedTime }),
        ...(articleData.modifiedTime && { dateModified: articleData.modifiedTime }),
        ...(articleData.section && { articleSection: articleData.section }),
        ...(articleData.tags && { keywords: articleData.tags.join(', ') })
      };
    }

    return baseSchema;
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Matt Decanted" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={`${window.location.origin}${ogImage}`} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${window.location.origin}${ogImage}`} />
      <meta name="twitter:creator" content="@mattdecanted" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="theme-color" content="#d97706" />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateSchema())}
      </script>
    </Helmet>
  );
};

export default SEOHead;