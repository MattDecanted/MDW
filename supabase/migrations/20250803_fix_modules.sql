-- 1. Ensure slug column exists
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Ensure unique constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'modules_course_slug_unique'
    ) THEN
        ALTER TABLE modules
        ADD CONSTRAINT modules_course_slug_unique UNIQUE (course_id, slug);
    END IF;
END $$;

-- 3. Delete orphaned modules
WITH orphaned AS (
  SELECT id
  FROM modules
  WHERE course_id NOT IN (SELECT id FROM courses)
)
DELETE FROM modules
WHERE id IN (SELECT id FROM orphaned);

-- 4. Insert correct modules using subselects for course_id
INSERT INTO modules (id, course_id, slug, title, description, video_url, order_index, required_role, is_published, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM courses WHERE slug = 'wine-fundamentals'), 'intro-to-wine', 'Introduction to Wine', 'Basic wine knowledge and terminology', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, 'learner', true, NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM courses WHERE slug = 'wine-fundamentals'), 'wine-tasting-techniques', 'Wine Tasting Techniques', 'Learn proper wine tasting methods and evaluation', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2, 'subscriber', true, NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM courses WHERE slug = 'french-regions'), 'burgundy-region', 'Burgundy Region', 'Deep dive into Burgundy wines and terroir', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, 'subscriber', true, NOW(), NOW())
ON CONFLICT (course_id, slug) DO NOTHING;
