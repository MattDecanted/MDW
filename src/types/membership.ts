export interface MembershipTier {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  stripeProductId?: string;
  stripePriceId?: string;
  features: string[];
  badge: {
    name: string;
    description: string;
    icon: string;
  };
}

export interface UserMembership {
  userId: string;
  tierId: string;
  status: 'active' | 'trialing' | 'canceled' | 'expired';
  startDate: string;
  endDate?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: {
    coursesCompleted?: number;
    modulesCompleted?: number;
    quizzesCompleted?: number;
    daysActive?: number;
  };
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'free',
    name: 'Discover & Taste', // Keep for compatibility, but use t('membership.tiers.free.name') in UI
    description: 'Perfect for wine beginners', // Keep for compatibility
    price: 0,
    billingPeriod: 'monthly',
    features: [], // Features now come from translations
    badge: {
      name: 'Pruner', // Keep for compatibility
      description: 'Starting your wine journey', // Keep for compatibility
      icon: '🌱'
    }
  },
  {
    id: 'basic',
    name: 'Weekly Wine Shorts', // Keep for compatibility
    description: 'Regular wine education content', // Keep for compatibility
    price: 4.99,
    billingPeriod: 'monthly',
    stripeProductId: 'prod_basic_monthly',
    stripePriceId: 'price_basic_monthly',
    features: [], // Features now come from translations
    badge: {
      name: 'Bud Burster', // Keep for compatibility
      description: 'Growing your wine knowledge', // Keep for compatibility
      icon: '🌿'
    }
  },
  {
    id: 'full',
    name: 'All Access Cellar Door', // Keep for compatibility
    description: 'Complete wine education experience', // Keep for compatibility
    price: 59,
    billingPeriod: 'one-time',
    stripeProductId: 'prod_full_course',
    stripePriceId: 'price_full_course',
    features: [], // Features now come from translations
    badge: {
      name: 'Harvest Hand', // Keep for compatibility
      description: 'Master of wine knowledge', // Keep for compatibility
      icon: '🍇'
    }
  }
];

export const ACHIEVEMENT_BADGES: Badge[] = [
  {
    id: 'pruner',
    name: 'Pruner', // Keep for compatibility
    description: 'Welcome to your wine journey! You\'ve taken the first step.', // Keep for compatibility
    icon: '🌱',
    requirements: { daysActive: 1 }
  },
  {
    id: 'bud_burster',
    name: 'Bud Burster', // Keep for compatibility
    description: 'Your knowledge is sprouting! First course module completed.', // Keep for compatibility
    icon: '🌿',
    requirements: { modulesCompleted: 1 }
  },
  {
    id: 'shoot_shaper',
    name: 'Shoot Shaper', // Keep for compatibility
    description: 'Growing strong! Multiple modules under your belt.', // Keep for compatibility
    icon: '🌾',
    requirements: { modulesCompleted: 5 }
  },
  {
    id: 'bloom_boss',
    name: 'Bloom Boss', // Keep for compatibility
    description: 'Your wine knowledge is flowering beautifully!', // Keep for compatibility
    icon: '🌸',
    requirements: { coursesCompleted: 1, quizzesCompleted: 10 }
  },
  {
    id: 'berry_builder',
    name: 'Berry Builder', // Keep for compatibility
    description: 'Building substantial wine expertise with consistent learning.', // Keep for compatibility
    icon: '🫐',
    requirements: { modulesCompleted: 15, daysActive: 30 }
  },
  {
    id: 'ripeness_reader',
    name: 'Ripeness Reader', // Keep for compatibility
    description: 'You can sense when knowledge is ready to harvest!', // Keep for compatibility
    icon: '🍇',
    requirements: { coursesCompleted: 3, quizzesCompleted: 25 }
  },
  {
    id: 'harvest_hand',
    name: 'Harvest Hand', // Keep for compatibility
    description: 'Expert level achieved! You\'re ready to share your knowledge.', // Keep for compatibility
    icon: '🏆',
    requirements: { coursesCompleted: 5, modulesCompleted: 30, daysActive: 90 }
  },
  {
    id: 'dormancy_defender',
    name: 'Dormancy Defender', // Keep for compatibility
    description: 'Consistent learner through all seasons of wine education.', // Keep for compatibility
    icon: '❄️',
    requirements: { daysActive: 365, coursesCompleted: 10 }
  },
  // Swirdle-specific badges
  {
    id: 'vocabulary_master',
    name: 'Vocabulary Master',
    description: 'Mastered wine terminology through consistent Swirdle play.',
    icon: '🧠',
    requirements: { daysActive: 30 }
  },
  {
    id: 'swirdle_champion',
    name: 'Swirdle Champion',
    description: 'Achieved a 30-day Swirdle streak!',
    icon: '🎯',
    requirements: { daysActive: 30 }
  },
  {
    id: 'tasting_expert',
    name: 'Tasting Expert',
    description: 'Completed multiple blind tasting challenges.',
    icon: '👃',
    requirements: { modulesCompleted: 10 }
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Active contributor to the wine community.',
    icon: '👥',
    requirements: { daysActive: 60, modulesCompleted: 20 }
  }
];

export const getMembershipTier = (tierId: string): MembershipTier | undefined => {
  return MEMBERSHIP_TIERS.find(tier => tier.id === tierId);
};

export const getUserBadges = (
  coursesCompleted: number,
  modulesCompleted: number,
  quizzesCompleted: number,
  daysActive: number
): Badge[] => {
  return ACHIEVEMENT_BADGES.filter(badge => {
    const req = badge.requirements;
    return (
      (!req.coursesCompleted || coursesCompleted >= req.coursesCompleted) &&
      (!req.modulesCompleted || modulesCompleted >= req.modulesCompleted) &&
      (!req.quizzesCompleted || quizzesCompleted >= req.quizzesCompleted) &&
      (!req.daysActive || daysActive >= req.daysActive)
    );
  });
};