// 물리 상수
export const GRAVITY = 0.50  // 낙하 속도
export const BOUNCE = 0.45   // 탱탱한 반발 (역동적)
export const FRICTION = 0.95 // 바닥 미끄러짐 (더 활발)
export const AIR_RESISTANCE = 0.995 // 공중 저항
export const SPACING_FACTOR = 0.92 // 동물 간 간격 (더 밀착)
export const SUB_STEPS = 5

// 게임 영역 (난이도 증가: 폭 축소, 위험선 상승)
export const CANVAS_W = 360  // 380 → 360 (좁아짐)
export const CANVAS_H = 640
export const WALL = 6
export const FLOOR_Y = CANVAS_H - WALL
export const LEFT = WALL
export const RIGHT = CANVAS_W - WALL
export const DROP_Y = 80
export const DANGER_Y = 140  // 110 → 140 (위험선 상승)

let _uid = 0
export function nextId() { return _uid++ }

// 단일 공의 위치 업데이트 (서브스텝 1회분)
export function updateBall(b) {
  // 서브스텝은 정확도를 위한 것이므로 dt = 1
  b.vy += GRAVITY
  b.x += b.vx
  b.y += b.vy

  // 공중 마찰 (항상 적용되어 수평 속도 감쇠)
  b.vx *= AIR_RESISTANCE

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
    b.vx *= FRICTION // 바닥 추가 마찰
    if (Math.abs(b.vy) < 1.0) b.vy = 0
    if (Math.abs(b.vx) < 0.3) b.vx = 0
  }
}

// 두 공 간 충돌 해소 (물리 처리만 담당)
export function resolvePair(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.sqrt(dx * dx + dy * dy) || 0.1
  const minDist = (a.r + b.r) * SPACING_FACTOR // 간격 축소

  if (d >= minDist) return

  // 충돌 해소
  const nx = dx / d
  const ny = dy / d
  const overlap = minDist - d
  const totalR = a.r + b.r

  // 수직 충돌(위에서 떨어지는 경우) 시 수평 보정 최소화
  const isVerticalCollision = Math.abs(ny) > 0.7
  const horizontalFactor = isVerticalCollision ? 0.3 : 0.5
  const verticalFactor = overlap < 1 ? 0.3 : 0.65 // 미세 떨림 방지

  a.x -= nx * overlap * (b.r / totalR) * horizontalFactor
  a.y -= ny * overlap * (b.r / totalR) * verticalFactor
  b.x += nx * overlap * (a.r / totalR) * horizontalFactor
  b.y += ny * overlap * (a.r / totalR) * verticalFactor

  // 상대 속도에 따른 임펄스
  const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (dvn > 0) {
    const imp = dvn * 0.5
    a.vx -= imp * nx * (b.r / totalR)
    a.vy -= imp * ny * (b.r / totalR)
    b.vx += imp * nx * (a.r / totalR)
    b.vy += imp * ny * (a.r / totalR)
  }

  // 동물 간 충돌 마찰
  a.vx *= 0.94
  b.vx *= 0.94
}
