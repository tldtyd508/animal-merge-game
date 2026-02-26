import { useEffect, useRef, useState } from 'react'
import { ANIMALS, DROP_TYPES } from './animals'
import { CANVAS_W as W, CANVAS_H as H, LEFT, RIGHT, DROP_Y, DANGER_Y, SUB_STEPS, nextId, updateBall, resolvePair, setGravityScale } from './physics'
import { render } from './renderer'
import { playDrop, playMerge, playCombo, playGameOver, toggleMute, vibrate } from './sound'
import GameStats from '../ui/GameStats'
import Leaderboard from '../ui/Leaderboard'

// ── 난이도 시스템 ──
const DIFFICULTIES = [
  { minScore: 0,    level: 1, gravityScale: 1.0,  cooldown: 500, autoDropMs: 0,     dropWeights: [1,1,1,1,1] },
  { minScore: 300,  level: 2, gravityScale: 1.1,  cooldown: 450, autoDropMs: 10000, dropWeights: [1,1,1,1,1] },
  { minScore: 800,  level: 3, gravityScale: 1.25, cooldown: 400, autoDropMs: 7000,  dropWeights: [0.7,1,1,1.2,1.2] },
  { minScore: 1500, level: 4, gravityScale: 1.4,  cooldown: 350, autoDropMs: 5000,  dropWeights: [0.5,0.8,1,1.3,1.5] },
  { minScore: 3000, level: 5, gravityScale: 1.6,  cooldown: 300, autoDropMs: 3500,  dropWeights: [0.3,0.7,1,1.3,1.5] },
  { minScore: 5000, level: 6, gravityScale: 1.8,  cooldown: 250, autoDropMs: 2500,  dropWeights: [0.2,0.5,1,1.5,1.8] },
]

function getDifficulty(score) {
  for (let i = DIFFICULTIES.length - 1; i >= 0; i--) {
    if (score >= DIFFICULTIES[i].minScore) return DIFFICULTIES[i]
  }
  return DIFFICULTIES[0]
}

function weightedRandom(weights) {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

export default function MergeGame({ playerName }) {
  const cvs = useRef(null)
  const g = useRef({
    balls: [],
    score: 0,
    cur: Math.floor(Math.random() * DROP_TYPES),
    nxt: Math.floor(Math.random() * DROP_TYPES),
    nxt2: Math.floor(Math.random() * DROP_TYPES),
    dropX: W / 2,
    canDrop: true,
    over: false,
    fx: [],
    scorePopups: [],
    particles: [],
    combo: 0,
    comboTimer: 0,
    dangerT: 0,
    shakeT: 0,
    maxAnimal: 0,
    maxCombo: 0,
    isNewHigh: false,
    // 난이도 관련
    level: 1,
    prevLevel: 1,
    levelUpT: 0,
    dropTimer: 0,
    autoDropMax: 0,
  })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('animalGameHighScore')
      return saved ? parseInt(saved) : 0
    } catch (error) {
      return 0
    }
  })
  const [over, setOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('animalGameTutorialSeen')
  })
  const gameStartTime = useRef(Date.now())
  const maxAnimalReached = useRef(0)
  const maxComboReached = useRef(0)
  const cooldownTimerRef = useRef(null)
  const highScoreRef = useRef(highScore)

  // 캔버스 좌표 변환
  const pos = (e) => {
    const c = cvs.current
    const rect = c.getBoundingClientRect()
    const sx = W / rect.width
    const touch = e.touches?.[0] || e.changedTouches?.[0]
    const cx = touch ? touch.clientX : e.clientX
    return { x: (cx - rect.left) * sx }
  }

  useEffect(() => {
    let raf
    const step = () => {
      const s = g.current

      if (!s.over && !paused) {
        // ── 난이도 적용 ──
        const diff = getDifficulty(s.score)
        setGravityScale(diff.gravityScale)
        s.level = diff.level
        s.autoDropMax = diff.autoDropMs

        // 레벨업 감지
        if (diff.level > s.prevLevel) {
          s.levelUpT = 90
          vibrate(100)
        }
        s.prevLevel = diff.level

        // ── 자동 드롭 타이머 (테트리스식 압박) ──
        if (s.canDrop && diff.autoDropMs > 0) {
          s.dropTimer += 16.67
          if (s.dropTimer >= diff.autoDropMs) {
            const r = ANIMALS[s.cur].r
            const cx = Math.max(LEFT + r, Math.min(RIGHT - r, s.dropX))
            s.balls.push({
              id: nextId(), type: s.cur,
              x: cx, y: DROP_Y, vx: 0, vy: 0,
              r, born: Date.now(),
            })
            playDrop()
            s.cur = s.nxt
            s.nxt = s.nxt2
            s.nxt2 = weightedRandom(diff.dropWeights)
            s.canDrop = false
            s.dropTimer = 0
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
            cooldownTimerRef.current = setTimeout(() => { s.canDrop = true }, diff.cooldown)
          }
        } else if (!s.canDrop) {
          s.dropTimer = 0
        }

        // 물리 서브스텝
        for (let sub = 0; sub < SUB_STEPS; sub++) {
          for (const b of s.balls) updateBall(b)
          for (let i = 0; i < s.balls.length; i++) {
            for (let j = i + 1; j < s.balls.length; j++) {
              resolvePair(s.balls[i], s.balls[j])
            }
          }
        }

        // 글로벌 속도 댐핑
        for (const b of s.balls) {
          if (Math.abs(b.vx) < 0.15) b.vx = 0
          if (Math.abs(b.vy) < 0.3) b.vy = 0
        }

        // 합체 감지
        const merges = []
        for (let i = 0; i < s.balls.length; i++) {
          for (let j = i + 1; j < s.balls.length; j++) {
            const a = s.balls[i], b2 = s.balls[j]
            const dx = b2.x - a.x
            const dy = b2.y - a.y
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d < (a.r + b2.r) * 0.95 && a.type === b2.type && a.type < ANIMALS.length - 1 && !a.del && !b2.del) {
              merges.push([i, j])
              a.del = true
              b2.del = true
            }
          }
        }

        // 합체 실행
        if (merges.length > 0) {
          s.combo += merges.length
          s.comboTimer = 180
          if (s.combo > maxComboReached.current) {
            maxComboReached.current = s.combo
          }

          for (const [i, j] of merges) {
            const a = s.balls[i], b2 = s.balls[j]
            const nt = a.type + 1
            const mergeX = (a.x + b2.x) / 2
            const mergeY = (a.y + b2.y) / 2
            s.balls.push({
              id: nextId(), type: nt,
              x: mergeX, y: mergeY,
              vx: 0, vy: -1, r: ANIMALS[nt].r,
              born: Date.now(),
            })
            if (nt > maxAnimalReached.current) {
              maxAnimalReached.current = nt
            }
            const comboMultiplier = Math.min(1 + (s.combo - 1) * 0.2, 3)
            const basePts = ANIMALS[nt].pts
            const pts = Math.floor(basePts * comboMultiplier)
            s.score += pts
            s.fx.push({
              x: mergeX, y: mergeY,
              r: ANIMALS[nt].r, t: 0, name: ANIMALS[nt].name,
            })
            s.scorePopups.push({
              x: mergeX, y: mergeY - 10, t: 0, pts, combo: s.combo
            })
            const particleCount = 12 + Math.floor(Math.random() * 9)
            for (let p = 0; p < particleCount; p++) {
              const angle = (Math.PI * 2 * p) / particleCount + (Math.random() - 0.5) * 0.5
              const speed = 3 + Math.random() * 3
              s.particles.push({
                x: mergeX, y: mergeY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30 + Math.floor(Math.random() * 20),
                t: 0,
                size: 3 + Math.random() * 3
              })
            }
            playMerge(nt)
            vibrate(30)
          }
          s.balls = s.balls.filter(b => !b.del)
          s.shakeT = Math.min(8 + s.combo * 3, 25)
          if (s.combo > 1) playCombo(s.combo)
        }

        // 이펙트 업데이트
        s.fx = s.fx.filter(f => { f.t++; return f.t < 30 })
        s.scorePopups = s.scorePopups.filter(p => { p.t++; p.y -= 1.5; return p.t < 40 })
        s.particles = s.particles.filter(p => {
          p.t++
          p.vy += 0.2
          p.vx *= 0.98
          p.x += p.vx
          p.y += p.vy
          return p.t < p.life
        })

        // 콤보 타이머
        if (s.comboTimer > 0) {
          s.comboTimer--
          if (s.comboTimer === 0) s.combo = 0
        }

        // 레벨업 타이머
        if (s.levelUpT > 0) s.levelUpT--

        // 위험 판정
        const now = Date.now()
        const danger = s.balls.some(b => b.y - b.r < DANGER_Y && now - b.born > 1000)
        if (danger) {
          s.dangerT++
          if (s.dangerT > 60) {
            s.over = true
            s.overTime = Date.now()
            s.isNewHigh = s.score > highScoreRef.current
            s.maxAnimal = maxAnimalReached.current
            s.maxCombo = maxComboReached.current
            setOver(true)
            playGameOver()
            vibrate(200)
            setGravityScale(1.0)
            setHighScore(prev => {
              const newHigh = Math.max(prev, s.score)
              if (newHigh > prev) {
                highScoreRef.current = newHigh
                try {
                  localStorage.setItem('animalGameHighScore', newHigh.toString())
                } catch (error) { /* ignore */ }
              }
              return newHigh
            })
            saveGameStats(s.score)
          }
        }
        else if (s.dangerT > 0) s.dangerT = Math.max(0, s.dangerT - 2)

        setScore(s.score)
      }

      // 렌더링 전 최신 상태 반영
      s.maxAnimal = maxAnimalReached.current
      s.maxCombo = maxComboReached.current

      const c = cvs.current
      if (c) render(c.getContext('2d'), s, highScoreRef.current, paused)

      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current)
        cooldownTimerRef.current = null
      }
    }
  }, [paused])

  // 게임 통계 저장
  const saveGameStats = (finalScore) => {
    try {
      const playTime = Math.floor((Date.now() - gameStartTime.current) / 1000)
      const savedStats = localStorage.getItem('animalGameStats')
      const stats = savedStats ? JSON.parse(savedStats) : {
        totalGames: 0, totalPlayTime: 0, highestAnimal: 0, totalScore: 0, maxCombo: 0
      }
      stats.totalGames++
      stats.totalPlayTime += playTime
      stats.totalScore += finalScore
      if (maxAnimalReached.current > stats.highestAnimal) stats.highestAnimal = maxAnimalReached.current
      if (maxComboReached.current > stats.maxCombo) stats.maxCombo = maxComboReached.current
      localStorage.setItem('animalGameStats', JSON.stringify(stats))
    } catch (error) { /* ignore */ }
  }

  const togglePause = () => {
    if (!g.current.over) setPaused(prev => !prev)
  }

  const handleToggleMute = () => {
    const newMuted = toggleMute()
    setMuted(newMuted)
  }

  const dismissTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem('animalGameTutorialSeen', '1')
  }

  const onMove = (e) => {
    e.preventDefault()
    const s = g.current
    if (s.over || paused) return
    const p = pos(e)
    const r = ANIMALS[s.cur].r
    s.dropX = Math.max(LEFT + r, Math.min(RIGHT - r, p.x))
  }

  const onDrop = (e) => {
    e.preventDefault()
    const s = g.current

    if (s.over) {
      if (s.overTime && Date.now() - s.overTime < 2000) return
      restart()
      return
    }

    if (paused || !s.canDrop) return
    const p = pos(e)
    const r = ANIMALS[s.cur].r
    const dx = Math.max(LEFT + r, Math.min(RIGHT - r, p.x))
    const diff = getDifficulty(s.score)

    s.balls.push({
      id: nextId(), type: s.cur,
      x: dx, y: DROP_Y, vx: 0, vy: 0,
      r, born: Date.now(),
    })
    playDrop()
    s.cur = s.nxt
    s.nxt = s.nxt2
    s.nxt2 = weightedRandom(diff.dropWeights)
    s.canDrop = false
    s.dropTimer = 0

    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
    cooldownTimerRef.current = setTimeout(() => {
      s.canDrop = true
    }, diff.cooldown)
  }

  const restart = () => {
    const s = g.current
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current)
      cooldownTimerRef.current = null
    }
    setGravityScale(1.0)
    s.balls = []; s.score = 0; s.fx = []; s.scorePopups = []; s.particles = []
    s.combo = 0; s.comboTimer = 0; s.dangerT = 0; s.shakeT = 0
    s.cur = Math.floor(Math.random() * DROP_TYPES)
    s.nxt = Math.floor(Math.random() * DROP_TYPES)
    s.nxt2 = Math.floor(Math.random() * DROP_TYPES)
    s.dropX = W / 2
    s.canDrop = true; s.over = false; s.isNewHigh = false; s.maxAnimal = 0; s.maxCombo = 0
    s.level = 1; s.prevLevel = 1; s.levelUpT = 0; s.dropTimer = 0; s.autoDropMax = 0
    setScore(0); setOver(false); setPaused(false)
    gameStartTime.current = Date.now()
    maxAnimalReached.current = 0
    maxComboReached.current = 0
  }

  // 점수 공유
  const shareScore = async () => {
    const canvas = cvs.current
    if (!canvas) return
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      if (navigator.share && blob) {
        const file = new File([blob], 'animal-game.png', { type: 'image/png' })
        await navigator.share({
          title: '동물 합치기',
          text: `동물 합치기에서 ${score}점을 달성했어요! (LV.${g.current.level})`,
          files: [file]
        })
      } else if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `animal-game-${score}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      console.log('Share cancelled')
    }
  }

  const btnStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none',
    borderRadius: 10, padding: '6px 10px', cursor: 'pointer',
    fontSize: 16, minWidth: 44, minHeight: 44,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a1a', minHeight: '100vh', padding: '8px 4px', fontFamily: 'sans-serif' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 360, marginBottom: 6 }}>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>🐾 동물 합치기</span>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => { setShowLeaderboard(true); setPaused(true) }} style={{ ...btnStyle, background: 'rgba(156,39,176,0.3)' }}>
            <span>🏆</span><span style={{ fontSize: 9, opacity: 0.8 }}>랭킹</span>
          </button>
          <button onClick={() => { setShowStats(true); setPaused(true) }} style={{ ...btnStyle, background: 'rgba(33,150,243,0.3)' }}>
            <span>📊</span><span style={{ fontSize: 9, opacity: 0.8 }}>통계</span>
          </button>
          <button onClick={handleToggleMute} style={{ ...btnStyle, background: muted ? 'rgba(244,67,54,0.3)' : 'rgba(76,175,80,0.3)' }}>
            <span>{muted ? '🔇' : '🔊'}</span><span style={{ fontSize: 9, opacity: 0.8 }}>소리</span>
          </button>
          <button onClick={togglePause} disabled={over} style={{ ...btnStyle, background: paused ? 'rgba(76,175,80,0.3)' : 'rgba(255,167,38,0.3)', opacity: over ? 0.5 : 1, cursor: over ? 'not-allowed' : 'pointer' }}>
            <span>{paused ? '▶' : '⏸'}</span><span style={{ fontSize: 9, opacity: 0.8 }}>{paused ? '계속' : '정지'}</span>
          </button>
          <button onClick={restart} style={{ ...btnStyle, background: 'rgba(233,69,96,0.3)' }}>
            <span>🔄</span><span style={{ fontSize: 9, opacity: 0.8 }}>재시작</span>
          </button>
        </div>
      </div>
      {/* 캔버스 + 오버레이 */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
        <canvas
          ref={cvs} width={W} height={H}
          style={{ width: '100%', maxWidth: 360, borderRadius: 12, cursor: 'pointer', touchAction: 'none', display: 'block' }}
          onMouseMove={onMove} onClick={onDrop}
          onTouchStart={onMove} onTouchMove={onMove} onTouchEnd={onDrop}
        />
        {/* 게임오버 버튼 */}
        {over && (
          <div style={{
            position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 10, zIndex: 10
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowLeaderboard(true) }}
              style={{
                background: 'rgba(156,39,176,0.9)', color: '#fff', border: 'none',
                borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 'bold',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              🏆 랭킹 등록
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); shareScore() }}
              style={{
                background: 'rgba(33,150,243,0.9)', color: '#fff', border: 'none',
                borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 'bold',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              📤 점수 공유
            </button>
          </div>
        )}
        {/* 첫 플레이 튜토리얼 */}
        {showTutorial && (
          <div
            onClick={dismissTutorial}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 20, cursor: 'pointer',
            }}
          >
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 24 }}>
              🐾 플레이 방법
            </div>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, textAlign: 'center', lineHeight: 2.2, padding: '0 24px' }}>
              👆 터치/클릭으로 동물을 떨어뜨리세요<br />
              🔄 같은 동물끼리 합치면 진화!<br />
              ⚠️ 동물이 위험선을 넘으면 게임오버<br />
              🦕 최종 목표: 공룡 만들기!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 32 }}>
              터치하여 시작
            </div>
          </div>
        )}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 6 }}>
        같은 동물을 합쳐서 더 큰 동물로 진화시키세요!
      </div>

      {/* 모달 */}
      <GameStats isOpen={showStats} onClose={() => { setShowStats(false); setPaused(false) }} />
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => { setShowLeaderboard(false); setPaused(false) }}
        currentScore={score}
        highestAnimal={maxAnimalReached.current}
      />
    </div>
  )
}
