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
    // 햄스터를 중앙에 크게 그리기
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
      background: '#0a0a1a',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      {/* 마스코트 */}
      <canvas ref={mascotRef} width={160} height={160} style={{ marginBottom: 16 }} />

      {/* 타이틀 */}
      <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
        동물 합치기
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, margin: 0, marginBottom: 32 }}>
        같은 동물을 합쳐서 진화!
      </p>

      {/* 로그인 상태 */}
      {authUser && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.15)',
          border: '1px solid rgba(76, 175, 80, 0.4)',
          padding: 12,
          borderRadius: 12,
          marginBottom: 16,
          width: 280,
          textAlign: 'center'
        }}>
          <span style={{ color: '#4CAF50', fontSize: 14 }}>
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
          width: 280,
          padding: 14,
          borderRadius: 12,
          border: '2px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 16,
          boxSizing: 'border-box',
          outline: 'none'
        }}
      />

      {/* Google 로그인 */}
      {!authUser && (
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: 280,
            padding: 14,
            background: '#fff',
            border: 'none',
            borderRadius: 12,
            color: '#333',
            fontSize: 15,
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <span style={{ fontSize: 18 }}>G</span> Google로 로그인
        </button>
      )}

      {/* 게임 시작 */}
      <button
        onClick={handleStart}
        style={{
          width: 280,
          padding: 16,
          background: '#e94560',
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: 16
        }}
      >
        {authUser ? '게임 시작' : '게스트로 시작'}
      </button>

      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
        랭킹에 등록하려면 Google 로그인을 권장합니다
      </p>
    </div>
  )
}
