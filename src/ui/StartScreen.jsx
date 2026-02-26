import { useState, useEffect, useRef } from 'react'
import { signInWithGoogle, getCurrentUser, onAuthStateChange } from '../lib/supabase'
import { getUserNickname, setUserNickname } from '../utils/userId'
import { ANIMALS } from '../game/animals'
import { drawAnimal } from '../game/drawAnimal'

export default function StartScreen({ onStart }) {
  const [nickname, setNickname] = useState('')
  const [authUser, setAuthUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const mascotRef = useRef(null)

  useEffect(() => {
    // 저장된 닉네임 불러오기
    const saved = getUserNickname()
    if (saved) setNickname(saved)

    // 로그인 상태 확인
    getCurrentUser().then(user => {
      setAuthUser(user)
      if (user) {
        const name = user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split('@')[0]
        if (name && !saved) setNickname(name)
      }
      setChecking(false)
    })

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setAuthUser(session?.user || null)
      if (session?.user) {
        const name = session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email?.split('@')[0]
        if (name) setNickname(name)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // 마스코트 캔버스 그리기
  useEffect(() => {
    const canvas = mascotRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 160, 160)
    drawAnimal(ctx, 80, 80, 60, 2)
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) alert(`로그인 실패: ${error.message}`)
    setLoading(false)
  }

  const handleStart = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요!')
      return
    }
    if (nickname.length > 20) {
      alert('닉네임은 20자 이하로 입력해주세요!')
      return
    }
    setUserNickname(nickname.trim())
    onStart(nickname.trim())
  }

  if (checking) return null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1A1520',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: "'Noto Sans KR', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(45, 143, 78, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(242, 153, 74, 0.04) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* 마스코트 */}
      <canvas ref={mascotRef} width={160} height={160} style={{ marginBottom: 16, position: 'relative' }} />

      {/* 타이틀 */}
      <h1 style={{
        fontFamily: "'Black Han Sans', sans-serif",
        fontSize: 36, color: '#F5F0FF',
        margin: 0, marginBottom: 8, letterSpacing: -1,
        position: 'relative',
      }}>
        동물합치기
      </h1>
      <p style={{
        color: '#B8A9CC', fontSize: 15, fontWeight: 500,
        margin: 0, marginBottom: 32,
        position: 'relative',
      }}>
        같은 동물을 합쳐 진화!
      </p>

      {/* 로그인 상태 */}
      {authUser && (
        <div style={{
          background: 'rgba(39, 174, 96, 0.1)',
          border: '1px solid rgba(39, 174, 96, 0.25)',
          padding: '10px 16px', borderRadius: 10,
          marginBottom: 16, width: 280, textAlign: 'center',
          position: 'relative',
        }}>
          <span style={{ color: '#27AE60', fontSize: 13 }}>
            {authUser.email} 로그인됨
          </span>
        </div>
      )}

      {/* 닉네임 입력 */}
      <input
        type="text"
        placeholder="닉네임을 입력하세요"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={20}
        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        style={{
          width: 280, padding: '14px 16px', borderRadius: 12,
          border: '2px solid #4A3D5C', background: '#2A2235',
          color: '#F5F0FF', fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: 15, textAlign: 'center',
          marginBottom: 12, boxSizing: 'border-box', outline: 'none',
          position: 'relative',
        }}
      />

      {/* Google 로그인 */}
      {!authUser && (
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: 280, padding: 13,
            background: '#fff', border: 'none', borderRadius: 12,
            color: '#333', fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          <span style={{
            fontWeight: 700, fontSize: 16,
            background: 'linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>G</span>
          Google로 로그인
        </button>
      )}

      {/* 게임 시작 */}
      <button
        onClick={handleStart}
        style={{
          width: 280, padding: 16,
          background: '#2D8F4E', border: 'none', borderRadius: 12,
          color: '#fff', fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: 17, fontWeight: 700,
          cursor: 'pointer', marginBottom: 16,
          boxShadow: '0 4px 12px rgba(45, 143, 78, 0.3)',
          position: 'relative',
        }}
      >
        {authUser ? '게임 시작' : '게스트로 시작'}
      </button>

      <p style={{ color: '#7A6B8A', fontSize: 12, margin: 0, position: 'relative' }}>
        랭킹에 등록하려면 Google 로그인을 권장합니다
      </p>
    </div>
  )
}
