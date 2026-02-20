import { useState, useEffect } from 'react'
import { ANIMALS } from '../game/animals'
import { getLeaderboard, submitScore } from '../api/leaderboard'
import { getUserId, getUserNickname, setUserNickname, getShortUserId } from '../utils/userId'

export default function Leaderboard({ isOpen, onClose, currentScore, highestAnimal }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const userId = getUserId()

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard()
      // 저장된 닉네임 불러오기
      const savedNickname = getUserNickname()
      if (savedNickname) {
        setPlayerName(savedNickname)
      }
    }
  }, [isOpen])

  const loadLeaderboard = async () => {
    setLoading(true)
    const data = await getLeaderboard()
    setLeaderboard(data)
    setLoading(false)
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
    // 점수 제출 (userId 포함)
    await submitScore(userId, playerName.trim(), currentScore, highestAnimal)
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

        {/* 점수 제출 폼 */}
        {currentScore > 0 && !submitted && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4, fontSize: 11 }}>
              당신의 ID: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>{getShortUserId(userId)}</code>
            </div>
            <div style={{ color: '#fff', marginBottom: 8, fontSize: 14 }}>
              당신의 점수: <strong>{currentScore}점</strong>
            </div>
            <input
              type="text"
              placeholder="이름 입력 (최대 20자)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              style={{
                width: '100%',
                padding: '10px',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                marginBottom: 8
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '제출 중...' : '점수 제출'}
            </button>
          </div>
        )}

        {/* 랭킹 목록 */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '40px 0' }}>
            로딩 중...
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px 0' }}>
            아직 등록된 점수가 없습니다
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: index < 3 ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  border: index < 3 ? '1px solid rgba(255,215,0,0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#fff',
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
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '12px',
            background: '#e94560',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          닫기
        </button>
      </div>
    </div>
  )
}
