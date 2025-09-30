import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslationManager } from '../../hooks/useTranslatedContent';
import { supabase, Course, Module, Quiz, Translation } from '../../lib/supabase';
import { Globe, Edit, Save, X, Plus, Trash2, Search, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface ContentItem {
  id: string;
  type: 'course' | 'module' | 'quiz';
  title: string;
  description?: string;
  question?: string; // for quizzes
}

const AdminTranslations: React.FC = () => {
  const { availableLanguages } = useLanguage();
  const { saveTranslation, deleteTranslation } = useTranslationManager();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [selectedContentType, setSelectedContentType] = useState<'all' | 'course' | 'module' | 'quiz' | 'community_post'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTranslation, setEditingTranslation] = useState<{
    contentId: string;
    contentType: string;
    fieldName: string;
    currentText: string;
  } | null>(null);
  const [newTranslationText, setNewTranslationText] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedLanguage]);

  const loadData = async () => {
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      console.log('Supabase not connected - using mock translation data');
      // Mock data when Supabase not connected
      setContentItems([
        {
          id: '1',
          type: 'course',
          title: 'Wine Fundamentals',
          description: 'Learn the basics of wine tasting, terminology, and appreciation',
        },
        {
          id: 'mod1',
          type: 'module',
          title: 'Introduction to Wine',
          description: 'Basic wine knowledge and terminology',
        },
        {
          id: 'post1',
          type: 'community_post',
          title: 'Welcome to Matt Decanted Community',
          description: 'Join our wine education community for discussions and tastings',
        }
      ]);
      setTranslations([]);
      setLoading(false);
      return;
    }

    try {
      // Load all content items
      const [coursesResult, modulesResult, quizzesResult] = await Promise.all([
        supabase.from('courses').select('id, title, description').eq('is_published', true),
        supabase.from('modules').select('id, title, description').eq('is_published', true),
        supabase.from('quizzes').select('id, question, module_id'),
        supabase.from('community_posts').select('id, title, content').eq('is_published', true)
      ]);

      const items: ContentItem[] = [
        ...(coursesResult.data || []).map(course => ({
          id: course.id,
          type: 'course' as const,
          title: course.title,
          description: course.description,
        })),
        ...(modulesResult.data || []).map(module => ({
          id: module.id,
          type: 'module' as const,
          title: module.title,
          description: module.description,
        })),
        ...(quizzesResult.data || []).map(quiz => ({
          id: quiz.id,
          type: 'quiz' as const,
          title: `Quiz: ${quiz.question.substring(0, 50)}...`,
          question: quiz.question,
        })),
        ...(communityResult.data || []).map((post: any) => ({
          id: post.id,
          type: 'community_post' as const,
          title: post.title,
          description: post.content,
        })),
      ];

      setContentItems(items);

      // Load existing translations for selected language
      const { data: translationsData, error: translationsError } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', selectedLanguage);

      if (translationsError) throw translationsError;
      setTranslations(translationsData || []);
    } catch (error) {
      console.error('Error loading translation data:', error);
      // Fallback to mock data
      setContentItems([
        {
          id: '1',
          type: 'course',
          title: 'Wine Fundamentals',
          description: 'Learn the basics of wine tasting, terminology, and appreciation',
        }
      ]);
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!editingTranslation) return;

    console.log('Saving translation:', {
      contentType: editingTranslation.contentType,
      contentId: editingTranslation.contentId,
      language: selectedLanguage,
      fieldName: editingTranslation.fieldName,
      text: newTranslationText
    });

    const success = await saveTranslation(
      editingTranslation.contentType as any,
      editingTranslation.contentId,
      selectedLanguage,
      editingTranslation.fieldName,
      newTranslationText
    );

    if (success) {
      console.log('Translation saved successfully');
      setEditingTranslation(null);
      setNewTranslationText('');
      loadData(); // Reload to show updated translations
    } else {
      console.error('Translation save failed');
      alert('Failed to save translation');
    }
  };

  const handleDeleteTranslation = async (
    contentType: string,
    contentId: string,
    fieldName: string
  ) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;

    const success = await deleteTranslation(
      contentType as any,
      contentId,
      selectedLanguage,
      fieldName
    );

    if (success) {
      loadData(); // Reload to show updated translations
    } else {
      alert('Failed to delete translation');
    }
  };

  const getTranslation = (contentId: string, fieldName: string): string => {
    const translation = translations.find(
      t => t.content_id === contentId && t.field_name === fieldName
    );
    return translation?.translated_text || '';
  };

  const hasTranslation = (contentId: string, fieldName: string): boolean => {
    return translations.some(
      t => t.content_id === contentId && t.field_name === fieldName
    );
  };

  const filteredContent = contentItems.filter(item => {
    const matchesType = selectedContentType === 'all' || item.type === selectedContentType;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.question?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const selectedLanguageInfo = availableLanguages.find(lang => lang.code === selectedLanguage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Text Translation Management
            </h1>
            <p className="text-gray-600">
              Manage text translations for courses, modules, and quizzes. English is the master language.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">🇺🇸 English = Master Language</p>
                <p className="text-xs text-blue-700">All text automatically translates. Media uploads are optional.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Status Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Translation Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {availableLanguages.filter(lang => lang.code !== 'en').map(lang => {
              const langTranslations = translations.filter(t => t.language_code === lang.code);
              const totalPossibleTranslations = contentItems.length * 2; // title + description for each item
              const completionRate = totalPossibleTranslations > 0 
                ? Math.round((langTranslations.length / totalPossibleTranslations) * 100) 
                : 0;
              
              return (
                <div key={lang.code} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className="text-sm font-medium text-gray-900">{lang.name}</div>
                  <div className="text-xs text-gray-500">{completionRate}% complete</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div 
                      className="bg-blue-600 h-1 rounded-full" 
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Adding translations for: {selectedLanguageInfo?.flag} {selectedLanguageInfo?.name}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language (English is Master)
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Content</option>
                <option value="course">Courses</option>
                <option value="module">Modules</option>
                <option value="quiz">Quizzes</option>
                <option value="community_post">Community Posts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Content
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{contentItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Edit className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Translated</p>
                <p className="text-2xl font-bold text-gray-900">{translations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Filter className="w-8 h-8 text-amber-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contentItems.length > 0 ? Math.round((translations.length / (contentItems.length * 2)) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Languages</p>
                <p className="text-2xl font-bold text-gray-900">{availableLanguages.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Translation Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Content Translations - {selectedLanguageInfo?.flag} {selectedLanguageInfo?.name}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Translated Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Translated Content
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.type === 'course' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'module' ? 'bg-green-100 text-green-800' :
                          item.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {hasTranslation(item.id, 'title') ? (
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            <span className="truncate max-w-xs">
                              {getTranslation(item.id, 'title')}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingTranslation({
                                contentId: item.id,
                                contentType: item.type,
                                fieldName: 'title',
                                currentText: getTranslation(item.id, 'title'),
                              });
                              setNewTranslationText('');
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            + Add Translation
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {(item.description || item.question) && (
                          hasTranslation(item.id, item.type === 'quiz' ? 'question' : item.type === 'community_post' ? 'content' : 'description') ? (
                            <div className="flex items-center">
                              <span className="text-green-600 mr-2">✓</span>
                              <span className="truncate max-w-xs">
                                {getTranslation(item.id, item.type === 'quiz' ? 'question' : item.type === 'community_post' ? 'content' : 'description')}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingTranslation({
                                  contentId: item.id,
                                  contentType: item.type,
                                  fieldName: item.type === 'quiz' ? 'question' : item.type === 'community_post' ? 'content' : 'description',
                                  currentText: getTranslation(item.id, item.type === 'quiz' ? 'question' : item.type === 'community_post' ? 'content' : 'description'),
                                });
                                setNewTranslationText('');
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Add {item.type === 'quiz' ? 'Question' : item.type === 'community_post' ? 'Content' : 'Description'} Translation
                            </button>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingTranslation({
                              contentId: item.id,
                              contentType: item.type,
                              fieldName: 'title',
                              currentText: getTranslation(item.id, 'title'),
                            });
                            setNewTranslationText(getTranslation(item.id, 'title'));
                          }}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {hasTranslation(item.id, 'title') && (
                          <button
                            onClick={() => handleDeleteTranslation(item.type, item.id, 'title')}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No content found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedContentType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No content available for translation'
                }
              </p>
            </div>
          )}
        </div>

        {/* Translation Edit Modal */}
        {editingTranslation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Translation - {selectedLanguageInfo?.flag} {selectedLanguageInfo?.name}
                </h3>
                <button
                  onClick={() => {
                    setEditingTranslation(null);
                    setNewTranslationText('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field: {editingTranslation.fieldName}
                  </label>
                  <div className="text-sm text-gray-600 mb-2">
                    Content Type: {editingTranslation.contentType}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Text (English)
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                    {/* Show original content based on field */}
                    {(() => {
                      const item = contentItems.find(c => c.id === editingTranslation.contentId);
                      if (editingTranslation.fieldName === 'title') return item?.title;
                      if (editingTranslation.fieldName === 'description') return item?.description;
                      if (editingTranslation.fieldName === 'question') return item?.question;
                      if (editingTranslation.fieldName === 'content') return item?.description; // community post content
                      return 'Original text not found';
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation ({selectedLanguageInfo?.name})
                  </label>
                  <textarea
                    value={newTranslationText}
                    onChange={(e) => setNewTranslationText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder={`Enter ${editingTranslation.fieldName} translation in ${selectedLanguageInfo?.name}...`}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveTranslation}
                    disabled={!newTranslationText.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Translation
                  </button>
                  <button
                    onClick={() => {
                      setEditingTranslation(null);
                      setNewTranslationText('');
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTranslations;