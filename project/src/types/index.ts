// Database Types - These will become our Supabase table structures

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  pdf_url?: string;
  order_index: number;
  required_subscription: 'free' | 'basic' | 'premium';
  is_published: boolean;
  estimated_duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[]; // JSON array for multiple choice
  correct_answer: string;
  explanation?: string;
  order_index: number;
  points: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  score?: number;
  time_spent_minutes?: number;
  completed_at?: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken_seconds?: number;
  attempted_at: string;
}

/*
DATABASE REQUIREMENTS CAPTURED:

TABLES NEEDED:
1. courses - main course information
2. modules - course content sections  
3. quizzes - questions within modules
4. user_progress - track module completion
5. quiz_attempts - individual quiz answers

RELATIONSHIPS:
- courses -> modules (one-to-many)
- modules -> quizzes (one-to-many)
- modules -> user_progress (one-to-many)
- quizzes -> quiz_attempts (one-to-many)

INDEXES NEEDED:
- course_id on modules
- module_id on quizzes, user_progress
- user_id on user_progress, quiz_attempts
- quiz_id on quiz_attempts

RLS POLICIES NEEDED:
- Admins can manage all content
- Users can read published content based on role
- Users can manage own progress/attempts
*/