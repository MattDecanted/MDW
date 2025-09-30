import React, { useState, useEffect } from 'react';
import { supabase, safeQuery } from '../../lib/supabaseClient';
import { 
  Brain, 
  Calendar, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Filter,
  RefreshCw,
  Download,
  Trophy,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface SwirdleWord {
  id: string;
  word: string;
  definition: string;
  category: 'grape_variety' | 'wine_region' | 'tasting_term' | 'production' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  date_scheduled: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Analytics data
  total_attempts?: number;
  total_wins?: number;
  win_rate?: number;
  avg_attempts?: number;
}

interface LeaderboardEntry {
  id: string;
  user_name: string;
  avatar?: string;
  current_streak: number;
  max_streak: number;
  games_played: number;
  games_won: number;
  win_rate: number;
  avg_attempts: number;
  last_played: string;
}

interface NotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

interface DateRange {
  start: Date;
  end: Date;
}

const AdminSwirdle: React.FC = () => {
  const [words, setWords] = useState<SwirdleWord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)    // 30 days from now
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<'date_scheduled' | 'total_attempts' | 'win_rate'>('date_scheduled');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, categoryFilter, difficultyFilter, publishedFilter, dateRange, sortField, sortDirection]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const loadData = async () => {
    setLoading(true);
    
    // Mock leaderboard data
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        user_name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
        current_streak: 15,
        max_streak: 23,
        games_played: 45,
        games_won: 38,
        win_rate: 84.4,
        avg_attempts: 3.2,
        last_played: '2025-01-20T10:30:00Z'
      },
      {
        id: '2',
        user_name: 'James Rodriguez',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
        current_streak: 12,
        max_streak: 18,
        games_played: 38,
        games_won: 29,
        win_rate: 76.3,
        avg_attempts: 3.8,
        last_played: '2025-01-20T09:15:00Z'
      },
      {
        id: '3',
        user_name: 'Emma Thompson',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
        current_streak: 8,
        max_streak: 15,
        games_played: 32,
        games_won: 22,
        win_rate: 68.8,
        avg_attempts: 4.1,
        last_played: '2025-01-19T20:45:00Z'
      },
      {
        id: '4',
        user_name: 'Michael Park',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
        current_streak: 6,
        max_streak: 12,
        games_played: 28,
        games_won: 18,
        win_rate: 64.3,
        avg_attempts: 4.5,
        last_played: '2025-01-19T18:20:00Z'
      },
      {
        id: '5',
        user_name: 'Lisa Wang',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
        current_streak: 4,
        max_streak: 9,
        games_played: 25,
        games_won: 14,
        win_rate: 56.0,
        avg_attempts: 4.8,
        last_played: '2025-01-19T16:10:00Z'
      }
    ];

    // Mock words data with analytics
    const mockWords: SwirdleWord[] = [
      {
        id: '1',
        word: 'TERROIR',
        definition: 'The complete natural environment in which a wine is produced',
        category: 'tasting_term',
        difficulty: 'intermediate',
        date_scheduled: '2025-01-15',
        is_published: true,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
        total_attempts: 234,
        total_wins: 187,
        win_rate: 79.9,
        avg_attempts: 3.4
      },
      {
        id: '2',
        word: 'TANNINS',
        definition: 'Compounds that provide structure and astringency to wine',
        category: 'tasting_term',
        difficulty: 'beginner',
        date_scheduled: '2025-01-16',
        is_published: true,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-16T10:00:00Z',
        total_attempts: 198,
        total_wins: 176,
        win_rate: 88.9,
        avg_attempts: 2.8
      },
      {
        id: '3',
        word: 'MERLOT',
        definition: 'A red wine grape variety known for its soft, velvety texture',
        category: 'grape_variety',
        difficulty: 'beginner',
        date_scheduled: '2025-01-17',
        is_published: true,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-17T10:00:00Z',
        total_attempts: 156,
        total_wins: 142,
        win_rate: 91.0,
        avg_attempts: 2.3
      },
      {
        id: '4',
        word: 'BURGUNDY',
        definition: 'Famous French wine region known for Pinot Noir and Chardonnay',
        category: 'wine_region',
        difficulty: 'intermediate',
        date_scheduled: '2025-01-18',
        is_published: true,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-18T10:00:00Z',
        total_attempts: 189,
        total_wins: 134,
        win_rate: 70.9,
        avg_attempts: 4.1
      },
      {
        id: '5',
        word: 'MALOLACTIC',
        definition: 'Secondary fermentation that converts malic acid to lactic acid',
        category: 'production',
        difficulty: 'advanced',
        date_scheduled: '2025-01-19',
        is_published: true,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-19T10:00:00Z',
        total_attempts: 167,
        total_wins: 89,
        win_rate: 53.3,
        avg_attempts: 5.2
      },
      // Future words
      {
        id: '6',
        word: 'CHARDONNAY',
        definition: 'A white wine grape variety that can produce both oaked and unoaked styles',
        category: 'grape_variety',
        difficulty: 'beginner',
        date_scheduled: '2025-01-21',
        is_published: false,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-10T10:00:00Z',
        total_attempts: 0,
        total_wins: 0,
        win_rate: 0,
        avg_attempts: 0
      },
      {
        id: '7',
        word: 'BORDEAUX',
        definition: 'Famous French wine region known for Cabernet Sauvignon and Merlot blends',
        category: 'wine_region',
        difficulty: 'intermediate',
        date_scheduled: '2025-01-22',
        is_published: false,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-10T10:00:00Z',
        total_attempts: 0,
        total_wins: 0,
        win_rate: 0,
        avg_attempts: 0
      },
      {
        id: '8',
        word: 'DECANTING',
        definition: 'The process of pouring wine from bottle to another container to separate sediment',
        category: 'general',
        difficulty: 'intermediate',
        date_scheduled: '2025-01-23',
        is_published: false,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-10T10:00:00Z',
        total_attempts: 0,
        total_wins: 0,
        win_rate: 0,
        avg_attempts: 0
      }
    ];

    try {
      // Load leaderboard
      const leaderboardData = await safeQuery(
        () => supabase!.from('user_swirdle_stats')
          .select(`
            *,
            profiles!user_swirdle_stats_user_id_fkey(full_name)
          `)
          .order('current_streak', { ascending: false })
          .limit(10),
        mockLeaderboard
      );
      setLeaderboard(leaderboardData);

      // Build words query with analytics
      let query = supabase?.from('swirdle_words').select(`
        *,
        attempts:swirdle_attempts(count),
        wins:swirdle_attempts(count).eq(completed, true)
      `, { count: 'exact' });
      
      if (!query) {
        setWords(mockWords);
        setTotalPages(Math.ceil(mockWords.length / itemsPerPage));
        setLoading(false);
        return;
      }

      // Apply date range filter
      query = query
        .gte('date_scheduled', dateRange.start.toISOString().split('T')[0])
        .lte('date_scheduled', dateRange.end.toISOString().split('T')[0]);

      // Apply other filters
      if (searchTerm) {
        query = query.or(`word.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%`);
      }
      
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      
      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty', difficultyFilter);
      }
      
      if (publishedFilter !== 'all') {
        query = query.eq('is_published', publishedFilter === 'published');
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Add pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const result = await safeQuery(
        () => query!,
        { data: mockWords, count: mockWords.length, error: null }
      );

      if (result.data) {
        // Process analytics data
        const wordsWithAnalytics = result.data.map((word: any) => ({
          ...word,
          total_attempts: word.attempts?.[0]?.count || 0,
          total_wins: word.wins?.[0]?.count || 0,
          win_rate: word.attempts?.[0]?.count > 0 
            ? ((word.wins?.[0]?.count || 0) / word.attempts[0].count) * 100 
            : 0,
          avg_attempts: word.total_attempts > 0 ? word.total_attempts / (word.total_wins || 1) : 0
        }));

        setWords(wordsWithAnalytics);
        const totalCount = result.count || mockWords.length;
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
      }
    } catch (error) {
      console.error('Error loading Swirdle data:', error);
      showNotification('error', 'Failed to load Swirdle data');
      setWords(mockWords);
      setLeaderboard(mockLeaderboard);
      setTotalPages(Math.ceil(mockWords.length / itemsPerPage));
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (wordId: string, currentStatus: boolean) => {
    if (!supabase) {
      showNotification('error', 'Supabase not connected');
      return;
    }

    setUpdating(wordId);
    
    try {
      const { error } = await supabase
        .from('swirdle_words')
        .update({ 
          is_published: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', wordId);

      if (error) throw error;

      // Update local state
      setWords(prev => prev.map(word => 
        word.id === wordId 
          ? { ...word, is_published: !currentStatus }
          : word
      ));

      showNotification('success', `Word ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (error: any) {
      console.error('Error updating word:', error);
      showNotification('error', `Failed to update word: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const exportData = () => {
    const csvHeaders = [
      'Word',
      'Definition', 
      'Category',
      'Difficulty',
      'Scheduled Date',
      'Published',
      'Total Attempts',
      'Total Wins',
      'Win Rate (%)',
      'Avg Attempts'
    ];

    const csvData = words.map(word => [
      word.word,
      `"${word.definition}"`,
      word.category,
      word.difficulty,
      word.date_scheduled,
      word.is_published ? 'Yes' : 'No',
      word.total_attempts || 0,
      word.total_wins || 0,
      word.win_rate?.toFixed(1) || '0.0',
      word.avg_attempts?.toFixed(1) || '0.0'
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swirdle-words-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification('success', 'Data exported successfully');
  };

  const exportLeaderboard = () => {
    const csvHeaders = [
      'Player Name',
      'Current Streak',
      'Max Streak', 
      'Games Played',
      'Games Won',
      'Win Rate (%)',
      'Avg Attempts',
      'Last Played'
    ];

    const csvData = leaderboard.map(player => [
      player.user_name,
      player.current_streak,
      player.max_streak,
      player.games_played,
      player.games_won,
      player.win_rate.toFixed(1),
      player.avg_attempts.toFixed(1),
      new Date(player.last_played).toLocaleDateString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swirdle-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification('success', 'Leaderboard exported successfully');
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
  };

  const handleSort = (field: 'date_scheduled' | 'total_attempts' | 'win_rate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1 inline" /> : 
      <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const adjustDateRange = (direction: 'past' | 'future') => {
    const days = 30;
    const msPerDay = 24 * 60 * 60 * 1000;
    
    if (direction === 'past') {
      setDateRange({
        start: new Date(dateRange.start.getTime() - days * msPerDay),
        end: new Date(dateRange.end.getTime() - days * msPerDay)
      });
    } else {
      setDateRange({
        start: new Date(dateRange.start.getTime() + days * msPerDay),
        end: new Date(dateRange.end.getTime() + days * msPerDay)
      });
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setPublishedFilter('all');
    setCurrentPage(1);
    setSortField('date_scheduled');
    setSortDirection('asc');
    setDateRange({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grape_variety': return 'bg-purple-100 text-purple-800';
      case 'wine_region': return 'bg-blue-100 text-blue-800';
      case 'tasting_term': return 'bg-amber-100 text-amber-800';
      case 'production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-amber-100 text-amber-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 80) return 'text-green-600';
    if (winRate >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredWordsCount = words.length;
  const publishedCount = words.filter(w => w.is_published).length;
  const unpublishedCount = words.filter(w => !w.is_published).length;
  const totalAttempts = words.reduce((sum, w) => sum + (w.total_attempts || 0), 0);
  const totalWins = words.reduce((sum, w) => sum + (w.total_wins || 0), 0);
  const overallWinRate = totalAttempts > 0 ? (totalWins / totalAttempts) * 100 : 0;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Swirdle Management Dashboard
            </h1>
            <p className="text-gray-600">
              Manage daily wine word puzzles, view analytics, and track player engagement
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportLeaderboard}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Export Leaderboard
            </button>
            <button
              onClick={exportData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Words
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Trophy className="w-6 h-6 text-amber-600 mr-2" />
              Top Players Leaderboard
            </h2>
            <button
              onClick={exportLeaderboard}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {leaderboard.slice(0, 5).map((player, index) => (
              <div key={player.id} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold ${
                  index === 0 ? 'bg-amber-100 text-amber-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <img
                  src={player.avatar || '/Matt_decantednk.png'}
                  alt={player.user_name}
                  className="w-12 h-12 rounded-full mx-auto mb-2"
                />
                <div className="text-sm font-medium text-gray-900 mb-1">{player.user_name}</div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>🔥 {player.current_streak} streak</div>
                  <div>🎯 {player.win_rate.toFixed(1)}% wins</div>
                  <div>🎮 {player.games_played} games</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Words</p>
                <p className="text-2xl font-bold text-gray-900">{filteredWordsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttempts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-amber-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Wins</p>
                <p className="text-2xl font-bold text-gray-900">{totalWins.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Win Rate</p>
                <p className={`text-2xl font-bold ${getWinRateColor(overallWinRate)}`}>
                  {overallWinRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Date Range</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => adjustDateRange('past')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Past 30 Days
              </button>
              <button
                onClick={() => adjustDateRange('future')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                Future 30 Days
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>From: {dateRange.start.toLocaleDateString()}</span>
            </div>
            <span>→</span>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>To: {dateRange.end.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search words or definitions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="grape_variety">Grape Variety</option>
                <option value="wine_region">Wine Region</option>
                <option value="tasting_term">Tasting Term</option>
                <option value="production">Production</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <select
                value={publishedFilter}
                onChange={(e) => {
                  setPublishedFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>

            <div>
              <button
                onClick={resetFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Words Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('date_scheduled')}
                      >
                        <div className="flex items-center">
                          Scheduled Date
                          {getSortIcon('date_scheduled')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Word & Definition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category & Difficulty
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('total_attempts')}
                      >
                        <div className="flex items-center">
                          Attempts
                          {getSortIcon('total_attempts')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('win_rate')}
                      >
                        <div className="flex items-center">
                          Win Rate
                          {getSortIcon('win_rate')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {words.map((word) => {
                      const isToday = word.date_scheduled === new Date().toISOString().split('T')[0];
                      const isPast = new Date(word.date_scheduled) < new Date();
                      const isFuture = new Date(word.date_scheduled) > new Date();
                      
                      return (
                        <tr key={word.id} className={`hover:bg-gray-50 ${
                          isToday ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(word.date_scheduled).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {isToday ? '🔥 Today' : 
                                   isPast ? '📅 Past' : 
                                   '⏳ Future'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                                {word.word}
                              </div>
                              <div className="text-sm text-gray-600 max-w-xs">
                                {word.definition}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(word.category)}`}>
                                {word.category.replace('_', ' ')}
                              </span>
                              <br />
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(word.difficulty)}`}>
                                {word.difficulty}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {word.total_attempts || 0} attempts
                              </div>
                              <div className="text-green-600">
                                {word.total_wins || 0} wins
                              </div>
                              {word.avg_attempts && word.avg_attempts > 0 && (
                                <div className="text-xs text-gray-500">
                                  Avg: {word.avg_attempts.toFixed(1)} tries
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-center">
                              {word.total_attempts && word.total_attempts > 0 ? (
                                <div className={`text-lg font-bold ${getWinRateColor(word.win_rate || 0)}`}>
                                  {(word.win_rate || 0).toFixed(1)}%
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No data</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => togglePublished(word.id, word.is_published)}
                              disabled={updating === word.id}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                                word.is_published ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  word.is_published ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                              {updating === word.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                      <div className="text-xs text-gray-500">
                        {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={loading}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && words.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Swirdle words found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all' || publishedFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No words scheduled for this date range'
                }
              </p>
              {(searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all' || publishedFilter !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            Performance Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Difficulty Performance</h4>
              <div className="space-y-2">
                {['beginner', 'intermediate', 'advanced'].map(difficulty => {
                  const difficultyWords = words.filter(w => w.difficulty === difficulty && w.total_attempts);
                  const avgWinRate = difficultyWords.length > 0 
                    ? difficultyWords.reduce((sum, w) => sum + (w.win_rate || 0), 0) / difficultyWords.length 
                    : 0;
                  
                  return (
                    <div key={difficulty} className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{difficultyWords.length} words</span>
                        <span className={`text-sm font-medium ${getWinRateColor(avgWinRate)}`}>
                          {avgWinRate.toFixed(1)}% avg win rate
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Category Performance</h4>
              <div className="space-y-2">
                {['grape_variety', 'wine_region', 'tasting_term', 'production', 'general'].map(category => {
                  const categoryWords = words.filter(w => w.category === category && w.total_attempts);
                  const avgWinRate = categoryWords.length > 0 
                    ? categoryWords.reduce((sum, w) => sum + (w.win_rate || 0), 0) / categoryWords.length 
                    : 0;
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(category)}`}>
                        {category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{categoryWords.length} words</span>
                        <span className={`text-sm font-medium ${getWinRateColor(avgWinRate)}`}>
                          {avgWinRate.toFixed(1)}% avg win rate
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSwirdle;