-- Phase 2: Username System Migration
-- Add unique username to profiles table

-- 0. Drop existing constraint if it exists (from previous failed attempts)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_format;

-- 1. Add username column if it doesn't exist (nullable for existing users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username VARCHAR(30);

-- 2. Clean up any invalid existing usernames (set to NULL)
UPDATE profiles
SET username = NULL
WHERE username IS NOT NULL 
  AND (username !~ '^[a-zA-Z0-9_]{3,30}$' OR LENGTH(username) < 3);

-- 3. Add unique index (only for non-null values)
DROP INDEX IF EXISTS idx_profiles_username_unique;
CREATE UNIQUE INDEX idx_profiles_username_unique 
ON profiles(username) 
WHERE username IS NOT NULL;

-- 4. Add constraint for username format (only validates when NOT NULL)
ALTER TABLE profiles
ADD CONSTRAINT username_format 
CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,30}$');

-- 5. Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 6. Create RPC function to check username availability
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(username_to_check)
  );
$$;

-- 7. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_username_availability(TEXT) TO authenticated;

-- Comments
COMMENT ON COLUMN profiles.username IS 'Unique username for social features (3-30 chars, alphanumeric + underscore). NULL allowed for existing users until they set one.';
COMMENT ON FUNCTION check_username_availability IS 'Check if a username is available (case-insensitive)';
