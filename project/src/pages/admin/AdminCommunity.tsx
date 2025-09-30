import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Calendar, Plus, Edit, Trash2, Eye, Pin, TrendingUp, Send } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { supabase, CommunityPost, CommunityReply } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslatedContent } from '../../hooks/useTranslatedContent';
import { useLanguage } from '../../contexts/LanguageContext';

interface PostWithReplies extends CommunityPost {
  replies?: CommunityReply[];
  author?: { full_name: string; email: string };
  translatedTitle?: string;
  translatedContent?: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventType: 'blind_tasting' | 'wineback_wednesday' | 'community_chat';
  maxParticipants?: number;
  currentParticipants: number;
}

const AdminCommunity: React.FC = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<PostWithReplies[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchEvents();
  }, []);

  const fetchPosts = async () => {
    try {
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
        console.log('Supabase not connected - using mock community posts');
        // Mock data with sample posts
        setPosts([
          {
            id: '550e8400-e29b-41d4-a716-446655440020',
            author_id: '1',
            title: 'Welcome to the Matt Decanted Community!',
            content: 'This is where we discuss all things wine, share tasting notes, and learn together. Feel free to ask questions and share your wine experiences!',
            post_type: 'announcement',
            is_pinned: true,
            is_published: true,
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-01-15T10:00:00Z',
            author: { full_name: 'Matt Decanted', email: 'matt@mattdecanted.com' },
            replies: []
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440021',
            author_id: '1',
            title: 'Weekly Blind Tasting - Pinot Noir',
            content: 'Join us this Friday for our weekly blind tasting session. We\'ll be exploring Pinot Noir from different regions. Bring your tasting notes!',
            post_type: 'event',
            is_pinned: false,
            is_published: true,
            created_at: '2025-01-16T10:00:00Z',
            updated_at: '2025-01-16T10:00:00Z',
            author: { full_name: 'Matt Decanted', email: 'matt@mattdecanted.com' },
            replies: []
          }
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles!community_posts_author_id_fkey(full_name, email),
          replies:community_replies(*)
        `)
        .eq('is_published', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to mock data
      setPosts([
        {
          id: '1',
          author_id: '1',
          title: 'Welcome to the Matt Decanted Community!',
          content: 'This is where we discuss all things wine, share tasting notes, and learn together. Feel free to ask questions and share your wine experiences!',
          post_type: 'announcement',
          is_pinned: true,
          is_published: true,
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          author: { full_name: 'Matt Decanted', email: 'matt@mattdecanted.com' },
          replies: []
        }
      ]);
    }
  };

  const fetchEvents = async () => {
    // Mock data for events - you can implement actual database storage later
    setEvents([
      {
        id: '1',
        title: 'Weekly Blind Tasting - Pinot Noir',
        description: 'Join us for a blind tasting session focusing on Pinot Noir from different regions',
        eventDate: '2025-01-20T19:00:00Z',
        eventType: 'blind_tasting',
        maxParticipants: 20,
        currentParticipants: 15
      },
      {
        id: '2',
        title: 'Wineback Wednesday - Holiday Wines',
        description: 'Matt discusses the best wines for holiday celebrations',
        eventDate: '2025-01-22T18:00:00Z',
        eventType: 'wineback_wednesday',
        currentParticipants: 45
      }
    ]);
    setLoading(false);
  };

  const handleSavePost = async (postData: Partial<CommunityPost>) => {
    if (!supabase || !profile || !import.meta.env.VITE_SUPABASE_URL) {
      alert('Supabase not connected');
      return;
    }

    try {
      const dataToSave = {
        ...postData,
        author_id: profile.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('community_posts')
          .update(dataToSave)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_posts')
          .insert([dataToSave]);
        if (error) throw error;
      }
      
      setEditingPost(null);
      setShowPostForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      alert('Supabase not connected');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleTogglePin = async (postId: string, currentPinned: boolean) => {
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      alert('Supabase not connected');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_pinned: !currentPinned })
        .eq('id', postId);
      
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update post');
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
              Community Management
            </h1>
            <p className="text-gray-600">
              Manage community discussions, events, and member engagement
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPostForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Post
            </button>
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Event
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-amber-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">84%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Community Posts
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Events & Sessions
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onEdit={setEditingPost} onDelete={handleDeletePost} onTogglePin={handleTogglePin} />
                ))}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            event.eventType === 'blind_tasting' ? 'bg-amber-100 text-amber-800' :
                            event.eventType === 'wineback_wednesday' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {event.eventType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(event.eventDate).toLocaleString()}</span>
                          <span className="mx-2">•</span>
                          <Users className="w-4 h-4 mr-1" />
                          <span>
                            {event.currentParticipants}
                            {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Post Form Modal */}
        {(showPostForm || editingPost) && (
          <PostForm
            post={editingPost}
            onSave={handleSavePost}
            onCancel={() => {
              setEditingPost(null);
              setShowPostForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Separate PostCard component with translation
const PostCard: React.FC<{
  post: PostWithReplies;
  onEdit: (post: CommunityPost) => void;
  onDelete: (postId: string) => void;
  onTogglePin: (postId: string, currentPinned: boolean) => void;
}> = ({ post, onEdit, onDelete, onTogglePin }) => {
  // Get translated content for the post
  const translatedPost = useTranslatedContent('community_post', post.id, {
    title: post.title,
    content: post.content,
  });

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {post.is_pinned && <Pin className="w-4 h-4 text-amber-600 mr-2" />}
            <h3 className="text-lg font-semibold text-gray-900">{translatedPost.title}</h3>
            <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
              post.post_type === 'announcement' ? 'bg-blue-100 text-blue-800' :
              post.post_type === 'event' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {post.post_type}
            </span>
          </div>
          <p className="text-gray-600 mb-2">{translatedPost.content}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span>By {post.author?.full_name || 'Unknown'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{post.replies?.length || 0} replies</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onTogglePin(post.id, post.is_pinned)}
            className={`p-2 rounded-lg transition-colors ${
              post.is_pinned 
                ? 'text-amber-600 bg-amber-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onEdit(post)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(post.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Post Form Component
const PostForm: React.FC<{
  post: CommunityPost | null;
  onSave: (data: Partial<CommunityPost>) => void;
  onCancel: () => void;
}> = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    post_type: post?.post_type || 'discussion',
    is_pinned: post?.is_pinned || false,
    is_published: post?.is_published || true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {post ? 'Edit Post' : 'Create New Post'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Write your post content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Type
            </label>
            <select
              value={formData.post_type}
              onChange={(e) => setFormData({ ...formData, post_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="discussion">Discussion</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_pinned"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_pinned" className="text-sm font-medium text-gray-700">
                Pin to top
              </label>
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
                Published
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {post ? 'Update' : 'Create'} Post
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

export default AdminCommunity;