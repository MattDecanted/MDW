import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, safeQuery } from '../lib/supabaseClient';
import { Wine, Trophy, Target, Share2, Brain, Calendar, TrendingUp, Award, Lightbulb } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

interface SwirdleWord {
  id: string;
  word: string;
  definition: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'grape_variety' | 'wine_region' | 'tasting_term' | 'production' | 'general';
  hints: string[];
  date_scheduled: string;
  is_published: boolean;
}

interface SwirdleAttempt {
  id: string;
  user_id: string;
  word_id: string;
  guesses: string[];
  attempts: number;
  completed: boolean;
  hints_used: number[];
  completed_at?: string;
}

interface UserStats {
  current_streak: number;
  max_streak: number;
  games_played: number;
  games_won: number;
  average_attempts: number;
}

const Swirdle: React.FC = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [todaysWord, setTodaysWord] = useState<SwirdleWord | null>(null);
  const [userAttempt, setUserAttempt] = useState<SwirdleAttempt | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>(['']);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const maxGuesses = 6;

  useEffect(() => {
    if (user) {
      loadTodaysGame();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadTodaysGame = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Mock data when Supabase not connected
    const mockWord: SwirdleWord = {
      id: '1',
      word: 'TERROIR',
      definition: 'The complete natural environment in which a wine is produced',
      difficulty: 'intermediate',
      category: 'tasting_term',
      hints: [
        'This French concept relates to wine character',
        'It includes soil, climate, and topography',
        'Essential for understanding wine regions'
      ],
      date_scheduled: today,
      is_published: true,
    };

    const mockStats: UserStats = {
      current_streak: 7,
      max_streak: 15,
      games_played: 23,
      games_won: 18,
      average_attempts: 4.2,
    };

    try {
      // Load today's word
      const wordData = await safeQuery(
        () => supabase!.from('swirdle_words')
          .select('*')
          .eq('date_scheduled', today)
          .eq('is_published', true)
          .single(),
        mockWord
      );
      setTodaysWord(wordData);

      // Load user's attempt for today
      const attemptData = await safeQuery(
        () => supabase!.from('swirdle_attempts')
          .select('*')
          .eq('user_id', user.id)
          .eq('word_id', wordData.id)
          .maybeSingle(),
        null
      );
      
      if (attemptData) {
        setUserAttempt(attemptData);
        setGuesses(attemptData.guesses || ['']);
        setGameComplete(attemptData.completed);
        setGameWon(attemptData.completed);
        setHintsUsed(attemptData.hints_used || []);
      }

      // Load user stats
      const statsData = await safeQuery(
        () => supabase!.from('user_swirdle_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        mockStats
      );
      setUserStats(statsData);

    } catch (error) {
      console.error('Error loading Swirdle game:', error);
      setError('Failed to load today\'s game');
    } finally {
      setLoading(false);
    }
  };

  const saveAttempt = async () => {
    if (!user || !todaysWord || !supabase) return;

    try {
      const attemptData = {
        user_id: user.id,
        word_id: todaysWord.id,
        guesses: guesses.filter(g => g.length > 0),
        attempts: guesses.filter(g => g.length > 0).length,
        completed: gameComplete,
        hints_used: hintsUsed,
        ...(gameComplete && { completed_at: new Date().toISOString() }),
      };

      if (userAttempt) {
        await supabase.from('swirdle_attempts')
          .update(attemptData)
          .eq('id', userAttempt.id);
      } else {
        await supabase.from('swirdle_attempts')
          .insert([attemptData]);
      }

      // Update user stats if game completed
      if (gameComplete && userStats) {
        const newStats = {
          ...userStats,
          games_played: userStats.games_played + 1,
          games_won: gameWon ? userStats.games_won + 1 : userStats.games_won,
          current_streak: gameWon ? userStats.current_streak + 1 : 0,
          max_streak: gameWon ? Math.max(userStats.max_streak, userStats.current_streak + 1) : userStats.max_streak,
          last_played: new Date().toISOString(),
        };

        await supabase.from('user_swirdle_stats')
          .upsert(newStats, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const handleSubmitGuess = () => {
    if (!todaysWord || currentGuess.length !== todaysWord.word.length || gameComplete) return;

    if (guesses.filter(g => g.length > 0).length < maxGuesses) {
      const newGuesses = [...guesses];
      const currentIndex = guesses.findIndex(g => g.length === 0);
      if (currentIndex !== -1) {
        newGuesses[currentIndex] = currentGuess.toUpperCase();
      } else {
        newGuesses.push(currentGuess.toUpperCase());
      }
      
      setGuesses(newGuesses);
      
      if (currentGuess.toUpperCase() === todaysWord.word) {
        setGameWon(true);
        setGameComplete(true);
      } else if (newGuesses.filter(g => g.length > 0).length === maxGuesses) {
        setGameComplete(true);
      }
      
      setCurrentGuess('');
      saveAttempt();
    }
  };

  const useHint = (hintIndex: number) => {
    if (!hintsUsed.includes(hintIndex)) {
      setHintsUsed(prev => [...prev, hintIndex]);
      setShowHint(hintIndex);
      saveAttempt();
    }
  };

  const getLetterStatus = (letter: string, position: number, word: string): string => {
    if (!todaysWord) return 'empty';
    
    if (word.toUpperCase() === todaysWord.word) {
      return 'correct';
    }
    if (todaysWord.word.includes(letter)) {
      if (todaysWord.word[position] === letter) {
        return 'correct';
      }
      return 'present';
    }
    return 'absent';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-amber-100 text-amber-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Wine className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Unavailable</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!todaysWord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Game Today</h1>
          <p className="text-gray-600">Check back tomorrow for a new Swirdle challenge!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Wine className="w-8 h-8 text-purple-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">Swirdle</h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            {t('swirdle.dailyChallenge', 'Daily Wine Word Challenge')}
          </p>
          <p className="text-sm text-gray-500">
            Guess the {todaysWord.word.length}-letter wine term in {maxGuesses} tries
          </p>
          
          {/* Word Info */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(todaysWord.difficulty)}`}>
              {todaysWord.difficulty}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(todaysWord.category)}`}>
              {todaysWord.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Game Board */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="grid gap-2 mb-6">
            {Array.from({ length: maxGuesses }, (_, i) => (
              <div key={i} className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${todaysWord.word.length}, minmax(0, 1fr))` }}>
                {Array.from({ length: todaysWord.word.length }, (_, j) => {
                  const guess = guesses[i];
                  const letter = guess && guess[j] ? guess[j] : '';
                  const status = guess ? getLetterStatus(letter, j, guess) : '';
                  
                  return (
                    <div
                      key={j}
                      className={`
                        w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-lg
                        ${status === 'correct' ? 'bg-green-500 text-white border-green-500' :
                          status === 'present' ? 'bg-yellow-500 text-white border-yellow-500' :
                          status === 'absent' ? 'bg-gray-500 text-white border-gray-500' :
                          i === guesses.filter(g => g.length > 0).length && !gameComplete ? 'border-blue-400 bg-blue-50' :
                          'border-gray-300 bg-white'}
                      `}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Input */}
          {!gameComplete && (
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
              <input
                type="text"
                value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value.slice(0, todaysWord.word.length).toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitGuess()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg text-center"
                  placeholder={`Enter ${todaysWord.word.length}-letter wine term`}
                  maxLength={todaysWord.word.length}
              />
              <button
                onClick={handleSubmitGuess}
                  disabled={currentGuess.length !== todaysWord.word.length}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                  {t('swirdle.guess', 'Guess')}
              </button>
            </div>
              
              {/* Attempts remaining */}
              <div className="text-center text-sm text-gray-500">
                {maxGuesses - guesses.filter(g => g.length > 0).length} attempts remaining
              </div>
            </div>
          )}

          {/* Game Result */}
          {gameComplete && (
            <div className="text-center mb-8">
              {gameWon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    {t('swirdle.congratulations', 'Congratulations!')}
                  </h3>
                  <p className="text-green-700 mb-2">
                    You guessed "{todaysWord.word}" in {guesses.filter(g => g.length > 0).length} tries!
                  </p>
                  <p className="text-green-600 text-sm">
                    {todaysWord.definition}
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <Target className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h3 className="text-xl font-semibold text-red-800 mb-2">
                    {t('swirdle.gameOver', 'Game Over')}
                  </h3>
                  <p className="text-red-700 mb-2">
                    The word was "{todaysWord.word}"
                  </p>
                  <p className="text-red-600 text-sm">
                    {todaysWord.definition}
                  </p>
                </div>
              )}
              
              <button className="mt-6 flex items-center justify-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                <Share2 className="w-4 h-4 mr-2" />
                {t('swirdle.shareResult', 'Share Result')}
              </button>
            </div>
          )}
        </div>

        {/* Hints */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Lightbulb className="w-5 h-5 text-amber-600 mr-2" />
              {t('swirdle.hints', 'Hints')}
            </h3>
            <span className="text-sm text-gray-500">
              {hintsUsed.length}/{todaysWord.hints.length} used
            </span>
          </div>
          
          <div className="space-y-3">
            {todaysWord.hints.map((hint, index) => {
              const isUnlocked = hintsUsed.includes(index) || guesses.filter(g => g.length > 0).length > index * 2;
              const canUnlock = !isUnlocked && !gameComplete;
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all ${
                    isUnlocked
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-medium">Hint {index + 1}:</span>
                      <span className="ml-2">
                        {isUnlocked ? hint : '???'}
                      </span>
                    </div>
                    {canUnlock && (
                      <button
                        onClick={() => useHint(index)}
                        className="ml-3 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-full font-medium transition-colors"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                  {showHint === index && (
                    <div className="mt-2 text-xs text-blue-600">
                      Hint unlocked! This will affect your score.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 text-amber-600 mr-2" />
                {t('swirdle.yourStats', 'Your Stats')}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userStats.games_played}</div>
                  <div className="text-sm text-gray-600">{t('swirdle.gamesPlayed', 'Games Played')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats.games_played > 0 ? Math.round((userStats.games_won / userStats.games_played) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">{t('swirdle.winRate', 'Win Rate')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.current_streak}</div>
                  <div className="text-sm text-gray-600">{t('swirdle.currentStreak', 'Current Streak')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{userStats.max_streak}</div>
                  <div className="text-sm text-gray-600">{t('swirdle.bestStreak', 'Best Streak')}</div>
                </div>
              </div>
              
              {userStats.current_streak > 0 && (
                <div className="mt-4 text-center">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-600 mr-2" />
                      <span className="text-amber-800 font-medium">
                        {userStats.current_streak} day streak! Keep it up!
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Swirdle;