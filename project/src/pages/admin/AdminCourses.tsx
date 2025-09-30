import React, { useState, useEffect } from 'react';
import { supabase, Course, Module, Quiz } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { BookOpen, Plus, Edit, Trash2, Eye, Settings, Video, FileText, Users, HelpCircle, CheckCircle, X, Upload, Globe } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AdminCourses: React.FC = () => {
  const { availableLanguages } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<{ [courseId: string]: Module[] }>({});
  const [quizzes, setQuizzes] = useState<{ [moduleId: string]: Quiz[] }>({});
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [expandedCourse, setExpandedCourse] = useState<string>('');
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [selectedModuleForMedia, setSelectedModuleForMedia] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Load courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Load modules for each course
      const modulesData: { [courseId: string]: Module[] } = {};
      const quizzesData: { [moduleId: string]: Quiz[] } = {};

      if (coursesData) {
        for (const course of coursesData) {
          const { data: courseModules, error: modulesError } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', course.id)
            .order('order_index');

          if (modulesError) throw modulesError;
          modulesData[course.id] = courseModules || [];

          // Load quizzes for each module
          for (const module of courseModules || []) {
            const { data: moduleQuizzes, error: quizzesError } = await supabase
              .from('quizzes')
              .select('*')
              .eq('module_id', module.id)
              .order('order_index');

            if (quizzesError) throw quizzesError;
            quizzesData[module.id] = moduleQuizzes || [];
          }
        }
      }

      setModules(modulesData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) return;

    try {
      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);
        if (error) throw error;
      }
      
      setEditingCourse(null);
      setShowCourseForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure? This will delete the course and all its modules and quizzes.')) return;
    
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleSaveModule = async (moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) return;

    try {
      if (editingModule) {
        const { error } = await supabase
          .from('modules')
          .update(moduleData)
          .eq('id', editingModule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('modules')
          .insert([moduleData]);
        if (error) throw error;
      }
      
      setEditingModule(null);
      setShowModuleForm(false);
      setSelectedCourseId('');
      loadData();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure? This will delete the module and all its quizzes.')) return;
    
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);
      
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module');
    }
  };

  const handleSaveQuiz = async (quizData: Omit<Quiz, 'id' | 'created_at'>) => {
    if (!supabase) return;

    try {
      if (editingQuiz) {
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', editingQuiz.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quizzes')
          .insert([quizData]);
        if (error) throw error;
      }
      
      setEditingQuiz(null);
      setShowQuizForm(false);
      setSelectedModuleId('');
      loadData();
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
      
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalModules = Object.values(modules).flat().length;
  const totalQuizzes = Object.values(quizzes).flat().length;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Course Management
            </h1>
            <p className="text-gray-600">
              Create and manage wine education courses, modules, and quizzes
            </p>
          </div>
          <button
            onClick={() => setShowCourseForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900">{totalModules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <HelpCircle className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-amber-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.is_published).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                        course.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{course.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-1" />
                      <span>{modules[course.id]?.length || 0} modules</span>
                      <span className="mx-2">•</span>
                      <HelpCircle className="w-4 h-4 mr-1" />
                      <span>{Object.values(quizzes).flat().filter(q => 
                        modules[course.id]?.some(m => m.id === q.module_id)
                      ).length} quizzes</span>
                      <span className="mx-2">•</span>
                      <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExpandedCourse(expandedCourse === course.id ? '' : course.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setShowModuleForm(true);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Add Module"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setShowCourseForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Course Details */}
                {expandedCourse === course.id && modules[course.id] && (
                  <div className="border-t border-gray-200 pt-6 mt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Course Modules & Quizzes</h4>
                    
                    <div className="space-y-4">
                      {modules[course.id].map((module) => (
                        <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                          {/* Module Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <h5 className="font-semibold text-gray-900">{module.title}</h5>
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  module.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {module.is_published ? 'Published' : 'Draft'}
                                </span>
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  module.required_role === 'guest' ? 'bg-gray-100 text-gray-700' :
                                  module.required_role === 'learner' ? 'bg-blue-100 text-blue-700' :
                                  module.required_role === 'subscriber' ? 'bg-purple-100 text-purple-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {module.required_role}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">{module.description}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                {module.video_url && <Video className="w-3 h-3 mr-1" />}
                                {module.pdf_url && <FileText className="w-3 h-3 mr-1" />}
                                <span>Order: {module.order_index}</span>
                                <span className="mx-2">•</span>
                                <span>{quizzes[module.id]?.length || 0} quizzes</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedModuleForMedia(module.id);
                                  setShowMediaForm(true);
                                }}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Manage Language-Specific Media"
                              >
                                <Video className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedModuleId(module.id);
                                  setShowQuizForm(true);
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Add Quiz"
                              >
                                <HelpCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingModule(module);
                                  setSelectedCourseId(course.id);
                                  setShowModuleForm(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit Module"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteModule(module.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Module"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Quizzes for this module */}
                          {quizzes[module.id] && quizzes[module.id].length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <h6 className="text-sm font-medium text-gray-900 mb-3">Module Quizzes:</h6>
                              <div className="space-y-2">
                                {quizzes[module.id].map((quiz) => (
                                  <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                      <div className="flex items-center mb-1">
                                        <span className="font-medium text-gray-900 text-sm">{quiz.question}</span>
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                          quiz.question_type === 'multiple_choice' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                          {quiz.question_type.replace('_', ' ')}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        <span>Order: {quiz.order_index}</span>
                                        <span className="mx-2">•</span>
                                        <span>Answer: {quiz.correct_answer}</span>
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => {
                                          setEditingQuiz(quiz);
                                          setSelectedModuleId(module.id);
                                          setShowQuizForm(true);
                                        }}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit Quiz"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuiz(quiz.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Quiz"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first wine education course to get started
            </p>
            <button
              onClick={() => setShowCourseForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create First Course
            </button>
          </div>
        )}

        {/* Course Form Modal */}
        {showCourseForm && (
          <CourseForm
            course={editingCourse}
            onSave={handleSaveCourse}
            onCancel={() => {
              setEditingCourse(null);
              setShowCourseForm(false);
            }}
          />
        )}

        {/* Module Form Modal */}
        {showModuleForm && (
          <ModuleForm
            courseId={selectedCourseId}
            module={editingModule}
            onSave={handleSaveModule}
            onCancel={() => {
              setEditingModule(null);
              setShowModuleForm(false);
              setSelectedCourseId('');
            }}
          />
        )}

        {/* Quiz Form Modal */}
        {showQuizForm && (
          <QuizForm
            moduleId={selectedModuleId}
            quiz={editingQuiz}
            onSave={handleSaveQuiz}
            onCancel={() => {
              setEditingQuiz(null);
              setShowQuizForm(false);
              setSelectedModuleId('');
            }}
          />
        )}

        {/* Language-Specific Media Form Modal */}
        {showMediaForm && (
          <LanguageMediaForm
            moduleId={selectedModuleForMedia}
            onSave={() => {
              setShowMediaForm(false);
              setSelectedModuleForMedia('');
              loadData();
            }}
            onCancel={() => {
              setShowMediaForm(false);
              setSelectedModuleForMedia('');
            }}
          />
        )}
      </div>
    </div>
  );
};

// Course Form Component
const CourseForm: React.FC<{
  course: Course | null;
  onSave: (data: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}> = ({ course, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    thumbnail_url: course?.thumbnail_url || '',
    is_published: course?.is_published || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {course ? 'Edit Course' : 'Create New Course'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Wine Fundamentals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe what students will learn..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL (optional)
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://images.pexels.com/..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
              Published (visible to users)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {course ? 'Update' : 'Create'} Course
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Module Form Component
const ModuleForm: React.FC<{
  courseId: string;
  module: Module | null;
  onSave: (data: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}> = ({ courseId, module, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    course_id: courseId,
    title: module?.title || '',
    description: module?.description || '',
    video_url: module?.video_url || '',
    pdf_url: module?.pdf_url || '',
    order_index: module?.order_index || 1,
    required_role: module?.required_role || 'learner' as const,
    is_published: module?.is_published || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {module ? 'Edit Module' : 'Add New Module'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Introduction to Wine Tasting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="What will students learn in this module?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (YouTube/Vimeo)
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF URL (optional)
            </label>
            <input
              type="url"
              value={formData.pdf_url}
              onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/module-notes.pdf"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Role
              </label>
              <select
                value={formData.required_role}
                onChange={(e) => setFormData({ ...formData, required_role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="guest">Guest (Free)</option>
                <option value="learner">Learner</option>
                <option value="subscriber">Subscriber (Premium)</option>
                <option value="admin">Admin Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Index
              </label>
              <input
                type="number"
                min="1"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="module_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="module_published" className="text-sm font-medium text-gray-700">
              Published (visible to users)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {module ? 'Update' : 'Add'} Module
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Quiz Form Component
const QuizForm: React.FC<{
  moduleId: string;
  quiz: Quiz | null;
  onSave: (data: Omit<Quiz, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}> = ({ moduleId, quiz, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    module_id: moduleId,
    question: quiz?.question || '',
    question_type: quiz?.question_type || 'multiple_choice' as const,
    options: quiz?.options || ['', '', '', ''],
    correct_answer: quiz?.correct_answer || '',
    explanation: quiz?.explanation || '',
    order_index: quiz?.order_index || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up options for true/false questions
    const finalData = {
      ...formData,
      options: formData.question_type === 'true_false' ? null : formData.options.filter(opt => opt.trim() !== ''),
    };
    
    onSave(finalData);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {quiz ? 'Edit Quiz' : 'Add New Quiz'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <textarea
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Enter your quiz question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={formData.question_type}
              onChange={(e) => {
                const newType = e.target.value as 'multiple_choice' | 'true_false';
                setFormData({ 
                  ...formData, 
                  question_type: newType,
                  options: newType === 'true_false' ? ['true', 'false'] : ['', '', '', ''],
                  correct_answer: ''
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
            </select>
          </div>

          {/* Multiple Choice Options */}
          {formData.question_type === 'multiple_choice' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Answer Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  + Add Option
                </button>
              </div>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 w-6">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer
            </label>
            {formData.question_type === 'multiple_choice' ? (
              <select
                required
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select correct answer...</option>
                {formData.options.filter(opt => opt.trim() !== '').map((option, index) => (
                  <option key={index} value={option}>
                    {String.fromCharCode(65 + index)}. {option}
                  </option>
                ))}
              </select>
            ) : (
              <select
                required
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select correct answer...</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (optional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Index
            </label>
            <input
              type="number"
              min="1"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              {quiz ? 'Update' : 'Create'} Quiz
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Language-Specific Media Form Component
const LanguageMediaForm: React.FC<{
  moduleId: string;
  onSave: () => void;
  onCancel: () => void;
}> = ({ moduleId, onSave, onCancel }) => {
  const { availableLanguages } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [mediaData, setMediaData] = useState({
    video_url: '',
    video_title: '',
    video_description: '',
    pdf_url: '',
    pdf_title: '',
    pdf_description: '',
  });
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingMedia();
  }, [moduleId, selectedLanguage]);

  const loadExistingMedia = async () => {
    if (!supabase) return;

    try {
      // Load existing videos for this language
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('module_id', moduleId)
        .eq('language_code', selectedLanguage);

      // Load existing downloadables for this language
      const { data: downloadables } = await supabase
        .from('downloadables')
        .select('*')
        .eq('module_id', moduleId)
        .eq('language_code', selectedLanguage);

      setExistingMedia([...(videos || []), ...(downloadables || [])]);
    } catch (error) {
      console.error('Error loading existing media:', error);
    }
  };

  const handleSaveVideo = async () => {
    if (!supabase || !mediaData.video_url) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('videos').insert({
        module_id: moduleId,
        title: mediaData.video_title,
        description: mediaData.video_description,
        video_url: mediaData.video_url,
        language_code: selectedLanguage,
        video_type: mediaData.video_url.includes('youtube') ? 'youtube' : 
                   mediaData.video_url.includes('vimeo') ? 'vimeo' : 'direct',
        order_index: 1,
      });

      if (error) throw error;
      loadExistingMedia();
      setMediaData({ ...mediaData, video_url: '', video_title: '', video_description: '' });
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Failed to save video');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePDF = async () => {
    if (!supabase || !mediaData.pdf_url) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('downloadables').insert({
        module_id: moduleId,
        title: mediaData.pdf_title,
        description: mediaData.pdf_description,
        file_url: mediaData.pdf_url,
        language_code: selectedLanguage,
        file_type: 'pdf',
        download_count: 0,
      });

      if (error) throw error;
      loadExistingMedia();
      setMediaData({ ...mediaData, pdf_url: '', pdf_title: '', pdf_description: '' });
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Failed to save PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string, type: 'video' | 'downloadable') => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    if (!supabase) return;

    try {
      const table = type === 'video' ? 'videos' : 'downloadables';
      const { error } = await supabase.from(table).delete().eq('id', mediaId);
      
      if (error) throw error;
      loadExistingMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media');
    }
  };

  const selectedLang = availableLanguages.find(lang => lang.code === selectedLanguage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Language-Specific Media Management
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableLanguages.filter(lang => lang.code !== 'en').map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Upload content specific to {selectedLang?.flag} {selectedLang?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Upload Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Video className="w-5 h-5 mr-2 text-red-600" />
              Video Content ({selectedLang?.name})
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={mediaData.video_title}
                  onChange={(e) => setMediaData({ ...mediaData, video_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Video title in ${selectedLang?.name}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL (YouTube/Vimeo)
                </label>
                <input
                  type="url"
                  value={mediaData.video_url}
                  onChange={(e) => setMediaData({ ...mediaData, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Description
                </label>
                <textarea
                  value={mediaData.video_description}
                  onChange={(e) => setMediaData({ ...mediaData, video_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={`Video description in ${selectedLang?.name}`}
                />
              </div>

              <button
                onClick={handleSaveVideo}
                disabled={!mediaData.video_url || loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Video'}
              </button>
            </div>
          </div>

          {/* PDF Upload Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              PDF Materials ({selectedLang?.name})
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF Title
                </label>
                <input
                  type="text"
                  value={mediaData.pdf_title}
                  onChange={(e) => setMediaData({ ...mediaData, pdf_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`PDF title in ${selectedLang?.name}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF URL
                </label>
                <input
                  type="url"
                  value={mediaData.pdf_url}
                  onChange={(e) => setMediaData({ ...mediaData, pdf_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/document.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF Description
                </label>
                <textarea
                  value={mediaData.pdf_description}
                  onChange={(e) => setMediaData({ ...mediaData, pdf_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={`PDF description in ${selectedLang?.name}`}
                />
              </div>

              <button
                onClick={handleSavePDF}
                disabled={!mediaData.pdf_url || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Media for Selected Language */}
        {existingMedia.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Existing Media for {selectedLang?.flag} {selectedLang?.name}
            </h4>
            <div className="space-y-3">
              {existingMedia.map((media) => (
                <div key={media.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center flex-1">
                    {media.video_url ? (
                      <Video className="w-5 h-5 text-red-600 mr-3" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                    )}
                    <div>
                      <h5 className="font-medium text-gray-900">{media.title}</h5>
                      <p className="text-sm text-gray-500">{media.description}</p>
                      <a 
                        href={media.video_url || media.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Content →
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMedia(media.id, media.video_url ? 'video' : 'downloadable')}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Language-Specific Media Manager Component
const LanguageMediaManager: React.FC<{
  moduleId: string;
  moduleTitle: string;
  existingMedia: { [languageCode: string]: { video_url?: string; pdf_url?: string } };
  onSave: (moduleId: string, languageCode: string, mediaType: 'video' | 'pdf', url: string) => void;
  onDelete: (moduleId: string, languageCode: string, mediaType: 'video' | 'pdf') => void;
  onClose: () => void;
}> = ({ moduleId, moduleTitle, existingMedia, onSave, onDelete, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const availableLanguages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  useEffect(() => {
    const media = existingMedia[selectedLanguage];
    setVideoUrl(media?.video_url || '');
    setPdfUrl(media?.pdf_url || '');
  }, [selectedLanguage, existingMedia]);

  const handleSaveVideo = () => {
    if (videoUrl.trim()) {
      onSave(moduleId, selectedLanguage, 'video', videoUrl.trim());
      setVideoUrl('');
    }
  };

  const handleSavePdf = () => {
    if (pdfUrl.trim()) {
      onSave(moduleId, selectedLanguage, 'pdf', pdfUrl.trim());
      setPdfUrl('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Language-Specific Media: {moduleTitle}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Management */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Video className="w-5 h-5 text-red-600 mr-2" />
              Video Content ({availableLanguages.find(l => l.code === selectedLanguage)?.flag} {availableLanguages.find(l => l.code === selectedLanguage)?.name})
            </h4>

            {/* Current Video */}
            {existingMedia[selectedLanguage]?.video_url && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Video:</span>
                  <button
                    onClick={() => onDelete(moduleId, selectedLanguage, 'video')}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <a
                  href={existingMedia[selectedLanguage].video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                >
                  {existingMedia[selectedLanguage].video_url}
                </a>
              </div>
            )}

            {/* Add/Update Video */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {existingMedia[selectedLanguage]?.video_url ? 'Update' : 'Add'} Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveVideo}
                disabled={!videoUrl.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                {existingMedia[selectedLanguage]?.video_url ? 'Update' : 'Add'} Video
              </button>
            </div>
          </div>

          {/* PDF Management */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              PDF Content ({availableLanguages.find(l => l.code === selectedLanguage)?.flag} {availableLanguages.find(l => l.code === selectedLanguage)?.name})
            </h4>

            {/* Current PDF */}
            {existingMedia[selectedLanguage]?.pdf_url && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">Current PDF:</span>
                  <button
                    onClick={() => onDelete(moduleId, selectedLanguage, 'pdf')}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <a
                  href={existingMedia[selectedLanguage].pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                >
                  {existingMedia[selectedLanguage].pdf_url}
                </a>
              </div>
            )}

            {/* Add/Update PDF */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {existingMedia[selectedLanguage]?.pdf_url ? 'Update' : 'Add'} PDF URL
              </label>
              <input
                type="url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://example.com/guide-korean.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSavePdf}
                disabled={!pdfUrl.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                {existingMedia[selectedLanguage]?.pdf_url ? 'Update' : 'Add'} PDF
              </button>
            </div>
          </div>
        </div>

        {/* Overview of All Languages */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Media Overview - All Languages</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableLanguages.map(lang => {
              const media = existingMedia[lang.code];
              const hasVideo = !!media?.video_url;
              const hasPdf = !!media?.pdf_url;
              
              return (
                <div key={lang.code} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <span className="text-lg mr-2">{lang.flag}</span>
                    <span className="font-medium text-gray-900">{lang.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Video:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        hasVideo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {hasVideo ? 'Available' : 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">PDF:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        hasPdf ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {hasPdf ? 'Available' : 'Missing'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;