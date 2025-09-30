export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  membershipTier: 'basic' | 'full';
  trialPeriodDays?: number;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_basic_monthly',
    priceId: 'price_1RqmGBDOdznrQoqMac87Xl2J', // Replace with actual Stripe price ID
    name: 'Weekly Wine Shorts - Basic Membership',
    description: 'Monthly subscription with weekly premium content',
    mode: 'subscription',
    price: 4.99,
    membershipTier: 'basic',
    trialPeriodDays: 90, // 3-month trial for new members
  },
  {
    id: 'prod_full_course',
    priceId: 'price_full_course_access', // Replace with actual Stripe price ID
    name: 'All Access Cellar Door - Full Course Access',
    description: 'One-time purchase for complete course access',
    mode: 'payment',
    price: 59.00,
    membershipTier: 'full',
  },
  {
    id: 'prod_individual_course',
    priceId: 'price_individual_course', // Replace with actual Stripe price ID
    name: 'Individual Course Access',
    description: 'Purchase access to a specific course',
    mode: 'payment',
    price: 29.00,
    membershipTier: 'full',
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const getProductsByTier = (tier: 'basic' | 'full'): StripeProduct[] => {
  return STRIPE_PRODUCTS.filter(product => product.membershipTier === tier);
};