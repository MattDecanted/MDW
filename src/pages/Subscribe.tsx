import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession, getUserSubscription, UserSubscription } from '../lib/stripe';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { MEMBERSHIP_TIERS, getMembershipTier } from '../types/membership';
import { Wine, Check, Loader2, CreditCard, Calendar, Shield } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Subscribe: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>('basic');

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscriptionLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.log('Supabase not connected - no subscription data available');
      setSubscriptionLoading(false);
      return;
    }

    try {
      const data = await getUserSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscribe = async (productId: string) => {
    if (!user) return;

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      alert('Stripe is not configured. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const product = STRIPE_PRODUCTS.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      const { url } = await createCheckoutSession({
        price_id: product.priceId,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/subscribe`,
        mode: product.mode,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      alert(error.message || 'Failed to start checkout process');
    } finally {
      setLoading(false);
    }
  };

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Membership Coming Soon
            </h1>
            <p className="text-lg text-gray-600">
              Membership functionality is currently being set up. Please check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (subscription && subscription.subscription_status === 'active') {
    const currentTier = getMembershipTier(profile?.membership_tier || 'free');

    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You're All Set!
            </h1>
            <p className="text-lg text-gray-600">
              You have an active {currentTier?.name} membership
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Membership Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Wine className="w-5 h-5 text-amber-600 mr-3" />
                    <span className="text-gray-600">{currentTier?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-amber-600 mr-3" />
                    <span className="text-gray-600">
                      {subscription.current_period_end 
                        ? `Renews ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`
                        : 'Active membership'}
                    </span>
                  </div>
                  {subscription.payment_method_brand && subscription.payment_method_last4 && (
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-amber-600 mr-3" />
                      <span className="text-gray-600">
                        {subscription.payment_method_brand.toUpperCase()} ending in {subscription.payment_method_last4}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Benefits
                </h3>
                <ul className="space-y-2">
                  {currentTier?.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('subscription.chooseYourJourney')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subscription.casualToExpert')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {MEMBERSHIP_TIERS.map((tier) => {
            const isCurrentTier = profile?.membership_tier === tier.id;
            const isPopular = tier.id === 'basic';
            const stripeProduct = STRIPE_PRODUCTS.find(p => p.membershipTier === tier.id);

            return (
              <div
                key={tier.id}
                className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                  isPopular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    {t('subscription.mostPopular')}
                  </div>
                )}

                <div className={`p-6 ${isPopular ? 'pt-12' : ''}`}>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{tier.badge.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900">{t(`membership.tiers.${tier.id}.name`)}</h3>
                    <p className="text-gray-600 mt-1">{t(`membership.tiers.${tier.id}.description`)}</p>
                    <div className="mt-4">
                      {tier.price === 0 ? (
                        <span className="text-3xl font-bold text-gray-900">{t('common.free')}</span>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                          <span className="text-gray-600">
                            {tier.billingPeriod === 'monthly' ? t('subscription.monthly') : 
                             tier.billingPeriod === 'one-time' ? t('subscription.oneTime') : ''}
                          </span>
                        </div>
                      )}
                      {tier.id === 'basic' && (
                        <p className="text-sm text-green-600 mt-1">{t('subscription.freeTrialNewMembers')}</p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {t(`membership.tiers.${tier.id}.features`, '').split(',').filter(f => f.trim()).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-center">
                    {isCurrentTier ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">{t('subscription.currentPlan')}</span>
                        </div>
                      </div>
                    ) : tier.price === 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <span className="text-gray-600 font-medium">{t('subscription.alwaysFree')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => stripeProduct && handleSubscribe(stripeProduct.id)}
                        disabled={loading || !stripeProduct}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                          isPopular
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          <>
                            {tier.billingPeriod === 'monthly' ? t('subscription.startFreeTrial') : t('subscription.purchaseAccess')}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 text-center">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <span className="text-lg mr-2">{tier.badge.icon}</span>
                        <span className="font-medium text-amber-800">{t(`membership.badges.${tier.id.replace('_', '')}.name`)}</span>
                      </div>
                      <p className="text-xs text-amber-700">{t(`membership.badges.${tier.id.replace('_', '')}.description`)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('subscription.faqTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('subscription.faqTrialQuestion')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('subscription.faqTrialAnswer')}</p>
              <h3 className="font-semibold text-gray-900 mb-2">{t('subscription.faqUpgradeQuestion')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('subscription.faqUpgradeAnswer')}</p>
              <h3 className="font-semibold text-gray-900 mb-2">{t('subscription.faqDifferenceQuestion')}</h3>
              <p className="text-gray-600 text-sm">{t('subscription.faqDifferenceAnswer')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('subscription.faqKeepAccessQuestion')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('subscription.faqKeepAccessAnswer')}</p>
              <h3 className="font-semibold text-gray-900 mb-2">{t('subscription.faqSetupFeesQuestion')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('subscription.faqSetupFeesAnswer')}</p>
              <h3 className="font-semibold text-gray-900 mb-2">{t('subscription.faqOfflineQuestion')}</h3>
              <p className="text-gray-600 text-sm">{t('subscription.faqOfflineAnswer')}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="flex justify-center items-center space-x-8 text-gray-500">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">{t('subscription.securePayment')}</span>
            </div>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              <span className="text-sm">{t('subscription.cancelAnytime')}</span>
            </div>
            <div className="flex items-center">
              <Wine className="w-5 h-5 mr-2" />
              <span className="text-sm">{t('subscription.expertContent')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;

