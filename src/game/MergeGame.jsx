import { useEffect, useRef, useState } from 'react'
import { ANIMALS, DROP_TYPES } from './animals'
import { CANVAS_W as W, CANVAS_H as H, LEFT, RIGHT, DROP_Y, DANGER_Y, SUB_STEPS, nextId, updateBall, resolvePair, setGravityScale } from './physics'
import { render } from './renderer'
import { playDrop, playAutoDrop, playMerge, playCombo, playGameOver, toggleMute, vibrate } from './sound'
import { Volume2, VolumeX, Settings, Pause, Play, RotateCcw, Trophy, BarChart3, Share2 } from 'lucide-react'
import GameStats from '../ui/GameStats'
import Leaderboard from '../ui/Leaderboard'

// ── 난이도 시스템 (개선) ──
const DIFFICULTIES = [
  { minScore: 0,    level: 1, gravityScale: 1.0,  cooldown: 500, autoDropMs: 15000, dropWeights: [1,1,1,1,1] },
  { minScore: 300,  level: 2, gravityScale: 1.05, cooldown: 475, autoDropMs: 12000, dropWeights: [1,1,1,1,1] },
  { minScore: 800,  level: 3, gravityScale: 1.15, cooldown: 425, autoDropMs: 8000,  dropWeights: [1.2,1,1,0.8,0.6] },
  { minScore: 1500, level: 4, gravityScale: 1.3,  cooldown: 375, autoDropMs: 5500,  dropWeights: [1.4,1.1,1,0.7,0.5] },
  { minScore: 3000, level: 5, gravityScale: 1.5,  cooldown: 325, autoDropMs: 4000,  dropWeights: [1.6,1.2,1,0.6,0.4] },
  { minScore: 5000, level: 6, gravityScale: 1.7,  cooldown: 275, autoDropMs: 3000,  dropWeights: [1.8,1.3,1,0.5,0.3] },
]

const LEVEL_UP_HINTS = {
  2: '자동드롭이 빨라집니다',
  3: '중력이 강해집니다',
  4: '더 빨라집니다!',
  5: '최고 속도에 가까워지고 있어요',
  6: '최종 난이도! 행운을 빕니다',
}

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

// Pawprint SVG icon component
function PawprintIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <ellipse cx="8" cy="8" rx="3" ry="3.5" />
      <ellipse cx="16" cy="8" rx="3" ry="3.5" />
      <ellipse cx="5" cy="14" rx="2.5" ry="3" />
      <ellipse cx="19" cy="14" rx="2.5" ry="3" />
      <ellipse cx="12" cy="17" rx="5" ry="4" />
    </svg>
  )
}

export default function MergeGame({ playerName }) {
  const cvs = useRef(null)
  const lastFrameTimeRef = useRef(0)
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
    levelUpHint: '',
    dropTimer: 0,
    autoDropMax: 0,
    // 자동드롭 이펙트
    autoDropFx: 0,
    autoDropHintShown: false,
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
  const [showSettings, setShowSettings] = useState(false)
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
    lastFrameTimeRef.current = performance.now()

    const step = (timestamp) => {
      const s = g.current

      // 실시간 delta time 계산
      const rawDt = timestamp - lastFrameTimeRef.current
      const dt = Math.min(rawDt, 100) // dt cap: 탭 비활성 복귀 시 큰 점프 방지
      lastFrameTimeRef.current = timestamp

      if (!s.over && !paused) {
        // ── 난이도 적용 ──
        const diff = getDifficulty(s.score)
        setGravityScale(diff.gravityScale)
        s.level = diff.level
        s.autoDropMax = diff.autoDropMs

        // 레벨업 감지
        if (diff.level > s.prevLevel) {
          s.levelUpT = 90
          s.levelUpHint = LEVEL_UP_HINTS[diff.level] || ''
          vibrate(100)
        }
        s.prevLevel = diff.level

        // ── 자동 드롭 타이머 (실시간 delta time 기반) ──
        if (s.canDrop && diff.autoDropMs > 0) {
          s.dropTimer += dt
          if (s.dropTimer >= diff.autoDropMs) {
            const r = ANIMALS[s.cur].r
            const cx = Math.max(LEFT + r, Math.min(RIGHT - r, s.dropX))
            s.balls.push({
              id: nextId(), type: s.cur,
              x: cx, y: DROP_Y, vx: 0, vy: 0,
              r, born: Date.now(),
            })
            playAutoDrop()
            s.autoDropFx = 20

            // 첫 자동드롭 안내
            if (!s.autoDropHintShown) {
              const hintSeen = localStorage.getItem('autoDropHintSeen')
              if (!hintSeen) {
                s.autoDropHintShown = true
                localStorage.setItem('autoDropHintSeen', '1')
              } else {
                s.autoDropHintShown = true
              }
            }

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

        // 자동드롭 이펙트 타이머 감소
        if (s.autoDropFx > 0) s.autoDropFx--

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
    s.level = 1; s.prevLevel = 1; s.levelUpT = 0; s.levelUpHint = ''
    s.dropTimer = 0; s.autoDropMax = 0; s.autoDropFx = 0; s.autoDropHintShown = false
    setScore(0); setOver(false); setPaused(false); setShowSettings(false)
    gameStartTime.current = Date.now()
    maxAnimalReached.current = 0
    maxComboReached.current = 0
    lastFrameTimeRef.current = performance.now()
  }

  // 점수 공유 (개선)
  const shareScore = async () => {
    const canvas = cvs.current
    if (!canvas) return
    const s = g.current
    const maxAnimalName = s.maxAnimal > 0 ? ANIMALS[s.maxAnimal]?.name : ''
    const maxCombo = s.maxCombo || 0
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const shareText = [
        `동물 합치기에서 ${score}점을 달성했어요!`,
        `LV.${s.level}${maxAnimalName ? ` | 최고 동물: ${maxAnimalName}` : ''}${maxCombo > 1 ? ` | ${maxCombo}콤보` : ''}`,
        '도전해보세요!'
      ].join('\n')
      if (navigator.share && blob) {
        const file = new File([blob], 'animal-game.png', { type: 'image/png' })
        await navigator.share({
          title: '동물 합치기',
          text: shareText,
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

  // 설정 패널 외부 클릭 시 닫기
  const settingsRef = useRef(null)
  useEffect(() => {
    if (!showSettings) return
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showSettings])

  const headerBtnStyle = {
    width: 40, height: 40, border: 'none', borderRadius: 10,
    background: '#352B42', color: '#B8A9CC',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.15s, transform 0.1s',
    position: 'relative',
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: '#1A1520', minHeight: '100vh', padding: '8px 4px',
      fontFamily: "'Noto Sans KR', sans-serif"
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', maxWidth: 360, padding: '8px 4px', marginBottom: 4
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PawprintIcon size={24} color="#2D8F4E" />
          <span style={{
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: 20, color: '#F5F0FF', letterSpacing: -0.5
          }}>
            동물합치기
          </span>
        </div>
        {/* 버튼 그룹 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleToggleMute}
            style={{
              ...headerBtnStyle,
              ...(muted ? { background: 'rgba(235, 87, 87, 0.15)', color: '#EB5757' } : {})
            }}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div ref={settingsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettings(prev => !prev)}
              style={headerBtnStyle}
            >
              <Settings size={20} />
            </button>
            {/* 설정 드롭다운 */}
            {showSettings && (
              <div style={{
                position: 'absolute', top: 48, right: 0, width: 180,
                background: '#352B42', borderRadius: 12, padding: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 50,
              }}>
                <button
                  onClick={() => { togglePause(); setShowSettings(false) }}
                  disabled={over}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, color: '#F5F0FF',
                    fontFamily: "'Noto Sans KR', sans-serif", fontSize: 14,
                    cursor: over ? 'not-allowed' : 'pointer', border: 'none',
                    background: 'transparent', width: '100%', opacity: over ? 0.5 : 1,
                  }}
                >
                  {paused ? <Play size={18} color="#B8A9CC" /> : <Pause size={18} color="#B8A9CC" />}
                  {paused ? '계속하기' : '일시정지'}
                </button>
                <button
                  onClick={() => { restart(); setShowSettings(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, color: '#F5F0FF',
                    fontFamily: "'Noto Sans KR', sans-serif", fontSize: 14,
                    cursor: 'pointer', border: 'none', background: 'transparent', width: '100%',
                  }}
                >
                  <RotateCcw size={18} color="#B8A9CC" />
                  다시 시작
                </button>
                <button
                  onClick={() => { setShowStats(true); setPaused(true); setShowSettings(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, color: '#F5F0FF',
                    fontFamily: "'Noto Sans KR', sans-serif", fontSize: 14,
                    cursor: 'pointer', border: 'none', background: 'transparent', width: '100%',
                  }}
                >
                  <BarChart3 size={18} color="#B8A9CC" />
                  게임 통계
                </button>
                <button
                  onClick={() => { setShowLeaderboard(true); setPaused(true); setShowSettings(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, color: '#F5F0FF',
                    fontFamily: "'Noto Sans KR', sans-serif", fontSize: 14,
                    cursor: 'pointer', border: 'none', background: 'transparent', width: '100%',
                  }}
                >
                  <Trophy size={18} color="#B8A9CC" />
                  랭킹
                </button>
              </div>
            )}
          </div>
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
                background: '#2D8F4E', color: '#fff', border: 'none',
                borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(45,143,78,0.3)',
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >
              <Trophy size={16} /> 랭킹 등록
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); shareScore() }}
              style={{
                background: '#352B42', color: '#F5F0FF', border: '1px solid #4A3D5C',
                borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >
              <Share2 size={16} /> 점수 공유
            </button>
          </div>
        )}
        {/* 첫 플레이 튜토리얼 */}
        {showTutorial && (
          <div
            onClick={dismissTutorial}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(26, 21, 32, 0.92)', borderRadius: 12,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 20, cursor: 'pointer', padding: '0 28px',
            }}
          >
            <div style={{
              fontFamily: "'Black Han Sans', sans-serif",
              color: '#F5F0FF', fontSize: 24, marginBottom: 28
            }}>
              플레이 방법
            </div>
            {[
              { num: '1', text: '터치/클릭으로 동물을 떨어뜨리세요' },
              { num: '2', text: '같은 동물끼리 합치면 진화!' },
              { num: '3', text: '위험선을 넘으면 게임 오버' },
              { num: '4', text: '점수가 오르면 난이도가 올라갑니다!' },
              { num: '!', text: '최종 목표: 공룡 만들기!', accent: true },
            ].map(step => (
              <div key={step.num} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                marginBottom: 16, width: '100%',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: step.accent ? '#2D8F4E' : '#352B42',
                  color: step.accent ? '#fff' : '#B8A9CC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Black Han Sans', sans-serif",
                  fontSize: 16, flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <span style={{
                  color: '#F5F0FF', fontSize: 15, lineHeight: 1.5,
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}>
                  {step.text}
                </span>
              </div>
            ))}
            <div style={{
              color: '#7A6B8A', fontSize: 13, marginTop: 24,
              fontFamily: "'Noto Sans KR', sans-serif",
            }}>
              터치하여 시작
            </div>
          </div>
        )}
      </div>
      <div style={{ color: '#7A6B8A', fontSize: 12, marginTop: 6 }}>
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
