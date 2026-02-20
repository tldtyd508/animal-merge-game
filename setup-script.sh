#!/bin/bash
# changup 프로젝트 초기 셋업 스크립트
# 사용법: cd changup && bash setup.sh

echo "🐾 동물 합치기 게임 프로젝트 셋업 시작..."

# ─────────────────────────────────────
# CLAUDE.md
# ─────────────────────────────────────
cat > CLAUDE.md << 'CLAUDE_EOF'
# 동물 합치기 게임 (Merge Animals)

## 프로젝트 개요
수박게임(Suika Game) 스타일의 동물 합치기 캐주얼 웹 게임.
같은 동물 두 마리를 합쳐서 더 큰 동물로 진화시키는 물리 기반 퍼즐 게임.

## 기술 스택
- **프레임워크**: Vite + React
- **렌더링**: HTML5 Canvas 2D
- **물리엔진**: 자체 구현 (중력, 충돌, 바운스)
- **배포**: Vercel (예정)
- **패키지 매니저**: npm

## 게임 메커니즘
- 11단계 동물 진화: 개미 → 쥐 → 햄스터 → 토끼 → 고양이 → 강아지 → 여우 → 곰 → 사자 → 코끼리 → 공룡
- 드롭 가능한 동물: 처음 4종 (개미, 쥐, 햄스터, 토끼) 중 랜덤
- 같은 동물이 충돌하면 한 단계 위 동물로 합체
- 동물이 위험선(DANGER_Y)을 넘으면 게임 오버
- 드롭 후 400ms 쿨다운

## 물리 파라미터
- 중력(G): 0.45
- 바운스: 0.55
- 마찰: 0.98
- 서브스텝: 5회/프레임

## 동물별 특징 (각양각색 체형 - 매우 중요)
각 동물은 서로 다른 실루엣과 체형을 가져야 한다:
- 개미: 가로로 긴 3마디 몸통 + 6개 다리 (옆으로 넓적)
- 쥐: 옆모습, 납작 동글 + 긴 꼬리
- 햄스터: 완전 동그란 공 모양 (가장 둥글둥글)
- 토끼: 위로 쭉 뻗은 귀 + 넓적한 몸
- 고양이: 날씬하고 가로로 긴 옆모습
- 강아지: 통통 넓적, 짧은 다리
- 여우: 날렵한 몸 + 몸만한 큰 꼬리
- 곰: 앉아있는 포즈, 가장 넓고 둥글
- 사자: 머리보다 큰 갈기 + 가로 몸
- 코끼리: 가장 넓적하고 무거운 느낌 + 상아
- 공룡: 가로로 길게 + 긴 꼬리 + 등 돌기

## 프로젝트 구조
```
changup/
├── CLAUDE.md          # 이 파일
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── favicon.ico
└── src/
    ├── main.jsx           # React 엔트리포인트
    ├── App.jsx            # 앱 루트
    ├── App.css
    ├── game/
    │   ├── MergeGame.jsx      # 게임 메인 컴포넌트
    │   ├── physics.js         # 물리엔진 (중력, 충돌, 바운스)
    │   ├── animals.js         # 동물 데이터 (이름, 반지름, 점수)
    │   ├── renderer.js        # Canvas 렌더러 (배경, UI, 이펙트)
    │   └── drawAnimal.js     # 동물별 Canvas 드로잉 함수
    └── ui/
        ├── ScoreBoard.jsx     # 점수 표시
        └── GameOver.jsx       # 게임오버 화면
```

## 현재 상태
- [x] 프로토타입 완성 (단일 파일, Canvas 기반)
- [x] 물리엔진 동작 확인
- [x] 11종 동물 Canvas 드로잉 (각양각색 체형)
- [x] 합체 이펙트 + 동물 이름 표시
- [ ] 파일 분리 (game/, ui/ 구조)
- [ ] 동물 에셋을 실제 이미지(SVG/PNG)로 교체
- [ ] 효과음 추가
- [ ] 합체 애니메이션 강화 (파티클 등)
- [ ] 최고점수 저장 (localStorage)
- [ ] 랭킹 시스템 (백엔드 필요)
- [ ] 모바일 터치 최적화
- [ ] PWA 지원
- [ ] 배포 (Vercel)

## 수익화 계획 (미정)
- 리워드 광고 (부활 시)
- 인앱결제 (동물 스킨)
- 하루 1회 도전 모드

## 코딩 컨벤션
- 한국어 주석 사용
- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 상수: UPPER_SNAKE_CASE
- Canvas 좌표계: 좌상단 (0,0), 우하단 (W,H)
CLAUDE_EOF

# ─────────────────────────────────────
# package.json
# ─────────────────────────────────────
cat > package.json << 'PKG_EOF'
{
  "name": "merge-animals",
  "private": true,
  "version": "0.1.0",
  "description": "동물 합치기 게임 - 수박게임 스타일 캐주얼 웹 게임",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.0"
  }
}
PKG_EOF

# ─────────────────────────────────────
# vite.config.js
# ─────────────────────────────────────
cat > vite.config.js << 'VITE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
})
VITE_EOF

# ─────────────────────────────────────
# index.html
# ─────────────────────────────────────
cat > index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#0a0a1a" />
    <title>🐾 동물 합치기</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #0a0a1a; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
HTML_EOF

# ─────────────────────────────────────
# 디렉토리 생성
# ─────────────────────────────────────
mkdir -p src/game src/ui public

# ─────────────────────────────────────
# src/main.jsx
# ─────────────────────────────────────
cat > src/main.jsx << 'MAIN_EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
MAIN_EOF

# ─────────────────────────────────────
# src/App.css
# ─────────────────────────────────────
cat > src/App.css << 'CSS_EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
CSS_EOF

# ─────────────────────────────────────
# src/App.jsx
# ─────────────────────────────────────
cat > src/App.jsx << 'APP_EOF'
import MergeGame from './game/MergeGame'

export default function App() {
  return <MergeGame />
}
APP_EOF

# ─────────────────────────────────────
# src/game/animals.js
# ─────────────────────────────────────
cat > src/game/animals.js << 'ANIMALS_EOF'
// 동물 데이터 정의
// r: 충돌 반지름, pts: 합체 시 획득 점수
export const ANIMALS = [
  { name: '개미',     r: 18, pts: 2   },
  { name: '쥐',       r: 23, pts: 5   },
  { name: '햄스터',   r: 29, pts: 10  },
  { name: '토끼',     r: 36, pts: 18  },
  { name: '고양이',   r: 44, pts: 30  },
  { name: '강아지',   r: 52, pts: 48  },
  { name: '여우',     r: 60, pts: 72  },
  { name: '곰',       r: 69, pts: 105 },
  { name: '사자',     r: 78, pts: 150 },
  { name: '코끼리',   r: 88, pts: 210 },
  { name: '공룡',     r: 98, pts: 300 },
]

// 드롭 가능한 동물: 처음 4종만
export const DROP_TYPES = 4
ANIMALS_EOF

# ─────────────────────────────────────
# src/game/physics.js
# ─────────────────────────────────────
cat > src/game/physics.js << 'PHYSICS_EOF'
import { ANIMALS } from './animals'

// 물리 상수
export const GRAVITY = 0.45
export const BOUNCE = 0.55
export const FRICTION = 0.98
export const SUB_STEPS = 5

// 게임 영역
export const CANVAS_W = 380
export const CANVAS_H = 640
export const WALL = 6
export const FLOOR_Y = CANVAS_H - WALL
export const LEFT = WALL
export const RIGHT = CANVAS_W - WALL
export const DROP_Y = 80
export const DANGER_Y = 110

let _uid = 0
export function nextId() { return _uid++ }

// 단일 공의 위치 업데이트 (서브스텝 1회분)
export function updateBall(b) {
  const dt = 1 / SUB_STEPS
  b.vy += GRAVITY * dt
  b.vx *= FRICTION
  b.x += b.vx * dt
  b.y += b.vy * dt

  // 벽 충돌
  if (b.x - b.r < LEFT) {
    b.x = LEFT + b.r
    b.vx = Math.abs(b.vx) * BOUNCE
  }
  if (b.x + b.r > RIGHT) {
    b.x = RIGHT - b.r
    b.vx = -Math.abs(b.vx) * BOUNCE
  }
  // 바닥 충돌
  if (b.y + b.r > FLOOR_Y) {
    b.y = FLOOR_Y - b.r
    b.vy = -Math.abs(b.vy) * BOUNCE
    if (Math.abs(b.vy) < 0.5) b.vy = 0
  }
}

// 두 공 간 충돌 처리. 합체 가능하면 true 반환
export function resolvePair(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.sqrt(dx * dx + dy * dy) || 0.1
  const minDist = a.r + b.r

  if (d >= minDist) return false

  // 같은 타입이면 합체 대상
  if (a.type === b.type && a.type < ANIMALS.length - 1 && !a.del && !b.del) {
    return true // 합체 가능
  }

  // 일반 충돌 해소
  const nx = dx / d
  const ny = dy / d
  const overlap = minDist - d
  const totalR = a.r + b.r

  a.x -= nx * overlap * (b.r / totalR) * 0.5
  a.y -= ny * overlap * (b.r / totalR) * 0.5
  b.x += nx * overlap * (a.r / totalR) * 0.5
  b.y += ny * overlap * (a.r / totalR) * 0.5

  // 상대 속도에 따른 임펄스
  const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (dvn > 0) {
    const imp = dvn * 0.5
    a.vx -= imp * nx * (b.r / totalR)
    a.vy -= imp * ny * (b.r / totalR)
    b.vx += imp * nx * (a.r / totalR)
    b.vy += imp * ny * (a.r / totalR)
  }

  return false
}
PHYSICS_EOF

# ─────────────────────────────────────
# src/game/drawAnimal.js (전체 드로잉 함수)
# ─────────────────────────────────────
cat > src/game/drawAnimal.js << 'DRAW_EOF'
// 각 동물별 Canvas 2D 전신 드로잉
// 각양각색의 체형: 가로형, 둥근형, 날씬형, 넓적형 등

export function drawAnimal(ctx, x, y, r, type) {
  ctx.save()
  ctx.translate(x, y)
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
  ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 1.5 * s
  for (let i = -1; i <= 1; i++) {
    const bx = i * seg * 0.8
    ctx.beginPath(); ctx.moveTo(bx, -r*0.05); ctx.lineTo(bx-r*0.3, -r*0.35); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(bx, r*0.05); ctx.lineTo(bx-r*0.3, r*0.35); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(bx, -r*0.05); ctx.lineTo(bx+r*0.3, -r*0.35); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(bx, r*0.05); ctx.lineTo(bx+r*0.3, r*0.35); ctx.stroke()
  }
  ctx.beginPath(); ctx.moveTo(-seg*1.1, -r*0.1); ctx.quadraticCurveTo(-seg*1.5, -r*0.55, -seg*1.2, -r*0.5); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-seg*1.1, 0); ctx.quadraticCurveTo(-seg*1.5, 0, -seg*1.3, -r*0.3); ctx.stroke()
  ctx.fillStyle = '#5D4037'
  ctx.beginPath(); ctx.ellipse(seg*0.9, 0, seg*0.55, r*0.35, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#6D4C41'
  ctx.beginPath(); ctx.ellipse(0, 0, seg*0.35, r*0.22, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#5D4037'
  ctx.beginPath(); ctx.ellipse(-seg*0.8, 0, seg*0.4, r*0.28, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-seg*0.95, -r*0.08, r*0.1, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-seg*0.95, r*0.08, r*0.1, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(-seg*1.0, -r*0.08, r*0.055, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(-seg*1.0, r*0.08, r*0.055, 0, Math.PI*2); ctx.fill()
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
DRAW_EOF

# ─────────────────────────────────────
# src/game/renderer.js
# ─────────────────────────────────────
cat > src/game/renderer.js << 'RENDER_EOF'
import { ANIMALS } from './animals'
import { drawAnimal } from './drawAnimal'
import { CANVAS_W as W, CANVAS_H as H, WALL, FLOOR_Y, LEFT, RIGHT, DROP_Y, DANGER_Y } from './physics'

// 게임 화면 전체 렌더링
export function render(ctx, state) {
  // 배경
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, W, H)

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

  // 드롭 가이드
  if (state.canDrop && !state.over) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.setLineDash([3, 6])
    ctx.beginPath(); ctx.moveTo(state.dropX, DROP_Y); ctx.lineTo(state.dropX, FLOOR_Y); ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.7
    drawAnimal(ctx, state.dropX, DROP_Y / 2 + 12, ANIMALS[state.cur].r * 0.7, state.cur)
    ctx.globalAlpha = 1
  }

  // 동물들
  for (const b of state.balls) {
    drawAnimal(ctx, b.x, b.y, b.r, b.type)
  }

  // 합체 이펙트
  for (const f of state.fx) {
    const p = f.t / 30
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 + p * 0.8), 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255,215,0,${1 - p})`
    ctx.lineWidth = 3 * (1 - p); ctx.stroke()
    if (f.t < 20) {
      ctx.fillStyle = `rgba(255,255,255,${0.9 - p})`
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(f.name + '!', f.x, f.y - f.r - 10 - f.t * 1.5)
    }
  }

  // 점수 UI
  ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  ctx.fillText(`점수 ${state.score}`, 12, 12)

  // 다음 동물
  ctx.font = '13px sans-serif'; ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('다음', W - 50, 8)
  drawAnimal(ctx, W - 22, 22, ANIMALS[state.nxt].r * 0.4, state.nxt)

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
}
RENDER_EOF

# ─────────────────────────────────────
# src/game/MergeGame.jsx (메인 게임 컴포넌트)
# ─────────────────────────────────────
cat > src/game/MergeGame.jsx << 'GAME_EOF'
import { useEffect, useRef, useState } from 'react'
import { ANIMALS, DROP_TYPES } from './animals'
import { CANVAS_W as W, CANVAS_H as H, LEFT, RIGHT, DROP_Y, DANGER_Y, SUB_STEPS, nextId, updateBall, resolvePair } from './physics'
import { render } from './renderer'

export default function MergeGame() {
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
    dangerT: 0,
  })
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)

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

      if (!s.over) {
        // 물리 서브스텝
        for (let sub = 0; sub < SUB_STEPS; sub++) {
          for (const b of s.balls) updateBall(b)

          // 충돌 검사
          const merges = []
          for (let i = 0; i < s.balls.length; i++) {
            for (let j = i + 1; j < s.balls.length; j++) {
              const canMerge = resolvePair(s.balls[i], s.balls[j])
              if (canMerge) {
                merges.push([i, j])
                s.balls[i].del = true
                s.balls[j].del = true
              }
            }
          }

          // 합체 처리
          for (const [i, j] of merges) {
            const a = s.balls[i], b2 = s.balls[j]
            const nt = a.type + 1
            s.balls.push({
              id: nextId(), type: nt,
              x: (a.x + b2.x) / 2, y: (a.y + b2.y) / 2,
              vx: 0, vy: -2, r: ANIMALS[nt].r,
              born: Date.now(),
            })
            s.score += ANIMALS[nt].pts
            s.fx.push({
              x: (a.x + b2.x) / 2, y: (a.y + b2.y) / 2,
              r: ANIMALS[nt].r, t: 0, name: ANIMALS[nt].name,
            })
          }
          if (merges.length) s.balls = s.balls.filter(b => !b.del)
        }

        // 이펙트 업데이트
        s.fx = s.fx.filter(f => { f.t++; return f.t < 30 })

        // 위험 판정
        const now = Date.now()
        const danger = s.balls.some(b => b.y - b.r < DANGER_Y && now - b.born > 2000)
        if (danger) { s.dangerT++; if (s.dangerT > 90) { s.over = true; setOver(true) } }
        else s.dangerT = 0

        setScore(s.score)
      }

      // 렌더링
      const c = cvs.current
      if (c) render(c.getContext('2d'), s)

      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onMove = (e) => {
    e.preventDefault()
    const s = g.current
    if (s.over) return
    const p = pos(e)
    const r = ANIMALS[s.cur].r
    s.dropX = Math.max(LEFT + r, Math.min(RIGHT - r, p.x))
  }

  const onDrop = (e) => {
    e.preventDefault()
    const s = g.current

    if (s.over) {
      // 재시작
      s.balls = []; s.score = 0; s.fx = []; s.dangerT = 0
      s.cur = Math.floor(Math.random() * DROP_TYPES)
      s.nxt = Math.floor(Math.random() * DROP_TYPES)
      s.canDrop = true; s.over = false
      setScore(0); setOver(false)
      return
    }

    if (!s.canDrop) return
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
    setTimeout(() => { s.canDrop = true }, 400)
  }

  const restart = () => {
    const s = g.current
    s.balls = []; s.score = 0; s.fx = []; s.dangerT = 0
    s.cur = Math.floor(Math.random() * DROP_TYPES)
    s.nxt = Math.floor(Math.random() * DROP_TYPES)
    s.canDrop = true; s.over = false
    setScore(0); setOver(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a1a', minHeight: '100vh', padding: '8px 4px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 380, marginBottom: 6 }}>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>🐾 동물 합치기</span>
        <button onClick={restart} style={{ background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}>다시하기</button>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 380 }}>
        {ANIMALS.map((a, i) => (
          <span key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            {a.name}{i < ANIMALS.length - 1 ? ' →' : ''}
          </span>
        ))}
      </div>
      <canvas
        ref={cvs} width={W} height={H}
        style={{ width: '100%', maxWidth: 380, borderRadius: 12, cursor: 'pointer', touchAction: 'none' }}
        onMouseMove={onMove} onClick={onDrop}
        onTouchMove={onMove} onTouchEnd={onDrop}
      />
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 6 }}>
        같은 동물을 합쳐서 더 큰 동물로 진화시키세요!
      </div>
    </div>
  )
}
GAME_EOF

# ─────────────────────────────────────
# README.md
# ─────────────────────────────────────
cat > README.md << 'README_EOF'
# 🐾 동물 합치기 (Merge Animals)

수박게임(Suika Game) 스타일의 동물 합치기 캐주얼 웹 게임

## 시작하기

```bash
npm install
npm run dev
```

## 게임 방법

- 마우스/터치로 좌우 이동, 클릭/탭으로 동물 드롭
- 같은 동물이 만나면 한 단계 큰 동물로 진화
- 개미 → 쥐 → 햄스터 → 토끼 → 고양이 → 강아지 → 여우 → 곰 → 사자 → 코끼리 → 공룡 🦕
- 동물이 빨간 점선 위로 넘치면 게임 오버

## 기술 스택

- Vite + React
- HTML5 Canvas 2D
- 자체 물리엔진
README_EOF

# ─────────────────────────────────────
# .gitignore
# ─────────────────────────────────────
cat > .gitignore << 'GIT_EOF'
node_modules/
dist/
.DS_Store
*.local
GIT_EOF

echo ""
echo "✅ 프로젝트 셋업 완료!"
echo ""
echo "📁 생성된 파일:"
echo "  CLAUDE.md          - Claude Code 컨텍스트"
echo "  package.json       - 의존성"
echo "  vite.config.js     - Vite 설정"
echo "  index.html         - 엔트리"
echo "  src/main.jsx       - React 엔트리"
echo "  src/App.jsx        - 앱 루트"
echo "  src/App.css        - 스타일"
echo "  src/game/animals.js    - 동물 데이터"
echo "  src/game/physics.js    - 물리엔진"
echo "  src/game/drawAnimal.js - 동물 드로잉"
echo "  src/game/renderer.js   - Canvas 렌더러"
echo "  src/game/MergeGame.jsx - 게임 컴포넌트"
echo "  README.md          - 프로젝트 설명"
echo "  .gitignore"
echo ""
echo "🚀 다음 단계:"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "그 다음 Claude Code에서:"
echo "  claude"
echo "  → CLAUDE.md를 자동으로 읽고 프로젝트를 파악합니다"
