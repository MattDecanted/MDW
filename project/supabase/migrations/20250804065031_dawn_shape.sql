/*
  # Create content_items table for multilingual content management

  1. New Tables
    - `content_items`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `type` (enum: blind_tasting, short_course)
      - Admin labels in 5 languages (en, ko, zh, ja, da)
      - User labels in 5 languages (en, ko, zh, ja, da)
      - Descriptions in 5 languages (en, ko, zh, ja, da)
      - `subscriber_only` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `content_items` table
    - Add policy for admins to manage all content
    - Add policy for users to view active content based on subscription

  3. Sample Data
    - Insert sample content items for blind tastings and short courses
*/

-- Create enum for content types
CREATE TYPE content_item_type AS ENUM ('blind_tasting', 'short_course');

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  type content_item_type NOT NULL,
  
  -- Admin labels (internal use)
  admin_label_en text NOT NULL,
  admin_label_ko text,
  admin_label_zh text,
  admin_label_ja text,
  admin_label_da text,
  
  -- User labels (frontend display)
  user_label_en text NOT NULL,
  user_label_ko text,
  user_label_zh text,
  user_label_ja text,
  user_label_da text,
  
  -- Descriptions (optional)
  description_en text,
  description_ko text,
  description_zh text,
  description_ja text,
  description_da text,
  
  -- Access control
  subscriber_only boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Admin policy - full access
CREATE POLICY "Admins can manage all content items"
  ON content_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- User policy - view active content based on subscription
CREATE POLICY "Users can view active content based on subscription"
  ON content_items
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (
      subscriber_only = false
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (
          profiles.role = 'admin'
          OR (profiles.role IN ('subscriber', 'admin') AND profiles.subscription_status = 'active')
        )
      )
    )
  );

-- Anonymous users can only see free, active content
CREATE POLICY "Anonymous users can view free active content"
  ON content_items
  FOR SELECT
  TO anon
  USING (is_active = true AND subscriber_only = false);

-- Create indexes for performance
CREATE INDEX idx_content_items_type ON content_items(type);
CREATE INDEX idx_content_items_active ON content_items(is_active);
CREATE INDEX idx_content_items_subscriber ON content_items(subscriber_only);
CREATE INDEX idx_content_items_slug ON content_items(slug);

-- Insert sample data
INSERT INTO content_items (
  slug,
  type,
  admin_label_en,
  admin_label_ko,
  admin_label_zh,
  admin_label_ja,
  admin_label_da,
  user_label_en,
  user_label_ko,
  user_label_zh,
  user_label_ja,
  user_label_da,
  description_en,
  description_ko,
  description_zh,
  description_ja,
  description_da,
  subscriber_only,
  is_active
) VALUES 
(
  'matts-blind-tastings',
  'blind_tasting',
  'Matt''s Blind Tastings (Admin)',
  '맷의 블라인드 테이스팅 (관리자)',
  '马特的盲品 (管理员)',
  'マットのブラインドテイスティング (管理者)',
  'Matts Blindsmagning (Admin)',
  'Matt''s Blind Tastings',
  '맷의 블라인드 테이스팅',
  '马特的盲品',
  'マットのブラインドテイスティング',
  'Matts Blindsmagning',
  'Weekly blind tasting sessions with Matt to test your palate and learn from fellow wine enthusiasts',
  '맷과 함께하는 주간 블라인드 테이스팅 세션으로 미각을 테스트하고 동료 와인 애호가들로부터 배워보세요',
  '与马特一起进行的每周盲品会，测试您的味觉并向其他葡萄酒爱好者学习',
  'マットと一緒に行う週次ブラインドテイスティングセッションで、味覚をテストし、仲間のワイン愛好家から学びましょう',
  'Ugentlige blindsmagninger med Matt for at teste din gane og lære af andre vinentusiaster',
  true,
  true
),
(
  'short-courses',
  'short_course',
  'Short Courses (Admin)',
  '단기 코스 (관리자)',
  '短期课程 (管理员)',
  'ショートコース (管理者)',
  'Korte Kurser (Admin)',
  'Short Courses',
  '단기 코스',
  '短期课程',
  'ショートコース',
  'Korte Kurser',
  'Focused mini-courses covering specific wine topics in digestible sessions',
  '소화하기 쉬운 세션으로 특정 와인 주제를 다루는 집중적인 미니 코스',
  '专注于特定葡萄酒主题的迷你课程，以易于消化的课程形式呈现',
  '特定のワイントピックを消化しやすいセッションで扱う集中的なミニコース',
  'Fokuserede mini-kurser, der dækker specifikke vinemner i fordøjelige sessioner',
  false,
  true
),
(
  'premium-masterclasses',
  'short_course',
  'Premium Masterclasses (Admin)',
  '프리미엄 마스터클래스 (관리자)',
  '高级大师班 (管理员)',
  'プレミアムマスタークラス (管理者)',
  'Premium Masterklasser (Admin)',
  'Premium Masterclasses',
  '프리미엄 마스터클래스',
  '高级大师班',
  'プレミアムマスタークラス',
  'Premium Masterklasser',
  'Advanced wine education sessions exclusively for premium subscribers',
  '프리미엄 구독자만을 위한 고급 와인 교육 세션',
  '专为高级订阅者提供的高级葡萄酒教育课程',
  'プレミアム購読者専用の高度なワイン教育セッション',
  'Avancerede vinuddannelsessessioner udelukkende for premium-abonnenter',
  true,
  true
);