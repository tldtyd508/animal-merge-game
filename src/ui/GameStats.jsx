import { useState } from 'react'
import { ANIMALS } from '../game/animals'

// 게임 통계 컴포넌트
export default function GameStats({ isOpen, onClose }) {
  const [stats] = useState(() => {
    const saved = localStorage.getItem('animalGameStats')
    return saved ? JSON.parse(saved) : {
      totalGames: 0,
      totalPlayTime: 0,
      highestAnimal: 0,
      totalScore: 0,
      maxCombo: 0
    }
  })

  if (!isOpen) return null

  const avgScore = stats.totalGames > 0 ? Math.floor(stats.totalScore / stats.totalGames) : 0
  const playTimeMin = Math.floor(stats.totalPlayTime / 60)
  const playTimeSec = stats.totalPlayTime % 60

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
      zIndex: 1000
    }}>
      <div style={{
        background: '#16213e',
        borderRadius: 16,
        padding: 24,
        maxWidth: 360,
        width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ color: '#fff', marginBottom: 20, textAlign: 'center', fontSize: 24 }}>
          📊 게임 통계
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 총 게임 횟수 */}
          <StatItem
            icon="🎮"
            label="총 게임 횟수"
            value={`${stats.totalGames}회`}
          />

          {/* 총 플레이 시간 */}
          <StatItem
            icon="⏱️"
            label="총 플레이 시간"
            value={`${playTimeMin}분 ${playTimeSec}초`}
          />

          {/* 최고 도달 동물 */}
          <StatItem
            icon="🏆"
            label="최고 도달 동물"
            value={stats.highestAnimal > 0 ? ANIMALS[stats.highestAnimal].name : '-'}
          />

          {/* 평균 점수 */}
          <StatItem
            icon="📈"
            label="평균 점수"
            value={avgScore > 0 ? `${avgScore}점` : '-'}
          />

          {/* 최고 콤보 */}
          <StatItem
            icon="🔥"
            label="최고 콤보"
            value={stats.maxCombo > 0 ? `${stats.maxCombo} COMBO` : '-'}
          />
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 24,
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

function StatItem({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 8
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{label}</span>
      </div>
      <span style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{value}</span>
    </div>
  )
}
