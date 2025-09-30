import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { supabase, Module, Course, Quiz, UserProgress, QuizAttempt } from '../lib/supabase';
import { 
  ArrowLeft, 
  Video, 
  FileText, 
  Clock, 
  Download, 
  CheckCircle, 
  Play,
  Star,
  Crown,
  Lock,
  Award,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ModuleDetail: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [quizId: string]: string }>({});
  const [quizResults, setQuizResults] = useState<{ [quizId: string]: boolean }>({});
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [languageSpecificContent, setLanguageSpecificContent] = useState<{
    video_url?: string;
    pdf_url?: string;
  }>({});

  // Get translated content for the module
  const translatedModule = useTranslatedContent(
    'module',
    moduleId || '',
    {
      title: module?.title || '',
      description: module?.description || '',
    }
  );

  // Get translated content for quizzes
  const translatedQuizzes = quizzes.map(quiz => ({
    ...quiz,
    ...useTranslatedContent('quiz', quiz.id, {
      question: quiz.question,
      explanation: quiz.explanation || '',
    })
  }));

  useEffect(() => {
    if (moduleId) {
      loadModuleData();
    }
  }, [moduleId, user]);

  useEffect(() => {
    if (module && language !== 'en') {
      loadLanguageSpecificContent();
    }
  }, [module, language]);

  const loadLanguageSpecificContent = async () => {
    if (!supabase || !module || !import.meta.env.VITE_SUPABASE_URL) return;

    try {
      // Load language-specific videos
      const { data: videoData } = await supabase
        .from('videos')
        .select('video_url')
        .eq('module_id', module.id)
        .eq('language_code', language)
        .maybeSingle();

      // Load language-specific downloadables
      const { data: downloadData } = await supabase
        .from('downloadables')
        .select('file_url')
        .eq('module_id', module.id)
        .eq('language_code', language)
        .eq('file_type', 'pdf')
        .maybeSingle();

      setLanguageSpecificContent({
        video_url: videoData?.video_url,
        pdf_url: downloadData?.file_url,
      });
    } catch (error) {
      console.error('Error loading language-specific content:', error);
      setLanguageSpecificContent({});
    }
  };

  const loadModuleData = async () => {
    if (!moduleId) return;
    
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      // Mock data when Supabase not connected
      setModule({
        id: '11111111-1111-1111-1111-111111111111',
        course_id: '550e8400-e29b-41d4-a716-446655440001',
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
      });
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
      setQuizzes([]);
      setModuleCompleted(false);
      setLoading(false);
      return;
    }

    try {
      // Load module
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .eq('is_published', true)
        .single();

      if (moduleError) throw moduleError;
      setModule(moduleData);

      // Load course
      if (moduleData) {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', moduleData.course_id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Load quizzes
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('module_id', moduleId)
          .order('order_index');

        if (quizzesError) throw quizzesError;
        setQuizzes(quizzesData || []);

        // Check if module is completed
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('module_id', moduleId)
            .maybeSingle();

          if (progressError) throw progressError;
          setModuleCompleted(progressData?.completed || false);
        }
      }
    } catch (error) {
      console.error('Error loading module data:', error);
      // Fallback to mock data on error
      setModule(null);
      setCourse(null);
      setQuizzes([]);
      setModuleCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const canAccessModule = (): boolean => {
    if (!module || !user || !profile) return false;
    
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

  const handleQuizAnswer = (quizId: string, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [quizId]: answer }));
  };

  const submitQuiz = async (quiz: Quiz) => {
    if (!user) return;

    const userAnswer = quizAnswers[quiz.id];
    // Use translated quiz for comparison
    const translatedQuiz = translatedQuizzes.find(q => q.id === quiz.id);
    const isCorrect = userAnswer === (translatedQuiz?.correct_answer || quiz.correct_answer);
    
    setQuizResults(prev => ({ ...prev, [quiz.id]: isCorrect }));

    // Save quiz attempt
    if (supabase && import.meta.env.VITE_SUPABASE_URL) {
      try {
        await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          quiz_id: quiz.id,
          answer: userAnswer,
          is_correct: isCorrect,
        });
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    }
    
    // Move to next quiz or complete module
    if (currentQuizIndex < quizzes.length - 1) {
      setTimeout(() => {
        setCurrentQuizIndex(currentQuizIndex + 1);
      }, 2000); // Show result for 2 seconds
    } else {
      setTimeout(() => {
        completeModule();
      }, 2000);
    }
  };

  const completeModule = async () => {
    if (!user || !moduleId) return;
    
    if (supabase && import.meta.env.VITE_SUPABASE_URL) {
      try {
        // Mark module as completed
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error completing module:', error);
      }
    }
    
    setModuleCompleted(true);
    setShowQuiz(false);
  };

  const getVideoEmbedUrl = (url: string): string => {
    // Use language-specific video if available
    const videoUrl = languageSpecificContent.video_url || url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!module || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Module Not Found</h1>
          <Link to="/courses" className="text-blue-600 hover:text-blue-800">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!canAccessModule()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Premium Content</h1>
          <p className="text-gray-600 mb-6">
            This module requires a {module.required_role} subscription to access.
          </p>
          <Link
            to="/subscribe"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade Now
          </Link>
          <div className="mt-4">
            <Link to={`/course/${course.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center text-sm">
            <Link to="/courses" className="text-blue-600 hover:text-blue-800">Courses</Link>
            <span className="mx-2 text-gray-400">→</span>
            <Link to={`/course/${course.id}`} className="text-blue-600 hover:text-blue-800">{course.title}</Link>
            <span className="mx-2 text-gray-400">→</span>
            <span className="text-gray-600">{module.title}</span>
          </div>
        </div>

        {/* Module Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link
                to={`/course/${course.id}`}
                className="text-blue-600 hover:text-blue-800 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{translatedModule.title}</h1>
                <p className="text-gray-600">{translatedModule.description}</p>
              </div>
            </div>
            
            {moduleCompleted && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span className="font-semibold">Completed</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>15 minutes</span>
            </div>
            {module.video_url && (
              <div className="flex items-center">
                <Video className="w-4 h-4 mr-1 text-red-600" />
                <span>Video Content</span>
              </div>
            )}
            {module.pdf_url && (
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1 text-blue-600" />
                <span>PDF Download</span>
              </div>
            )}
            {quizzes.length > 0 && (
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1 text-amber-600" />
                <span>{quizzes.length} Quiz{quizzes.length > 1 ? 'zes' : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {(languageSpecificContent.video_url || module.video_url) && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src={getVideoEmbedUrl(languageSpecificContent.video_url || module.video_url)}
                    title={translatedModule.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{translatedModule.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Watch to continue</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Download */}
            {(languageSpecificContent.pdf_url || module.pdf_url) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600 mr-4" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Course Materials</h3>
                      <p className="text-gray-600 text-sm">
                        Download the PDF guide for this module
                        {languageSpecificContent.pdf_url && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {language.toUpperCase()} Version
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <a
                    href={languageSpecificContent.pdf_url || module.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {languageSpecificContent.pdf_url ? `Download ${language.toUpperCase()} PDF` : 'Download PDF'}
                  </a>
                </div>
              </div>
            )}

            {/* Quiz Section */}
            {quizzes.length > 0 && !moduleCompleted && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {!showQuiz ? (
                  <div className="text-center">
                    <Award className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Test Your Knowledge
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Complete {quizzes.length} quiz{quizzes.length > 1 ? 'zes' : ''} to finish this module
                    </p>
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Start Quiz
                    </button>
                  </div>
                ) : currentQuiz ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Question {currentQuizIndex + 1} of {quizzes.length}
                      </h3>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Use translated quiz */}
                    {(() => {
                      const translatedQuiz = translatedQuizzes.find(q => q.id === currentQuiz.id) || currentQuiz;
                      
                      return (
                    <div className="mb-6">
                        <h4 className="text-lg text-gray-900 mb-4">{translatedQuiz.question}</h4>
                      
                        {translatedQuiz.question_type === 'multiple_choice' && translatedQuiz.options ? (
                        <div className="space-y-3">
                            {(translatedQuiz.options as string[]).map((option, index) => (
                            <label
                              key={index}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="radio"
                                  name={`quiz-${translatedQuiz.id}`}
                                value={option}
                                  checked={quizAnswers[translatedQuiz.id] === option}
                                  onChange={(e) => handleQuizAnswer(translatedQuiz.id, e.target.value)}
                                className="mr-3"
                              />
                              <span className="text-gray-900">{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                                name={`quiz-${translatedQuiz.id}`}
                              value="true"
                                checked={quizAnswers[translatedQuiz.id] === 'true'}
                                onChange={(e) => handleQuizAnswer(translatedQuiz.id, e.target.value)}
                              className="mr-3"
                            />
                            <span className="text-gray-900">True</span>
                          </label>
                          <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                                name={`quiz-${translatedQuiz.id}`}
                              value="false"
                                checked={quizAnswers[translatedQuiz.id] === 'false'}
                                onChange={(e) => handleQuizAnswer(translatedQuiz.id, e.target.value)}
                              className="mr-3"
                            />
                            <span className="text-gray-900">False</span>
                          </label>
                        </div>
                      )}
                    </div>
                      );
                    })()}

                    {/* Show result if answered */}
                    {quizResults[currentQuiz.id] !== undefined && (() => {
                      const translatedQuiz = translatedQuizzes.find(q => q.id === currentQuiz.id) || currentQuiz;
                      return (
                      <div className={`p-4 rounded-lg mb-4 ${
                        quizResults[currentQuiz.id] ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          <CheckCircle className={`w-5 h-5 mr-2 ${
                            quizResults[currentQuiz.id] ? 'text-green-600' : 'text-red-600'
                          }`} />
                          <span className={`font-semibold ${
                            quizResults[currentQuiz.id] ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {quizResults[currentQuiz.id] ? 'Correct!' : 'Incorrect'}
                          </span>
                        </div>
                          {translatedQuiz.explanation && (
                          <p className={`text-sm ${
                            quizResults[currentQuiz.id] ? 'text-green-700' : 'text-red-700'
                          }`}>
                              {translatedQuiz.explanation}
                          </p>
                        )}
                      </div>
                      );
                    })()}

                    <div className="flex justify-between">
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Exit Quiz
                      </button>
                      <button
                        onClick={() => submitQuiz(translatedQuizzes.find(q => q.id === currentQuiz.id) || currentQuiz)}
                        disabled={!quizAnswers[currentQuiz.id] || quizResults[currentQuiz.id] !== undefined}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {currentQuizIndex < quizzes.length - 1 ? (
                          <>
                            Next Question
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          'Complete Module'
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Module Completed */}
            {moduleCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Module Completed!
                </h3>
                <p className="text-green-700 mb-4">
                  Great job! You've successfully completed this module.
                </p>
                <Link
                  to={`/course/${course.id}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue to Next Module
                </Link>
              </div>
            )}

            {/* No Quiz - Auto Complete */}
            {quizzes.length === 0 && !moduleCompleted && (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Complete?
                </h3>
                <p className="text-gray-600 mb-6">
                  Mark this module as completed to track your progress.
                </p>
                <button
                  onClick={completeModule}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Mark as Complete
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module Progress */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Progress</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Content Viewed</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                
                {module.pdf_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Materials Available</span>
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                
                {quizzes.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quiz Completed</span>
                    {moduleCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                )}
              </div>

              {!moduleCompleted && (
                <div className="mt-4">
                  {quizzes.length > 0 ? (
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Take Quiz to Complete
                    </button>
                  ) : (
                    <button
                      onClick={completeModule}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Course Navigation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Navigation</h3>
              
              <Link
                to={`/course/${course.id}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center mb-3"
              >
                View All Modules
              </Link>
              
              <Link
                to="/dashboard"
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors block text-center"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Subscription Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Access</h3>
              
              <div className={`p-3 rounded-lg ${
                module.required_role === 'subscriber' ? 'bg-purple-50 border border-purple-200' :
                module.required_role === 'learner' ? 'bg-blue-50 border border-blue-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center mb-2">
                  {module.required_role === 'subscriber' && <Crown className="w-4 h-4 text-purple-600 mr-2" />}
                  {module.required_role === 'learner' && <Star className="w-4 h-4 text-blue-600 mr-2" />}
                  <span className="font-medium">
                    {module.required_role.charAt(0).toUpperCase() + module.required_role.slice(1)} Content
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  This module is available with your current access level.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;