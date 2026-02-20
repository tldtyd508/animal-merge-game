// Vercel Serverless Function - 랭킹 API
import { sql } from '@vercel/postgres'

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// 메인 핸들러
export default async function handler(req, res) {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }

  try {
    // GET: 랭킹 목록 조회
    if (req.method === 'GET') {
      const result = await sql`
        SELECT user_id, player_name, score, highest_animal, created_at
        FROM leaderboard
        ORDER BY score DESC, created_at ASC
        LIMIT 100
      `

      return res.status(200).json(
        result.rows.map((row, index) => ({
          userId: row.user_id,
          playerName: row.player_name,
          score: row.score,
          highestAnimal: row.highest_animal,
          timestamp: row.created_at,
          rank: index + 1,
        }))
      )
    }

    // POST: 점수 제출
    if (req.method === 'POST') {
      const { userId, playerName, score, highestAnimal } = req.body

      // 입력 검증
      if (!userId || !playerName || typeof score !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
        })
      }

      // 닉네임 길이 제한
      if (playerName.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Player name too long (max 20 characters)',
        })
      }

      // 점수 범위 검증 (부정 방지)
      if (score < 0 || score > 100000) {
        return res.status(400).json({
          success: false,
          message: 'Invalid score range',
        })
      }

      // 점수 저장
      await sql`
        INSERT INTO leaderboard (user_id, player_name, score, highest_animal, created_at)
        VALUES (${userId}, ${playerName}, ${score}, ${highestAnimal || 0}, NOW())
      `

      // 순위 계산
      const rankResult = await sql`
        SELECT COUNT(*) as rank
        FROM leaderboard
        WHERE score > ${score}
      `
      const rank = parseInt(rankResult.rows[0].rank) + 1

      return res.status(200).json({
        success: true,
        rank,
        message: 'Score submitted successfully',
      })
    }

    // 지원하지 않는 메소드
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Vercel config
export const config = {
  runtime: 'edge',
}
