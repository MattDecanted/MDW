import { supabase } from '../lib/supabaseClient';
import { 
  WineGameSession, 
  WineGameQuestion, 
  WineGameAnswer, 
  WineGameScore,
  OCRResult,
  QuestionTemplate 
} from '../types/wineGame';

// Generate temporary user ID for guest sessions
export const generateTempUserId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// OCR placeholder function (replace with actual Google Vision API)
export const extractWineInfo = async (imageFile: File): Promise<OCRResult> => {
  // Placeholder OCR function - replace with actual Google Vision API
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  
  // Mock OCR results based on filename or random selection
  const mockResults: OCRResult[] = [
    {
      text: "Château Margaux 2015 Bordeaux France",
      confidence: 0.95,
      vintage: 2015,
      country: "France",
      region: "Bordeaux",
      variety: "Cabernet Sauvignon",
      producer: "Château Margaux"
    },
    {
      text: "Cloudy Bay Sauvignon Blanc 2022 Marlborough New Zealand",
      confidence: 0.88,
      vintage: 2022,
      country: "New Zealand",
      region: "Marlborough",
      variety: "Sauvignon Blanc",
      producer: "Cloudy Bay"
    },
    {
      text: "Penfolds Grange 2016 South Australia",
      confidence: 0.92,
      vintage: 2016,
      country: "Australia",
      region: "South Australia",
      variety: "Shiraz",
      producer: "Penfolds"
    }
  ];
  
  return mockResults[Math.floor(Math.random() * mockResults.length)];
};

// Upload wine label image to Supabase Storage
export const uploadWineImage = async (file: File, userId: string, sessionId: string): Promise<string> => {
  if (!supabase) {
    throw new Error('Supabase not connected');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${sessionId}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('wine_labels')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('wine_labels')
    .getPublicUrl(fileName);

  return publicUrl;
};

// Question templates for generating game questions
const questionTemplates: QuestionTemplate[] = [
  {
    type: 'hemisphere',
    text: 'Which hemisphere is this wine from?',
    generateChoices: () => ['Northern Hemisphere', 'Southern Hemisphere'],
    getCorrectAnswer: (info) => {
      const southernCountries = ['Australia', 'New Zealand', 'South Africa', 'Chile', 'Argentina'];
      return southernCountries.includes(info.country) ? 'Southern Hemisphere' : 'Northern Hemisphere';
    }
  },
  {
    type: 'color',
    text: 'What color is this wine?',
    generateChoices: () => ['Red', 'White', 'Rosé', 'Sparkling'],
    getCorrectAnswer: (info) => {
      const redVarieties = ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Shiraz', 'Syrah'];
      const whiteVarieties = ['Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Pinot Grigio'];
      
      if (redVarieties.some(v => info.variety?.includes(v))) return 'Red';
      if (whiteVarieties.some(v => info.variety?.includes(v))) return 'White';
      if (info.region?.toLowerCase().includes('champagne')) return 'Sparkling';
      return 'Red'; // Default fallback
    }
  },
  {
    type: 'vintage',
    text: 'What vintage is this wine?',
    generateChoices: (info) => {
      const correctVintage = info.vintage || 2020;
      const choices = [correctVintage];
      
      // Add 3 other plausible vintages
      while (choices.length < 4) {
        const randomVintage = correctVintage + Math.floor(Math.random() * 6) - 3;
        if (randomVintage >= 2010 && randomVintage <= 2023 && !choices.includes(randomVintage)) {
          choices.push(randomVintage);
        }
      }
      
      return choices.sort().map(String);
    },
    getCorrectAnswer: (info) => String(info.vintage || 2020)
  },
  {
    type: 'country',
    text: 'Which country is this wine from?',
    generateChoices: (info) => {
      const correctCountry = info.country || 'France';
      const allCountries = ['France', 'Italy', 'Spain', 'USA', 'Australia', 'New Zealand', 'Chile', 'Argentina', 'Germany', 'Portugal'];
      const choices = [correctCountry];
      
      // Add 3 other countries
      while (choices.length < 4) {
        const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
        if (!choices.includes(randomCountry)) {
          choices.push(randomCountry);
        }
      }
      
      return choices.sort();
    },
    getCorrectAnswer: (info) => info.country || 'France'
  },
  {
    type: 'region',
    text: 'Which region is this wine from?',
    generateChoices: (info) => {
      const correctRegion = info.region || 'Bordeaux';
      const regionsByCountry = {
        'France': ['Bordeaux', 'Burgundy', 'Champagne', 'Rhône Valley', 'Loire Valley'],
        'Italy': ['Tuscany', 'Piedmont', 'Veneto', 'Sicily'],
        'USA': ['Napa Valley', 'Sonoma', 'Oregon', 'Washington'],
        'Australia': ['Barossa Valley', 'Hunter Valley', 'Margaret River', 'Yarra Valley'],
        'New Zealand': ['Marlborough', 'Central Otago', 'Hawke\'s Bay'],
      };
      
      const countryRegions = regionsByCountry[info.country as keyof typeof regionsByCountry] || regionsByCountry['France'];
      const choices = [correctRegion];
      
      // Add 3 other regions from the same country
      while (choices.length < 4) {
        const randomRegion = countryRegions[Math.floor(Math.random() * countryRegions.length)];
        if (!choices.includes(randomRegion)) {
          choices.push(randomRegion);
        }
      }
      
      return choices.sort();
    },
    getCorrectAnswer: (info) => info.region || 'Bordeaux'
  },
  {
    type: 'variety',
    text: 'What grape variety is this wine?',
    generateChoices: (info) => {
      const correctVariety = info.variety || 'Cabernet Sauvignon';
      const allVarieties = [
        'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Chardonnay', 'Sauvignon Blanc', 
        'Riesling', 'Syrah', 'Shiraz', 'Pinot Grigio', 'Sangiovese'
      ];
      const choices = [correctVariety];
      
      // Add 3 other varieties
      while (choices.length < 4) {
        const randomVariety = allVarieties[Math.floor(Math.random() * allVarieties.length)];
        if (!choices.includes(randomVariety)) {
          choices.push(randomVariety);
        }
      }
      
      return choices.sort();
    },
    getCorrectAnswer: (info) => info.variety || 'Cabernet Sauvignon'
  }
];

// Generate questions based on extracted wine info
export const generateQuestions = async (sessionId: string, extractedInfo: any): Promise<WineGameQuestion[]> => {
  if (!supabase) {
    throw new Error('Supabase not connected');
  }

  const questions: Omit<WineGameQuestion, 'id' | 'created_at'>[] = [];
  
  // Select 5-6 question types
  const selectedTemplates = questionTemplates.slice(0, 6);
  
  selectedTemplates.forEach((template, index) => {
    const choices = template.generateChoices(extractedInfo);
    const correctAnswer = template.getCorrectAnswer(extractedInfo);
    
    questions.push({
      session_id: sessionId,
      question_type: template.type,
      question_text: template.text,
      choices,
      correct_answer: correctAnswer,
      order_index: index
    });
  });

  // Save questions to database
  const { data, error } = await supabase
    .from('wine_option_questions')
    .insert(questions)
    .select();

  if (error) {
    throw new Error(`Failed to save questions: ${error.message}`);
  }

  return data || [];
};

// Create new game session
export const createGameSession = async (userId?: string, tempUserId?: string): Promise<WineGameSession> => {
  if (!supabase) {
    throw new Error('Supabase not connected');
  }

  const sessionData = {
    user_id: userId,
    temp_user_id: tempUserId,
    ocr_data: {},
    extracted_info: {},
    total_questions: 0,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('wine_option_sessions')
    .insert([sessionData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data;
};

// Save user answer
export const saveAnswer = async (
  sessionId: string,
  questionId: string,
  userAnswer: string,
  roundNumber: 1 | 2,
  userId?: string,
  tempUserId?: string
): Promise<boolean> => {
  if (!supabase) {
    throw new Error('Supabase not connected');
  }

  // Get the correct answer
  const { data: question, error: questionError } = await supabase
    .from('wine_option_questions')
    .select('correct_answer')
    .eq('id', questionId)
    .single();

  if (questionError) {
    throw new Error(`Failed to get question: ${questionError.message}`);
  }

  const isCorrect = userAnswer === question.correct_answer;

  const { error } = await supabase
    .from('wine_option_answers')
    .insert([{
      user_id: userId,
      temp_user_id: tempUserId,
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
      round_number: roundNumber,
      is_correct: isCorrect
    }]);

  if (error) {
    throw new Error(`Failed to save answer: ${error.message}`);
  }

  return isCorrect;
};

// Calculate and save final scores
export const calculateAndSaveScore = async (
  sessionId: string,
  userId?: string,
  tempUserId?: string
): Promise<WineGameScore> => {
  if (!supabase) {
    throw new Error('Supabase not connected');
  }

  // Get all answers for this session
  const { data: answers, error: answersError } = await supabase
    .from('wine_option_answers')
    .select('round_number, is_correct')
    .eq('session_id', sessionId)
    .eq(userId ? 'user_id' : 'temp_user_id', userId || tempUserId);

  if (answersError) {
    throw new Error(`Failed to get answers: ${answersError.message}`);
  }

  const round1Answers = answers?.filter(a => a.round_number === 1) || [];
  const round2Answers = answers?.filter(a => a.round_number === 2) || [];

  const firstRoundScore = round1Answers.filter(a => a.is_correct).length;
  const secondRoundScore = round2Answers.filter(a => a.is_correct).length;
  const totalQuestions = Math.max(round1Answers.length, round2Answers.length);

  const scoreData = {
    user_id: userId,
    temp_user_id: tempUserId,
    session_id: sessionId,
    first_round_score: firstRoundScore,
    second_round_score: secondRoundScore,
    total_questions: totalQuestions
  };

  const { data, error } = await supabase
    .from('wine_option_scores')
    .insert([scoreData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save score: ${error.message}`);
  }

  // Mark session as completed
  await supabase
    .from('wine_option_sessions')
    .update({ is_completed: true })
    .eq('id', sessionId);

  return data;
};

// Create group challenge
export const createGroupChallenge = async (
  sessionId: string,
  groupName: string,
  creatorId: string
): Promise<WineGameGroup> => {
  if (!supabase) {
    throw new Error('Supabase not connected');
  }

  const groupCode = Math.random().toString(36).substr(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from('wine_option_groups')
    .insert([{
      creator_id: creatorId,
      session_id: sessionId,
      group_code: groupCode,
      group_name: groupName,
      max_members: 10,
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create group: ${error.message}`);
  }

  return data;
};

// Join group challenge
export const joinGroupChallenge = async (
  groupCode: string,
  playerName: string,
  userId?: string,
  tempUserId?: string
): Promise<WineGameGroup> => {
  if (!supabase) {
    throw new Error('Supabase not connected');
  }

  // Get group info
  const { data: group, error: groupError } = await supabase
    .from('wine_option_groups')
    .select('*')
    .eq('group_code', groupCode)
    .eq('is_active', true)
    .single();

  if (groupError || !group) {
    throw new Error('Group not found or expired');
  }

  // Check if group is full
  const { count } = await supabase
    .from('wine_option_group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', group.id);

  if (count && count >= group.max_members) {
    throw new Error('Group is full');
  }

  // Add member to group
  const { error: memberError } = await supabase
    .from('wine_option_group_members')
    .insert([{
      group_id: group.id,
      user_id: userId,
      temp_user_id: tempUserId,
      player_name: playerName
    }]);

  if (memberError) {
    throw new Error(`Failed to join group: ${memberError.message}`);
  }

  return group;
};

// Get group leaderboard
export const getGroupLeaderboard = async (groupId: string) => {
  if (!supabase) {
    throw new Error('Supabase not connected');
  }

  const { data, error } = await supabase
    .from('wine_option_group_members')
    .select(`
      *,
      score:wine_option_scores(*)
    `)
    .eq('group_id', groupId)
    .order('joined_at');

  if (error) {
    throw new Error(`Failed to get leaderboard: ${error.message}`);
  }

  return data || [];
};