import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  Upload, 
  Brain, 
  Trophy, 
  Users, 
  Share2, 
  Heart, 
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Target,
  Sparkles,
  Wine,
  Play,
  Clock,
  Star,
  Eye,
  EyeOff,
  ZoomIn,
  Info,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

interface GameState {
  step: 'rounds' | 'glass' | 'photo' | 'questions' | 'results' | 'group';
  session: any | null;
  questions: any[];
  currentQuestionIndex: number;
  currentRound: 1 | 2;
  roundsSelected: 1 | 2;
  isBlackGlass: boolean;
  answers: { [questionId: string]: { round1?: string; round2?: string } };
  scores: { round1: number; round2: number };
  loading: boolean;
  error: string | null;
}

interface WineInfo {
  vintage: number;
  country: string;
  region: string;
  variety: string;
  producer: string;
  color: 'red' | 'white' | 'rose' | 'sparkling';
}

const WineOptionsGame: React.FC = () => {
  const { user, profile } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    step: 'rounds',
    session: null,
    questions: [],
    currentQuestionIndex: 0,
    currentRound: 1,
    roundsSelected: 2,
    isBlackGlass: false,
    answers: {},
    scores: { round1: 0, round2: 0 },
    loading: false,
    error: null
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        updateGameState({ error: 'Please select a valid image file' });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        updateGameState({ error: 'Image file is too large. Please choose a smaller image.' });
        return;
      }
      
      updateGameState({ error: null });
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect({ target: { files: [file] } } as any);
      }
    };
    input.click();
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect({ target: { files: [file] } } as any);
      }
    };
    input.click();
  };

  const generateQuestions = (wineInfo: WineInfo, isBlackGlass: boolean): any[] => {
    const questions = [];
    let sortOrder = 0;

    // 1. Vintage (always first)
    const correctVintage = wineInfo.vintage;
    const vintageChoices = [correctVintage];
    
    // Add 2 realistic vintages (±1-2 years)
    while (vintageChoices.length < 3) {
      const realistic = correctVintage + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1);
      if (realistic >= 2010 && realistic <= 2024 && !vintageChoices.includes(realistic)) {
        vintageChoices.push(realistic);
      }
    }
    
    // Add 1 unusual vintage
    const unusual = Math.random() > 0.5 
      ? correctVintage - (5 + Math.floor(Math.random() * 10)) // Much older
      : 2025 + Math.floor(Math.random() * 3); // Future year
    vintageChoices.push(unusual);

    questions.push({
      id: `vintage_${Date.now()}`,
      question_type: 'vintage',
      question_text: 'What vintage is this wine?',
      choices: vintageChoices.sort().map(String),
      correct_answer: String(correctVintage),
      sort_order: sortOrder++
    });

    // 2. Colour (only if black glass)
    if (isBlackGlass) {
      questions.push({
        id: `color_${Date.now()}`,
        question_type: 'color',
        question_text: 'What color is this wine?',
        choices: ['White', 'Red', 'Rosé', 'Other'],
        correct_answer: wineInfo.color.charAt(0).toUpperCase() + wineInfo.color.slice(1),
        sort_order: sortOrder++
      });
    }

    // 3. Variety (always third, but logic depends on glass type)
    const varietyChoices = [wineInfo.variety];
    
    if (isBlackGlass) {
      // Mix of red and white varieties
      const redVarieties = ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Shiraz', 'Sangiovese'];
      const whiteVarieties = ['Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Pinot Grigio', 'Gewürztraminer'];
      
      // Add 1 red and 1 white, plus 1 more of either
      const availableRed = redVarieties.filter(v => v !== wineInfo.variety);
      const availableWhite = whiteVarieties.filter(v => v !== wineInfo.variety);
      
      if (availableRed.length > 0) varietyChoices.push(availableRed[Math.floor(Math.random() * availableRed.length)]);
      if (availableWhite.length > 0) varietyChoices.push(availableWhite[Math.floor(Math.random() * availableWhite.length)]);
      
      // Add one more variety
      const allOthers = [...availableRed, ...availableWhite].filter(v => !varietyChoices.includes(v));
      if (allOthers.length > 0) varietyChoices.push(allOthers[Math.floor(Math.random() * allOthers.length)]);
    } else {
      // Same color varieties only
      const sameColorVarieties = wineInfo.color === 'red' 
        ? ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Shiraz', 'Sangiovese', 'Tempranillo']
        : ['Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Pinot Grigio', 'Gewürztraminer', 'Albariño'];
      
      const available = sameColorVarieties.filter(v => v !== wineInfo.variety);
      while (varietyChoices.length < 4 && available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        varietyChoices.push(available.splice(randomIndex, 1)[0]);
      }
    }

    questions.push({
      id: `variety_${Date.now()}`,
      question_type: 'variety',
      question_text: 'What grape variety is this wine?',
      choices: varietyChoices.sort(),
      correct_answer: wineInfo.variety,
      sort_order: sortOrder++
    });

    // 4. Hemisphere
    const southernCountries = ['Australia', 'New Zealand', 'South Africa', 'Chile', 'Argentina'];
    const correctHemisphere = southernCountries.includes(wineInfo.country) ? 'Southern' : 'Northern';
    
    questions.push({
      id: `hemisphere_${Date.now()}`,
      question_type: 'hemisphere',
      question_text: 'Which hemisphere is this wine from?',
      choices: ['Northern', 'Southern', 'Equator'],
      correct_answer: correctHemisphere,
      sort_order: sortOrder++
    });

    // 5. Country
    const countryChoices = [wineInfo.country];
    const allCountries = ['France', 'Italy', 'Spain', 'USA', 'Australia', 'New Zealand', 'Chile', 'Argentina', 'Germany', 'Portugal'];
    const availableCountries = allCountries.filter(c => c !== wineInfo.country);
    
    while (countryChoices.length < 4 && availableCountries.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCountries.length);
      countryChoices.push(availableCountries.splice(randomIndex, 1)[0]);
    }

    questions.push({
      id: `country_${Date.now()}`,
      question_type: 'country',
      question_text: 'Which country is this wine from?',
      choices: countryChoices.sort(),
      correct_answer: wineInfo.country,
      sort_order: sortOrder++
    });

    // 6. Region
    const regionChoices = [wineInfo.region];
    const regionsByCountry: { [key: string]: string[] } = {
      'France': ['Bordeaux', 'Burgundy', 'Champagne', 'Rhône Valley', 'Loire Valley', 'Alsace'],
      'Italy': ['Tuscany', 'Piedmont', 'Veneto', 'Sicily', 'Umbria'],
      'USA': ['Napa Valley', 'Sonoma', 'Oregon', 'Washington', 'Finger Lakes'],
      'Australia': ['Barossa Valley', 'Hunter Valley', 'Margaret River', 'Yarra Valley'],
      'New Zealand': ['Marlborough', 'Central Otago', 'Hawke\'s Bay'],
      'Spain': ['Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas'],
      'Chile': ['Maipo Valley', 'Casablanca Valley', 'Colchagua Valley'],
      'Argentina': ['Mendoza', 'Salta', 'San Juan']
    };

    const countryRegions = regionsByCountry[wineInfo.country] || ['Unknown Region'];
    const availableRegions = countryRegions.filter(r => r !== wineInfo.region);
    
    // Add 2 regions that grow the same variety
    while (regionChoices.length < 3 && availableRegions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableRegions.length);
      regionChoices.push(availableRegions.splice(randomIndex, 1)[0]);
    }
    
    // Add 1 outlier region from different country
    const outlierRegions = Object.values(regionsByCountry).flat().filter(r => !regionChoices.includes(r));
    if (outlierRegions.length > 0) {
      regionChoices.push(outlierRegions[Math.floor(Math.random() * outlierRegions.length)]);
    }

    questions.push({
      id: `region_${Date.now()}`,
      question_type: 'region',
      question_text: 'Which region is this wine from?',
      choices: regionChoices.sort(),
      correct_answer: wineInfo.region,
      sort_order: sortOrder++
    });

    return questions;
  };

  const handlePhotoSubmit = async () => {
    if (!selectedFile) return;

    updateGameState({ loading: true, error: null });

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock wine info extraction with more variety
      const mockWineOptions: WineInfo[] = [
        {
          vintage: 2020,
          country: 'France',
          region: 'Bordeaux',
          variety: 'Cabernet Sauvignon',
          producer: 'Château Margaux',
          color: 'red'
        },
        {
          vintage: 2022,
          country: 'New Zealand',
          region: 'Marlborough',
          variety: 'Sauvignon Blanc',
          producer: 'Cloudy Bay',
          color: 'white'
        },
        {
          vintage: 2019,
          country: 'Australia',
          region: 'Barossa Valley',
          variety: 'Shiraz',
          producer: 'Penfolds',
          color: 'red'
        },
        {
          vintage: 2021,
          country: 'USA',
          region: 'Napa Valley',
          variety: 'Chardonnay',
          producer: 'Opus One',
          color: 'white'
        }
      ];

      const mockWineInfo = mockWineOptions[Math.floor(Math.random() * mockWineOptions.length)];
      const questions = generateQuestions(mockWineInfo, gameState.isBlackGlass);

      updateGameState({
        session: { 
          id: 'mock-session', 
          extracted_info: mockWineInfo,
          rounds_selected: gameState.roundsSelected,
          is_black_glass: gameState.isBlackGlass
        },
        questions,
        step: 'questions',
        loading: false
      });

    } catch (error: any) {
      updateGameState({ 
        error: error.message || 'Failed to process wine image',
        loading: false 
      });
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    const { questions, currentQuestionIndex, currentRound } = gameState;
    if (!questions[currentQuestionIndex]) return;

    const question = questions[currentQuestionIndex];
    const isCorrect = answer === question.correct_answer;

    // Update local answers
    const newAnswers = {
      ...gameState.answers,
      [question.id]: {
        ...gameState.answers[question.id],
        [`round${currentRound}`]: answer
      }
    };

    // Update scores
    const newScores = { ...gameState.scores };
    if (isCorrect) {
      newScores[`round${currentRound}` as keyof typeof newScores]++;
    }

    updateGameState({
      answers: newAnswers,
      scores: newScores
    });

    // Move to next question or round
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        updateGameState({ currentQuestionIndex: currentQuestionIndex + 1 });
      } else if (currentRound === 1 && gameState.roundsSelected === 2) {
        // Start round 2
        updateGameState({
          currentRound: 2,
          currentQuestionIndex: 0
        });
      } else {
        // Game complete
        updateGameState({ step: 'results' });
        if (!user) {
          setTimeout(() => setShowLoginPrompt(true), 2000);
        }
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState({
      step: 'rounds',
      session: null,
      questions: [],
      currentQuestionIndex: 0,
      currentRound: 1,
      roundsSelected: 2,
      isBlackGlass: false,
      answers: {},
      scores: { round1: 0, round2: 0 },
      loading: false,
      error: null
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowLoginPrompt(false);
    setImageExpanded(false);
  };

  const shareResults = () => {
    const { scores, questions, roundsSelected } = gameState;
    const totalQuestions = questions.length;
    const totalScore = roundsSelected === 1 ? scores.round1 : scores.round1 + scores.round2;
    const maxScore = totalQuestions * roundsSelected;
    
    const shareText = `🍷 I just scored ${totalScore}/${maxScore} on the Wine Options Game! Can you beat my score? Try it at ${window.location.origin}/wine-game`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Wine Options Game Results',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  const renderRoundsStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Target className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Challenge
        </h2>
        <p className="text-gray-600">
          How many rounds would you like to play?
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={() => updateGameState({ roundsSelected: 1, step: 'glass' })}
          className="w-full bg-white border-2 border-gray-300 hover:border-blue-400 rounded-lg p-6 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">1 Round</h3>
              <p className="text-gray-600 text-sm">Quick challenge - perfect for a single tasting</p>
            </div>
            <div className="text-2xl">🍷</div>
          </div>
        </button>

        <button
          onClick={() => updateGameState({ roundsSelected: 2, step: 'glass' })}
          className="w-full bg-blue-50 border-2 border-blue-400 rounded-lg p-6 text-left transition-all relative"
        >
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Recommended
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">2 Rounds</h3>
              <p className="text-gray-600 text-sm">
                Ideal if you're really testing your tasting skills using a black glass for your first try!
              </p>
            </div>
            <div className="text-2xl">🥽🍷</div>
          </div>
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-800 text-sm">
              <strong>Pro Tip:</strong> Two rounds let you compare your blind tasting skills 
              against your knowledge when you can see the label!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGlassStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Eye className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What type of glass are you using?
        </h2>
        <p className="text-gray-600">
          This affects which questions we'll ask you
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={() => updateGameState({ isBlackGlass: true, step: 'photo' })}
          className="w-full bg-white border-2 border-gray-300 hover:border-purple-400 rounded-lg p-6 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">🖤 Black/Opaque Glass</h3>
              <p className="text-gray-600 text-sm">True blind tasting - can't see the wine color</p>
            </div>
            <EyeOff className="w-8 h-8 text-purple-600" />
          </div>
        </button>

        <button
          onClick={() => updateGameState({ isBlackGlass: false, step: 'photo' })}
          className="w-full bg-white border-2 border-gray-300 hover:border-blue-400 rounded-lg p-6 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">🔍 Clear Glass</h3>
              <p className="text-gray-600 text-sm">Can see the wine color and clarity</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800 text-sm">
              <strong>Black glass</strong> gives you the full blind tasting experience, 
              while <strong>clear glass</strong> focuses on other wine characteristics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhotoStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Wine className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Snap Your Wine Label
        </h2>
        <p className="text-gray-600">
          Take a photo of the wine you're tasting to start the challenge
        </p>
        {gameState.roundsSelected === 2 && (
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-purple-800 text-sm">
              <strong>Round 1:</strong> {gameState.isBlackGlass ? '🖤 Black glass' : '🔍 Clear glass'} tasting
              {gameState.roundsSelected === 2 && (
                <>
                  <br />
                  <strong>Round 2:</strong> Label revealed
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {previewUrl ? (
        <div className="mb-6">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Wine label preview"
              className="max-h-[300px] w-full object-contain mx-auto rounded-lg shadow-lg cursor-pointer border border-gray-200"
              onClick={() => setImageExpanded(true)}
            />
            <button
              onClick={() => setImageExpanded(true)}
              className="absolute top-3 right-3 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all shadow-lg"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl('');
              updateGameState({ error: null });
            }}
            className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            📷 Choose Different Photo
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <div className="space-y-4">
            {/* Camera Button */}
            <button
              onClick={handleCameraCapture}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer"
            >
              <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">Take Photo with Camera</p>
              <p className="text-sm text-gray-500">Best for mobile devices</p>
            </button>

            {/* Gallery Button */}
            <button
              onClick={handleGallerySelect}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Upload className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-900 font-medium mb-1">Upload from Gallery</p>
              <p className="text-sm text-gray-500">Choose existing photo</p>
            </button>

            {/* Hidden fallback input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="fallback-file-input"
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {gameState.error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800 text-sm">{gameState.error}</p>
          </div>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handlePhotoSubmit}
          disabled={gameState.loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {gameState.loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Analyzing Wine Label...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Start Wine Challenge
            </>
          )}
        </button>
      )}

      {/* Image Expansion Modal */}
      {imageExpanded && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewUrl}
              alt="Wine label expanded"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setImageExpanded(false)}
              className="absolute -top-12 right-0 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg">
              <p className="text-sm">Tap outside to close</p>
            </div>
          </div>
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setImageExpanded(false)}
          />
        </div>
      )}
    </div>
  );

  const renderQuestionsStep = () => {
    const { questions, currentQuestionIndex, currentRound, answers, roundsSelected } = gameState;
    const question = questions[currentQuestionIndex];
    
    if (!question) return null;

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const hasAnswered = answers[question.id]?.[`round${currentRound}`];

    return (
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="w-6 h-6 text-purple-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">
                {roundsSelected === 1 ? 'Question' : `Round ${currentRound} - Question`} {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentRound === 1 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {currentRound === 1 ? 
                (gameState.isBlackGlass ? '🖤 Black Glass' : '🔍 Clear Glass') : 
                '👁️ Label Revealed'
              }
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Round 2 Reminder */}
          {currentRound === 2 && gameState.isBlackGlass && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-800 text-sm">
                    <strong>Round 2 Reminder:</strong> If you used a black glass for round 1, 
                    you might want to try your answers again out of a clear glass!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {question.question_text}
          </h3>

          <div className="space-y-3">
            {question.choices.map((choice: string, index: number) => {
              const isSelected = hasAnswered === choice;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 text-purple-800'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium mr-4">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-800 rounded-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Answer recorded! Moving to next question...
              </div>
            </div>
          )}
        </div>

        {/* Round Info */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            {currentRound === 1 ? (
              gameState.isBlackGlass ? 
                "🖤 Taste the wine without seeing the color" :
                "🔍 You can see the wine color and clarity"
            ) : (
              "👁️ Now you can see the wine label - how did you do?"
            )}
          </p>
        </div>
      </div>
    );
  };

  const renderResultsStep = () => {
    const { scores, questions, roundsSelected } = gameState;
    const totalQuestions = questions.length;
    const totalScore = roundsSelected === 1 ? scores.round1 : scores.round1 + scores.round2;
    const maxScore = totalQuestions * roundsSelected;
    const percentage = Math.round((totalScore / maxScore) * 100);

    const getScoreMessage = () => {
      if (percentage >= 90) return "🏆 Wine Master! Incredible palate!";
      if (percentage >= 75) return "🍷 Excellent! You know your wines!";
      if (percentage >= 60) return "👍 Good job! Keep tasting!";
      if (percentage >= 40) return "🤔 Not bad! Practice makes perfect!";
      return "😅 This wine had you fooled! Try another?";
    };

    return (
      <div className="max-w-2xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Game Complete!
          </h2>
          <p className="text-xl text-gray-600">
            {getScoreMessage()}
          </p>
        </div>

        {/* Score Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-purple-600 mb-2">
              {totalScore}/{maxScore}
            </div>
            <div className="text-lg text-gray-600">
              {percentage}% Accuracy
            </div>
          </div>

          {roundsSelected === 2 ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{scores.round1}</div>
                <div className="text-sm text-blue-800">
                  {gameState.isBlackGlass ? '🖤 Black Glass' : '🔍 Clear Glass'}
                </div>
                <div className="text-xs text-blue-600">out of {totalQuestions}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{scores.round2}</div>
                <div className="text-sm text-purple-800">👁️ Label Revealed</div>
                <div className="text-xs text-purple-600">out of {totalQuestions}</div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-blue-50 rounded-lg mb-6">
              <div className="text-2xl font-bold text-blue-600">{scores.round1}</div>
              <div className="text-sm text-blue-800">Single Round Score</div>
              <div className="text-xs text-blue-600">out of {totalQuestions}</div>
            </div>
          )}

          {/* Improvement Message */}
          {roundsSelected === 2 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-amber-600 mr-2" />
                <div>
                  <p className="text-amber-800 font-medium">
                    {scores.round2 > scores.round1 
                      ? "Great improvement when you could see the label!"
                      : scores.round1 > scores.round2
                      ? "Impressive blind tasting skills!"
                      : "Consistent performance in both rounds!"
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={shareResults}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Results
            </button>
            <button
              onClick={() => {/* TODO: Implement save to favorites */}}
              className="border border-purple-600 text-purple-600 hover:bg-purple-50 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Heart className="w-5 h-5 mr-2" />
              Save Wine
            </button>
          </div>

          <button
            onClick={resetGame}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Another Wine
          </button>

          {/* Group Challenge */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Challenge Friends</h4>
                <p className="text-sm text-green-600">Create a group and see who knows wine best!</p>
              </div>
              <button
                onClick={() => updateGameState({ step: 'group' })}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Create Group
              </button>
            </div>
          </div>
        </div>

        {/* Login Prompt for Guests */}
        {showLoginPrompt && !user && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Want to track your scores?
            </h3>
            <p className="text-blue-600 mb-4">
              Create an account to save your game history, get wine recommendations, and unlock more features!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Free Account
              </a>
              <a
                href="/signin"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGroupStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Group Challenge
        </h2>
        <p className="text-gray-600">
          Create a group challenge or join an existing one
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Create New Group</h3>
          <input
            type="text"
            placeholder="Group name (e.g., Wine Night Crew)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
          />
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
            Create Group & Get Code
          </button>
        </div>

        <div className="text-center text-gray-500">or</div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Join Existing Group</h3>
          <input
            type="text"
            placeholder="Enter group code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
          />
          <button className="w-full border border-green-600 text-green-600 hover:bg-green-50 py-3 px-6 rounded-lg font-semibold transition-colors">
            Join Group Challenge
          </button>
        </div>

        <button
          onClick={() => updateGameState({ step: 'results' })}
          className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium"
        >
          ← Back to Results
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            🎯 Wine Options Game
          </h1>
          <p className="text-lg text-gray-600">
            Test your wine knowledge with AI-powered challenges
          </p>
        </div>

        {/* Error Display */}
        {gameState.error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{gameState.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Steps */}
        {gameState.step === 'rounds' && renderRoundsStep()}
        {gameState.step === 'glass' && renderGlassStep()}
        {gameState.step === 'photo' && renderPhotoStep()}
        {gameState.step === 'questions' && renderQuestionsStep()}
        {gameState.step === 'results' && renderResultsStep()}
        {gameState.step === 'group' && renderGroupStep()}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by AI wine recognition • Mobile optimized</p>
        </div>
      </div>
    </div>
  );
};

export default WineOptionsGame;