// Vercel Serverless Function - 랭킹 API (Supabase)
import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 (서버용 - Service Role Key 사용)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// 메인 핸들러
export default async function handler(req, res) {
  // CORS 헤더 적용
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Supabase 설정 확인
  if (!supabase) {
    return res.status(500).json({
      success: false,
      message: 'Database not configured',
    })
  }

  try {
    // GET: 랭킹 목록 조회
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('user_id, auth_user_id, player_name, score, highest_animal, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error

      return res.status(200).json(
        data.map((row, index) => ({
          userId: row.user_id || row.auth_user_id,
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
      const { userId, authUserId, playerName, score, highestAnimal } = req.body

      // 입력 검증
      if ((!userId && !authUserId) || !playerName || typeof score !== 'number') {
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
      const insertData = {
        player_name: playerName,
        score,
        highest_animal: highestAnimal || 0,
      }

      // Auth 사용자인 경우 auth_user_id, 아니면 user_id 사용
      if (authUserId) {
        insertData.auth_user_id = authUserId
      } else {
        insertData.user_id = userId
      }

      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert([insertData])

      if (insertError) throw insertError

      // 순위 계산
      const { count, error: countError } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .gt('score', score)

      if (countError) throw countError

      const rank = (count || 0) + 1

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
