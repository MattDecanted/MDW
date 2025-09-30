# IMMEDIATE SUPABASE CONSTRAINT FIX

## Step 1: Connect to Supabase
1. Click "Connect to Supabase" button in Bolt.new (top-right)
2. Follow the setup wizard
3. Wait for environment variables to be configured

## Step 2: Copy This SQL and Run in Supabase Dashboard

Go to **Supabase Dashboard → SQL Editor** and run this exact SQL:

```sql
/*
  # Fix translations constraint to allow community_post
  
  This migration fixes the constraint error by updating the translations table
  to allow 'community_post' as a valid content_type.
*/

-- Check current constraint
DO $$
BEGIN
  RAISE NOTICE 'Checking current translations table constraint...';
END $$;

-- Drop the existing constraint that's causing the error
ALTER TABLE translations DROP CONSTRAINT IF EXISTS translations_content_type_check;

-- Add the correct constraint that includes community_post
ALTER TABLE translations ADD CONSTRAINT translations_content_type_check 
CHECK (content_type = ANY (ARRAY['course'::text, 'module'::text, 'quiz'::text, 'community_post'::text]));

-- Test the fix with the exact failing row from the error
INSERT INTO translations (
  id,
  content_type, 
  content_id, 
  language_code, 
  field_name, 
  translated_text,
  created_at,
  updated_at
) VALUES (
  '9e22d032-4f37-4119-b2a6-ecfcadbdc211',
  'community_post',
  '550e8400-e29b-41d4-a716-446655440020',
  'ko',
  'title',
  'Matt Decanted 커뮤니티에 오신 것을 환영합니다!',
  '2025-08-03 02:00:48.64221+00',
  '2025-08-03 02:00:48.64221+00'
) ON CONFLICT (id) DO UPDATE SET
  translated_text = EXCLUDED.translated_text,
  updated_at = EXCLUDED.updated_at;

-- Verify the constraint is working
DO $$
BEGIN
  RAISE NOTICE 'Constraint fixed! community_post is now allowed in translations table.';
END $$;
```

## Step 3: Verify Success
You should see:
- ✅ Constraint dropped and recreated
- ✅ Test insertion succeeds  
- ✅ "Constraint fixed!" message

## Alternative: File Location
The SQL is also in: `supabase/migrations/immediate_constraint_fix.sql`