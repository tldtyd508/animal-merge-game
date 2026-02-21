import { ANIMALS } from './animals'
import { drawAnimal } from './drawAnimal'
import { CANVAS_W as W, CANVAS_H as H, WALL, FLOOR_Y, LEFT, RIGHT, DROP_Y, DANGER_Y } from './physics'

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
    const timeLeft = ((120 - state.dangerT) / 60).toFixed(1)  // 120프레임 = 2초
    const progress = state.dangerT / 120

    // 경고 텍스트
    ctx.fillStyle = '#ff3c3c'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`⚠️ ${timeLeft}초`, LEFT + 5, DANGER_Y - 10)

    // 진행 바
    const barWidth = RIGHT - LEFT
    ctx.fillStyle = 'rgba(255,60,60,0.3)'
    ctx.fillRect(LEFT, DANGER_Y - 25, barWidth, 4)
    ctx.fillStyle = '#ff3c3c'
    ctx.fillRect(LEFT, DANGER_Y - 25, barWidth * progress, 4)
  }

  // 드롭 가이드
  if (state.canDrop && !state.over) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.setLineDash([3, 6])
    ctx.beginPath(); ctx.moveTo(state.dropX, DROP_Y); ctx.lineTo(state.dropX, FLOOR_Y); ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.7
    drawAnimal(ctx, state.dropX, DROP_Y / 2 + 12, ANIMALS[state.cur].r, state.cur)
    ctx.globalAlpha = 1

    // 자동 드롭 타이머 표시
    if (state.dropTimer !== undefined && state.dropTimerMax > 0) {
      const progress = state.dropTimer / state.dropTimerMax
      const timerColor = progress > 0.5 ? '#4CAF50' : progress > 0.25 ? '#FF9800' : '#F44336'
      const barWidth = 60
      const barX = state.dropX - barWidth / 2
      const barY = 8

      // 타이머 배경
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(barX, barY, barWidth, 5)
      // 타이머 진행
      ctx.fillStyle = timerColor
      ctx.fillRect(barX, barY, barWidth * progress, 5)

      // 남은 시간이 적으면 테두리 깜빡이기
      if (progress < 0.25) {
        const blink = Math.sin(Date.now() * 0.015) > 0
        if (blink) {
          ctx.strokeStyle = 'rgba(255,60,60,0.6)'
          ctx.lineWidth = 4
          ctx.strokeRect(2, 2, W - 4, H - 4)
        }
      }
    }
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
    // 콤보별 색상 변화
    let color
    if (p.combo >= 10) {
      color = `rgba(0,255,255,${alpha})` // 시안 (10콤보+)
    } else if (p.combo >= 5) {
      color = `rgba(255,105,180,${alpha})` // 핑크 (5-9콤보)
    } else {
      color = `rgba(255,215,0,${alpha})` // 황금 (1-4콤보)
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
    // 콤보별 색상 변화
    let comboColor
    if (state.combo >= 10) {
      comboColor = `rgba(0,255,255,${comboAlpha})` // 시안 (10콤보+)
    } else if (state.combo >= 5) {
      comboColor = `rgba(255,105,180,${comboAlpha})` // 핑크 (5-9콤보)
    } else {
      comboColor = `rgba(255,215,0,${comboAlpha})` // 황금 (1-4콤보)
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

  // 레벨 시스템
  const level = Math.min(Math.floor(state.score / 500) + 1, 6)
  const levelColors = ['#4CAF50', '#FFEB3B', '#FF9800', '#F44336', '#9C27B0', '#00E5FF']
  const levelProgress = (state.score % 500) / 500

  ctx.fillStyle = levelColors[level - 1]
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔥 LV.${level}`, 12, 56)

  // 진행도 바
  const barX = 70
  const barY = 58
  const barW = 100
  const barH = 6
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(barX, barY, barW, barH)
  ctx.fillStyle = levelColors[level - 1]
  ctx.fillRect(barX, barY, barW * levelProgress, barH)

  // 다음 동물 (크기 확대 및 배경 추가)
  const nextX = W - 40
  const nextY = 30
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  // 둥근 사각형 직접 그리기 (roundRect 호환성 문제 해결)
  const x = nextX - 35, y = 5, w = 70, h = 50, r = 8
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
  ctx.fill()

  ctx.font = '12px sans-serif'; ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('NEXT', nextX, 15)
  drawAnimal(ctx, nextX, nextY, ANIMALS[state.nxt].r * 0.55, state.nxt)

  // 일시정지
  if (paused && !state.over) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('⏸', W / 2, H / 2 - 20)
    ctx.font = '18px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText('일시정지', W / 2, H / 2 + 25)
  }

  // 게임오버
  if (state.over) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 34px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('GAME OVER', W / 2, H / 2 - 40)
    ctx.font = '22px sans-serif'
    ctx.fillText(`최종 점수: ${state.score}`, W / 2, H / 2 + 5)
    ctx.font = '15px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('클릭하여 다시 시작', W / 2, H / 2 + 45)
  }

  ctx.restore()
}
