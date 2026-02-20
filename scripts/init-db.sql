-- 랭킹 테이블 생성 (Vercel Postgres)
CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  player_name VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  highest_animal INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (빠른 정렬)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard (user_id);

-- 테스트 데이터 (선택사항)
INSERT INTO leaderboard (user_id, player_name, score, highest_animal, created_at)
VALUES
  ('demo-001', 'TestPlayer1', 1500, 9, NOW()),
  ('demo-002', 'TestPlayer2', 1200, 8, NOW()),
  ('demo-003', 'TestPlayer3', 1000, 7, NOW())
ON CONFLICT DO NOTHING;
