# Complete Supabase Setup Guide for Matt Decanted Wine Education Platform

## Step 1: Connect to Supabase in Bolt

1. **Click "Connect to Supabase"** button in the top-right corner of Bolt
2. **Follow the setup wizard** to create or connect your Supabase project
3. **Wait for environment variables** to be automatically configured in your `.env` file

## Step 2: Run Database Migrations

After Supabase is connected, go to **Supabase Dashboard → SQL Editor** and run these migrations in order:

### Migration 1: Core User System
```sql
/*
  # Core User System Setup
  
  1. New Tables
    - `profiles` - User profiles with roles and subscription status
  2. Security
    - Enable RLS on profiles table
    - Add policies for user data access
  3. Functions
    - Auto-create profile on user signup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'learner' CHECK (role IN ('guest', 'learner', 'subscriber', 'admin', 'translator')),
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'canceled')),
  subscription_end_date timestamptz,
  stripe_customer_id text,
  membership_tier text DEFAULT 'free' CHECK (membership_tier IN ('free', 'basic', 'premium')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Migration 2: Course System
```sql
/*
  # Course System Setup
  
  1. New Tables
    - `courses` - Main course information
    - `modules` - Course content sections
    - `quizzes` - Questions within modules
    - `user_progress` - Track module completion
    - `quiz_attempts` - Individual quiz answers
  2. Security
    - Enable RLS on all tables
    - Add role-based access policies
*/

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  is_published boolean DEFAULT false,
  order_index integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  slug text,
  title text NOT NULL,
  description text,
  video_url text,
  pdf_url text,
  order_index integer DEFAULT 0,
  required_role text DEFAULT 'learner' CHECK (required_role IN ('guest', 'learner', 'subscriber', 'admin')),
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, slug)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('true_false', 'multiple_choice')),
  options jsonb,
  correct_answer text NOT NULL,
  explanation text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  answer text NOT NULL,
  is_correct boolean NOT NULL,
  attempted_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Course policies
CREATE POLICY "Published courses are visible to all"
  ON courses FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Module policies
CREATE POLICY "Users can view modules based on role"
  ON modules FOR SELECT
  TO authenticated
  USING (
    is_published = true AND (
      required_role = 'guest' OR
      (required_role = 'learner' AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('learner', 'subscriber', 'admin')
      )) OR
      (required_role = 'subscriber' AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('subscriber', 'admin') AND profiles.subscription_status = 'active'
      )) OR
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins and translators can manage modules"
  ON modules FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'translator')
  ));

-- Quiz policies
CREATE POLICY "Users can view quizzes for accessible modules"
  ON quizzes FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM modules m
    WHERE m.id = quizzes.module_id AND m.is_published = true AND (
      m.required_role = 'guest' OR
      (m.required_role = 'learner' AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('learner', 'subscriber', 'admin')
      )) OR
      (m.required_role = 'subscriber' AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('subscriber', 'admin') AND profiles.subscription_status = 'active'
      )) OR
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
  ));

-- User progress policies
CREATE POLICY "Users can manage own progress"
  ON user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Quiz attempt policies
CREATE POLICY "Users can manage own quiz attempts"
  ON quiz_attempts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
```

### Migration 3: Swirdle Game System
```sql
/*
  # Swirdle Game System
  
  1. New Tables
    - `swirdle_words` - Daily wine word puzzles
    - `swirdle_attempts` - User game attempts
    - `user_swirdle_stats` - User statistics and streaks
  2. Security
    - Enable RLS on all tables
    - Add user-specific policies
  3. Functions
    - Update timestamp trigger
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE swirdle_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE swirdle_category AS ENUM ('grape_variety', 'wine_region', 'tasting_term', 'production', 'general');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Swirdle words table
CREATE TABLE IF NOT EXISTS swirdle_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL CHECK (char_length(word) >= 3 AND char_length(word) <= 10),
  definition text,
  level text,
  category text,
  tags text[],
  date date,
  is_used boolean DEFAULT false,
  is_published boolean DEFAULT false,
  publish_date date,
  date_scheduled date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Swirdle attempts table
CREATE TABLE IF NOT EXISTS swirdle_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  word_id uuid REFERENCES swirdle_words(id),
  guesses jsonb,
  attempts integer,
  completed boolean DEFAULT false,
  hints_used jsonb,
  completed_at timestamp,
  created_at timestamp DEFAULT now()
);

-- User Swirdle stats table
CREATE TABLE IF NOT EXISTS user_swirdle_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  current_streak integer DEFAULT 0,
  max_streak integer DEFAULT 0,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  average_attempts numeric DEFAULT 0,
  last_played timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE swirdle_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE swirdle_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_swirdle_stats ENABLE ROW LEVEL SECURITY;

-- Swirdle words policies
CREATE POLICY "select_published_words"
  ON swirdle_words FOR SELECT
  TO public
  USING (is_published);

-- Swirdle attempts policies
CREATE POLICY "user_select_attempts"
  ON swirdle_attempts FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_attempts"
  ON swirdle_attempts FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_update_attempts"
  ON swirdle_attempts FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "user_delete_attempts"
  ON swirdle_attempts FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "user_select_stats"
  ON user_swirdle_stats FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_stats"
  ON user_swirdle_stats FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_update_stats"
  ON user_swirdle_stats FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_swirdle_words_date ON swirdle_words(date_scheduled);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON swirdle_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_word ON swirdle_attempts(word_id);
CREATE INDEX IF NOT EXISTS idx_stats_user ON user_swirdle_stats(user_id);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
DROP TRIGGER IF EXISTS trg_swirdle_words_updated ON swirdle_words;
CREATE TRIGGER trg_swirdle_words_updated
  BEFORE UPDATE ON swirdle_words
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_user_stats_updated ON user_swirdle_stats;
CREATE TRIGGER trg_user_stats_updated
  BEFORE UPDATE ON user_swirdle_stats
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### Migration 4: Community System
```sql
/*
  # Community System
  
  1. New Tables
    - `community_posts` - Discussion posts
    - `community_replies` - Post replies
  2. Security
    - Enable RLS with role-based access
*/

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  post_type text DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'announcement', 'event')),
  is_pinned boolean DEFAULT false,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community replies table
CREATE TABLE IF NOT EXISTS community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

-- Community posts policies
CREATE POLICY "Everyone can view published posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can manage all posts"
  ON community_posts FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Community replies policies
CREATE POLICY "Everyone can view replies"
  ON community_replies FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM community_posts 
    WHERE community_posts.id = community_replies.post_id AND community_posts.is_published = true
  ));

CREATE POLICY "Users can create replies"
  ON community_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own replies"
  ON community_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can manage all replies"
  ON community_replies FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON community_posts(is_pinned, created_at);
CREATE INDEX IF NOT EXISTS idx_community_replies_post ON community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_author ON community_replies(author_id);
```

### Migration 5: Leads System
```sql
/*
  # Leads System
  
  1. New Tables
    - `leads` - Lead magnet captures
  2. Security
    - Enable RLS with public insert access
*/

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  source text DEFAULT 'wine_pairing_guide',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));
```

### Migration 6: Translation System
```sql
/*
  # Translation System
  
  1. New Tables
    - `translations` - Multi-language content
  2. Security
    - Enable RLS with translator access
*/

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('course', 'module', 'quiz', 'community_post')),
  content_id uuid NOT NULL,
  language_code text DEFAULT 'en' NOT NULL,
  field_name text NOT NULL,
  translated_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, language_code, field_name)
);

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Translation policies
CREATE POLICY "Everyone can read translations"
  ON translations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Translators and admins can manage translations"
  ON translations FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'translator')
  ));

-- Create index
CREATE INDEX IF NOT EXISTS idx_translations_content ON translations(content_type, content_id, language_code);
```

### Migration 7: Leaderboard System
```sql
/*
  # Leaderboard System
  
  1. New Tables
    - `user_leaderboard` - Global user rankings
  2. No RLS needed for public leaderboard
*/

-- User leaderboard table
CREATE TABLE IF NOT EXISTS user_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar text,
  points integer DEFAULT 0 NOT NULL,
  rank integer,
  tier text DEFAULT 'free' NOT NULL CHECK (tier IN ('free', 'basic', 'premium')),
  badges text[] DEFAULT '{}'
);

-- No RLS needed - public leaderboard
ALTER TABLE user_leaderboard DISABLE ROW LEVEL SECURITY;
```

## Step 3: Insert Sample Data

### Sample Courses and Modules
```sql
-- Insert sample courses
INSERT INTO courses (id, slug, title, description, thumbnail_url, is_published, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'wine-fundamentals', 'Wine Fundamentals', 'Learn the basics of wine tasting, terminology, and appreciation', 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg', true, 1),
('550e8400-e29b-41d4-a716-446655440002', 'french-wine-regions', 'French Wine Regions', 'Explore the diverse wine regions of France and their unique characteristics', 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg', true, 2)
ON CONFLICT (id) DO NOTHING;

-- Insert sample modules
INSERT INTO modules (id, course_id, slug, title, description, video_url, order_index, required_role, is_published) VALUES
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', 'intro-to-wine', 'Introduction to Wine', 'Basic wine knowledge and terminology', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, 'learner', true),
('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', 'wine-tasting-techniques', 'Wine Tasting Techniques', 'Learn proper wine tasting methods and evaluation', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2, 'subscriber', true),
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440002', 'burgundy-region', 'Burgundy Region', 'Deep dive into Burgundy wines and terroir', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, 'subscriber', true)
ON CONFLICT (id) DO NOTHING;
```

### Sample Swirdle Words
```sql
-- Insert sample Swirdle words
INSERT INTO swirdle_words (word, definition, level, category, is_published, date_scheduled) VALUES
('TERROIR', 'The complete natural environment in which a wine is produced', 'intermediate', 'tasting_term', true, CURRENT_DATE),
('TANNINS', 'Compounds that provide structure and astringency to wine', 'beginner', 'tasting_term', true, CURRENT_DATE + 1),
('MERLOT', 'A red wine grape variety known for its soft, velvety texture', 'beginner', 'grape_variety', true, CURRENT_DATE + 2),
('BURGUNDY', 'Famous French wine region known for Pinot Noir and Chardonnay', 'intermediate', 'wine_region', false, CURRENT_DATE + 3),
('MALOLACTIC', 'Secondary fermentation that converts malic acid to lactic acid', 'advanced', 'production', false, CURRENT_DATE + 4)
ON CONFLICT DO NOTHING;
```

### Sample Community Posts
```sql
-- Insert sample community posts (you'll need actual user IDs)
-- First, get a user ID from your profiles table, or create a test user
```

## Step 4: Configure Stripe (Optional)

If you want to enable subscriptions:

1. **Get Stripe Keys** from your Stripe Dashboard
2. **Add to Environment Variables** in Supabase:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. **Update your local .env** with:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

## Step 5: Test the Setup

1. **Create Test Accounts**:
   - Admin: `trish@smidgewines.com` / `trish123`
   - User: `user@example.com` / `user123`

2. **Test Features**:
   - Sign up/sign in functionality
   - Course access based on roles
   - Swirdle game functionality
   - Community posts and discussions
   - Admin panels for content management

## Step 6: Configure Authentication Settings

In **Supabase Dashboard → Authentication → Settings**:

1. **Disable email confirmation** for testing:
   - Set "Enable email confirmations" to OFF
2. **Set Site URL** to your domain
3. **Configure redirect URLs** if needed

## Troubleshooting

### Common Issues:

1. **RLS Policies**: If you get permission errors, check that RLS policies are correctly set up
2. **Missing Profiles**: The trigger should auto-create profiles, but you can manually insert if needed
3. **Translation Errors**: The constraint fix in the existing migration should resolve community_post translation issues

### Verification Queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check profiles
SELECT * FROM profiles LIMIT 5;

-- Check courses
SELECT * FROM courses WHERE is_published = true;

-- Check Swirdle words
SELECT * FROM swirdle_words WHERE is_published = true;
```

## Next Steps

Once Supabase is connected and migrations are run:

1. **Test user registration** and profile creation
2. **Verify course access** based on user roles
3. **Test Swirdle game** functionality
4. **Check admin panels** for content management
5. **Configure Stripe** if you want subscription functionality

The platform will work with mock data when Supabase isn't connected, but full functionality requires the database setup above.