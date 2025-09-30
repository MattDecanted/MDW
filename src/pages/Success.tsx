import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Wine, ArrowRight } from 'lucide-react';
import { getUserSubscription, UserSubscription } from '../lib/stripe';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Give Stripe webhook time to process
    const timer = setTimeout(() => {
      fetchSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await getUserSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">{t('success.processingSubscription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('success.welcomeToMatt')}
          </h1>

          <p className="text-gray-600 mb-6">
            {subscription?.subscription_status === 'active' 
              ? t('success.subscriptionActive')
              : t('success.paymentProcessed')
            }
          </p>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">
                <strong>{t('success.sessionId')}</strong> {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              to="/courses"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <Wine className="w-5 h-5 mr-2" />
              {t('success.startLearning')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              {t('success.goToDashboard')}
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('success.whatsNext')}
            </h3>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('success.exploreAllCourses')}
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('success.joinCommunity')}
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('success.participateBlind')}
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('success.watchWineback')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;