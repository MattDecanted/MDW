import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createCheckoutSession, getUserSubscription, UserSubscription } from '../lib/stripe';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { Check, Gift, Loader2, CreditCard, Calendar, Shield, Crown, Star, Sparkles } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

interface PricingTier {
  id: string;
  name: string;
  icon: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  popular?: boolean;
  cta: string;
  stripeProductId?: string;
  stripePriceId?: {
    monthly: string;
    annual: string;
  };
}

const Pricing: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [giftMode, setGiftMode] = useState<string | null>(null);

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: t('pricing.tiers.free.name'),
      icon: '🍇',
      price: { monthly: 0, annual: 0 },
      features: t('pricing.tiers.free.features', '').split(',').filter(f => f.trim()),
      cta: t('pricing.tiers.free.cta'),
    },
    {
      id: 'basic',
      name: t('pricing.tiers.basic.name'),
      icon: '🍷',
      price: { monthly: 4.99, annual: 47.90 },
      features: t('pricing.tiers.basic.features', '').split(',').filter(f => f.trim()),
      popular: true,
      cta: t('pricing.tiers.basic.cta'),
      stripeProductId: 'prod_basic',
      stripePriceId: {
        monthly: 'price_basic_monthly',
        annual: 'price_basic_annual',
      },
    },
    {
      id: 'premium',
      name: t('pricing.tiers.premium.name'),
      icon: '🥂',
      price: { monthly: 9.99, annual: 95.90 },
      features: t('pricing.tiers.premium.features', '').split(',').filter(f => f.trim()),
      cta: t('pricing.tiers.premium.cta'),
      stripeProductId: 'prod_premium',
      stripePriceId: {
        monthly: 'price_premium_monthly',
        annual: 'price_premium_annual',
      },
    },
  ];

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscriptionLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
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

  const handleSubscribe = async (tierId: string, isGift: boolean = false) => {
    if (!user && !isGift) return;

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      alert(t('pricing.errors.stripeNotConfigured'));
      return;
    }

    setLoading(true);
    try {
      const tier = pricingTiers.find(t => t.id === tierId);
      if (!tier || !tier.stripePriceId) throw new Error(t('pricing.errors.tierNotFound'));

      const priceId = tier.stripePriceId[billingCycle];
      
      const { url } = await createCheckoutSession({
        price_id: priceId,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}${isGift ? '&gift=true' : ''}`,
        cancel_url: `${window.location.origin}/pricing`,
        mode: 'subscription',
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      alert(error.message || t('pricing.errors.checkoutFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getAnnualDiscount = (monthly: number, annual: number): number => {
    if (monthly === 0) return 0;
    return Math.round(((monthly * 12 - annual) / (monthly * 12)) * 100);
  };

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('pricing.comingSoon')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('pricing.setupInProgress')}
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

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-amber-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('pricing.chooseYourJourney')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('pricing.journeyDescription')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-amber-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              {t('pricing.annual')}
            </span>
            {billingCycle === 'annual' && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {t('pricing.save20Percent')}
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier) => {
            const isCurrentTier = profile?.membership_tier === tier.id;
            const price = tier.price[billingCycle];
            const discount = getAnnualDiscount(tier.price.monthly, tier.price.annual);

            return (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  tier.popular ? 'ring-2 ring-amber-500 transform scale-105' : ''
                } ${isCurrentTier ? 'ring-2 ring-blue-500' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    {t('pricing.mostPopular')}
                  </div>
                )}

                {isCurrentTier && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    <Crown className="w-4 h-4 inline mr-1" />
                    {t('pricing.currentPlan')}
                  </div>
                )}

                <div className={`p-8 ${tier.popular || isCurrentTier ? 'pt-12' : ''}`}>
                  {/* Tier Header */}
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">{tier.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                    
                    <div className="mb-4">
                      {price === 0 ? (
                        <span className="text-4xl font-bold text-gray-900">{t('common.free')}</span>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-gray-900">${price}</span>
                          <span className="text-gray-600 ml-1">
                            /{billingCycle === 'monthly' ? t('pricing.month') : t('pricing.year')}
                          </span>
                          {billingCycle === 'annual' && discount > 0 && (
                            <div className="text-sm text-green-600 font-medium mt-1">
                              {t('pricing.savePercent', { percent: discount })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {tier.id === 'basic' && (
                      <p className="text-sm text-amber-600 font-medium">
                        {t('pricing.freeTrialOffer')}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    {isCurrentTier ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Check className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-blue-800 font-medium">{t('pricing.currentPlan')}</span>
                        </div>
                        <Link
                          to="/dashboard"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {t('pricing.managePlan')} →
                        </Link>
                      </div>
                    ) : tier.id === 'free' ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <span className="text-gray-600 font-medium">{t('pricing.alwaysFree')}</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSubscribe(tier.id)}
                          disabled={loading}
                          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                            tier.popular
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg'
                              : 'bg-gray-900 hover:bg-gray-800 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          ) : (
                            tier.cta
                          )}
                        </button>

                        <button
                          onClick={() => setGiftMode(tier.id)}
                          className="w-full py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          {t('pricing.giftThisPlan')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('pricing.compareFeatures')}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-900">{t('pricing.features')}</th>
                  {pricingTiers.map(tier => (
                    <th key={tier.id} className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">{tier.icon}</span>
                        <span className="font-medium text-gray-900">{tier.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: t('pricing.comparison.communityAccess'), free: true, basic: true, premium: true },
                  { feature: t('pricing.comparison.weeklyVideos'), free: false, basic: true, premium: true },
                  { feature: t('pricing.comparison.blindTastings'), free: false, basic: false, premium: true },
                  { feature: t('pricing.comparison.liveQA'), free: false, basic: false, premium: true },
                  { feature: t('pricing.comparison.masterclasses'), free: false, basic: false, premium: true },
                  { feature: t('pricing.comparison.downloadableContent'), free: false, basic: true, premium: true },
                  { feature: t('pricing.comparison.prioritySupport'), free: false, basic: false, premium: true },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-900">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.free ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.basic ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.premium ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('pricing.faq.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.trialQuestion')}</h3>
                <p className="text-gray-600 text-sm">{t('pricing.faq.trialAnswer')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.upgradeQuestion')}</h3>
                <p className="text-gray-600 text-sm">{t('pricing.faq.upgradeAnswer')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.giftQuestion')}</h3>
                <p className="text-gray-600 text-sm">{t('pricing.faq.giftAnswer')}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.cancelQuestion')}</h3>
                <p className="text-gray-600 text-sm">{t('pricing.faq.cancelAnswer')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.accessQuestion')}</h3>
                <p className="text-gray-600 text-sm">{t('pricing.faq.accessAnswer')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.supportQuestion')}</h3>
                <p className="text-gray-600 text-sm">{t('pricing.faq.supportAnswer')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex justify-center items-center space-x-8 text-gray-500">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">{t('pricing.securePayment')}</span>
            </div>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              <span className="text-sm">{t('pricing.cancelAnytime')}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="text-sm">{t('pricing.noCommitment')}</span>
            </div>
          </div>
        </div>

        {/* Gift Modal */}
        {giftMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="text-center mb-6">
                <Gift className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('pricing.gift.title')}
                </h3>
                <p className="text-gray-600">
                  {t('pricing.gift.description')}
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricing.gift.recipientEmail')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={t('pricing.gift.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricing.gift.message')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    placeholder={t('pricing.gift.messagePlaceholder')}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleSubscribe(giftMode, true)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {t('pricing.gift.sendGift')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGiftMode(null)}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;