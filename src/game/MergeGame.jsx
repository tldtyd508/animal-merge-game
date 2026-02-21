import { useEffect, useRef, useState } from 'react'
import { ANIMALS, DROP_TYPES } from './animals'
import { CANVAS_W as W, CANVAS_H as H, LEFT, RIGHT, DROP_Y, DANGER_Y, SUB_STEPS, nextId, updateBall, resolvePair } from './physics'
import { render } from './renderer'
import GameStats from '../ui/GameStats'
import Leaderboard from '../ui/Leaderboard'

export default function MergeGame({ playerName }) {
  const cvs = useRef(null)
  const g = useRef({
    balls: [],
    score: 0,
    cur: Math.floor(Math.random() * DROP_TYPES),
    nxt: Math.floor(Math.random() * DROP_TYPES),
    dropX: W / 2,
    canDrop: true,
    over: false,
    fx: [],
    scorePopups: [], // 점수 증가 애니메이션
    particles: [], // 파티클 효과
    combo: 0, // 콤보 카운트
    comboTimer: 0, // 콤보 타이머 (180프레임 = 3초)
    dangerT: 0,
    shakeT: 0, // 화면 흔들림 타이머
    dropTimer: 180, // 자동 드롭 카운트다운 (초기값 = dropTimerMax)
    dropTimerMax: 180, // 최대 타이머 (3초, 점수에 따라 감소)
  })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('animalGameHighScore')
      return saved ? parseInt(saved) : 0
    } catch (error) {
      console.error('localStorage error:', error)
      return 0
    }
  })
  const [over, setOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const gameStartTime = useRef(Date.now())
  const maxAnimalReached = useRef(0)
  const maxComboReached = useRef(0)
  const cooldownTimerRef = useRef(null) // 쿨다운 타이머 누수 방지

  // 캔버스 좌표 변환
  const pos = (e) => {
    const c = cvs.current
    const rect = c.getBoundingClientRect()
    const sx = W / rect.width
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    return { x: (cx - rect.left) * sx }
  }

  useEffect(() => {
    let raf
    const step = () => {
      const s = g.current

      if (!s.over && !paused) {
        // 물리 서브스텝 (정확도 향상용)
        for (let sub = 0; sub < SUB_STEPS; sub++) {
          for (const b of s.balls) updateBall(b)

          // 충돌 해소 (합체는 아직 안 함)
          for (let i = 0; i < s.balls.length; i++) {
            for (let j = i + 1; j < s.balls.length; j++) {
              resolvePair(s.balls[i], s.balls[j])
            }
          }
        }

        // 글로벌 속도 댐핑 (떨림 방지)
        for (const b of s.balls) {
          if (Math.abs(b.vx) < 0.3) b.vx = 0
          if (Math.abs(b.vy) < 1.0) b.vy = 0
        }

        // 합체 처리 (서브스텝 밖에서 한 번만)
        const merges = []
        for (let i = 0; i < s.balls.length; i++) {
          for (let j = i + 1; j < s.balls.length; j++) {
            const a = s.balls[i], b2 = s.balls[j]
            // 같은 타입이고 충돌 중이면 합체
            const dx = b2.x - a.x
            const dy = b2.y - a.y
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d < (a.r + b2.r) * 0.70 && a.type === b2.type && a.type < ANIMALS.length - 1 && !a.del && !b2.del) {
              merges.push([i, j])
              a.del = true
              b2.del = true
            }
          }
        }

        // 합체 실행
        if (merges.length > 0) {
          // 콤보 증가
          s.combo += merges.length
          s.comboTimer = 180 // 3초 (60fps 기준)
          // 통계: 최고 콤보 기록
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
              vx: 0, vy: -2, r: ANIMALS[nt].r,
              born: Math.min(a.born, b2.born), // 더 오래된 시간 계승 (버그 수정)
            })
            // 통계: 최고 동물 기록
            if (nt > maxAnimalReached.current) {
              maxAnimalReached.current = nt
            }
            // 콤보 보너스 계산 (1x, 1.2x, 1.4x, ... 최대 3x)
            const comboMultiplier = Math.min(1 + (s.combo - 1) * 0.2, 3)
            const basePts = ANIMALS[nt].pts
            const pts = Math.floor(basePts * comboMultiplier)
            s.score += pts
            s.fx.push({
              x: mergeX, y: mergeY,
              r: ANIMALS[nt].r, t: 0, name: ANIMALS[nt].name,
            })
            // 점수 팝업 추가
            s.scorePopups.push({
              x: mergeX, y: mergeY - 10, t: 0, pts, combo: s.combo
            })
            // 파티클 생성 (12~20개)
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
          }
          s.balls = s.balls.filter(b => !b.del)
          // 화면 흔들림 (콤보가 높을수록 강하게)
          s.shakeT = Math.min(8 + s.combo * 3, 25)
        }

        // 이펙트 업데이트
        s.fx = s.fx.filter(f => { f.t++; return f.t < 30 })
        s.scorePopups = s.scorePopups.filter(p => { p.t++; p.y -= 1.5; return p.t < 40 })

        // 파티클 업데이트
        s.particles = s.particles.filter(p => {
          p.t++
          p.vy += 0.2 // 중력
          p.vx *= 0.98 // 마찰
          p.x += p.vx
          p.y += p.vy
          return p.t < p.life
        })

        // 콤보 타이머 감소
        if (s.comboTimer > 0) {
          s.comboTimer--
          if (s.comboTimer === 0) {
            s.combo = 0 // 콤보 리셋
          }
        }

        // 자동 드롭 타이머 (canDrop일 때만 카운트)
        if (s.canDrop && !s.over) {
          s.dropTimer--
          if (s.dropTimer <= 0) {
            // 시간 초과 → 자동 드롭!
            const r = ANIMALS[s.cur].r
            const dx = Math.max(LEFT + r, Math.min(RIGHT - r, s.dropX))
            s.balls.push({
              id: nextId(), type: s.cur,
              x: dx, y: DROP_Y, vx: 0, vy: 0,
              r, born: Date.now(),
            })
            s.cur = s.nxt
            s.nxt = Math.floor(Math.random() * DROP_TYPES)
            s.canDrop = false

            // 난이도에 따른 쿨다운
            const cooldown = Math.max(150, 400 - s.score * 0.1)
            cooldownTimerRef.current = setTimeout(() => {
              s.canDrop = true
              // 타이머 리셋 (점수 높을수록 짧아짐)
              s.dropTimerMax = Math.max(90, 180 - Math.floor(s.score / 100) * 10) // 3초 → 최소 1.5초
              s.dropTimer = s.dropTimerMax
            }, cooldown)
          }
        }

        // 위험 판정 (1초 대기 + 120프레임, 총 3초로 완화)
        const now = Date.now()
        const danger = s.balls.some(b => b.y - b.r < DANGER_Y && now - b.born > 1000)
        if (danger) {
          s.dangerT++
          if (s.dangerT > 120) {  // 60 → 120 (2초로 증가)
            s.over = true
            s.overTime = Date.now()
            setOver(true)
            // 최고 점수 갱신
            setHighScore(prev => {
              const newHigh = Math.max(prev, s.score)
              if (newHigh > prev) {
                try {
                  localStorage.setItem('animalGameHighScore', newHigh.toString())
                } catch (error) {
                  console.error('localStorage save error:', error)
                }
              }
              return newHigh
            })
            // 통계 저장
            saveGameStats(s.score)
          }
        }
        else s.dangerT = 0

        setScore(s.score)
      }

      // 렌더링
      const c = cvs.current
      if (c) render(c.getContext('2d'), s, highScore, paused)

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
  }, [paused, highScore])

  // 게임 통계 저장
  const saveGameStats = (finalScore) => {
    try {
      const playTime = Math.floor((Date.now() - gameStartTime.current) / 1000)
      const savedStats = localStorage.getItem('animalGameStats')
      const stats = savedStats ? JSON.parse(savedStats) : {
        totalGames: 0,
        totalPlayTime: 0,
        highestAnimal: 0,
        totalScore: 0,
        maxCombo: 0
      }

      stats.totalGames++
      stats.totalPlayTime += playTime
      stats.totalScore += finalScore
      if (maxAnimalReached.current > stats.highestAnimal) {
        stats.highestAnimal = maxAnimalReached.current
      }
      if (maxComboReached.current > stats.maxCombo) {
        stats.maxCombo = maxComboReached.current
      }

      localStorage.setItem('animalGameStats', JSON.stringify(stats))
    } catch (error) {
      console.error('localStorage stats save error:', error)
    }
  }

  const togglePause = () => {
    const s = g.current
    if (!s.over) {
      setPaused(prev => !prev)
    }
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
      // 게임오버 후 1초 딜레이 (실수 방지)
      if (s.overTime && Date.now() - s.overTime < 1000) return
      restart()
      return
    }

    if (paused || !s.canDrop) return
    const p = pos(e)
    const r = ANIMALS[s.cur].r
    const dx = Math.max(LEFT + r, Math.min(RIGHT - r, p.x))

    s.balls.push({
      id: nextId(), type: s.cur,
      x: dx, y: DROP_Y, vx: 0, vy: 0,
      r, born: Date.now(),
    })
    s.cur = s.nxt
    s.nxt = Math.floor(Math.random() * DROP_TYPES)
    s.canDrop = false

    // 난이도에 따른 쿨다운 (점수가 높을수록 빠름)
    const baseCooldown = 400
    const reductionPerScore = 0.1
    const minCooldown = 150
    const cooldown = Math.max(minCooldown, baseCooldown - s.score * reductionPerScore)

    cooldownTimerRef.current = setTimeout(() => {
      s.canDrop = true
      // 자동 드롭 타이머 리셋 (점수 높을수록 짧아짐)
      s.dropTimerMax = Math.max(90, 180 - Math.floor(s.score / 100) * 10)
      s.dropTimer = s.dropTimerMax
    }, cooldown)
  }

  const restart = () => {
    const s = g.current
    // 쿨다운 타이머 정리 (누수 방지)
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current)
      cooldownTimerRef.current = null
    }
    s.balls = []; s.score = 0; s.fx = []; s.scorePopups = []; s.particles = []; s.combo = 0; s.comboTimer = 0; s.dangerT = 0; s.shakeT = 0
    s.dropTimer = 180; s.dropTimerMax = 180
    s.cur = Math.floor(Math.random() * DROP_TYPES)
    s.nxt = Math.floor(Math.random() * DROP_TYPES)
    s.canDrop = true; s.over = false
    setScore(0); setOver(false); setPaused(false)
    gameStartTime.current = Date.now()
    maxAnimalReached.current = 0
    maxComboReached.current = 0
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a1a', minHeight: '100vh', padding: '8px 4px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 360, marginBottom: 6 }}>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>🐾 동물 합치기</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setShowLeaderboard(true); setPaused(true) }} style={{ background: '#9C27B0', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', minWidth: 48, minHeight: 44 }}>
            🏆
          </button>
          <button onClick={() => { setShowStats(true); setPaused(true) }} style={{ background: '#2196F3', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', minWidth: 48, minHeight: 44 }}>
            📊
          </button>
          <button onClick={togglePause} disabled={over} style={{ background: paused ? '#4CAF50' : '#FFA726', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', cursor: over ? 'not-allowed' : 'pointer', fontSize: 18, fontWeight: 'bold', opacity: over ? 0.5 : 1, minWidth: 48, minHeight: 44 }}>
            {paused ? '▶' : '⏸'}
          </button>
          <button onClick={restart} style={{ background: '#e94560', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', minWidth: 48, minHeight: 44 }}>🔄</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
        {ANIMALS.map((a, i) => (
          <span key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            {a.name}{i < ANIMALS.length - 1 ? ' →' : ''}
          </span>
        ))}
      </div>
      <canvas
        ref={cvs} width={W} height={H}
        style={{ width: '100%', maxWidth: 360, borderRadius: 12, cursor: 'pointer', touchAction: 'none' }}
        onMouseMove={onMove} onClick={onDrop}
        onTouchMove={onMove} onTouchEnd={onDrop}
      />
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 6 }}>
        같은 동물을 합쳐서 더 큰 동물로 진화시키세요!
      </div>

      {/* 게임 통계 모달 */}
      <GameStats isOpen={showStats} onClose={() => { setShowStats(false); setPaused(false) }} />

      {/* 랭킹 모달 */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => { setShowLeaderboard(false); setPaused(false) }}
        currentScore={score}
        highestAnimal={maxAnimalReached.current}
      />
    </div>
  )
}
