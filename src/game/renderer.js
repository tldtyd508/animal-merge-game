import { ANIMALS } from './animals'
import { drawAnimal } from './drawAnimal'
import { CANVAS_W as W, CANVAS_H as H, WALL, FLOOR_Y, LEFT, RIGHT, DROP_Y, DANGER_Y } from './physics'

// 둥근 사각형 유틸리티
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// 레벨 컬러 (의미 기반)
const levelColors = ['#4DB870', '#8BC34A', '#F2994A', '#F27649', '#EB5757', '#BB6BD9']
const levelThresholds = [0, 300, 800, 1500, 3000, 5000]

// 착지 예측 (수직 레이캐스트)
function predictLandingY(dropX, dropR, balls) {
  let landingY = FLOOR_Y - dropR
  for (const b of balls) {
    const dx = dropX - b.x
    const combined = dropR + b.r
    if (Math.abs(dx) < combined) {
      const dy = Math.sqrt(combined * combined - dx * dx)
      const possibleY = b.y - dy
      if (possibleY > DROP_Y && possibleY < landingY) {
        landingY = possibleY
      }
    }
  }
  return landingY
}

// 게임 화면 전체 렌더링
export function render(ctx, state, highScore = 0, paused = false) {
  ctx.save()

  // 화면 흔들림 효과
  if (state.shakeT > 0) {
    const intensity = state.shakeT * 0.5
    const sx = (Math.random() - 0.5) * intensity
    const sy = (Math.random() - 0.5) * intensity
    ctx.translate(sx, sy)
    state.shakeT--
  }

  // ── 배경 ──
  ctx.fillStyle = '#1A1520'
  ctx.fillRect(-5, -5, W + 10, H + 10)

  // 게임 영역 그라디언트
  const grd = ctx.createLinearGradient(0, DROP_Y, 0, H)
  grd.addColorStop(0, '#2A2040')
  grd.addColorStop(1, '#1E1630')
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.moveTo(0, DROP_Y); ctx.lineTo(WALL, DROP_Y); ctx.lineTo(WALL, FLOOR_Y)
  ctx.lineTo(RIGHT, FLOOR_Y); ctx.lineTo(RIGHT, DROP_Y); ctx.lineTo(W, DROP_Y)
  ctx.lineTo(W, H); ctx.lineTo(0, H)
  ctx.closePath(); ctx.fill()

  // 배경 점 패턴
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
  for (let px = LEFT + 10; px < RIGHT; px += 20) {
    for (let py = DROP_Y + 10; py < FLOOR_Y; py += 20) {
      ctx.beginPath()
      ctx.arc(px, py, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 벽/바닥 라인
  ctx.strokeStyle = '#4A3D5C'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(LEFT, FLOOR_Y)
  ctx.lineTo(RIGHT, FLOOR_Y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(LEFT, DROP_Y)
  ctx.lineTo(LEFT, FLOOR_Y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(RIGHT, DROP_Y)
  ctx.lineTo(RIGHT, FLOOR_Y)
  ctx.stroke()

  // ── 위험선 ──
  if (state.dangerT > 0) {
    const progress = state.dangerT / 60
    const timeLeft = ((60 - state.dangerT) / 60).toFixed(1)

    // 위험선 글로우
    ctx.shadowColor = '#EB5757'
    ctx.shadowBlur = 8 + Math.sin(Date.now() * 0.01) * 4
    ctx.strokeStyle = `rgba(235, 87, 87, ${0.5 + Math.sin(Date.now() * 0.01) * 0.4})`
    ctx.setLineDash([8, 4])
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(LEFT, DANGER_Y)
    ctx.lineTo(RIGHT, DANGER_Y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.shadowBlur = 0

    // 타이머 텍스트
    ctx.fillStyle = '#EB5757'
    ctx.font = '700 14px "Noto Sans KR", sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(`${timeLeft}s`, LEFT + 5, DANGER_Y - 12)

    // 프로그레스 바
    const barWidth = RIGHT - LEFT
    ctx.fillStyle = 'rgba(235, 87, 87, 0.2)'
    roundRect(ctx, LEFT, DANGER_Y - 28, barWidth, 4, 2)
    ctx.fill()
    ctx.fillStyle = '#EB5757'
    roundRect(ctx, LEFT, DANGER_Y - 28, barWidth * progress, 4, 2)
    ctx.fill()

    // 상단 빨간 비네팅
    const dangerGrd = ctx.createLinearGradient(0, 0, 0, DANGER_Y)
    dangerGrd.addColorStop(0, `rgba(235, 87, 87, ${progress * 0.15})`)
    dangerGrd.addColorStop(1, 'rgba(235, 87, 87, 0)')
    ctx.fillStyle = dangerGrd
    ctx.fillRect(0, 0, W, DANGER_Y)
  } else {
    // 기본 위험선 (비활성)
    ctx.strokeStyle = 'rgba(235, 87, 87, 0.12)'
    ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(LEFT, DANGER_Y); ctx.lineTo(RIGHT, DANGER_Y); ctx.stroke()
    ctx.setLineDash([])
  }

  // ── 드롭 가이드 + 고스트 프리뷰 ──
  if (state.canDrop && !state.over) {
    const curR = ANIMALS[state.cur].r

    // 착지 예측 고스트
    const landY = predictLandingY(state.dropX, curR, state.balls)
    ctx.globalAlpha = 0.15
    drawAnimal(ctx, state.dropX, landY, curR, state.cur)
    ctx.globalAlpha = 1

    // 드롭 가이드 라인
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.setLineDash([3, 6])
    ctx.beginPath(); ctx.moveTo(state.dropX, DROP_Y); ctx.lineTo(state.dropX, FLOOR_Y); ctx.stroke()
    ctx.setLineDash([])

    // 현재 드롭할 동물
    ctx.globalAlpha = 0.7
    drawAnimal(ctx, state.dropX, DROP_Y / 2 + 12, ANIMALS[state.cur].r, state.cur)
    ctx.globalAlpha = 1
  }

  // ── 동물들 ──
  for (const b of state.balls) {
    drawAnimal(ctx, b.x, b.y, b.r, b.type)
  }

  // ── 파티클 효과 (금색 기반) ──
  for (const p of state.particles || []) {
    const alpha = 1 - (p.t / p.life)
    ctx.fillStyle = `rgba(247, 201, 72, ${alpha * 0.8})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 합체 이펙트 ──
  for (const f of state.fx) {
    const p = f.t / 30
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 + p * 0.8), 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(247, 201, 72, ${1 - p})`
    ctx.lineWidth = 5 * (1 - p); ctx.stroke()
    if (f.t < 20) {
      ctx.fillStyle = `rgba(245, 240, 255, ${0.9 - p})`
      ctx.font = '700 14px "Noto Sans KR", sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(f.name + '!', f.x, f.y - f.r - 10 - f.t * 1.5)
    }
  }

  // ── 점수 팝업 (개선) ──
  for (const p of state.scorePopups || []) {
    const alpha = 1 - (p.t / 40)
    let color
    if (p.combo >= 10) color = `rgba(187, 107, 217, ${alpha})`
    else if (p.combo >= 5) color = `rgba(242, 153, 74, ${alpha})`
    else color = `rgba(247, 201, 72, ${alpha})`
    ctx.fillStyle = color
    ctx.font = '700 15px "Black Han Sans", sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const text = p.combo > 1 ? `+${p.pts} x${p.combo}` : `+${p.pts}`
    ctx.fillText(text, p.x, p.y)
  }

  // ── 콤보 표시 (개선) ──
  if (state.combo > 1 && state.comboTimer > 0) {
    const comboAlpha = Math.min(state.comboTimer / 60, 1)
    const comboScale = 1 + Math.sin((180 - state.comboTimer) * 0.05) * 0.08

    ctx.save()
    ctx.translate(W / 2, 55)
    ctx.scale(comboScale, comboScale)

    // 배경 뱃지
    const comboText = `${state.combo} COMBO`
    ctx.font = '700 22px "Black Han Sans", sans-serif'
    const textW = ctx.measureText(comboText).width
    ctx.fillStyle = `rgba(247, 201, 72, ${comboAlpha * 0.15})`
    roundRect(ctx, -textW / 2 - 12, -14, textW + 24, 28, 8)
    ctx.fill()

    // 콤보 텍스트
    let comboColor
    if (state.combo >= 10) comboColor = `rgba(187, 107, 217, ${comboAlpha})`
    else if (state.combo >= 5) comboColor = `rgba(242, 153, 74, ${comboAlpha})`
    else comboColor = `rgba(247, 201, 72, ${comboAlpha})`
    ctx.fillStyle = comboColor
    ctx.globalAlpha = comboAlpha
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(comboText, 0, 0)

    ctx.restore()
    ctx.globalAlpha = 1
  }

  // ── 점수 UI ──
  ctx.textBaseline = 'alphabetic'
  // "SCORE" 라벨
  ctx.fillStyle = '#7A6B8A'
  ctx.font = '700 11px "Noto Sans KR", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE', 14, 16)

  // 실제 점수
  ctx.fillStyle = '#F5F0FF'
  ctx.font = '700 22px "Black Han Sans", sans-serif'
  ctx.fillText(state.score.toLocaleString(), 14, 38)

  // BEST 점수
  ctx.fillStyle = '#F7C948'
  ctx.font = '500 12px "Noto Sans KR", sans-serif'
  ctx.fillText(`BEST ${highScore.toLocaleString()}`, 14, 54)

  // ── 레벨 바 ──
  const level = state.level || 1
  const nextThreshold = level < 6 ? levelThresholds[level] : levelThresholds[level - 1] + 2000
  const prevThreshold = levelThresholds[level - 1]
  const levelProgress = (state.score - prevThreshold) / (nextThreshold - prevThreshold)

  const barX = 14, barY = 62, barW = 120, barH = 8, barR = 4
  // 배경
  ctx.fillStyle = '#3D3350'
  roundRect(ctx, barX, barY, barW, barH, barR)
  ctx.fill()

  // 진행 바
  const fillW = barW * Math.min(Math.max(levelProgress, 0), 1)
  if (fillW > 0) {
    ctx.fillStyle = levelColors[level - 1]
    roundRect(ctx, barX, barY, fillW, barH, barR)
    ctx.fill()
  }

  // 레벨 텍스트
  ctx.fillStyle = levelColors[level - 1]
  ctx.font = '700 11px "Noto Sans KR", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`LV.${level}`, barX + barW + 8, barY + 7)

  // ── 자동 드롭 타이머 바 ──
  if (state.canDrop && state.autoDropMax > 0 && state.dropTimer > 0 && !state.over) {
    const adProgress = state.dropTimer / state.autoDropMax
    const adBarY = DROP_Y - 6
    const adBarW = RIGHT - LEFT
    const adBarH = 4
    const adBarR = 2

    // 배경
    ctx.fillStyle = '#3D3350'
    roundRect(ctx, LEFT, adBarY, adBarW, adBarH, adBarR)
    ctx.fill()

    // 진행 바
    let adColor
    if (adProgress > 0.7) adColor = '#EB5757'
    else if (adProgress > 0.4) adColor = '#F2994A'
    else adColor = '#4DB870'

    if (adProgress > 0) {
      ctx.fillStyle = adColor
      roundRect(ctx, LEFT, adBarY, adBarW * adProgress, adBarH, adBarR)
      ctx.fill()
    }

    // 80% 이상 글로우
    if (adProgress > 0.8) {
      ctx.shadowColor = '#EB5757'
      ctx.shadowBlur = 6
      ctx.fillStyle = '#EB5757'
      roundRect(ctx, LEFT, adBarY, adBarW * adProgress, adBarH, adBarR)
      ctx.fill()
      ctx.shadowBlur = 0
    }
  }

  // ── 자동드롭 이펙트 ──
  if (state.autoDropFx > 0) {
    const fxAlpha = state.autoDropFx / 20

    // 화면 테두리 주황 플래시
    ctx.strokeStyle = `rgba(242, 153, 74, ${fxAlpha * 0.6})`
    ctx.lineWidth = 4
    roundRect(ctx, 2, 2, W - 4, H - 4, 10)
    ctx.stroke()
    ctx.lineWidth = 1

    // "AUTO!" 텍스트
    ctx.fillStyle = `rgba(242, 153, 74, ${fxAlpha})`
    ctx.font = '700 18px "Black Han Sans", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('AUTO!', W / 2, DROP_Y - 20)
    ctx.textBaseline = 'alphabetic'
  }

  // ── NEXT 박스 ──
  const nextX = W - 42
  const bx = nextX - 32, by = 6, bw = 64, bh = 78, br = 10

  // 카드 배경
  ctx.fillStyle = '#2A2235'
  roundRect(ctx, bx, by, bw, bh, br)
  ctx.fill()

  // 카드 테두리
  ctx.strokeStyle = '#4A3D5C'
  ctx.lineWidth = 1.5
  roundRect(ctx, bx, by, bw, bh, br)
  ctx.stroke()

  // "NEXT" 뱃지
  const labelW = 38, labelH = 14, labelX = nextX - labelW / 2, labelY = by + 4
  ctx.fillStyle = '#2D8F4E'
  roundRect(ctx, labelX, labelY, labelW, labelH, 4)
  ctx.fill()
  ctx.fillStyle = '#F5F0FF'
  ctx.font = '700 9px "Noto Sans KR", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('NEXT', nextX, labelY + 11)

  // 첫 번째 NEXT 동물
  drawAnimal(ctx, nextX, 38, ANIMALS[state.nxt].r * 0.5, state.nxt)

  // 구분선
  ctx.strokeStyle = '#4A3D5C'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(bx + 8, 52)
  ctx.lineTo(bx + bw - 8, 52)
  ctx.stroke()

  // 두 번째 NEXT 동물
  if (state.nxt2 !== undefined) {
    ctx.globalAlpha = 0.65
    drawAnimal(ctx, nextX, 66, ANIMALS[state.nxt2].r * 0.35, state.nxt2)
    ctx.globalAlpha = 1
  }

  // ── 진화 사이드바 ──
  const evoX = RIGHT - 16
  const evoStartY = 90
  const evoCount = ANIMALS.length
  const evoSpacing = Math.min(44, (FLOOR_Y - evoStartY - 10) / (evoCount - 1))
  const maxTypeOnBoard = state.balls.length > 0
    ? state.balls.reduce((max, b) => Math.max(max, b.type), 0)
    : -1

  // 사이드바 배경
  const evoBoxX = evoX - 16, evoBoxW = 32
  const evoBoxY = evoStartY - 18, evoBoxH = evoSpacing * (evoCount - 1) + 36
  ctx.fillStyle = '#2A2235'
  roundRect(ctx, evoBoxX, evoBoxY, evoBoxW, evoBoxH, 10)
  ctx.fill()

  // 테두리
  ctx.strokeStyle = '#4A3D5C'
  ctx.lineWidth = 1
  roundRect(ctx, evoBoxX, evoBoxY, evoBoxW, evoBoxH, 10)
  ctx.stroke()

  for (let i = 0; i < evoCount; i++) {
    const ey = evoStartY + i * evoSpacing
    const isHighest = i === maxTypeOnBoard
    const isReached = i <= maxTypeOnBoard

    // 현재 최고 하이라이트
    if (isHighest) {
      ctx.fillStyle = 'rgba(247, 201, 72, 0.15)'
      ctx.beginPath()
      ctx.arc(evoX, ey, 13, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#F7C948'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(evoX, ey, 13, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.globalAlpha = isHighest ? 1.0 : isReached ? 0.5 : 0.15
    drawAnimal(ctx, evoX, ey, 9, i)
    ctx.globalAlpha = 1
  }

  // ── 레벨업 이펙트 ──
  if (state.levelUpT > 0) {
    const luAlpha = Math.min(state.levelUpT / 30, 1)
    const luScale = 1 + (90 - state.levelUpT) * 0.003

    ctx.save()
    ctx.translate(W / 2, H / 2 - 50)
    ctx.scale(luScale, luScale)

    // 뱃지 배경
    ctx.fillStyle = `rgba(247, 201, 72, ${luAlpha * 0.12})`
    roundRect(ctx, -70, -22, 140, 55, 12)
    ctx.fill()

    // 메인 텍스트
    ctx.fillStyle = `rgba(247, 201, 72, ${luAlpha})`
    ctx.font = '700 26px "Black Han Sans", sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(`LEVEL ${state.level}`, 0, 0)

    // 서브 텍스트 (레벨별 힌트)
    const hintText = state.levelUpHint || '난이도 상승!'
    ctx.font = '500 13px "Noto Sans KR", sans-serif'
    ctx.fillStyle = `rgba(184, 169, 204, ${luAlpha * 0.8})`
    ctx.fillText(hintText, 0, 24)

    ctx.restore()
  }

  // ── 일시정지 ──
  if (paused && !state.over) {
    ctx.fillStyle = 'rgba(26, 21, 32, 0.75)'
    ctx.fillRect(0, 0, W, H)

    // 두 개의 직사각형 바
    ctx.fillStyle = '#F5F0FF'
    const pauseBarW = 10, pauseBarH = 36, pauseGap = 10
    roundRect(ctx, W / 2 - pauseGap - pauseBarW, H / 2 - pauseBarH / 2 - 10, pauseBarW, pauseBarH, 3)
    ctx.fill()
    roundRect(ctx, W / 2 + pauseGap, H / 2 - pauseBarH / 2 - 10, pauseBarW, pauseBarH, 3)
    ctx.fill()

    // 텍스트
    ctx.font = '500 16px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#B8A9CC'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('일시정지', W / 2, H / 2 + 35)
  }

  // ── 게임오버 (카드형 결과 화면) ──
  if (state.over) {
    // 배경 어둡게
    ctx.fillStyle = 'rgba(26, 21, 32, 0.88)'
    ctx.fillRect(0, 0, W, H)

    // 결과 카드
    const cardX = W * 0.08, cardY = H * 0.12
    const cardW = W * 0.84, cardH = H * 0.55

    // 카드 배경
    ctx.fillStyle = '#2A2235'
    roundRect(ctx, cardX, cardY, cardW, cardH, 16)
    ctx.fill()

    // 카드 테두리
    ctx.strokeStyle = '#4A3D5C'
    ctx.lineWidth = 1.5
    roundRect(ctx, cardX, cardY, cardW, cardH, 16)
    ctx.stroke()

    // "GAME OVER" 타이틀
    ctx.fillStyle = '#F5F0FF'
    ctx.font = '700 28px "Black Han Sans", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GAME OVER', W / 2, cardY + 40)

    // 도달 레벨 뱃지
    const lvBadgeW = 80, lvBadgeH = 24
    ctx.fillStyle = levelColors[(state.level || 1) - 1]
    roundRect(ctx, W / 2 - lvBadgeW / 2, cardY + 56, lvBadgeW, lvBadgeH, 6)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '700 12px "Noto Sans KR", sans-serif'
    ctx.fillText(`LEVEL ${state.level || 1}`, W / 2, cardY + 68)

    // 점수
    ctx.fillStyle = '#F7C948'
    ctx.font = '700 36px "Black Han Sans", sans-serif'
    ctx.fillText(state.score.toLocaleString(), W / 2, cardY + 110)
    ctx.fillStyle = '#7A6B8A'
    ctx.font = '400 12px "Noto Sans KR", sans-serif'
    ctx.fillText('SCORE', W / 2, cardY + 130)

    // 최고 기록 달성 배너
    if (state.isNewHigh) {
      const bannerY = cardY + 148
      ctx.fillStyle = 'rgba(247, 201, 72, 0.12)'
      roundRect(ctx, cardX + 20, bannerY, cardW - 40, 28, 6)
      ctx.fill()
      ctx.fillStyle = '#F7C948'
      ctx.font = '700 13px "Noto Sans KR", sans-serif'
      ctx.fillText('NEW BEST RECORD!', W / 2, bannerY + 15)
    }

    // 통계 행
    let statsY = state.isNewHigh ? cardY + 190 : cardY + 160
    ctx.font = '400 13px "Noto Sans KR", sans-serif'

    if (state.maxAnimal > 0) {
      const animalName = ANIMALS[state.maxAnimal]?.name || '?'
      ctx.fillStyle = '#7A6B8A'
      ctx.textAlign = 'left'
      ctx.fillText('최고 동물', cardX + 30, statsY)
      ctx.fillStyle = '#F5F0FF'
      ctx.textAlign = 'right'
      ctx.fillText(animalName, cardX + cardW - 30, statsY)
      statsY += 28
    }

    if (state.maxCombo > 1) {
      ctx.fillStyle = '#7A6B8A'
      ctx.textAlign = 'left'
      ctx.fillText('최고 콤보', cardX + 30, statsY)
      ctx.fillStyle = '#F5F0FF'
      ctx.textAlign = 'right'
      ctx.fillText(`${state.maxCombo} COMBO`, cardX + cardW - 30, statsY)
      statsY += 28
    }

    // 도달 동물 미리보기
    if (state.maxAnimal > 0) {
      drawAnimal(ctx, W / 2, statsY + 20, ANIMALS[state.maxAnimal].r * 0.35, state.maxAnimal)
    }

    // 하단 안내
    ctx.fillStyle = '#7A6B8A'
    ctx.font = '400 12px "Noto Sans KR", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('터치하여 다시 시작', W / 2, cardY + cardH - 16)
  }

  ctx.restore()
}
