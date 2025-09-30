import React, { useState, useEffect } from 'react';
import { Video, FileText, Upload, Download, Edit, Trash2, Search, Filter, Play, File } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'document';
  url: string;
  thumbnailUrl?: string;
  fileSize: string;
  uploadedAt: string;
  usedInModules: string[];
}

const AdminMedia: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    setTimeout(() => {
      setMediaItems([
        {
          id: '1',
          title: 'Introduction to Wine Tasting',
          description: 'Basic wine tasting techniques and terminology',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=example1',
          thumbnailUrl: 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg',
          fileSize: '45.2 MB',
          uploadedAt: '2025-01-15T10:00:00Z',
          usedInModules: ['Wine Basics 101', 'Tasting Fundamentals']
        },
        {
          id: '2',
          title: 'Wine Pairing Guide PDF',
          description: 'Comprehensive guide to food and wine pairings',
          type: 'pdf',
          url: 'https://example.com/wine-pairing-guide.pdf',
          fileSize: '2.1 MB',
          uploadedAt: '2025-01-14T15:30:00Z',
          usedInModules: ['Pairing Essentials']
        },
        {
          id: '3',
          title: 'Burgundy Region Deep Dive',
          description: 'Detailed exploration of Burgundy wine regions',
          type: 'video',
          url: 'https://vimeo.com/example2',
          thumbnailUrl: 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg',
          fileSize: '78.5 MB',
          uploadedAt: '2025-01-13T12:00:00Z',
          usedInModules: ['French Wine Regions']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-red-600" />;
      case 'pdf': return <FileText className="w-5 h-5 text-blue-600" />;
      default: return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'pdf': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              Media Library
            </h1>
            <p className="text-gray-600">
              Manage videos, PDFs, and downloadable content for your courses
            </p>
          </div>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Media
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="pdf">PDFs</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Videos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediaItems.filter(item => item.type === 'video').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">PDFs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediaItems.filter(item => item.type === 'pdf').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <File className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{mediaItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {item.type === 'video' && item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getTypeIcon(item.type)}
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white bg-black bg-opacity-50 rounded-full p-3" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(item.type)}`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{item.fileSize}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                <div className="text-xs text-gray-500 mb-3">
                  <p>Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}</p>
                  {item.usedInModules.length > 0 && (
                    <p>Used in: {item.usedInModules.join(', ')}</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    View/Download
                  </a>
                  <div className="flex space-x-2">
                    <button className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No media files found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload your first video or document to get started'
              }
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Upload Media
            </button>
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Media
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter media title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="video">Video (YouTube/Vimeo)</option>
                    <option value="pdf">PDF Document</option>
                    <option value="document">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter YouTube/Vimeo URL or file URL"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMedia;