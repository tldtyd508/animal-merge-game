-- 랭킹 테이블 생성 (Supabase Postgres)
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255),  -- UUID for anonymous users
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- Supabase Auth user
  player_name VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  highest_animal INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (빠른 정렬)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard (user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_auth_user ON leaderboard (auth_user_id);

-- Row Level Security (RLS) 활성화
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사람이 랭킹을 읽을 수 있음
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

-- 정책: 인증된 사용자는 자신의 점수를 제출할 수 있음
CREATE POLICY "Authenticated users can insert their scores"
  ON leaderboard FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- 정책: 익명 사용자도 점수를 제출할 수 있음 (auth_user_id가 NULL인 경우)
CREATE POLICY "Anonymous users can insert scores"
  ON leaderboard FOR INSERT
  WITH CHECK (auth_user_id IS NULL);

-- 테스트 데이터 (선택사항)
INSERT INTO leaderboard (user_id, player_name, score, highest_animal, created_at)
VALUES
  ('demo-001', 'TestPlayer1', 1500, 9, NOW()),
  ('demo-002', 'TestPlayer2', 1200, 8, NOW()),
  ('demo-003', 'TestPlayer3', 1000, 7, NOW())
ON CONFLICT DO NOTHING;
