import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Course, Module, UserProgress, safeQuery, isSupabaseConnected } from '../lib/supabaseClient';
import { ACHIEVEMENT_BADGES, getUserBadges } from '../types/membership';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Clock, 
  Star, 
  Crown, 
  TrendingUp, 
  Award,
  Play,
  Download,
  CheckCircle,
  Lock,
  ArrowRight,
  Trophy,
  Users
} from 'lucide-react';
import ProgressBar from '../components/Common/ProgressBar';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    coursesStarted: 0,
    coursesCompleted: 0,
    totalModulesCompleted: 0,
    streakDays: 7,
    quizzesCompleted: 0,
    daysActive: 15,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Mock data for development (used when Supabase not connected)
    const mockCourses: Course[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'wine-fundamentals',
        title: 'Wine Fundamentals',
        description: 'Learn the basics of wine tasting, terminology, and appreciation',
        thumbnail_url: 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg',
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        slug: 'french-wine-regions',
        title: 'French Wine Regions',
        description: 'Explore the diverse wine regions of France and their unique characteristics',
        thumbnail_url: 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg',
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    // Load courses with safe query
    const coursesData = await safeQuery(
      () => supabase!.from('courses').select('*').eq('is_published', true).order('order_index'),
      mockCourses
    );
    setCourses(coursesData);

    // Load user progress with safe query
    const progressData = await safeQuery(
      () => supabase!.from('user_progress').select('*').eq('user_id', user.id),
      []
    );
    setUserProgress(progressData);

    // Calculate stats
    const completedModules = progressData.filter(p => p.completed);
    const coursesWithProgress = new Set(progressData.map(p => p.module_id));

    setStats({
      coursesStarted: coursesWithProgress.size > 0 ? coursesData.length : 0,
      coursesCompleted: 0,
      totalModulesCompleted: completedModules.length,
      streakDays: 7,
      quizzesCompleted: completedModules.length * 2, // Mock: assume 2 quizzes per module
      daysActive: 15, // Mock: user active for 15 days
    });

    // Mock recent activity
    setRecentActivity([
      { type: 'completed', title: 'Wine Tasting Fundamentals', date: '2 hours ago' },
      { type: 'started', title: 'French Wine Regions', date: '1 day ago' },
      { type: 'quiz', title: 'Completed quiz: Wine Basics', date: '2 days ago' },
    ]);

    setLoading(false);
  };

  const getCourseProgress = (courseId: string): number => {
    // This would need to be calculated with actual module data
    // For now, return a mock progress
    const completed = userProgress.filter(p => p.completed).length;
    return completed > 0 ? Math.min(100, completed * 25) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <Link to="/signin" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('dashboard.welcomeBack', { name: profile?.full_name || 'Wine Enthusiast' })}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('dashboard.continueJourney')}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                profile?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                profile?.role === 'subscriber' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {profile?.role === 'admin' && <Crown className="w-4 h-4 mr-1" />}
                {profile?.role === 'subscriber' && <Star className="w-4 h-4 mr-1" />}
                {(profile?.role || 'learner').toUpperCase()} {t('dashboard.member')}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('dashboard.coursesAvailable')}</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('dashboard.modulesCompleted')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalModulesCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('dashboard.learningTime')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalModulesCompleted * 15}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('dashboard.learningStreak')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streakDays} {t('dashboard.days')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-2">{t('dashboard.continueLearning')}</h2>
              <p className="text-blue-100 mb-4">{t('dashboard.startJourney')}</p>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Wine Education Courses</h3>
                <p className="text-blue-100 text-sm mb-3">Explore comprehensive wine education content</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Multiple courses available</span>
                  </div>
                  <Link
                    to="/courses"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {t('home.startLearning')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Progress */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t('dashboard.yourCourses')}</h2>
                <Link 
                  to="/courses"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  {t('dashboard.viewAllCourses')} →
                </Link>
              </div>

              <div className="space-y-4">
                {courses.slice(0, 3).map((course) => {
                  const progress = getCourseProgress(course.id);
                  
                  return (
                    <CourseCard key={course.id} course={course} progress={progress} />
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.recentActivity')}</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      activity.type === 'completed' ? 'bg-green-100' :
                      activity.type === 'started' ? 'bg-blue-100' :
                      'bg-amber-100'
                    }`}>
                      {activity.type === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {activity.type === 'started' && <Play className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'quiz' && <Award className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievement Badges */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.achievements', 'Your Achievements')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getUserBadges(
                  stats.coursesCompleted,
                  stats.totalModulesCompleted,
                  stats.quizzesCompleted,
                  stats.daysActive
                ).map((badge) => (
                  <div key={badge.id} className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-sm font-medium text-amber-800">{badge.name}</div>
                    <div className="text-xs text-amber-600">{badge.description}</div>
                  </div>
                ))}
                
                {/* Next Badge Preview */}
                {(() => {
                  const earnedBadges = getUserBadges(stats.coursesCompleted, stats.totalModulesCompleted, stats.quizzesCompleted, stats.daysActive);
                  const nextBadge = ACHIEVEMENT_BADGES.find(badge => !earnedBadges.includes(badge));
                  
                  if (nextBadge) {
                    return (
                      <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
                        <div className="text-2xl mb-1 grayscale">{nextBadge.icon}</div>
                        <div className="text-sm font-medium text-gray-600">{nextBadge.name}</div>
                        <div className="text-xs text-gray-500">Next Goal</div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.accessLevel')}</h3>
              
              <div className={`p-4 rounded-lg mb-4 ${
                profile?.role === 'admin' ? 'bg-purple-50 border border-purple-200' :
                profile?.role === 'subscriber' ? 'bg-blue-50 border border-blue-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center mb-2">
                  {profile?.role === 'admin' && <Crown className="w-5 h-5 text-purple-600 mr-2" />}
                  {profile?.role === 'subscriber' && <Star className="w-5 h-5 text-blue-600 mr-2" />}
                  <span className="font-semibold text-gray-900">
                    {(profile?.role || 'learner').toUpperCase()} Access
                  </span>
                </div>
                
                {profile?.role === 'learner' ? (
                  <div>
                    <p className="text-gray-600 text-sm mb-3">
                      Basic learner access. Upgrade to subscriber for premium content.
                    </p>
                    <Link
                      to="/subscribe"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
                    >
                      Upgrade to Subscriber
                    </Link>
                  </div>
                ) : profile?.role === 'subscriber' ? (
                  <div>
                    <p className="text-blue-700 text-sm mb-3">
                      Subscriber access with premium content and community features.
                    </p>
                    {profile.subscription_status !== 'active' && (
                      <Link
                        to="/subscribe"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
                      >
                        Activate Subscription
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-purple-700 text-sm">
                    Full administrative access to all platform features.
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Free Content</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Learner Content</span>
                  {profile?.role !== 'guest' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subscriber Content</span>
                  {profile?.role === 'subscriber' || profile?.role === 'admin' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Community Access</span>
                  {profile?.role === 'subscriber' || profile?.role === 'admin' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h3>
              <div className="space-y-3">
                <Link
                  to="/courses"
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-blue-900">{t('dashboard.browseCourses')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </Link>

                <Link
                  to="/lead-magnet"
                  className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Download className="w-5 h-5 text-amber-600 mr-3" />
                    <span className="font-medium text-amber-900">{t('dashboard.freeWineGuide')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600" />
                </Link>

                <Link
                  to="/community"
                  className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-green-900">{t('dashboard.community', 'Community')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </Link>

                {(profile?.role === 'subscriber' || profile?.role === 'admin') && (
                  <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <Video className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="font-medium text-purple-900">{t('dashboard.communityVideos')}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.thisWeeksGoals')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('dashboard.completeModules').replace('{count}', '2')}</span>
                  <span className="text-green-600 font-medium">{Math.min(2, stats.totalModulesCompleted)}/2</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(100, (stats.totalModulesCompleted / 2) * 100)}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('dashboard.watchMinutes').replace('{count}', '60')}</span>
                  <span className="text-amber-600 font-medium">{Math.min(60, stats.totalModulesCompleted * 15)}/60</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${Math.min(100, (stats.totalModulesCompleted * 15 / 60) * 100)}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('dashboard.takeQuizzes').replace('{count}', '3')}</span>
                  <span className="text-blue-600 font-medium">{Math.min(3, stats.totalModulesCompleted)}/3</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, (stats.totalModulesCompleted / 3) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate component for course card with translation
const CourseCard: React.FC<{ course: Course; progress: number }> = ({ course, progress }) => {
  const { t } = useLanguage();
  
  // Get course translations from language context
  const courseTitle = t(`course.${course.id}.title`, course.title);
  const courseDescription = t(`course.${course.id}.description`, course.description || '');

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{courseTitle}</h3>
          <p className="text-gray-600 text-sm mt-1">{courseDescription}</p>
        </div>
        <img
          src={course.thumbnail_url || 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg'}
          alt={courseTitle}
          className="w-16 h-16 rounded-lg object-cover ml-4"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{t('course.wineEducationCourse', 'Wine education course')}</span>
        <span>{Math.round(progress)}% {t('dashboard.complete')}</span>
      </div>

      <ProgressBar progress={progress} showPercentage={false} className="mb-3" />

      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <FileText className="w-4 h-4 mr-1" />
          <span>{t('course.multipleModules', 'Multiple modules')}</span>
        </div>
        <Link
          to={`/course/${course.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {t('dashboard.viewCourse', 'View Course')}
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;