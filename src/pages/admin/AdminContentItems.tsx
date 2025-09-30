import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase, safeQuery } from '../../lib/supabaseClient';
import { 
  ContentItem, 
  ContentItemFormData, 
  ContentItemType, 
  SupportedLanguage,
  getLocalizedLabel,
  getLocalizedDescription,
  getContentTypeLabel,
  SUPPORTED_LANGUAGES
} from '../../types/contentItems';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Globe, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AdminContentItems: React.FC = () => {
  const { t, language } = useLanguage();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ContentItemType>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<ContentItemFormData>({
    slug: '',
    type: 'blind_tasting',
    admin_label_en: '',
    admin_label_ko: '',
    admin_label_zh: '',
    admin_label_ja: '',
    admin_label_da: '',
    user_label_en: '',
    user_label_ko: '',
    user_label_zh: '',
    user_label_ja: '',
    user_label_da: '',
    description_en: '',
    description_ko: '',
    description_zh: '',
    description_ja: '',
    description_da: '',
    subscriber_only: false,
    is_active: true,
  });

  useEffect(() => {
    loadContentItems();
  }, []);

  const loadContentItems = async () => {
    const mockData: ContentItem[] = [
      {
        id: '1',
        slug: 'matts-blind-tastings',
        type: 'blind_tasting',
        admin_label_en: 'Matt\'s Blind Tastings (Admin)',
        admin_label_ko: '맷의 블라인드 테이스팅 (관리자)',
        user_label_en: 'Matt\'s Blind Tastings',
        user_label_ko: '맷의 블라인드 테이스팅',
        description_en: 'Weekly blind tasting sessions with Matt',
        description_ko: '맷과 함께하는 주간 블라인드 테이스팅 세션',
        subscriber_only: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        slug: 'short-courses',
        type: 'short_course',
        admin_label_en: 'Short Courses (Admin)',
        user_label_en: 'Short Courses',
        description_en: 'Focused mini-courses covering specific wine topics',
        subscriber_only: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    const data = await safeQuery(
      () => supabase!.from('content_items').select('*').order('created_at', { ascending: false }),
      mockData
    );

    setContentItems(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!supabase) {
      alert('Supabase not connected');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('content_items')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content_items')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadContentItems();
    } catch (error: any) {
      console.error('Error saving content item:', error);
      alert(`Failed to save: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;
    
    if (!supabase) {
      alert('Supabase not connected');
      return;
    }

    try {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadContentItems();
    } catch (error: any) {
      console.error('Error deleting content item:', error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (!supabase) {
      alert('Supabase not connected');
      return;
    }

    try {
      const { error } = await supabase
        .from('content_items')
        .update({ 
          is_active: !currentActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      loadContentItems();
    } catch (error: any) {
      console.error('Error toggling active status:', error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      type: 'blind_tasting',
      admin_label_en: '',
      admin_label_ko: '',
      admin_label_zh: '',
      admin_label_ja: '',
      admin_label_da: '',
      user_label_en: '',
      user_label_ko: '',
      user_label_zh: '',
      user_label_ja: '',
      user_label_da: '',
      description_en: '',
      description_ko: '',
      description_zh: '',
      description_ja: '',
      description_da: '',
      subscriber_only: false,
      is_active: true,
    });
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      slug: item.slug,
      type: item.type,
      admin_label_en: item.admin_label_en,
      admin_label_ko: item.admin_label_ko || '',
      admin_label_zh: item.admin_label_zh || '',
      admin_label_ja: item.admin_label_ja || '',
      admin_label_da: item.admin_label_da || '',
      user_label_en: item.user_label_en,
      user_label_ko: item.user_label_ko || '',
      user_label_zh: item.user_label_zh || '',
      user_label_ja: item.user_label_ja || '',
      user_label_da: item.user_label_da || '',
      description_en: item.description_en || '',
      description_ko: item.description_ko || '',
      description_zh: item.description_zh || '',
      description_ja: item.description_ja || '',
      description_da: item.description_da || '',
      subscriber_only: item.subscriber_only,
      is_active: item.is_active,
    });
    setShowForm(true);
  };

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getLocalizedLabel(item, language as SupportedLanguage, true).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

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
              {t('admin.contentItems.title', 'Content Items Management')}
            </h1>
            <p className="text-gray-600">
              {t('admin.contentItems.subtitle', 'Manage multilingual content items for blind tastings and short courses')}
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.contentItems.addNew', 'Add New Content')}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('admin.contentItems.searchPlaceholder', 'Search content items...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('admin.contentItems.allTypes', 'All Types')}</option>
                <option value="blind_tasting">{t('admin.contentItems.blindTastings', 'Blind Tastings')}</option>
                <option value="short_course">{t('admin.contentItems.shortCourses', 'Short Courses')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">{t('admin.contentItems.totalItems', 'Total Items')}</p>
                <p className="text-2xl font-bold text-gray-900">{contentItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">{t('admin.contentItems.activeItems', 'Active Items')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contentItems.filter(item => item.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Lock className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">{t('admin.contentItems.subscriberOnly', 'Subscriber Only')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contentItems.filter(item => item.subscriber_only).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-amber-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">{t('admin.contentItems.languages', 'Languages')}</p>
                <p className="text-2xl font-bold text-gray-900">{SUPPORTED_LANGUAGES.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Items Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.contentItems.content', 'Content')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.contentItems.type', 'Type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.contentItems.adminLabel', 'Admin Label')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.contentItems.userLabel', 'User Label')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.contentItems.access', 'Access')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.contentItems.status', 'Status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.slug}</div>
                        <div className="text-sm text-gray-500">
                          {getLocalizedDescription(item, language as SupportedLanguage)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.type === 'blind_tasting' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getContentTypeLabel(item.type, language as SupportedLanguage)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getLocalizedLabel(item, language as SupportedLanguage, true)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getLocalizedLabel(item, language as SupportedLanguage, false)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.subscriber_only ? (
                          <>
                            <Lock className="w-4 h-4 text-purple-600 mr-1" />
                            <span className="text-sm text-purple-600">{t('admin.contentItems.subscribersOnly', 'Subscribers Only')}</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-sm text-green-600">{t('admin.contentItems.publicAccess', 'Public Access')}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.is_active ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-sm text-green-600">{t('admin.contentItems.active', 'Active')}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600 mr-1" />
                            <span className="text-sm text-red-600">{t('admin.contentItems.inactive', 'Inactive')}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleActive(item.id, item.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.is_active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={item.is_active ? t('admin.contentItems.deactivate', 'Deactivate') : t('admin.contentItems.activate', 'Activate')}
                        >
                          {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title={t('common.edit', 'Edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title={t('common.delete', 'Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('admin.contentItems.noItems', 'No content items found')}
              </h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== 'all' 
                  ? t('admin.contentItems.adjustFilters', 'Try adjusting your search or filters')
                  : t('admin.contentItems.createFirst', 'Create your first content item to get started')
                }
              </p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <ContentItemForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
              resetForm();
            }}
            isEditing={!!editingItem}
          />
        )}
      </div>
    </div>
  );
};

// Content Item Form Component
const ContentItemForm: React.FC<{
  formData: ContentItemFormData;
  setFormData: (data: ContentItemFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ formData, setFormData, onSave, onCancel, isEditing }) => {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  const updateField = (field: keyof ContentItemFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing 
                ? t('admin.contentItems.editContent', 'Edit Content Item')
                : t('admin.contentItems.createContent', 'Create Content Item')
              }
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.contentItems.slug', 'Slug')} *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., matts-blind-tastings"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.contentItems.type', 'Type')} *
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="blind_tasting">{t('admin.contentItems.blindTasting', 'Blind Tasting')}</option>
                <option value="short_course">{t('admin.contentItems.shortCourse', 'Short Course')}</option>
              </select>
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="subscriber_only"
                checked={formData.subscriber_only}
                onChange={(e) => updateField('subscriber_only', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="subscriber_only" className="text-sm font-medium text-gray-700">
                {t('admin.contentItems.subscriberOnlyLabel', 'Subscriber Only')}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                {t('admin.contentItems.activeLabel', 'Active')}
              </label>
            </div>
          </div>

          {/* Language Sections */}
          {SUPPORTED_LANGUAGES.map((lang) => (
            <div key={lang.code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">{lang.flag}</span>
                <h4 className="text-lg font-semibold text-gray-900">{lang.name}</h4>
                {lang.code !== 'en' && (
                  <span className="ml-2 text-xs text-gray-500">
                    {t('admin.contentItems.fallbackNote', 'Leave blank to fallback to English on frontend')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.contentItems.adminLabel', 'Admin Label')} {lang.code === 'en' && '*'}
                  </label>
                  <input
                    type="text"
                    required={lang.code === 'en'}
                    value={formData[`admin_label_${lang.code}` as keyof ContentItemFormData] as string}
                    onChange={(e) => updateField(`admin_label_${lang.code}` as keyof ContentItemFormData, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Admin label in ${lang.name}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.contentItems.userLabel', 'User Label')} {lang.code === 'en' && '*'}
                  </label>
                  <input
                    type="text"
                    required={lang.code === 'en'}
                    value={formData[`user_label_${lang.code}` as keyof ContentItemFormData] as string}
                    onChange={(e) => updateField(`user_label_${lang.code}` as keyof ContentItemFormData, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`User label in ${lang.name}`}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.contentItems.description', 'Description')}
                </label>
                <textarea
                  value={formData[`description_${lang.code}` as keyof ContentItemFormData] as string}
                  onChange={(e) => updateField(`description_${lang.code}` as keyof ContentItemFormData, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder={`Description in ${lang.name}`}
                />
              </div>
            </div>
          ))}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? t('common.update', 'Update') : t('common.create', 'Create')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminContentItems;