import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, safeQuery } from '../lib/supabaseClient';
import { getUserBadges, ACHIEVEMENT_BADGES } from '../types/membership';
import { 
  Crown, Star, Trophy, Play, Calendar, Users, TrendingUp, Award,
  Clock, BookOpen, Video, CheckCircle, ArrowRight, Gift, Settings,
  Download, Eye, MessageSquare, Brain, Target, Zap, Flame, Shield,
  Bell, Share2, ThumbsUp, MessageCircle, Send, Plus, ChevronRight,
  RotateCcw, Sparkles, Heart, Coffee, Wine, Globe, Camera
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

interface UserStats {
  name: string;
  streak: number;
  currentModuleIndex: number;
  totalModules: number;
  shortsThisWeek: number;
  totalShorts: number;
  points: number;
  rank: number;
  completionPercentage: number;
  estimatedTimeRemaining: string;
  swirdleStreak: number;
  blindTastingsCompleted: number;
  communityPosts: number;
  badgesEarned: number;
}

interface ModuleProgress {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  completedDate?: string;
  estimatedDuration: string;
  learningOutcomes: string[];
}

interface FeedItem {
  id: string;
  type: 'badge_earned' | 'module_completed' | 'streak_milestone' | 'community_post';
  user: {
    name: string;
    avatar: string;
    tier: 'free' | 'basic' | 'premium';
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'webinar' | 'qa' | 'meetup' | 'blind_tasting';
  isRegistered: boolean;
  maxParticipants?: number;
  currentParticipants: number;
}

interface Notification {
  id: string;
  type: 'badge_unlock' | 'new_content' | 'community_reply' | 'streak_reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  points: number;
  rank: number;
  tier: 'free' | 'basic' | 'premium';
}

const UserDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    // Mock comprehensive dashboard data
    const mockUserStats: UserStats = {
      name: profile?.full_name || user?.email?.split('@')[0] || 'Wine Enthusiast',
      streak: 12,
      currentModuleIndex: 3,
      totalModules: 15,
      shortsThisWeek: 4,
      totalShorts: 23,
      points: 2847,
      rank: 15,
      completionPercentage: 67,
      estimatedTimeRemaining: '2.5 hours',
      swirdleStreak: 7,
      blindTastingsCompleted: 6,
      communityPosts: 3,
      badgesEarned: 8,
    };

    const mockModules: ModuleProgress[] = [
      {
        id: '1',
        title: 'Wine Fundamentals',
        description: 'Master the basics of wine tasting and terminology',
        status: 'completed',
        progress: 100,
        completedDate: '2025-01-10',
        estimatedDuration: '45 min',
        learningOutcomes: ['Identify basic wine characteristics', 'Use proper tasting vocabulary', 'Understand wine styles']
      },
      {
        id: '2',
        title: 'French Wine Regions',
        description: 'Explore the diverse terroirs of France',
        status: 'completed',
        progress: 100,
        completedDate: '2025-01-15',
        estimatedDuration: '60 min',
        learningOutcomes: ['Navigate French wine regions', 'Understand AOC system', 'Identify regional styles']
      },
      {
        id: '3',
        title: 'Food & Wine Pairing',
        description: 'Learn the art of perfect pairings',
        status: 'completed',
        progress: 100,
        completedDate: '2025-01-18',
        estimatedDuration: '50 min',
        learningOutcomes: ['Master pairing principles', 'Create complementary matches', 'Avoid common mistakes']
      },
      {
        id: '4',
        title: 'Advanced Tasting Techniques',
        description: 'Develop professional tasting skills',
        status: 'in_progress',
        progress: 65,
        estimatedDuration: '75 min',
        learningOutcomes: ['Professional evaluation methods', 'Blind tasting skills', 'Quality assessment']
      },
      {
        id: '5',
        title: 'Wine Investment & Collecting',
        description: 'Build and manage a wine collection',
        status: 'not_started',
        progress: 0,
        estimatedDuration: '90 min',
        learningOutcomes: ['Investment strategies', 'Storage techniques', 'Market analysis']
      }
    ];

    const mockFeedItems: FeedItem[] = [
      {
        id: '1',
        type: 'badge_earned',
        user: {
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
          tier: 'premium'
        },
        content: 'earned the "Harvest Hand" badge for completing 5 courses!',
        timestamp: '2 hours ago',
        likes: 12,
        comments: 3,
        isLiked: false
      },
      {
        id: '2',
        type: 'streak_milestone',
        user: {
          name: 'James Rodriguez',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
          tier: 'basic'
        },
        content: 'achieved a 30-day learning streak! 🔥',
        timestamp: '4 hours ago',
        likes: 18,
        comments: 5,
        isLiked: true
      },
      {
        id: '3',
        type: 'module_completed',
        user: {
          name: 'Emma Thompson',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
          tier: 'basic'
        },
        content: 'completed "Advanced Tasting Techniques" module',
        timestamp: '6 hours ago',
        likes: 8,
        comments: 2,
        isLiked: false
      }
    ];

    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Burgundy Blind Tasting',
        description: 'Test your palate with premium Burgundy wines',
        date: '2025-01-25',
        time: '19:00',
        type: 'blind_tasting',
        isRegistered: true,
        maxParticipants: 20,
        currentParticipants: 15
      },
      {
        id: '2',
        title: 'Live Q&A with Matt',
        description: 'Ask Matt your burning wine questions',
        date: '2025-01-27',
        time: '18:30',
        type: 'qa',
        isRegistered: false,
        maxParticipants: 50,
        currentParticipants: 32
      },
      {
        id: '3',
        title: 'Wine Investment Webinar',
        description: 'Learn about building a wine collection',
        date: '2025-01-30',
        time: '20:00',
        type: 'webinar',
        isRegistered: false,
        currentParticipants: 28
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'badge_unlock',
        title: 'New Badge Unlocked!',
        message: 'You earned the "Tasting Expert" badge',
        timestamp: '1 hour ago',
        isRead: false,
        actionUrl: '/dashboard'
      },
      {
        id: '2',
        type: 'new_content',
        title: 'New Short Available',
        message: 'Matt just released "Decanting Techniques"',
        timestamp: '3 hours ago',
        isRead: false,
        actionUrl: '/courses'
      },
      {
        id: '3',
        type: 'streak_reminder',
        title: 'Keep Your Streak!',
        message: 'Complete today\'s activity to maintain your 12-day streak',
        timestamp: '1 day ago',
        isRead: true
      }
    ];

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
        streak: 45,
        points: 5847,
        rank: 1,
        tier: 'premium'
      },
      {
        id: '2',
        name: 'James Rodriguez',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
        streak: 32,
        points: 4156,
        rank: 2,
        tier: 'basic'
      },
      {
        id: '3',
        name: 'Emma Thompson',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
        streak: 28,
        points: 3923,
        rank: 3,
        tier: 'basic'
      },
      {
        id: '4',
        name: 'You',
        avatar: '/Matt_decantednk.png',
        streak: mockUserStats.streak,
        points: mockUserStats.points,
        rank: mockUserStats.rank,
        tier: profile?.membership_tier as any || 'free'
      },
      {
        id: '5',
        name: 'Michael Park',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
        streak: 18,
        points: 2456,
        rank: 18,
        tier: 'free'
      }
    ];

    // Load data with safe queries
    const statsData = await safeQuery(
      () => supabase!.from('user_stats').select('*').eq('user_id', user!.id).single(),
      mockUserStats
    );
    const modulesData = await safeQuery(
      () => supabase!.from('user_modules_progress').select('*').eq('user_id', user!.id),
      mockModules
    );
    const feedData = await safeQuery(
      () => supabase!.from('social_feed').select('*').order('timestamp', { ascending: false }).limit(10),
      mockFeedItems
    );
    const eventsData = await safeQuery(
      () => supabase!.from('calendar_events').select('*').gte('date', new Date().toISOString()).order('date').limit(5),
      mockEvents
    );
    const notificationsData = await safeQuery(
      () => supabase!.from('user_notifications').select('*').eq('user_id', user!.id).order('timestamp', { ascending: false }),
      mockNotifications
    );
    const leaderboardData = await safeQuery(
      () => supabase!.from('leaderboard').select('*').order('points', { ascending: false }).limit(5),
      mockLeaderboard
    );

    setUserStats(statsData);
    setModules(modulesData);
    setFeedItems(feedData);
    setEvents(eventsData);
    setNotifications(notificationsData);
    setLeaderboard(leaderboardData);
    setLoading(false);
  };

  const handleLikeFeedItem = async (itemId: string) => {
    setFeedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1
          }
        : item
    ));
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setSubmittingFeedback(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add to community (mock)
    alert('Your question has been posted to the community Q&A!');
    setFeedbackText('');
    setSubmittingFeedback(false);
  };

  const handleRSVP = async (eventId: string) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId
        ? { 
            ...event, 
            isRegistered: !event.isRegistered,
            currentParticipants: event.isRegistered 
              ? event.currentParticipants - 1 
              : event.currentParticipants + 1
          }
        : event
    ));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const shareProgress = () => {
    const shareText = `🍷 I'm on a ${userStats?.streak}-day learning streak with Matt Decanted! ${userStats?.completionPercentage}% through my wine education journey. Join me at ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Wine Learning Progress',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Progress shared to clipboard!');
    }
    setShowShareModal(false);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600 bg-purple-100';
    if (streak >= 14) return 'text-amber-600 bg-amber-100';
    if (streak >= 7) return 'text-green-600 bg-green-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getStatusBadge = (status: string, progress: number) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{progress}% Complete</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Not Started</span>;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return <Crown className="w-3 h-3 text-purple-600" />;
      case 'basic': return <Star className="w-3 h-3 text-amber-600" />;
      default: return <Users className="w-3 h-3 text-gray-600" />;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'blind_tasting': return <Target className="w-4 h-4 text-purple-600" />;
      case 'qa': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'webinar': return <Video className="w-4 h-4 text-green-600" />;
      default: return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'badge_unlock': return <Award className="w-4 h-4 text-amber-600" />;
      case 'new_content': return <Video className="w-4 h-4 text-blue-600" />;
      case 'community_reply': return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'streak_reminder': return <Flame className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const earnedBadges = getUserBadges(
    Math.floor((userStats?.currentModuleIndex || 0) / 3), // courses completed
    userStats?.currentModuleIndex || 0, // modules completed
    (userStats?.currentModuleIndex || 0) * 2, // quizzes completed
    userStats?.streak || 0 // days active
  );

  const nextBadge = ACHIEVEMENT_BADGES.find(badge => !earnedBadges.some(earned => earned.id === badge.id));

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !userStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Unavailable</h1>
          <Link to="/signin" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Notifications */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {userStats.name}! 👋
              </h1>
              <p className="text-gray-600">Continue your wine education journey</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Share Progress Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Progress
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                            onClick={() => markNotificationRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className="mr-3 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {/* Learning Streak */}
          <div className="bg-white rounded-lg shadow-lg p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-6 h-6 text-red-600" />
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStreakColor(userStats.streak)}`}>
                  🔥 {userStats.streak}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">Learning Streak</p>
              <p className="text-xs text-gray-600">{userStats.streak} days strong!</p>
            </div>
          </div>

          {/* Points */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-6 h-6 text-amber-600" />
              <span className="text-lg font-bold text-amber-600">{userStats.points.toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">XP Points</p>
            <p className="text-xs text-gray-600">Rank #{userStats.rank}</p>
          </div>

          {/* Modules Progress */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-blue-600">{userStats.currentModuleIndex}/{userStats.totalModules}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Modules</p>
            <p className="text-xs text-gray-600">{userStats.completionPercentage}% complete</p>
          </div>

          {/* Shorts This Week */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Video className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">{userStats.shortsThisWeek}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Shorts This Week</p>
            <p className="text-xs text-gray-600">{userStats.totalShorts} total</p>
          </div>

          {/* Swirdle Streak */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              <span className="text-lg font-bold text-indigo-600">{userStats.swirdleStreak}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Swirdle Streak</p>
            <p className="text-xs text-gray-600">Daily word game</p>
          </div>

          {/* Badges Earned */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 text-green-600" />
              <span className="text-lg font-bold text-green-600">{earnedBadges.length}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Badges</p>
            <p className="text-xs text-gray-600">Achievements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journey Progress */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Learning Journey</h2>
                <div className="group relative">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium cursor-help">
                    {userStats.completionPercentage}% Complete
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {userStats.estimatedTimeRemaining} remaining • {userStats.currentModuleIndex} of {userStats.totalModules} modules
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Module {userStats.currentModuleIndex} of {userStats.totalModules}</span>
                  <span>{userStats.estimatedTimeRemaining} remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${userStats.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.slice(0, 4).map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{module.title}</h3>
                          <div className="ml-2">
                            {getStatusBadge(module.status, module.progress)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{module.description}</p>
                        
                        {/* Learning Outcomes Tooltip */}
                        <div className="group relative">
                          <div className="flex items-center text-xs text-blue-600 cursor-help">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>Learning outcomes</span>
                          </div>
                          <div className="absolute bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                            <ul className="space-y-1">
                              {module.learningOutcomes.map((outcome, index) => (
                                <li key={index}>• {outcome}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{module.estimatedDuration}</span>
                      </div>
                      <Link
                        to={`/module/${module.id}`}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          module.status === 'completed' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : module.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {module.status === 'completed' ? 'Review' : 
                         module.status === 'in_progress' ? 'Continue' : 'Start'}
                      </Link>
                    </div>

                    {module.status === 'in_progress' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/courses"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center"
                >
                  View All Modules
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Shorts Tracker */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Weekly Wine Shorts</h2>
                  <p className="text-purple-100">Shorts completed this week: {userStats.shortsThisWeek}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{userStats.totalShorts}</div>
                  <div className="text-purple-100 text-sm">Total completed</div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Next: "Decanting Techniques"</h3>
                    <p className="text-purple-100 text-sm">Learn when and how to decant wines</p>
                  </div>
                  <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Now
                  </button>
                </div>
              </div>
            </div>

            {/* Social Feed */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                Community Activity
              </h2>
              
              <div className="space-y-4">
                {feedItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm">{item.user.name}</span>
                        {getTierIcon(item.user.tier)}
                        <span className="text-gray-600 text-sm">{item.content}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                        <button
                          onClick={() => handleLikeFeedItem(item.id)}
                          className={`flex items-center space-x-1 text-xs ${
                            item.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                          } transition-colors`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{item.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-3 h-3" />
                          <span>{item.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/community"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Full Community Feed →
                </Link>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Got a question or suggestion you'd like to learn?
              </h2>
              <div className="space-y-4">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="What wine topic would you like Matt to cover? Ask questions or suggest new content..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim() || submittingFeedback}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submittingFeedback ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit to Community Q&A
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges & Milestones */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 text-amber-600 mr-2" />
                Your Achievements
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {earnedBadges.slice(0, 6).map((badge) => (
                  <div 
                    key={badge.id} 
                    className="group relative text-center p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-xs font-medium text-amber-800">{badge.name}</div>
                    
                    {/* Badge Details Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10">
                      <p className="font-medium mb-1">{badge.name}</p>
                      <p>{badge.description}</p>
                    </div>
                  </div>
                ))}
                
                {/* Next Badge Preview */}
                {nextBadge && (
                  <div className="group relative text-center p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-2xl mb-1 grayscale">{nextBadge.icon}</div>
                    <div className="text-xs font-medium text-gray-600">Next Goal</div>
                    
                    {/* Next Badge Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10">
                      <p className="font-medium mb-1">{nextBadge.name}</p>
                      <p>{nextBadge.description}</p>
                      <div className="mt-2 text-amber-400">
                        💡 Complete more activities to unlock!
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {earnedBadges.length} of {ACHIEVEMENT_BADGES.length} badges earned
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(earnedBadges.length / ACHIEVEMENT_BADGES.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Calendar of Events */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 text-green-600 mr-2" />
                Upcoming Events
              </h2>
              
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {getEventTypeIcon(event.type)}
                          <h3 className="font-medium text-gray-900 text-sm ml-2">{event.title}</h3>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                          {event.maxParticipants && (
                            <>
                              <span className="mx-2">•</span>
                              <Users className="w-3 h-3 mr-1" />
                              <span>{event.currentParticipants}/{event.maxParticipants}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRSVP(event.id)}
                        className={`ml-3 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          event.isRegistered
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {event.isRegistered ? 'Registered' : 'RSVP'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard Teaser */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Trophy className="w-5 h-5 text-amber-600 mr-2" />
                  Top Streak Holders
                </h2>
                <Link to="/leaderboard" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Full Leaderboard →
                </Link>
              </div>
              
              <div className="space-y-2">
                {leaderboard.map((member, index) => (
                  <div key={member.id} className={`flex items-center justify-between p-2 rounded-lg ${
                    member.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        member.name === 'You' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {member.rank}
                      </div>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full ml-2 mr-2"
                      />
                      <div>
                        <div className="flex items-center">
                          <span className={`font-medium text-sm ${member.name === 'You' ? 'text-blue-900' : 'text-gray-900'}`}>
                            {member.name}
                          </span>
                          {getTierIcon(member.tier)}
                        </div>
                        <div className="text-xs text-gray-500">{member.points.toLocaleString()} points</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm">
                        <Flame className="w-4 h-4 text-red-500 mr-1" />
                        <span className="font-bold">{member.streak}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gamification Points */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold mb-1">Your XP Points</h2>
                  <p className="text-amber-100">Earn points by completing activities</p>
                </div>
                <div className="text-3xl font-bold">{userStats.points.toLocaleString()}</div>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Redeem Rewards</h3>
                    <p className="text-amber-100 text-sm">Unlock bonus content and exclusive perks</p>
                  </div>
                  <button className="bg-white text-amber-600 px-4 py-2 rounded-lg font-medium hover:bg-amber-50 transition-colors flex items-center">
                    <Gift className="w-4 h-4 mr-2" />
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Progress Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="text-center mb-6">
                <Share2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Share Your Progress
                </h3>
                <p className="text-gray-600">
                  Show off your wine learning journey!
                </p>
              </div>

              {/* Progress Preview */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">🍷 {userStats.name}</div>
                  <div className="text-blue-100 mb-3">Wine Learning Journey</div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">🔥{userStats.streak}</div>
                      <div className="text-xs text-blue-100">Day Streak</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{userStats.completionPercentage}%</div>
                      <div className="text-xs text-blue-100">Complete</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{earnedBadges.length}</div>
                      <div className="text-xs text-blue-100">Badges</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={shareProgress}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Share Progress
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;