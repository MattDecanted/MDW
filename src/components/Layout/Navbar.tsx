import React, { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../Common/LanguageSwitcher';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  CreditCard, 
  LogOut, 
  Shield,
  Crown,
  Star,
  ChevronDown
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Define navigation links with role-based visibility
  const getNavLinks = () => {
    const baseLinks = [
      { to: '/', label: t('translation.nav.home', 'Home'), public: true },
      { to: '/blog', label: t('translation.nav.blog', 'Blog'), public: true },
      { to: '/courses', label: t('translation.nav.courses', 'Courses'), public: true },
      { to: '/content', label: t('translation.nav.content', 'Content'), public: true },
      { to: '/community', label: t('translation.nav.community', 'Community'), public: true },
      { to: '/about', label: t('translation.nav.about', 'About'), public: true },
      { to: '/wine-game', label: '🎯 Wine Game', public: true },
    ];

    // Add pricing/subscribe link based on user status
    if (!user || (profile && ['free', 'learner'].includes(profile.role))) {
      baseLinks.push({ to: '/pricing', label: t('translation.nav.pricing', 'Pricing'), public: true });
    }

    // Add dashboard for logged-in users
    if (user) {
      baseLinks.push({ to: '/dashboard', label: t('translation.nav.dashboard', 'Dashboard'), public: false });
    }

    // Add admin link for admin users
    if (profile?.role === 'admin') {
      baseLinks.push({ to: '/admin', label: t('translation.nav.admin', 'Admin'), public: false });
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  const getMembershipBadge = () => {
    if (!profile) return null;

    const badges = {
      admin: { icon: <Crown className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800', label: t('membership.admin') },
      subscriber: { icon: <Star className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800', label: t('membership.premium') },
      learner: { icon: <User className="w-3 h-3" />, color: 'bg-green-100 text-green-800', label: t('membership.basic') },
      guest: { icon: <User className="w-3 h-3" />, color: 'bg-gray-100 text-gray-800', label: t('membership.free') },
    };

    const badge = badges[profile.role] || badges.guest;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        <span className="ml-1">{badge.label}</span>
      </span>
    );
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-amber-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/Matt_decantednk.png" 
              alt="Matt Decanted" 
              className="w-10 h-10 rounded-full shadow-sm"
            />
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900">Matt Decanted</span>
              <div className="text-xs text-amber-600 font-medium">Wine Education</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-amber-600 bg-amber-50 shadow-sm'
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <img 
                    src="/Matt_decantednk.png" 
                    alt="User" 
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium">
                      {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getMembershipBadge()}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900">
                            {profile?.full_name || 'User'}
                          </div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                          <div className="mt-1">{getMembershipBadge()}</div>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          {t('translation.nav.profile', 'Profile')}
                        </Link>

                        <Link
                          to="/dashboard/member"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Trophy className="w-4 h-4 mr-3" />
                          Member Dashboard
                        </Link>

                        <Link
                          to="/pricing"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <CreditCard className="w-4 h-4 mr-3" />
                          {t('translation.nav.mySubscription', 'My Subscription')}
                        </Link>

                        {profile?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <Shield className="w-4 h-4 mr-3" />
                            {t('translation.nav.admin', 'Admin')}
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            {t('translation.nav.signOut', 'Sign Out')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('translation.nav.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  {t('translation.nav.signUp', 'Sign Up')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-amber-600 p-2 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              {/* Mobile Auth Section */}
              {user ? (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="px-3 py-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <img 
                        src="/Matt_decantednk.png" 
                        alt="User" 
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                        <div className="mt-1">{getMembershipBadge()}</div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 mr-3" />
                    {t('translation.nav.profile', 'Profile')}
                  </Link>

                  <Link
                    to="/pricing"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    {t('translation.nav.mySubscription', 'My Subscription')}
                  </Link>

                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Shield className="w-5 h-5 mr-3" />
                      {t('translation.nav.admin', 'Admin')}
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors mt-2"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    {t('translation.nav.signOut', 'Sign Out')}
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                  <Link
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 hover:text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-lg text-base font-medium transition-colors"
                  >
                    {t('translation.nav.signIn', 'Sign In')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-colors"
                  >
                    {t('translation.nav.signUp', 'Sign Up')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;