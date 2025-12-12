-- Phase 3: Friends System Migration
-- Create friendships table for social features

-- 1. Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 2. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can see their own friendships (sent and received)
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they're part of (accept/reject)
CREATE POLICY "Users can update their friendships"
  ON friendships FOR UPDATE
  USING (auth.uid() = friend_id OR auth.uid() = user_id);

-- Users can delete their own friendships
CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 5. Create helper function to check friendship status
CREATE OR REPLACE FUNCTION get_friendship_status(other_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN f.status IS NULL THEN 'none'
      WHEN f.user_id = auth.uid() THEN 'sent_' || f.status
      WHEN f.friend_id = auth.uid() THEN 'received_' || f.status
    END
  FROM friendships f
  WHERE (f.user_id = auth.uid() AND f.friend_id = other_user_id)
     OR (f.user_id = other_user_id AND f.friend_id = auth.uid())
  LIMIT 1;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION get_friendship_status(UUID) TO authenticated;

-- Comments
COMMENT ON TABLE friendships IS 'Stores friend relationships between users';
COMMENT ON COLUMN friendships.status IS 'pending = request sent, accepted = friends, rejected = request declined';
COMMENT ON FUNCTION get_friendship_status IS 'Get friendship status with another user';
