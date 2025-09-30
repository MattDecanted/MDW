import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { supabase, Course, Module, UserProgress } from '../lib/supabase';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Clock, 
  Star, 
  Crown, 
  Lock,
  Play,
  Download,
  CheckCircle,
  ArrowLeft,
  Users
} from 'lucide-react';
import ProgressBar from '../components/Common/ProgressBar';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId, user]);

  const loadCourseData = async () => {
    if (!courseId) return;
    
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      // Mock data when Supabase not connected
      setCourse({
        id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'wine-fundamentals',
        title: 'Wine Fundamentals',
        description: 'Learn the basics of wine tasting, terminology, and appreciation',
        thumbnail_url: 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg',
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setModules([
        {
          id: '11111111-1111-1111-1111-111111111111',
          course_id: courseId,
          slug: 'intro-to-wine',
          title: 'Introduction to Wine',
          description: 'Basic wine knowledge and terminology',
          video_url: 'https://www.youtube.com/watch?v=example',
          pdf_url: null,
          order_index: 1,
          required_role: 'learner',
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
      setUserProgress([]);
      setLoading(false);
      return;
    }

    try {
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('is_published', true)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Load user progress if authenticated
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;
        setUserProgress(progressData || []);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      // Fallback to mock data on error
      setCourse({
        id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'wine-fundamentals',
        title: 'Wine Fundamentals',
        description: 'Learn the basics of wine tasting, terminology, and appreciation',
        thumbnail_url: 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg',
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setModules([]);
      setUserProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const canAccessModule = (module: Module): boolean => {
    if (!user || !profile) return module.required_role === 'guest';
    
    const roleHierarchy = {
      guest: 0,
      learner: 1,
      subscriber: 2,
      translator: 2,
      admin: 3,
    };

    const userRoleLevel = roleHierarchy[profile.role];
    const requiredRoleLevel = roleHierarchy[module.required_role];

    if (userRoleLevel < requiredRoleLevel) return false;

    // Special check for subscriber content
    if (module.required_role === 'subscriber' && profile.role === 'subscriber') {
      return profile.subscription_status === 'active';
    }

    return true;
  };

  const isModuleCompleted = (moduleId: string): boolean => {
    return userProgress.some(p => p.module_id === moduleId && p.completed);
  };

  const getCourseProgress = (): number => {
    if (modules.length === 0) return 0;
    
    const accessibleModules = modules.filter(m => canAccessModule(m));
    if (accessibleModules.length === 0) return 0;
    
    const completedModules = accessibleModules.filter(m => isModuleCompleted(m.id));
    return (completedModules.length / accessibleModules.length) * 100;
  };

  const getSubscriptionBadge = (requiredRole: string) => {
    switch (requiredRole) {
      case 'guest':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Free</span>;
      case 'learner':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center">
          <Star className="w-3 h-3 mr-1" />
          Learner Required
        </span>;
      case 'subscriber':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center">
          <Crown className="w-3 h-3 mr-1" />
          Subscriber Required
        </span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-blue-600 hover:text-blue-800">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const accessibleModules = modules.filter(m => canAccessModule(m));
  const lockedModules = modules.filter(m => !canAccessModule(m));
  const completedCount = accessibleModules.filter(m => isModuleCompleted(m.id)).length;
  
  // Get translated course content
  const translatedCourse = useTranslatedContent('course', course.id, {
    title: course.title,
    description: course.description || '',
  });

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/courses" 
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Courses
          </Link>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={course.thumbnail_url || 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg'}
                alt={course.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{translatedCourse.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{translatedCourse.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
                  <div className="text-sm text-gray-500">{t('course.modules')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                  <div className="text-sm text-gray-500">{t('course.completed')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{accessibleModules.length}</div>
                  <div className="text-sm text-gray-500">{t('common.available')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(getCourseProgress())}%</div>
                  <div className="text-sm text-gray-500">{t('course.progress')}</div>
                </div>
              </div>

              <ProgressBar progress={getCourseProgress()} className="mb-6" />

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Wine education course</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  profile?.role === 'subscriber' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {profile?.role === 'admin' && <Crown className="w-4 h-4 mr-1 inline" />}
                  {profile?.role === 'subscriber' && <Star className="w-4 h-4 mr-1 inline" />}
                  Your Access: {profile?.role?.toUpperCase() || 'GUEST'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Course Modules</h2>
              
              <div className="space-y-4">
                {modules.map((module, index) => {
                  const hasAccess = canAccessModule(module);
                  const isCompleted = isModuleCompleted(module.id);
                  
                  return (
                    <div
                      key={module.id}
                      className={`border rounded-lg p-4 transition-all ${
                        hasAccess 
                          ? 'border-gray-200 hover:border-blue-300 hover:shadow-md' 
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-4 ${
                            isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : hasAccess 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h3 className={`font-semibold ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}>
                                {module.title}
                              </h3>
                              {isCompleted && (
                                <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                              )}
                            </div>
                            
                            <p className={`text-sm mb-2 ${hasAccess ? 'text-gray-600' : 'text-gray-400'}`}>
                              {module.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>15 min</span>
                              </div>
                              {module.video_url && (
                                <div className="flex items-center">
                                  <Video className="w-3 h-3 mr-1 text-red-600" />
                                  <span>Video</span>
                                </div>
                              )}
                              {module.pdf_url && (
                                <div className="flex items-center">
                                  <FileText className="w-3 h-3 mr-1 text-blue-600" />
                                  <span>PDF</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {getSubscriptionBadge(module.required_role)}
                          
                          {hasAccess ? (
                            <Link
                              to={`/module/${module.id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Review
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Start
                                </>
                              )}
                            </Link>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <Lock className="w-4 h-4 mr-2" />
                              <span className="text-sm">Locked</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upgrade CTA for locked content */}
              {lockedModules.length > 0 && profile?.role !== 'subscriber' && profile?.role !== 'admin' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unlock {lockedModules.length} Premium Modules
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get access to advanced wine education content and exclusive community features
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          All premium course content
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Weekly blind tasting sessions
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Wineback Wednesday videos
                        </li>
                      </ul>
                    </div>
                    <div className="text-center">
                      <Crown className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                      <Link
                        to="/subscribe"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors block"
                      >
                        Upgrade Now
                      </Link>
                      <p className="text-xs text-gray-500 mt-2">Starting at $99/month</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Modules:</span>
                  <span className="font-medium">{modules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available to You:</span>
                  <span className="font-medium">{accessibleModules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">{completedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium">Beginner to Intermediate</span>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h3>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Fundamental wine tasting techniques</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">How to identify wine characteristics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Wine and food pairing principles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Understanding wine regions and styles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Building confidence in wine selection</span>
                </li>
              </ul>
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Instructor</h3>
              
              <div className="flex items-center mb-4">
                <img 
                  src="/Matt_decantednk.png" 
                  alt="Matt Decanted" 
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Matt Decanted</h4>
                  <p className="text-sm text-gray-600">Certified Sommelier & Wine Educator</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                Matt brings years of industry experience and a passion for making wine education 
                accessible and enjoyable for everyone.
              </p>
              
              <Link 
                to="/about"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn more about Matt →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;