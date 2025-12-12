-- Phase 4: Battle Invitations Migration
-- Create battle_invitations table for direct invitations

-- 1. Create battle_invitations table
CREATE TABLE IF NOT EXISTS battle_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battle_id, to_user_id)
);

-- 2. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_battle_invitations_to_user ON battle_invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_battle_invitations_battle ON battle_invitations(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_invitations_status ON battle_invitations(status);

-- 3. Enable RLS
ALTER TABLE battle_invitations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can view invitations they sent or received
CREATE POLICY "Users can view their battle invitations"
  ON battle_invitations FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can send invitations
CREATE POLICY "Users can send battle invitations"
  ON battle_invitations FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update invitations they received (accept/decline)
CREATE POLICY "Users can accept/decline invitations"
  ON battle_invitations FOR UPDATE
  USING (auth.uid() = to_user_id);

-- Users can delete their own invitations
CREATE POLICY "Users can delete their invitations"
  ON battle_invitations FOR DELETE
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- 5. Function to auto-expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void
LANGUAGE SQL
AS $$
  UPDATE battle_invitations
  SET status = 'expired'
  WHERE status = 'pending' 
    AND created_at < NOW() - INTERVAL '1 hour';
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION expire_old_invitations() TO authenticated;

-- Comments
COMMENT ON TABLE battle_invitations IS 'Direct battle invitations between users';
COMMENT ON COLUMN battle_invitations.status IS 'pending = waiting response, accepted = joined battle, declined = refused, expired = timeout';
