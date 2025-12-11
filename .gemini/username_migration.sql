-- Phase 2: Username System Migration
-- Add unique username to profiles table

-- 1. Add username column (nullable at first for existing users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username VARCHAR(30) UNIQUE;

-- 2. Add constraint for username format (alphanumeric + underscore only)
ALTER TABLE profiles
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$');

-- 3. Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 4. Create RPC function to check username availability
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(username_to_check)
  );
$$;

-- 5. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_username_availability(TEXT) TO authenticated;

-- Comments
COMMENT ON COLUMN profiles.username IS 'Unique username for social features (3-30 chars, alphanumeric + underscore)';
COMMENT ON FUNCTION check_username_availability IS 'Check if a username is available (case-insensitive)';
