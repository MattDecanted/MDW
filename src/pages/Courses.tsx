import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Course, Module, UserProgress, safeQuery, isSupabaseConnected } from '../lib/supabaseClient';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { BookOpen, Video, FileText, Clock, Lock, Star, Crown, ArrowRight, CheckCircle } from 'lucide-react';
import ProgressBar from '../components/Common/ProgressBar';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Courses: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<{ [courseId: string]: Module[] }>({});
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    // Mock data with proper UUIDs (used when Supabase not connected)
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

    const mockModules: { [courseId: string]: Module[] } = {
      '550e8400-e29b-41d4-a716-446655440001': [
        {
          id: '11111111-1111-1111-1111-111111111111',
          course_id: '550e8400-e29b-41d4-a716-446655440001',
          slug: 'intro-to-wine',
          title: 'Introduction to Wine',
          description: 'Basic wine knowledge and terminology',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          pdf_url: null,
          order_index: 1,
          required_role: 'learner',
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          course_id: '550e8400-e29b-41d4-a716-446655440001',
          slug: 'wine-tasting-techniques',
          title: 'Wine Tasting Techniques',
          description: 'Learn proper wine tasting methods and evaluation',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          pdf_url: null,
          order_index: 2,
          required_role: 'subscriber',
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      '550e8400-e29b-41d4-a716-446655440002': [
        {
          id: '33333333-3333-3333-3333-333333333333',
          course_id: '550e8400-e29b-41d4-a716-446655440002',
          slug: 'burgundy-region',
          title: 'Burgundy Region',
          description: 'Deep dive into Burgundy wines and terroir',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          pdf_url: null,
          order_index: 1,
          required_role: 'subscriber',
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    };

    // Load courses with safe query
    const coursesData = await safeQuery(
      () => supabase!.from('courses').select('*').eq('is_published', true).order('created_at'),
      mockCourses
    );
    setCourses(coursesData);

    // Load modules for each course
    const modulesData: { [courseId: string]: Module[] } = {};
    for (const course of coursesData) {
      const courseModules = await safeQuery(
        () => supabase!.from('modules').select('*').eq('course_id', course.id).eq('is_published', true).order('order_index'),
        mockModules[course.id] || []
      );
      modulesData[course.id] = courseModules;
    }
    setModules(modulesData);

    // Load user progress if authenticated
    if (user) {
      const progressData = await safeQuery(
        () => supabase!.from('user_progress').select('*').eq('user_id', user.id),
        []
      );
      setUserProgress(progressData);
    }

    setLoading(false);
  };

  const canAccessModule = (module: Module): boolean => {
    if (!user || !profile) return module.required_role === 'guest';
    
    // Admin always has access
    if (profile.role === 'admin') return true;

    // Role-based access check
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

  const getCourseProgress = (courseId: string): number => {
    const courseModules = modules[courseId] || [];
    const accessibleModules = courseModules.filter(m => canAccessModule(m));
    
    if (accessibleModules.length === 0) return 0;
    
    const completedModules = accessibleModules.filter(module =>
      userProgress.some(p => p.module_id === module.id && p.completed)
    );
    
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

  if (!user) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('course.wineEducationCourses')}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('auth.signIn')} to access our wine education content
          </p>
          <Link
            to="/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {t('auth.signIn')} to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Wine Education Courses - Learn Wine Online with Matt Decanted"
        description="Comprehensive wine education courses covering fundamentals, regions, tasting techniques, and advanced sommelier skills. Learn at your own pace with expert instruction."
        keywords="wine courses, online wine education, wine certification, sommelier training, wine fundamentals, wine regions"
        ogType="website"
        courseData={{
          provider: "Matt Decanted",
          instructor: "Matt Decanted",
          level: "Beginner to Advanced"
        }}
      />
      
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('course.wineEducationCourses')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('course.comprehensiveEducation')}
          </p>
          <div className="mt-4">
            <span className="text-sm text-gray-500">{t('course.yourAccessLevel')}: </span>
            <span className={`px-3 py-1 text-sm rounded-full ${
              profile?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
              profile?.role === 'subscriber' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {profile?.role === 'admin' && <Crown className="w-4 h-4 mr-1 inline" />}
              {profile?.role === 'subscriber' && <Star className="w-4 h-4 mr-1 inline" />}
              {profile?.role?.toUpperCase() || 'GUEST'}
            </span>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="space-y-8">
          {courses.map((course) => {
            // Get translated course content
            const translatedCourse = useTranslatedContent('course', course.id, {
              title: course.title,
              description: course.description || '',
            });
            
            const courseModules = modules[course.id] || [];
            const accessibleModules = courseModules.filter(m => canAccessModule(m));
            const lockedModules = courseModules.filter(m => !canAccessModule(m));
            const progress = getCourseProgress(course.id);

            return (
              <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                  {/* Course Thumbnail */}
                  <div className="md:w-1/3">
                    <img
                      src={course.thumbnail_url || 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg'}
                      alt={translatedCourse.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  {/* Course Content */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{translatedCourse.title}</h2>
                        <p className="text-gray-600 mb-4">{translatedCourse.description}</p>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center text-sm text-gray-500 mb-6">
                      <FileText className="w-4 h-4 mr-1" />
                      <span>{courseModules.length} modules</span>
                      <span className="mx-2">•</span>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Wine education course</span>
                      {accessibleModules.length < courseModules.length && (
                        <>
                          <span className="mx-2">•</span>
                          <Lock className="w-4 h-4 mr-1" />
                          <span>{lockedModules.length} premium modules</span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {user && <ProgressBar progress={progress} className="mb-6" />}

                    {/* Modules Preview */}
                    <div className="space-y-3 mb-6">
                      <h3 className="font-semibold text-gray-900">{t('course.modules')}:</h3>
                      {courseModules.slice(0, 3).map((module, index) => {
                        const hasAccess = canAccessModule(module);
                        const isCompleted = userProgress.some(p => p.module_id === module.id && p.completed);
                        
                        // Get translated module content
                        const translatedModule = useTranslatedContent('module', module.id, {
                          title: module.title,
                          description: module.description || '',
                        });
                        
                        return (
                          <div
                            key={module.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              hasAccess ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center flex-1">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${
                                isCompleted ? 'bg-green-100 text-green-800' :
                                hasAccess ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {isCompleted ? <CheckCircle className="w-3 h-3" /> : index + 1}
                              </span>
                              <div className="flex-1">
                                <h4 className={`font-medium ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {translatedModule.title}
                                </h4>
                                <div className="flex items-center mt-1">
                                  {module.video_url && <Video className="w-3 h-3 text-red-600 mr-1" />}
                                  {module.pdf_url && <FileText className="w-3 h-3 text-blue-600 mr-1" />}
                                  <span className="text-xs text-gray-500">15 min</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {getSubscriptionBadge(module.required_role)}
                              {!hasAccess && <Lock className="w-4 h-4 text-gray-400" />}
                            </div>
                          </div>
                        );
                      })}
                      
                      {courseModules.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{courseModules.length - 3} more {t('course.modules')}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/course/${course.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                      >
                       {t('course.viewCourseDetails')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>

                      {/* Upgrade CTA for locked content */}
                      {lockedModules.length > 0 && profile?.role !== 'subscriber' && profile?.role !== 'admin' && (
                        <Link
                          to="/subscribe"
                          className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Unlock {lockedModules.length} Premium Modules
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No courses available yet
            </h3>
            <p className="text-gray-600">
              Check back soon for new wine education content!
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Courses;