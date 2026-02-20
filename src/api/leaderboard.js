// 랭킹 시스템 API 클라이언트
// 백엔드 API 엔드포인트 (실제 배포 시 환경변수로 관리)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// 랭킹 목록 조회 (상위 100명)
export async function getLeaderboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard`)
    if (!response.ok) throw new Error('Failed to fetch leaderboard')
    return await response.json()
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    // 백엔드 없을 때 더미 데이터 반환
    return getMockLeaderboard()
  }
}

// 점수 제출
export async function submitScore(userId, authUserId, playerName, score, highestAnimal) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        authUserId,
        playerName,
        score,
        highestAnimal,
        timestamp: new Date().toISOString()
      })
    })
    if (!response.ok) throw new Error('Failed to submit score')
    return await response.json()
  } catch (error) {
    console.error('Score submission error:', error)
    // 로컬에 저장
    saveScoreLocally(userId || authUserId, playerName, score, highestAnimal)
    return { success: false, message: 'Saved locally' }
  }
}

// 내 순위 조회
export async function getMyRank(playerName) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard/rank/${encodeURIComponent(playerName)}`)
    if (!response.ok) throw new Error('Failed to fetch rank')
    return await response.json()
  } catch (error) {
    console.error('Rank fetch error:', error)
    return { rank: null, score: 0 }
  }
}

// 로컬 저장 (백엔드 없을 때)
function saveScoreLocally(userId, playerName, score, highestAnimal) {
  const localScores = JSON.parse(localStorage.getItem('localLeaderboard') || '[]')
  localScores.push({
    userId,
    playerName,
    score,
    highestAnimal,
    timestamp: new Date().toISOString()
  })
  // 최대 100개만 저장
  localScores.sort((a, b) => b.score - a.score)
  const top100 = localScores.slice(0, 100)
  localStorage.setItem('localLeaderboard', JSON.stringify(top100))
}

// 더미 데이터 (개발/테스트용)
function getMockLeaderboard() {
  const localScores = JSON.parse(localStorage.getItem('localLeaderboard') || '[]')
  if (localScores.length > 0) return localScores

  // 기본 더미 데이터
  return [
    { userId: 'demo-001', playerName: 'Player1', score: 1500, highestAnimal: 9, timestamp: new Date().toISOString() },
    { userId: 'demo-002', playerName: 'Player2', score: 1200, highestAnimal: 8, timestamp: new Date().toISOString() },
    { userId: 'demo-003', playerName: 'Player3', score: 1000, highestAnimal: 7, timestamp: new Date().toISOString() },
    { userId: 'demo-004', playerName: 'Player4', score: 800, highestAnimal: 7, timestamp: new Date().toISOString() },
    { userId: 'demo-005', playerName: 'Player5', score: 600, highestAnimal: 6, timestamp: new Date().toISOString() },
  ]
}

/*
=== 백엔드 API 설계 ===

1. GET /api/leaderboard
   - 설명: 랭킹 목록 조회 (상위 100명)
   - 응답: [{ playerName, score, highestAnimal, timestamp, rank }]

2. POST /api/leaderboard
   - 설명: 점수 제출
   - 요청: { playerName, score, highestAnimal, timestamp }
   - 응답: { success: true, rank, message }

3. GET /api/leaderboard/rank/:playerName
   - 설명: 특정 플레이어 순위 조회
   - 응답: { rank, score, playerName }

=== 데이터베이스 스키마 ===

Table: leaderboard
- id: INT PRIMARY KEY AUTO_INCREMENT
- player_name: VARCHAR(50)
- score: INT
- highest_animal: INT
- timestamp: DATETIME
- INDEX (score DESC, timestamp ASC)

=== 필요한 백엔드 기술 스택 ===
- Node.js + Express
- MySQL 또는 PostgreSQL
- CORS 설정
- Rate limiting (DDoS 방지)
- 입력 검증 (SQL Injection 방지)
*/
