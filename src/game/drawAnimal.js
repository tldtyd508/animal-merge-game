// 각 동물별 Canvas 2D 전신 드로잉
// 수박게임 스타일 버블 배경 + 동물별 개별 스케일

// 버블 배경색 (동물 테마에 맞춤)
const BUBBLE_COLORS = [
  { fill: '#BCAAA4', stroke: '#795548' },   // 개미 - 갈색
  { fill: '#CFD8DC', stroke: '#90A4AE' },   // 쥐 - 회색
  { fill: '#FFE0B2', stroke: '#FF9800' },   // 햄스터 - 주황
  { fill: '#FCE4EC', stroke: '#F48FB1' },   // 토끼 - 분홍
  { fill: '#FFCCBC', stroke: '#FF7043' },   // 고양이 - 피치
  { fill: '#D7CCC8', stroke: '#8D6E63' },   // 강아지 - 탄색
  { fill: '#FFAB91', stroke: '#E64A19' },   // 여우 - 살몬
  { fill: '#8D6E63', stroke: '#4E342E' },   // 곰 - 초콜릿
  { fill: '#FFE082', stroke: '#F9A825' },   // 사자 - 골드
  { fill: '#B0BEC5', stroke: '#607D8B' },   // 코끼리 - 블루그레이
  { fill: '#A5D6A7', stroke: '#2E7D32' },   // 공룡 - 그린
]

// 동물별 스케일 (각 동물의 시각적 크기를 버블에 맞춤)
const ANIMAL_SCALE = [
  1.18,  // 개미 (작아서 확대)
  1.05,  // 쥐
  1.00,  // 햄스터
  0.92,  // 토끼 (큰 귀 축소)
  0.96,  // 고양이 (긴 꼬리)
  1.08,  // 강아지
  1.00,  // 여우
  1.06,  // 곰
  1.03,  // 사자
  1.08,  // 코끼리
  1.00,  // 공룡
]

const VISUAL_R = 0.94  // physics.js SPACING_FACTOR와 동일

export function drawAnimal(ctx, x, y, r, type) {
  ctx.save()
  ctx.translate(x, y)

  // 버블 배경 (충돌 경계와 정확히 일치)
  const bubble = BUBBLE_COLORS[type]
  if (bubble) {
    const vr = r * VISUAL_R
    ctx.beginPath()
    ctx.arc(0, 0, vr, 0, Math.PI * 2)
    ctx.fillStyle = bubble.fill
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = bubble.stroke
    ctx.stroke()
  }

  // 동물별 스케일 적용
  const sc = ANIMAL_SCALE[type] || 1.0
  ctx.scale(sc, sc)

  const s = r / 45

  switch (type) {
    case 0: drawAnt(ctx, r, s); break
    case 1: drawMouse(ctx, r, s); break
    case 2: drawHamster(ctx, r, s); break
    case 3: drawRabbit(ctx, r, s); break
    case 4: drawCat(ctx, r, s); break
    case 5: drawDog(ctx, r, s); break
    case 6: drawFox(ctx, r, s); break
    case 7: drawBear(ctx, r, s); break
    case 8: drawLion(ctx, r, s); break
    case 9: drawElephant(ctx, r, s); break
    case 10: drawDino(ctx, r, s); break
  }

  ctx.restore()
}

// ── 개미: 가로로 긴 3마디 ──
function drawAnt(ctx, r, s) {
  const seg = r * 0.32
  ctx.strokeStyle = '#6D4C41'; ctx.lineWidth = 2 * s
  for (let i = -1; i <= 1; i++) {
    const bx = i * seg * 0.8
    ctx.beginPath(); ctx.moveTo(bx, -r*0.05); ctx.lineTo(bx-r*0.3, -r*0.35); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(bx, r*0.05); ctx.lineTo(bx-r*0.3, r*0.35); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(bx, -r*0.05); ctx.lineTo(bx+r*0.3, -r*0.35); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(bx, r*0.05); ctx.lineTo(bx+r*0.3, r*0.35); ctx.stroke()
  }
  ctx.beginPath(); ctx.moveTo(-seg*1.1, -r*0.1); ctx.quadraticCurveTo(-seg*1.5, -r*0.55, -seg*1.2, -r*0.5); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-seg*1.1, 0); ctx.quadraticCurveTo(-seg*1.5, 0, -seg*1.3, -r*0.3); ctx.stroke()
  ctx.fillStyle = '#8D6E63'
  ctx.beginPath(); ctx.ellipse(seg*0.9, 0, seg*0.55, r*0.35, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#A1887F'
  ctx.beginPath(); ctx.ellipse(0, 0, seg*0.35, r*0.22, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#8D6E63'
  ctx.beginPath(); ctx.ellipse(-seg*0.8, 0, seg*0.4, r*0.28, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-seg*0.95, -r*0.08, r*0.14, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-seg*0.95, r*0.08, r*0.14, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-seg*1.0, -r*0.08, r*0.07, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-seg*1.0, r*0.08, r*0.07, 0, Math.PI*2); ctx.fill()
}

// ── 쥐: 납작 동글 + 긴 꼬리 ──
function drawMouse(ctx, r, s) {
  ctx.strokeStyle = '#F48FB1'; ctx.lineWidth = 2*s; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(r*0.25, r*0.1); ctx.quadraticCurveTo(r*0.8, r*0.3, r*0.7, -r*0.15); ctx.stroke()
  ctx.fillStyle = '#BDBDBD'
  ctx.beginPath(); ctx.ellipse(0, r*0.05, r*0.5, r*0.4, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#E0E0E0'
  ctx.beginPath(); ctx.ellipse(0, r*0.12, r*0.3, r*0.22, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.ellipse(-r*0.3, r*0.38, r*0.1, r*0.06, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.15, r*0.38, r*0.1, r*0.06, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#9E9E9E'
  ctx.beginPath(); ctx.arc(-r*0.35, -r*0.3, r*0.18, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.05, -r*0.35, r*0.18, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.arc(-r*0.35, -r*0.3, r*0.1, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.05, -r*0.35, r*0.1, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-r*0.2, -r*0.05, r*0.07, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.18, -r*0.08, r*0.03, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.arc(-r*0.42, 0, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = '#999'; ctx.lineWidth = 1*s
  ctx.beginPath(); ctx.moveTo(-r*0.38, -r*0.05); ctx.lineTo(-r*0.65, -r*0.15); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-r*0.38, r*0.05); ctx.lineTo(-r*0.65, r*0.05); ctx.stroke()
}

// ── 햄스터: 완전 동그란 공 ──
function drawHamster(ctx, r, s) {
  ctx.fillStyle = '#FFAB40'
  ctx.beginPath(); ctx.arc(0, 0, r*0.82, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFF8E1'
  ctx.beginPath(); ctx.ellipse(0, r*0.15, r*0.5, r*0.45, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFE0B2'
  ctx.beginPath(); ctx.arc(-r*0.45, 0, r*0.22, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.45, 0, r*0.22, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FF8F00'
  ctx.beginPath(); ctx.arc(-r*0.45, -r*0.6, r*0.15, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.45, -r*0.6, r*0.15, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.arc(-r*0.45, -r*0.6, r*0.08, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.45, -r*0.6, r*0.08, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FF8F00'
  ctx.beginPath(); ctx.ellipse(-r*0.3, r*0.72, r*0.12, r*0.08, -0.2, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.3, r*0.72, r*0.12, r*0.08, 0.2, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.6, r*0.15, r*0.08, r*0.12, -0.3, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.6, r*0.15, r*0.08, r*0.12, 0.3, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-r*0.22, -r*0.2, r*0.08, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.22, -r*0.2, r*0.08, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.19, -r*0.23, r*0.035, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.25, -r*0.23, r*0.035, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#E65100'
  ctx.beginPath(); ctx.arc(0, -r*0.05, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = '#E65100'; ctx.lineWidth = 1.5*s
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-r*0.08, r*0.08, -r*0.12, r*0.04); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r*0.08, r*0.08, r*0.12, r*0.04); ctx.stroke()
}

// ── 토끼: 긴 귀 + 넓적 몸 ──
function drawRabbit(ctx, r, s) {
  ctx.fillStyle = '#F5F5F5'
  ctx.beginPath(); ctx.ellipse(-r*0.2, -r*0.55, r*0.12, r*0.42, -0.08, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.2, -r*0.55, r*0.12, r*0.42, 0.08, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.ellipse(-r*0.2, -r*0.55, r*0.06, r*0.3, -0.08, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.2, -r*0.55, r*0.06, r*0.3, 0.08, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(r*0.3, r*0.25, r*0.1, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F5F5F5'
  ctx.beginPath(); ctx.ellipse(0, r*0.15, r*0.55, r*0.35, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.ellipse(0, r*0.2, r*0.35, r*0.22, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.ellipse(-r*0.35, r*0.42, r*0.15, r*0.08, -0.15, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.2, r*0.42, r*0.15, r*0.08, 0.15, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F5F5F5'
  ctx.beginPath(); ctx.ellipse(0, -r*0.12, r*0.35, r*0.28, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#E91E63'
  ctx.beginPath(); ctx.arc(-r*0.12, -r*0.15, r*0.08, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.12, -r*0.15, r*0.08, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.1, -r*0.17, r*0.035, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.14, -r*0.17, r*0.035, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.ellipse(0, 0, r*0.05, r*0.035, 0, 0, Math.PI*2); ctx.fill()
}

// ── 고양이: 날씬한 옆모습 ──
function drawCat(ctx, r, s) {
  ctx.strokeStyle = '#FF8A65'; ctx.lineWidth = 5*s; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(r*0.5, 0); ctx.bezierCurveTo(r*0.9, -r*0.3, r*0.7, -r*0.7, r*0.4, -r*0.55); ctx.stroke()
  ctx.fillStyle = '#FF8A65'
  ctx.beginPath(); ctx.ellipse(0, r*0.05, r*0.6, r*0.32, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFCCBC'
  ctx.beginPath(); ctx.ellipse(r*0.05, r*0.12, r*0.35, r*0.18, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FF8A65'
  ctx.beginPath(); ctx.ellipse(r*0.35, r*0.28, r*0.12, r*0.15, 0.15, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.15, r*0.3, r*0.1, r*0.13, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.35, r*0.28, r*0.08, r*0.15, -0.1, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.2, r*0.3, r*0.07, r*0.13, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFCCBC'
  ctx.beginPath(); ctx.ellipse(-r*0.36, r*0.4, r*0.06, r*0.035, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.38, r*0.4, r*0.06, r*0.035, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FF8A65'
  ctx.beginPath(); ctx.ellipse(-r*0.45, -r*0.08, r*0.26, r*0.24, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-r*0.6, -r*0.15); ctx.lineTo(-r*0.58, -r*0.42); ctx.lineTo(-r*0.4, -r*0.2); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-r*0.35, -r*0.2); ctx.lineTo(-r*0.3, -r*0.42); ctx.lineTo(-r*0.2, -r*0.15); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.moveTo(-r*0.56, -r*0.18); ctx.lineTo(-r*0.56, -r*0.35); ctx.lineTo(-r*0.44, -r*0.2); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-r*0.33, -r*0.2); ctx.lineTo(-r*0.32, -r*0.36); ctx.lineTo(-r*0.24, -r*0.18); ctx.fill()
  ctx.fillStyle = '#8BC34A'
  ctx.beginPath(); ctx.ellipse(-r*0.52, -r*0.08, r*0.055, r*0.07, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.38, -r*0.08, r*0.055, r*0.07, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.ellipse(-r*0.52, -r*0.08, r*0.025, r*0.06, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.38, -r*0.08, r*0.025, r*0.06, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#F48FB1'
  ctx.beginPath(); ctx.moveTo(-r*0.45, r*0.02); ctx.lineTo(-r*0.47, r*0.06); ctx.lineTo(-r*0.43, r*0.06); ctx.fill()
  ctx.strokeStyle = '#BF360C'; ctx.lineWidth = 1*s
  ctx.beginPath(); ctx.moveTo(-r*0.5, r*0.08); ctx.lineTo(-r*0.75, r*0.02); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-r*0.5, r*0.1); ctx.lineTo(-r*0.75, r*0.12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-r*0.4, r*0.08); ctx.lineTo(-r*0.2, 0); ctx.stroke()
}

// ── 강아지: 통통 넓적 ──
function drawDog(ctx, r, s) {
  ctx.fillStyle = '#795548'
  ctx.beginPath(); ctx.moveTo(r*0.4, 0); ctx.quadraticCurveTo(r*0.75, -r*0.25, r*0.55, -r*0.35)
  ctx.quadraticCurveTo(r*0.6, -r*0.15, r*0.35, r*0.05); ctx.fill()
  ctx.fillStyle = '#A1887F'
  ctx.beginPath(); ctx.ellipse(0, r*0.05, r*0.55, r*0.42, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#D7CCC8'
  ctx.beginPath(); ctx.ellipse(0, r*0.15, r*0.35, r*0.28, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#A1887F'
  ctx.beginPath(); ctx.ellipse(-r*0.32, r*0.42, r*0.1, r*0.12, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.25, r*0.42, r*0.1, r*0.12, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.12, r*0.42, r*0.08, r*0.1, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.1, r*0.42, r*0.08, r*0.1, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#A1887F'
  ctx.beginPath(); ctx.ellipse(-r*0.1, -r*0.3, r*0.38, r*0.3, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#795548'
  ctx.beginPath(); ctx.ellipse(-r*0.42, -r*0.2, r*0.13, r*0.26, -0.25, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.22, -r*0.2, r*0.13, r*0.26, 0.25, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#D7CCC8'
  ctx.beginPath(); ctx.ellipse(-r*0.1, -r*0.18, r*0.2, r*0.15, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-r*0.22, -r*0.35, r*0.06, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.05, -r*0.35, r*0.06, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.2, -r*0.37, r*0.025, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.07, -r*0.37, r*0.025, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#3E2723'
  ctx.beginPath(); ctx.ellipse(-r*0.1, -r*0.2, r*0.06, r*0.04, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#E91E63'
  ctx.beginPath(); ctx.ellipse(-r*0.1, -r*0.08, r*0.05, r*0.08, 0, 0, Math.PI); ctx.fill()
}

// ── 여우: 날렵 + 큰 꼬리 ──
function drawFox(ctx, r, s) {
  ctx.fillStyle = '#FF7043'
  ctx.beginPath(); ctx.moveTo(r*0.3, 0); ctx.bezierCurveTo(r*0.9, r*0.15, r*0.95, -r*0.4, r*0.55, -r*0.5)
  ctx.bezierCurveTo(r*0.35, -r*0.35, r*0.4, -r*0.05, r*0.25, r*0.05); ctx.fill()
  ctx.fillStyle = '#FFF9C4'
  ctx.beginPath(); ctx.moveTo(r*0.6, -r*0.45); ctx.bezierCurveTo(r*0.5, -r*0.3, r*0.45, -r*0.15, r*0.4, -r*0.05)
  ctx.quadraticCurveTo(r*0.5, -r*0.2, r*0.6, -r*0.45); ctx.fill()
  ctx.fillStyle = '#FF7043'
  ctx.beginPath(); ctx.ellipse(0, r*0.05, r*0.4, r*0.3, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFF9C4'
  ctx.beginPath(); ctx.ellipse(0, r*0.12, r*0.22, r*0.18, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#BF360C'
  ctx.beginPath(); ctx.ellipse(-r*0.25, r*0.32, r*0.06, r*0.15, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.15, r*0.32, r*0.06, r*0.15, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#222'
  ctx.beginPath(); ctx.ellipse(-r*0.25, r*0.44, r*0.055, r*0.03, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.15, r*0.44, r*0.055, r*0.03, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FF7043'
  ctx.beginPath(); ctx.ellipse(-r*0.25, -r*0.18, r*0.28, r*0.22, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFF9C4'
  ctx.beginPath(); ctx.ellipse(-r*0.42, -r*0.1, r*0.12, r*0.1, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FF7043'
  ctx.beginPath(); ctx.moveTo(-r*0.42, -r*0.28); ctx.lineTo(-r*0.38, -r*0.58); ctx.lineTo(-r*0.22, -r*0.32); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-r*0.15, -r*0.3); ctx.lineTo(-r*0.08, -r*0.55); ctx.lineTo(0, -r*0.28); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-r*0.32, -r*0.22, r*0.045, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.17, -r*0.22, r*0.045, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.3, -r*0.24, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.15, -r*0.24, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#222'
  ctx.beginPath(); ctx.arc(-r*0.48, -r*0.1, r*0.035, 0, Math.PI*2); ctx.fill()
}

// ── 곰: 넓고 둥글, 앉아있는 포즈 ──
function drawBear(ctx, r, s) {
  ctx.fillStyle = '#6D4C41'
  ctx.beginPath(); ctx.ellipse(0, r*0.1, r*0.65, r*0.55, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#D7CCC8'
  ctx.beginPath(); ctx.ellipse(0, r*0.15, r*0.4, r*0.38, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#5D4037'
  ctx.beginPath(); ctx.ellipse(-r*0.5, r*0.5, r*0.18, r*0.12, -0.3, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.5, r*0.5, r*0.18, r*0.12, 0.3, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#8D6E63'
  ctx.beginPath(); ctx.ellipse(-r*0.5, r*0.5, r*0.1, r*0.07, -0.3, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.5, r*0.5, r*0.1, r*0.07, 0.3, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#6D4C41'
  ctx.beginPath(); ctx.ellipse(-r*0.55, 0, r*0.12, r*0.2, -0.2, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.55, 0, r*0.12, r*0.2, 0.2, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(0, -r*0.38, r*0.32, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.28, -r*0.62, r*0.13, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.28, -r*0.62, r*0.13, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#8D6E63'
  ctx.beginPath(); ctx.arc(-r*0.28, -r*0.62, r*0.07, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.28, -r*0.62, r*0.07, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#D7CCC8'
  ctx.beginPath(); ctx.ellipse(0, -r*0.28, r*0.16, r*0.12, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-r*0.12, -r*0.42, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.12, -r*0.42, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.1, -r*0.44, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.14, -r*0.44, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#222'
  ctx.beginPath(); ctx.ellipse(0, -r*0.3, r*0.06, r*0.04, 0, 0, Math.PI*2); ctx.fill()
}

// ── 사자: 거대한 갈기 ──
function drawLion(ctx, r, s) {
  ctx.strokeStyle = '#FFB300'; ctx.lineWidth = 3*s; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(r*0.4, r*0.15); ctx.bezierCurveTo(r*0.8, r*0.3, r*0.85, 0, r*0.65, -r*0.1); ctx.stroke()
  ctx.fillStyle = '#E65100'
  ctx.beginPath(); ctx.arc(r*0.65, -r*0.1, r*0.06, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFB300'
  ctx.beginPath(); ctx.ellipse(r*0.05, r*0.1, r*0.5, r*0.38, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFF8E1'
  ctx.beginPath(); ctx.ellipse(r*0.05, r*0.18, r*0.3, r*0.24, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFB300'
  ctx.beginPath(); ctx.ellipse(-r*0.2, r*0.42, r*0.09, r*0.14, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.3, r*0.42, r*0.09, r*0.14, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#E65100'
  for (let i = 0; i < 16; i++) {
    const a = (i/16) * Math.PI*2
    ctx.beginPath(); ctx.ellipse(-r*0.2 + Math.cos(a)*r*0.35, -r*0.25 + Math.sin(a)*r*0.35, r*0.2, r*0.13, a, 0, Math.PI*2); ctx.fill()
  }
  ctx.fillStyle = '#FFB300'
  ctx.beginPath(); ctx.arc(-r*0.2, -r*0.25, r*0.28, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-r*0.3, -r*0.28, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.1, -r*0.28, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.28, -r*0.3, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.08, -r*0.3, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#5D4037'
  ctx.beginPath(); ctx.moveTo(-r*0.2, -r*0.16); ctx.lineTo(-r*0.23, -r*0.12); ctx.lineTo(-r*0.17, -r*0.12); ctx.fill()
}

// ── 코끼리: 가장 넓적하고 무거운 ──
function drawElephant(ctx, r, s) {
  ctx.fillStyle = '#90A4AE'
  ctx.beginPath(); ctx.ellipse(0, r*0.05, r*0.7, r*0.5, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#B0BEC5'
  ctx.beginPath(); ctx.ellipse(0, r*0.12, r*0.42, r*0.32, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#78909C'
  ctx.beginPath(); ctx.ellipse(-r*0.4, r*0.45, r*0.14, r*0.18, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.4, r*0.45, r*0.14, r*0.18, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.15, r*0.48, r*0.12, r*0.16, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.15, r*0.48, r*0.12, r*0.16, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#CFD8DC'
  for (const lx of [-r*0.4, r*0.4, -r*0.15, r*0.15]) {
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(lx + i*r*0.04, r*0.6, r*0.025, 0, Math.PI*2); ctx.fill() }
  }
  ctx.fillStyle = '#90A4AE'
  ctx.beginPath(); ctx.ellipse(0, -r*0.35, r*0.35, r*0.3, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#78909C'
  ctx.beginPath(); ctx.ellipse(-r*0.55, -r*0.2, r*0.25, r*0.35, -0.1, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.55, -r*0.2, r*0.25, r*0.35, 0.1, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#B0BEC5'
  ctx.beginPath(); ctx.ellipse(-r*0.55, -r*0.2, r*0.15, r*0.22, -0.1, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.55, -r*0.2, r*0.15, r*0.22, 0.1, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = r*0.13; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, -r*0.2); ctx.quadraticCurveTo(-r*0.1, r*0.1, r*0.1, r*0.2); ctx.stroke()
  ctx.strokeStyle = '#78909C'; ctx.lineWidth = r*0.08
  ctx.beginPath(); ctx.moveTo(0, -r*0.2); ctx.quadraticCurveTo(-r*0.1, r*0.1, r*0.1, r*0.2); ctx.stroke()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-r*0.15, -r*0.38, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.15, -r*0.38, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.13, -r*0.4, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(r*0.17, -r*0.4, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#ECEFF1'
  ctx.beginPath(); ctx.moveTo(-r*0.1, -r*0.15); ctx.quadraticCurveTo(-r*0.2, r*0.05, -r*0.15, r*0.1); ctx.lineTo(-r*0.08, r*0.05); ctx.fill()
  ctx.beginPath(); ctx.moveTo(r*0.1, -r*0.15); ctx.quadraticCurveTo(r*0.2, r*0.05, r*0.15, r*0.1); ctx.lineTo(r*0.08, r*0.05); ctx.fill()
}

// ── 공룡: 가로로 길게 + 꼬리 + 등돌기 ──
function drawDino(ctx, r, s) {
  ctx.fillStyle = '#2E7D32'
  for (let i = -3; i <= 2; i++) {
    const bx = i * r*0.15
    ctx.beginPath(); ctx.moveTo(bx - r*0.05, -r*0.2); ctx.lineTo(bx, -r*0.38); ctx.lineTo(bx + r*0.05, -r*0.2); ctx.fill()
  }
  ctx.fillStyle = '#66BB6A'
  ctx.beginPath(); ctx.moveTo(r*0.4, 0); ctx.bezierCurveTo(r*0.85, r*0.1, r*0.9, -r*0.05, r*0.75, -r*0.15)
  ctx.bezierCurveTo(r*0.7, -r*0.05, r*0.6, r*0.05, r*0.35, r*0.08); ctx.fill()
  ctx.fillStyle = '#2E7D32'
  ctx.beginPath(); ctx.moveTo(r*0.6, -r*0.02); ctx.lineTo(r*0.63, -r*0.15); ctx.lineTo(r*0.66, -r*0.02); ctx.fill()
  ctx.beginPath(); ctx.moveTo(r*0.75, -r*0.08); ctx.lineTo(r*0.77, -r*0.2); ctx.lineTo(r*0.8, -r*0.08); ctx.fill()
  ctx.fillStyle = '#66BB6A'
  ctx.beginPath(); ctx.ellipse(0, 0, r*0.5, r*0.35, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#A5D6A7'
  ctx.beginPath(); ctx.ellipse(0, r*0.1, r*0.32, r*0.22, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#4CAF50'
  ctx.beginPath(); ctx.ellipse(-r*0.25, r*0.32, r*0.1, r*0.16, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(r*0.2, r*0.32, r*0.1, r*0.16, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#FFF9C4'
  for (const lx of [-r*0.25, r*0.2]) {
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(lx + i*r*0.04, r*0.46, r*0.02, r*0.04, 0, 0, Math.PI*2); ctx.fill() }
  }
  ctx.fillStyle = '#66BB6A'
  ctx.beginPath(); ctx.ellipse(-r*0.38, 0, r*0.05, r*0.1, -0.5, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.32, r*0.08, r*0.04, r*0.08, -0.3, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(-r*0.38, -r*0.15, r*0.25, r*0.22, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.48, -r*0.2, r*0.08, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.3, -r*0.2, r*0.08, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-r*0.46, -r*0.19, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.28, -r*0.19, r*0.05, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-r*0.44, -r*0.21, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-r*0.26, -r*0.21, r*0.02, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#388E3C'
  ctx.beginPath(); ctx.ellipse(-r*0.42, -r*0.02, r*0.18, r*0.06, 0, 0, Math.PI); ctx.fill()
  ctx.fillStyle = '#fff'
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(-r*0.42 + i*r*0.04, -r*0.02, r*0.015, r*0.035, 0, 0, Math.PI*2); ctx.fill() }
}
