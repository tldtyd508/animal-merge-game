import { ANIMALS } from './animals'
import { drawAnimal } from './drawAnimal'
import { CANVAS_W as W, CANVAS_H as H, WALL, FLOOR_Y, LEFT, RIGHT, DROP_Y, DANGER_Y } from './physics'

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

  // 배경
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(-5, -5, W + 10, H + 10)

  // 게임 영역
  const grd = ctx.createLinearGradient(0, DROP_Y, 0, H)
  grd.addColorStop(0, '#16213e')
  grd.addColorStop(1, '#0f3460')
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.moveTo(0, DROP_Y); ctx.lineTo(WALL, DROP_Y); ctx.lineTo(WALL, FLOOR_Y)
  ctx.lineTo(RIGHT, FLOOR_Y); ctx.lineTo(RIGHT, DROP_Y); ctx.lineTo(W, DROP_Y)
  ctx.lineTo(W, H); ctx.lineTo(0, H)
  ctx.closePath(); ctx.fill()

  // 위험선
  const da = state.dangerT > 0 ? 0.5 + Math.sin(Date.now() * 0.01) * 0.4 : 0.12
  ctx.strokeStyle = `rgba(255,60,60,${da})`
  ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(LEFT, DANGER_Y); ctx.lineTo(RIGHT, DANGER_Y); ctx.stroke()
  ctx.setLineDash([])

  // 위험 카운트다운 표시
  if (state.dangerT > 0) {
    const timeLeft = ((60 - state.dangerT) / 60).toFixed(1)
    const progress = state.dangerT / 60

    ctx.fillStyle = '#ff3c3c'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`⚠️ ${timeLeft}초`, LEFT + 5, DANGER_Y - 10)

    const barWidth = RIGHT - LEFT
    ctx.fillStyle = 'rgba(255,60,60,0.3)'
    ctx.fillRect(LEFT, DANGER_Y - 25, barWidth, 4)
    ctx.fillStyle = '#ff3c3c'
    ctx.fillRect(LEFT, DANGER_Y - 25, barWidth * progress, 4)
  }

  // 드롭 가이드 + 고스트 프리뷰
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

  // 동물들
  for (const b of state.balls) {
    drawAnimal(ctx, b.x, b.y, b.r, b.type)
  }

  // 파티클 효과
  for (const p of state.particles || []) {
    const alpha = 1 - (p.t / p.life)
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.8})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  // 합체 이펙트
  for (const f of state.fx) {
    const p = f.t / 30
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 + p * 0.8), 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255,215,0,${1 - p})`
    ctx.lineWidth = 5 * (1 - p); ctx.stroke()
    if (f.t < 20) {
      ctx.fillStyle = `rgba(255,255,255,${0.9 - p})`
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(f.name + '!', f.x, f.y - f.r - 10 - f.t * 1.5)
    }
  }

  // 점수 증가 팝업
  for (const p of state.scorePopups || []) {
    const alpha = 1 - (p.t / 40)
    let color
    if (p.combo >= 10) {
      color = `rgba(0,255,255,${alpha})`
    } else if (p.combo >= 5) {
      color = `rgba(255,105,180,${alpha})`
    } else {
      color = `rgba(255,215,0,${alpha})`
    }
    ctx.fillStyle = color
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const text = p.combo > 1 ? `+${p.pts} (${p.combo}콤보!)` : `+${p.pts}`
    ctx.fillText(text, p.x, p.y)
  }

  // 콤보 표시
  if (state.combo > 1 && state.comboTimer > 0) {
    const comboAlpha = Math.min(state.comboTimer / 60, 1)
    let comboColor
    if (state.combo >= 10) {
      comboColor = `rgba(0,255,255,${comboAlpha})`
    } else if (state.combo >= 5) {
      comboColor = `rgba(255,105,180,${comboAlpha})`
    } else {
      comboColor = `rgba(255,215,0,${comboAlpha})`
    }
    ctx.fillStyle = comboColor
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${state.combo} COMBO!`, W / 2, 60)
  }

  // 점수 UI
  ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  ctx.fillText(`점수 ${state.score}`, 12, 12)

  // 최고 점수
  ctx.font = '13px sans-serif'
  ctx.fillStyle = 'rgba(255,215,0,0.8)'
  ctx.fillText(`최고 ${highScore}`, 12, 34)

  // 레벨 시스템 (난이도 기반)
  const level = state.level || 1
  const levelColors = ['#4CAF50', '#FFEB3B', '#FF9800', '#F44336', '#9C27B0', '#00E5FF']
  const levelThresholds = [0, 300, 800, 1500, 3000, 5000]
  const nextThreshold = level < 6 ? levelThresholds[level] : null
  const prevThreshold = levelThresholds[level - 1]
  const levelProgress = nextThreshold ? (state.score - prevThreshold) / (nextThreshold - prevThreshold) : 1

  ctx.fillStyle = levelColors[level - 1]
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔥 LV.${level}`, 12, 56)

  const barX = 70, barY = 58, barW = 100, barH = 6
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(barX, barY, barW, barH)
  ctx.fillStyle = levelColors[level - 1]
  ctx.fillRect(barX, barY, barW * Math.min(levelProgress, 1), barH)

  // 자동 드롭 타이머 바
  if (state.canDrop && state.autoDropMax > 0 && state.dropTimer > 0 && !state.over) {
    const adProgress = state.dropTimer / state.autoDropMax
    const adBarY = DROP_Y - 4
    const adBarW = RIGHT - LEFT
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillRect(LEFT, adBarY, adBarW, 3)
    const adColor = adProgress > 0.7 ? '#ff3c3c' : adProgress > 0.4 ? '#FF9800' : '#4CAF50'
    ctx.fillStyle = adColor
    ctx.fillRect(LEFT, adBarY, adBarW * adProgress, 3)
  }

  // NEXT 2 표시 (다음 2마리)
  const nextX = W - 40
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  // 둥근 사각형 (높이 확장)
  const bx = nextX - 35, by = 5, bw = 70, bh = 72, br = 8
  ctx.beginPath()
  ctx.moveTo(bx + br, by)
  ctx.lineTo(bx + bw - br, by)
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br)
  ctx.lineTo(bx + bw, by + bh - br)
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh)
  ctx.lineTo(bx + br, by + bh)
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br)
  ctx.lineTo(bx, by + br)
  ctx.quadraticCurveTo(bx, by, bx + br, by)
  ctx.closePath()
  ctx.fill()

  ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('NEXT', nextX, 16)
  drawAnimal(ctx, nextX, 32, ANIMALS[state.nxt].r * 0.5, state.nxt)
  // 두 번째 NEXT
  if (state.nxt2 !== undefined) {
    ctx.globalAlpha = 0.5
    drawAnimal(ctx, nextX, 58, ANIMALS[state.nxt2].r * 0.35, state.nxt2)
    ctx.globalAlpha = 1
  }

  // 진화 순서 사이드바 (오른쪽)
  const evoX = RIGHT - 14
  const evoStartY = 90
  const evoCount = ANIMALS.length
  const evoSpacing = Math.min(48, (FLOOR_Y - evoStartY - 10) / (evoCount - 1))
  const maxTypeOnBoard = state.balls.length > 0
    ? state.balls.reduce((max, b) => Math.max(max, b.type), 0)
    : -1

  // 사이드바 배경
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  const evoBoxX = evoX - 14, evoBoxW = 28
  const evoBoxY = evoStartY - 16, evoBoxH = evoSpacing * (evoCount - 1) + 32
  const ebr = 8
  ctx.beginPath()
  ctx.moveTo(evoBoxX + ebr, evoBoxY)
  ctx.lineTo(evoBoxX + evoBoxW - ebr, evoBoxY)
  ctx.quadraticCurveTo(evoBoxX + evoBoxW, evoBoxY, evoBoxX + evoBoxW, evoBoxY + ebr)
  ctx.lineTo(evoBoxX + evoBoxW, evoBoxY + evoBoxH - ebr)
  ctx.quadraticCurveTo(evoBoxX + evoBoxW, evoBoxY + evoBoxH, evoBoxX + evoBoxW - ebr, evoBoxY + evoBoxH)
  ctx.lineTo(evoBoxX + ebr, evoBoxY + evoBoxH)
  ctx.quadraticCurveTo(evoBoxX, evoBoxY + evoBoxH, evoBoxX, evoBoxY + evoBoxH - ebr)
  ctx.lineTo(evoBoxX, evoBoxY + ebr)
  ctx.quadraticCurveTo(evoBoxX, evoBoxY, evoBoxX + ebr, evoBoxY)
  ctx.closePath()
  ctx.fill()

  for (let i = 0; i < evoCount; i++) {
    const ey = evoStartY + i * evoSpacing
    const isHighest = i === maxTypeOnBoard
    const isReached = i <= maxTypeOnBoard

    // 하이라이트 링
    if (isHighest) {
      ctx.strokeStyle = 'rgba(255,215,0,0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(evoX, ey, 12, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.globalAlpha = isHighest ? 0.9 : isReached ? 0.45 : 0.15
    drawAnimal(ctx, evoX, ey, 8, i)
    ctx.globalAlpha = 1
  }

  // 레벨업 이펙트
  if (state.levelUpT > 0) {
    const luAlpha = Math.min(state.levelUpT / 30, 1)
    const luScale = 1 + (90 - state.levelUpT) * 0.003
    ctx.save()
    ctx.translate(W / 2, H / 2 - 50)
    ctx.scale(luScale, luScale)
    ctx.fillStyle = `rgba(255,215,0,${luAlpha})`
    ctx.font = 'bold 30px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(`LEVEL ${state.level}!`, 0, 0)
    ctx.font = '16px sans-serif'
    ctx.fillStyle = `rgba(255,255,255,${luAlpha * 0.8})`
    ctx.fillText('난이도 상승!', 0, 30)
    ctx.restore()
  }

  // 일시정지
  if (paused && !state.over) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('⏸', W / 2, H / 2 - 20)
    ctx.font = '18px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText('일시정지', W / 2, H / 2 + 25)
  }

  // 게임오버 (강화)
  if (state.over) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, W, H)

    // GAME OVER 타이틀
    ctx.fillStyle = '#fff'; ctx.font = 'bold 34px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('GAME OVER', W / 2, H / 2 - 90)

    // 도달 레벨
    ctx.font = '16px sans-serif'
    ctx.fillStyle = levelColors[(state.level || 1) - 1]
    ctx.fillText(`LV.${state.level || 1} 도달`, W / 2, H / 2 - 58)

    // 최종 점수
    ctx.fillStyle = '#fff'
    ctx.font = '22px sans-serif'
    ctx.fillText(`최종 점수: ${state.score}`, W / 2, H / 2 - 35)

    // 최고 기록 달성
    if (state.isNewHigh) {
      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('🏆 최고 기록 달성!', W / 2, H / 2 - 18)
    }

    // 게임 통계
    let statsY = state.isNewHigh ? H / 2 + 10 : H / 2 - 10
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '15px sans-serif'

    if (state.maxAnimal !== undefined && state.maxAnimal > 0) {
      const animalName = ANIMALS[state.maxAnimal]?.name || '?'
      ctx.fillText(`최고 동물: ${animalName} (${state.maxAnimal + 1}/${ANIMALS.length}단계)`, W / 2, statsY)
      statsY += 25
    }
    if (state.maxCombo !== undefined && state.maxCombo > 1) {
      ctx.fillText(`최고 콤보: ${state.maxCombo} COMBO`, W / 2, statsY)
      statsY += 25
    }

    // 최고 도달 동물 그리기
    if (state.maxAnimal !== undefined && state.maxAnimal > 0) {
      drawAnimal(ctx, W / 2, statsY + 20, ANIMALS[state.maxAnimal].r * 0.4, state.maxAnimal)
      statsY += 50
    }

    // 재시작 안내
    ctx.font = '13px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText('빈 곳을 터치하면 다시 시작', W / 2, H / 2 + 130)
  }

  ctx.restore()
}
