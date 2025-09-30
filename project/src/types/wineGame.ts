// Wine Options Game Types

export interface WineGameSession {
  id: string;
  user_id?: string;
  temp_user_id?: string;
  wine_image_url?: string;
  ocr_data: any;
  extracted_info: {
    vintage?: number;
    country?: string;
    region?: string;
    variety?: string;
    producer?: string;
  };
  total_questions: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WineGameQuestion {
  id: string;
  session_id: string;
  question_type: 'hemisphere' | 'color' | 'vintage' | 'country' | 'region' | 'variety';
  question_text: string;
  choices: string[];
  correct_answer: string;
  order_index: number;
  created_at: string;
}

export interface WineGameAnswer {
  id: string;
  user_id?: string;
  temp_user_id?: string;
  session_id: string;
  question_id: string;
  user_answer: string;
  round_number: 1 | 2;
  is_correct: boolean;
  answered_at: string;
}

export interface WineGameScore {
  id: string;
  user_id?: string;
  temp_user_id?: string;
  session_id: string;
  first_round_score: number;
  second_round_score: number;
  total_questions: number;
  completed_at: string;
}

export interface WineGameGroup {
  id: string;
  creator_id: string;
  session_id: string;
  group_code: string;
  group_name: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}

export interface WineGameGroupMember {
  id: string;
  group_id: string;
  user_id?: string;
  temp_user_id?: string;
  player_name: string;
  score_id?: string;
  joined_at: string;
}

export interface WineReference {
  id: string;
  wine_name: string;
  producer?: string;
  vintage?: number;
  country?: string;
  region?: string;
  grape_variety?: string;
  wine_type: 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'fortified';
  purchase_url?: string;
  affiliate_data: any;
  availability_status: string;
  created_at: string;
  updated_at: string;
}

export interface WineLike {
  id: string;
  user_id: string;
  session_id: string;
  wine_reference_id?: string;
  notes?: string;
  created_at: string;
}

// Game state types
export type GameStep = 'photo' | 'questions' | 'results' | 'group';
export type GameRound = 1 | 2;

export interface GameState {
  step: GameStep;
  session: WineGameSession | null;
  questions: WineGameQuestion[];
  currentQuestionIndex: number;
  currentRound: GameRound;
  answers: { [questionId: string]: { round1?: string; round2?: string } };
  scores: { round1: number; round2: number };
  loading: boolean;
  error: string | null;
}

// OCR and question generation types
export interface OCRResult {
  text: string;
  confidence: number;
  vintage?: number;
  country?: string;
  region?: string;
  variety?: string;
  producer?: string;
}

export interface QuestionTemplate {
  type: WineGameQuestion['question_type'];
  text: string;
  generateChoices: (extractedInfo: any) => string[];
  getCorrectAnswer: (extractedInfo: any) => string;
}