/*
  # Wine Options Game Schema
  
  1. New Tables
    - `wine_option_sessions` - Game sessions with wine photos and OCR data
    - `wine_option_questions` - Generated questions for each session
    - `wine_option_answers` - User answers for each question
    - `wine_option_scores` - Final scores for each session
    - `wine_option_groups` - Group challenge sessions
    - `wine_option_group_members` - Members participating in group challenges
    - `wines_reference` - Wine database for matching and purchasing
    - `wine_likes` - User favorites for future features
  
  2. Security
    - Enable RLS on all tables
    - Add policies for user access and guest sessions
  
  3. Storage
    - Create wine_labels bucket for image uploads
*/

-- Create wine option sessions table
CREATE TABLE IF NOT EXISTS wine_option_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  temp_user_id text, -- For guest users
  wine_image_url text,
  ocr_data jsonb DEFAULT '{}',
  extracted_info jsonb DEFAULT '{}', -- vintage, country, region, variety
  total_questions integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wine option questions table
CREATE TABLE IF NOT EXISTS wine_option_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES wine_option_sessions(id) ON DELETE CASCADE,
  question_type text NOT NULL CHECK (question_type IN ('hemisphere', 'color', 'vintage', 'country', 'region', 'variety')),
  question_text text NOT NULL,
  choices jsonb NOT NULL DEFAULT '[]',
  correct_answer text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create wine option answers table
CREATE TABLE IF NOT EXISTS wine_option_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  temp_user_id text, -- For guest users
  session_id uuid REFERENCES wine_option_sessions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES wine_option_questions(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  round_number integer DEFAULT 1 CHECK (round_number IN (1, 2)),
  is_correct boolean NOT NULL,
  answered_at timestamptz DEFAULT now()
);

-- Create wine option scores table
CREATE TABLE IF NOT EXISTS wine_option_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  temp_user_id text, -- For guest users
  session_id uuid REFERENCES wine_option_sessions(id) ON DELETE CASCADE,
  first_round_score integer DEFAULT 0,
  second_round_score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

-- Create wine option groups table
CREATE TABLE IF NOT EXISTS wine_option_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES wine_option_sessions(id) ON DELETE CASCADE,
  group_code text UNIQUE NOT NULL,
  group_name text NOT NULL,
  max_members integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Create wine option group members table
CREATE TABLE IF NOT EXISTS wine_option_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES wine_option_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  temp_user_id text, -- For guest users
  player_name text NOT NULL,
  score_id uuid REFERENCES wine_option_scores(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now()
);

-- Create wines reference table (for future features)
CREATE TABLE IF NOT EXISTS wines_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_name text NOT NULL,
  producer text,
  vintage integer,
  country text,
  region text,
  grape_variety text,
  wine_type text CHECK (wine_type IN ('red', 'white', 'rose', 'sparkling', 'dessert', 'fortified')),
  purchase_url text,
  affiliate_data jsonb DEFAULT '{}',
  availability_status text DEFAULT 'unknown',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wine likes table (for user favorites)
CREATE TABLE IF NOT EXISTS wine_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES wine_option_sessions(id) ON DELETE CASCADE,
  wine_reference_id uuid REFERENCES wines_reference(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Enable RLS on all tables
ALTER TABLE wine_option_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_option_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_option_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_option_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_option_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_likes ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can manage own sessions"
  ON wine_option_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Guests can manage temp sessions"
  ON wine_option_sessions FOR ALL
  TO anon
  USING (temp_user_id IS NOT NULL);

CREATE POLICY "Admins can view all sessions"
  ON wine_option_sessions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Questions policies
CREATE POLICY "Users can view questions for their sessions"
  ON wine_option_questions FOR SELECT
  TO authenticated, anon
  USING (EXISTS (
    SELECT 1 FROM wine_option_sessions 
    WHERE wine_option_sessions.id = wine_option_questions.session_id 
    AND (wine_option_sessions.user_id = auth.uid() OR wine_option_sessions.temp_user_id IS NOT NULL)
  ));

-- Answers policies
CREATE POLICY "Users can manage own answers"
  ON wine_option_answers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Guests can manage temp answers"
  ON wine_option_answers FOR ALL
  TO anon
  USING (temp_user_id IS NOT NULL);

-- Scores policies
CREATE POLICY "Users can view own scores"
  ON wine_option_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Guests can view temp scores"
  ON wine_option_scores FOR SELECT
  TO anon
  USING (temp_user_id IS NOT NULL);

CREATE POLICY "Users can insert own scores"
  ON wine_option_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guests can insert temp scores"
  ON wine_option_scores FOR INSERT
  TO anon
  WITH CHECK (temp_user_id IS NOT NULL);

-- Groups policies
CREATE POLICY "Users can manage own groups"
  ON wine_option_groups FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view active groups"
  ON wine_option_groups FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Group members policies
CREATE POLICY "Users can manage own group memberships"
  ON wine_option_group_members FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Guests can manage temp memberships"
  ON wine_option_group_members FOR ALL
  TO anon
  USING (temp_user_id IS NOT NULL);

-- Wine reference policies (public read)
CREATE POLICY "Anyone can view wine reference"
  ON wines_reference FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage wine reference"
  ON wines_reference FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Wine likes policies
CREATE POLICY "Users can manage own likes"
  ON wine_likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wine_sessions_user ON wine_option_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_wine_sessions_temp ON wine_option_sessions(temp_user_id);
CREATE INDEX IF NOT EXISTS idx_wine_questions_session ON wine_option_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_wine_answers_session ON wine_option_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_wine_answers_user ON wine_option_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_wine_scores_user ON wine_option_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_wine_groups_code ON wine_option_groups(group_code);
CREATE INDEX IF NOT EXISTS idx_wine_group_members_group ON wine_option_group_members(group_id);

-- Insert sample wine reference data
INSERT INTO wines_reference (wine_name, producer, vintage, country, region, grape_variety, wine_type) VALUES
('Château Margaux', 'Château Margaux', 2015, 'France', 'Bordeaux', 'Cabernet Sauvignon', 'red'),
('Opus One', 'Opus One Winery', 2018, 'USA', 'Napa Valley', 'Cabernet Sauvignon', 'red'),
('Dom Pérignon', 'Moët & Chandon', 2012, 'France', 'Champagne', 'Chardonnay', 'sparkling'),
('Penfolds Grange', 'Penfolds', 2016, 'Australia', 'South Australia', 'Shiraz', 'red'),
('Cloudy Bay Sauvignon Blanc', 'Cloudy Bay', 2022, 'New Zealand', 'Marlborough', 'Sauvignon Blanc', 'white')
ON CONFLICT DO NOTHING;