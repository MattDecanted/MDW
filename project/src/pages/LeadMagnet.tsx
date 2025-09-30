import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Wine, CheckCircle } from 'lucide-react';

const LeadMagnet: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save lead to database
      if (supabase && import.meta.env.VITE_SUPABASE_URL) {
        const { error: dbError } = await supabase
          .from('leads')
          .insert([
            {
              full_name: formData.fullName,
              email: formData.email,
              source: 'wine_pairing_guide',
            },
          ]);

        if (dbError) throw dbError;
      } else {
        console.log('Supabase not connected - lead not saved to database');
      }

      // Send to VBOUT (if webhook URL is configured)
      const vboutWebhookUrl = import.meta.env.VITE_VBOUT_WEBHOOK_URL;
      if (vboutWebhookUrl) {
        try {
          await fetch(vboutWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.fullName,
              source: 'Matt Decanted Wine Pairing Guide',
            }),
          });
        } catch (webhookError) {
          console.warn('VBOUT webhook failed:', webhookError);
          // Don't fail the whole process if webhook fails
        }
      }

      setSubmitted(true);
    } catch (error: any) {
      setError(error.message || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('leadMagnet.thankYou')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('leadMagnet.guideOnWay')}
            </p>
            <a
              href="https://example.com/wine-pairing-guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              {t('leadMagnet.downloadNow')}
            </a>
            <p className="text-sm text-gray-500 mt-4">
              {t('leadMagnet.didntReceive')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 w-20 h-20 bg-amber-200 rounded-full flex items-center justify-center">
            <Wine className="w-10 h-10 text-amber-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('leadMagnet.getMattsFoodWine')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('leadMagnet.unlockSecrets')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('leadMagnet.downloadFreeGuide')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('leadMagnet.fullName')}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder={t('leadMagnet.enterFullName')}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('leadMagnet.emailAddress')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder={t('leadMagnet.enterEmail')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  t('leadMagnet.sending')
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    {t('leadMagnet.getMyFreeGuide')}
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              {t('leadMagnet.respectPrivacy')}
            </p>
          </div>

          {/* Guide Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('leadMagnet.whatsInside')}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">{t('leadMagnet.essentialPrinciples')}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">{t('leadMagnet.provenCombinations')}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">{t('leadMagnet.commonMistakes')}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">{t('leadMagnet.budgetRecommendations')}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">{t('leadMagnet.seasonalSuggestions')}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">{t('leadMagnet.personalNotes')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-100 rounded-lg p-6">
              <h4 className="font-semibold text-amber-800 mb-2">
                "{t('leadMagnet.testimonialQuote')}"
              </h4>
              <p className="text-amber-700 text-sm">
                "{t('leadMagnet.testimonialText')}"
              </p>
              <p className="text-amber-600 text-sm font-medium mt-2">{t('leadMagnet.testimonialAuthor')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadMagnet;