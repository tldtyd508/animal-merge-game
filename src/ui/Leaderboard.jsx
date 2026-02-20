import { useState, useEffect } from 'react'
import { ANIMALS } from '../game/animals'
import { getLeaderboard, submitScore } from '../api/leaderboard'
import { getUserId, getUserNickname, setUserNickname, getShortUserId } from '../utils/userId'
import { supabase, signInWithGoogle, signInWithKakao, signOut, getCurrentUser, onAuthStateChange } from '../lib/supabase'

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

      // 저장된 닉네임 불러오기
      const savedNickname = getUserNickname()
      if (savedNickname) {
        setPlayerName(savedNickname)
      }
    }

    // Auth 상태 변화 감지
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setAuthUser(session?.user || null)
      if (session?.user) {
        // 로그인하면 사용자 이름을 자동으로 설정
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

  const handleKakaoLogin = async () => {
    setLoading(true)
    const { error } = await signInWithKakao()
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
    // 닉네임 저장
    setUserNickname(playerName.trim())
    // 점수 제출 (authUser가 있으면 authUserId 사용, 없으면 userId 사용)
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
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#16213e',
        borderRadius: 16,
        padding: 24,
        maxWidth: 420,
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ color: '#fff', marginBottom: 20, textAlign: 'center', fontSize: 24 }}>
          🏆 랭킹
        </h2>

        {/* 로그인 상태 표시 */}
        {authUser && (
          <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ color: '#4CAF50', fontSize: 12, marginBottom: 4 }}>✓ 로그인됨</div>
              <div style={{ color: '#fff', fontSize: 14 }}>{authUser.email}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              로그아웃
            </button>
          </div>
        )}

        {/* 점수 제출 폼 */}
        {currentScore > 0 && !submitted && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20
          }}>
            {!authUser && (
              <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 12, fontSize: 11 }}>
                익명 ID: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>{getShortUserId(userId)}</code>
              </div>
            )}
            <div style={{ color: '#fff', marginBottom: 12, fontSize: 14 }}>
              당신의 점수: <strong>{currentScore}점</strong>
            </div>

            {/* OAuth 로그인 버튼 */}
            {!authUser && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 8 }}>
                  로그인하여 기록 관리하기:
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: '#fff',
                      border: 'none',
                      color: '#333',
                      padding: '10px 16px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <span>🔵</span> Google
                  </button>
                  <button
                    onClick={handleKakaoLogin}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: '#FEE500',
                      border: 'none',
                      color: '#000',
                      padding: '10px 16px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <span>💬</span> Kakao
                  </button>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center' }}>
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
                width: '100%',
                padding: 12,
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 14,
                marginBottom: 12,
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: 12,
                background: loading ? '#555' : '#4CAF50',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '제출 중...' : '점수 제출'}
            </button>
          </div>
        )}

        {/* 제출 완료 메시지 */}
        {submitted && (
          <div style={{
            background: 'rgba(76, 175, 80, 0.2)',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            textAlign: 'center',
            color: '#4CAF50'
          }}>
            ✓ 점수가 제출되었습니다!
          </div>
        )}

        {/* 랭킹 목록 */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          marginBottom: 20
        }}>
          {loading && leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>
              로딩 중...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>
              아직 랭킹이 없습니다
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={`${entry.userId}-${entry.timestamp}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  marginBottom: 8,
                  background: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  border: index < 3 ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: index < 3 ? 20 : 14,
                    fontWeight: 'bold',
                    color: index < 3 ? '#FFD700' : 'rgba(255,255,255,0.5)',
                    minWidth: 30
                  }}>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`}
                  </span>
                  <div>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                      {entry.playerName}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, display: 'flex', gap: 8, alignItems: 'center' }}>
                      {entry.userId && (
                        <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: 3 }}>
                          {getShortUserId(entry.userId)}
                        </code>
                      )}
                      {entry.highestAnimal !== undefined && entry.highestAnimal < ANIMALS.length
                        ? `최고: ${ANIMALS[entry.highestAnimal].name}`
                        : ''}
                    </div>
                  </div>
                </div>
                <div style={{ color: '#FFD700', fontSize: 16, fontWeight: 'bold' }}>
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: 12,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          닫기
        </button>
      </div>
    </div>
  )
}
