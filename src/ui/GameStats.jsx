import { useState } from 'react'
import { ANIMALS } from '../game/animals'

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
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(26, 21, 32, 0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#2A2235', borderRadius: 16, padding: 24,
        maxWidth: 400, width: '90%', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 0 0 1px rgba(74, 61, 92, 0.5), 0 16px 40px rgba(0,0,0,0.4)',
      }}>
        <h2 style={{
          fontFamily: "'Black Han Sans', sans-serif",
          color: '#F5F0FF', fontSize: 22, textAlign: 'center',
          marginBottom: 20, marginTop: 0,
        }}>
          게임 통계
        </h2>

        <div style={{
          background: '#352B42', borderRadius: 12, overflow: 'hidden',
        }}>
          <StatItem label="총 게임 횟수" value={`${stats.totalGames}회`} />
          <StatItem label="총 플레이 시간" value={`${playTimeMin}분 ${playTimeSec}초`} />
          <StatItem label="최고 도달 동물" value={stats.highestAnimal > 0 ? ANIMALS[stats.highestAnimal].name : '-'} />
          <StatItem label="평균 점수" value={avgScore > 0 ? `${avgScore}점` : '-'} />
          <StatItem label="최고 콤보" value={stats.maxCombo > 0 ? `${stats.maxCombo} COMBO` : '-'} last />
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 24, padding: 12,
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

function StatItem({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid rgba(74, 61, 92, 0.3)',
    }}>
      <span style={{
        color: '#B8A9CC',
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: 14, fontWeight: 400,
      }}>
        {label}
      </span>
      <span style={{
        color: '#F5F0FF',
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: 15, fontWeight: 700,
      }}>
        {value}
      </span>
    </div>
  )
}
