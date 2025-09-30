import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Connection status helper
export const isSupabaseConnected = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'guest' | 'learner' | 'subscriber' | 'admin' | 'translator';
  subscription_status: 'inactive' | 'active' | 'trialing' | 'canceled';
  subscription_end_date?: string;
  stripe_customer_id?: string;
  membership_tier?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  is_published: boolean;
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  slug?: string;
  title: string;
  description?: string;
  video_url?: string;
  pdf_url?: string;
  order_index: number;
  required_role: 'guest' | 'learner' | 'subscriber' | 'admin';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  question: string;
  question_type: 'true_false' | 'multiple_choice';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  order_index: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  answer: string;
  is_correct: boolean;
  attempted_at: string;
}

export interface Lead {
  id: string;
  email: string;
  full_name: string;
  source: string;
  created_at: string;
}

export interface Translation {
  id: string;
  content_type: 'course' | 'module' | 'quiz' | 'community_post';
  content_id: string;
  language_code: string;
  field_name: string;
  translated_text: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  post_type: 'discussion' | 'announcement' | 'event';
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

// Safe query wrapper with timeout and error handling
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallback: T,
  timeoutMs: number = 5000
): Promise<T> => {
  if (!isSupabaseConnected()) {
    console.log('Supabase not connected - using fallback data');
    return fallback;
  }

  try {
    const result = await withTimeout(queryFn(), timeoutMs);
    
    if (result.error) {
      console.warn('Database query error:', result.error.message);
      return fallback;
    }
    
    return result.data || fallback;
  } catch (error: any) {
    if (error.message.includes('timeout')) {
      console.warn('Database timeout - using fallback');
    } else {
      console.warn('Database error:', error.message);
    }
    return fallback;
  }
};