import { useState, useEffect } from 'react'
import { ANIMALS } from '../game/animals'
import { getLeaderboard, submitScore } from '../api/leaderboard'
import { getUserId, getUserNickname, setUserNickname, getShortUserId } from '../utils/userId'
import { supabase, signInWithGoogle, signOut, getCurrentUser, onAuthStateChange } from '../lib/supabase'

// 메달 뱃지 컴포넌트
function RankBadge({ rank }) {
  if (rank <= 3) {
    const colors = {
      1: 'linear-gradient(135deg, #F7C948, #D4A62A)',
      2: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)',
      3: 'linear-gradient(135deg, #CD7F32, #A0622C)',
    }
    return (
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: colors[rank], display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Black Han Sans', sans-serif",
        fontSize: 14, fontWeight: 700, color: '#1A1520', flexShrink: 0,
      }}>
        {rank}
      </div>
    )
  }
  return (
    <div style={{
      width: 28, textAlign: 'center', color: '#7A6B8A',
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: 14, fontWeight: 500, flexShrink: 0,
    }}>
      {rank}
    </div>
  )
}

export default function Leaderboard({ isOpen, onClose, currentScore, highestAnimal }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const userId = getUserId()

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard()
      loadAuthUser()

      const savedNickname = getUserNickname()
      if (savedNickname) {
        setPlayerName(savedNickname)
      }
    }

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setAuthUser(session?.user || null)
      if (session?.user) {
        const name = session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email?.split('@')[0]
        if (name) setPlayerName(name)
      }
    })

    return () => subscription?.unsubscribe()
  }, [isOpen])

  const loadAuthUser = async () => {
    const user = await getCurrentUser()
    setAuthUser(user)
    if (user) {
      const name = user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email?.split('@')[0]
      if (name) setPlayerName(name)
    }
  }

  const loadLeaderboard = async () => {
    setLoading(true)
    const data = await getLeaderboard()
    setLeaderboard(data)
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      alert(`로그인 실패: ${error.message}`)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      setAuthUser(null)
      setPlayerName('')
    }
  }

  const handleSubmit = async () => {
    if (!playerName.trim()) {
      alert('이름을 입력해주세요!')
      return
    }
    if (playerName.length > 20) {
      alert('이름은 20자 이하로 입력해주세요!')
      return
    }

    setLoading(true)
    setUserNickname(playerName.trim())
    await submitScore(
      authUser ? null : userId,
      authUser ? authUser.id : null,
      playerName.trim(),
      currentScore,
      highestAnimal
    )
    await loadLeaderboard()
    setSubmitted(true)
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(26, 21, 32, 0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, overflowY: 'auto',
    }}>
      <div style={{
        background: '#2A2235', borderRadius: 16, padding: 24,
        maxWidth: 420, width: '90%', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 0 0 1px rgba(74, 61, 92, 0.5), 0 16px 40px rgba(0,0,0,0.4)',
      }}>
        <h2 style={{
          fontFamily: "'Black Han Sans', sans-serif",
          color: '#F5F0FF', fontSize: 22, textAlign: 'center',
          marginBottom: 20, marginTop: 0,
        }}>
          랭킹
        </h2>

        {/* 로그인 상태 표시 */}
        {authUser && (
          <div style={{
            background: 'rgba(39, 174, 96, 0.1)',
            border: '1px solid rgba(39, 174, 96, 0.25)',
            padding: 12, borderRadius: 10, marginBottom: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ color: '#27AE60', fontSize: 12, marginBottom: 4, fontFamily: "'Noto Sans KR', sans-serif" }}>로그인됨</div>
              <div style={{ color: '#F5F0FF', fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>{authUser.email}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: '#352B42', border: '1px solid #4A3D5C',
                color: '#B8A9CC', padding: '6px 12px', borderRadius: 6,
                cursor: 'pointer', fontSize: 12,
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >
              로그아웃
            </button>
          </div>
        )}

        {/* 점수 제출 폼 */}
        {currentScore > 0 && !submitted && (
          <div style={{
            background: '#352B42', padding: 16, borderRadius: 12, marginBottom: 20,
          }}>
            {!authUser && (
              <div style={{ color: '#7A6B8A', marginBottom: 12, fontSize: 11, fontFamily: "'Noto Sans KR', sans-serif" }}>
                익명 ID: <code style={{ background: '#2A2235', padding: '2px 6px', borderRadius: 4, color: '#B8A9CC' }}>{getShortUserId(userId)}</code>
              </div>
            )}
            <div style={{ color: '#F5F0FF', marginBottom: 12, fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>
              당신의 점수: <strong>{currentScore}점</strong>
            </div>

            {/* OAuth 로그인 버튼 */}
            {!authUser && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#B8A9CC', fontSize: 12, marginBottom: 8, fontFamily: "'Noto Sans KR', sans-serif" }}>
                  로그인하여 기록 관리하기:
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                      width: '100%', background: '#fff', border: 'none',
                      color: '#333', padding: '10px 16px', borderRadius: 8,
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontFamily: "'Noto Sans KR', sans-serif",
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <span style={{
                      fontWeight: 700, fontSize: 15,
                      background: 'linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>G</span>
                    Google 로그인
                  </button>
                </div>
                <div style={{ color: '#7A6B8A', fontSize: 11, textAlign: 'center', fontFamily: "'Noto Sans KR', sans-serif" }}>
                  또는 익명으로 제출
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="이름 입력 (최대 20자)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 8,
                border: '1.5px solid #4A3D5C', background: '#2A2235',
                color: '#F5F0FF', fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: 14, marginBottom: 10, boxSizing: 'border-box', outline: 'none',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: 12,
                background: loading ? '#3D3350' : '#2D8F4E',
                border: 'none', borderRadius: 8,
                color: loading ? '#7A6B8A' : '#fff',
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 2px 8px rgba(45, 143, 78, 0.25)',
              }}
            >
              {loading ? '제출 중...' : '점수 제출'}
            </button>
          </div>
        )}

        {/* 제출 완료 메시지 */}
        {submitted && (
          <div style={{
            background: 'rgba(39, 174, 96, 0.1)',
            border: '1px solid rgba(39, 174, 96, 0.2)',
            padding: 14, borderRadius: 10, marginBottom: 20,
            textAlign: 'center', color: '#27AE60', fontSize: 14, fontWeight: 500,
            fontFamily: "'Noto Sans KR', sans-serif",
          }}>
            점수가 제출되었습니다!
          </div>
        )}

        {/* 랭킹 목록 */}
        <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 20 }}>
          {loading && leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#7A6B8A', padding: 40, fontFamily: "'Noto Sans KR', sans-serif" }}>
              로딩 중...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#7A6B8A', padding: 40, fontFamily: "'Noto Sans KR', sans-serif" }}>
              아직 랭킹이 없습니다
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const rank = index + 1
              const isTop3 = rank <= 3
              return (
                <div
                  key={`${entry.userId}-${entry.timestamp}`}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 10,
                    marginBottom: 6, gap: 12,
                    background: isTop3 ? 'rgba(247, 201, 72, 0.06)' : 'transparent',
                    border: isTop3 ? '1px solid rgba(247, 201, 72, 0.12)' : '1px solid transparent',
                  }}
                >
                  <RankBadge rank={rank} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: '#F5F0FF', fontSize: 14, fontWeight: 600,
                      fontFamily: "'Noto Sans KR', sans-serif",
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.playerName}
                    </div>
                    <div style={{
                      color: '#7A6B8A', fontSize: 11,
                      display: 'flex', gap: 8, alignItems: 'center',
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}>
                      {entry.userId && (
                        <code style={{ background: '#2A2235', padding: '1px 4px', borderRadius: 3, color: '#7A6B8A' }}>
                          {getShortUserId(entry.userId)}
                        </code>
                      )}
                      {entry.highestAnimal !== undefined && entry.highestAnimal < ANIMALS.length
                        ? `최고: ${ANIMALS[entry.highestAnimal].name}`
                        : ''}
                    </div>
                  </div>
                  <div style={{
                    color: '#F7C948',
                    fontFamily: "'Black Han Sans', sans-serif",
                    fontSize: 16,
                  }}>
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: 12,
            background: '#352B42', border: '1px solid #4A3D5C',
            borderRadius: 10, color: '#B8A9CC',
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  )
}
