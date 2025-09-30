import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { safeQuery, supabase, CommunityPost, CommunityReply } from '../lib/supabase';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Pin, 
  Lock, 
  Crown, 
  Star, 
  Plus,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  Reply
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

interface PostWithDetails extends CommunityPost {
  author?: { full_name: string; role: string };
  replies_count?: number;
  latest_reply?: string;
  is_trending?: boolean;
}

const Community: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'discussion' | 'announcement' | 'event'>('all');

  useEffect(() => {
    loadCommunityData();
  }, [user]);

  const loadCommunityData = async () => {
    // Mock community data with membership tier gating
    const mockPosts: PostWithDetails[] = [
      {
        id: '1',
        author_id: 'matt',
        title: t('community.posts.welcome.title'),
        content: t('community.posts.welcome.content'),
        post_type: 'announcement',
        is_pinned: true,
        is_published: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
        author: { full_name: 'Matt Decanted', role: 'admin' },
        replies_count: 23,
        latest_reply: '2 hours ago',
        is_trending: true
      },
      {
        id: '2',
        author_id: 'user1',
        title: t('community.posts.whatTasting.title'),
        content: t('community.posts.whatTasting.content'),
        post_type: 'discussion',
        is_pinned: false,
        is_published: true,
        created_at: '2025-01-16T14:30:00Z',
        updated_at: '2025-01-16T14:30:00Z',
        author: { full_name: 'Sarah Wine Lover', role: 'basic' },
        replies_count: 15,
        latest_reply: '1 hour ago',
        is_trending: true
      },
      {
        id: '3',
        author_id: 'matt',
        title: t('community.posts.blindTasting.title'),
        content: t('community.posts.blindTasting.content'),
        post_type: 'event',
        is_pinned: false,
        is_published: true,
        created_at: '2025-01-17T09:00:00Z',
        updated_at: '2025-01-17T09:00:00Z',
        author: { full_name: 'Matt Decanted', role: 'admin' },
        replies_count: 8,
        latest_reply: '3 hours ago',
        is_trending: false
      },
      {
        id: '4',
        author_id: 'user2',
        title: t('community.posts.askMatt.title'),
        content: t('community.posts.askMatt.content'),
        post_type: 'discussion',
        is_pinned: false,
        is_published: true,
        created_at: '2025-01-17T16:20:00Z',
        updated_at: '2025-01-17T16:20:00Z',
        author: { full_name: 'Wine Newbie', role: 'free' },
        replies_count: 12,
        latest_reply: '30 minutes ago',
        is_trending: false
      },
      {
        id: '5',
        author_id: 'matt',
        title: t('community.posts.premiumMasterclass.title'),
        content: t('community.posts.premiumMasterclass.content'),
        post_type: 'announcement',
        is_pinned: false,
        is_published: true,
        created_at: '2025-01-18T11:00:00Z',
        updated_at: '2025-01-18T11:00:00Z',
        author: { full_name: 'Matt Decanted', role: 'admin' },
        replies_count: 5,
        latest_reply: '1 day ago',
        is_trending: false
      }
    ];

    // Load posts with safe query
    const postsData = await safeQuery(
      () => supabase!.from('community_posts')
        .select(`
          *,
          author:profiles!community_posts_author_id_fkey(full_name, role),
          replies:community_replies(count)
        `)
        .eq('is_published', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false }),
      mockPosts
    );

    setPosts(postsData);
    setLoading(false);
  };

  const canAccessPost = (post: PostWithDetails): boolean => {
    if (!user || !profile) return post.post_type !== 'event'; // Free users can see discussions and announcements
    
    // Check if post requires premium access
    const isPremiumContent = post.title.toLowerCase().includes('premium') || 
                            post.content.toLowerCase().includes('full members') ||
                            post.content.toLowerCase().includes('basic and full members');
    
    if (!isPremiumContent) return true;
    
    // Premium content access based on membership tier
    if (profile.role === 'admin') return true;
    if (profile.membership_tier === 'full') return true;
    if (profile.membership_tier === 'basic' && !post.content.toLowerCase().includes('full members only')) return true;
    
    return false;
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Pin className="w-4 h-4 text-blue-600" />;
      case 'event': return <Calendar className="w-4 h-4 text-purple-600" />;
      default: return <MessageSquare className="w-4 h-4 text-green-600" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    return post.post_type === activeFilter;
  });

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
            {t('community.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('community.signInMessage')}
          </p>
          <Link
            to="/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {t('auth.signIn')} {t('common.signInToJoin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('community.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('community.subtitle')}
          </p>
          <div className="mt-4">
            <span className="text-sm text-gray-500">{t('community.yourTier')}: </span>
            <span className={`px-3 py-1 text-sm rounded-full ${
              profile?.membership_tier === 'full' ? 'bg-purple-100 text-purple-800' :
              profile?.membership_tier === 'basic' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {profile?.membership_tier === 'full' && <Crown className="w-4 h-4 mr-1 inline" />}
              {profile?.membership_tier === 'basic' && <Star className="w-4 h-4 mr-1 inline" />}
              {(profile?.membership_tier || 'free').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">127</div>
            <div className="text-sm text-gray-600">{t('community.activeMembers')}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-sm text-gray-600">{t('community.discussions')}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-600">{t('community.upcomingEvents')}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">89%</div>
            <div className="text-sm text-gray-600">{t('community.engagement')}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: t('community.allPosts') },
                { key: 'discussion', label: t('community.discussions') },
                { key: 'announcement', label: t('community.announcements') },
                { key: 'event', label: t('community.events') }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeFilter === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => {
            const hasAccess = canAccessPost(post);
            
            return (
              <div
                key={post.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  !hasAccess ? 'opacity-75' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {post.is_pinned && <Pin className="w-4 h-4 text-amber-600 mr-2" />}
                        {post.is_trending && <TrendingUp className="w-4 h-4 text-red-600 mr-2" />}
                        <h2 className={`text-xl font-semibold ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}>
                          {post.title}
                        </h2>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getPostTypeBadge(post.post_type)}`}>
                          {getPostTypeIcon(post.post_type)}
                          <span className="ml-1">{post.post_type}</span>
                        </span>
                        {!hasAccess && <Lock className="w-4 h-4 text-gray-400 ml-2" />}
                      </div>
                      
                      <p className={`mb-4 ${hasAccess ? 'text-gray-600' : 'text-gray-400'}`}>
                        {hasAccess 
                          ? post.content
                          : t('community.availableBasicFull')
                        }
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <img 
                            src="/Matt_decantednk.png" 
                            alt={post.author?.full_name} 
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span>{post.author?.full_name}</span>
                          {post.author?.role === 'admin' && <Crown className="w-3 h-3 text-purple-600 ml-1" />}
                          {post.author?.role === 'full' && <Star className="w-3 h-3 text-amber-600 ml-1" />}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Reply className="w-4 h-4 mr-1" />
                          <span>{post.replies_count} {t('community.replies')}</span>
                        </div>
                        {post.latest_reply && (
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{t('community.lastReply')} {post.latest_reply}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {hasAccess ? (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          {t('community.joinDiscussion')}
                        </button>
                      ) : (
                        <Link
                          to="/subscribe"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {t('community.upgrade')}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA for Free Users */}
        {profile?.membership_tier === 'free' && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('community.unlockMore')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('community.upgradeMessage')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/subscribe"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Star className="w-5 h-5 mr-2" />
                {t('community.startTrial')} - $4.99/month
              </Link>
              <Link
                to="/subscribe"
                className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Crown className="w-5 h-5 mr-2" />
                {t('community.getFullAccess')} - $59 one-time
              </Link>
            </div>
          </div>
        )}

        {/* Community Guidelines */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('community.guidelines')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('community.guideline1')}
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('community.guideline2')}
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('community.guideline3')}
              </li>
            </ul>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('community.guideline4')}
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('community.guideline5')}
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {t('community.guideline6')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;