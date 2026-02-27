// 물리 상수 (수박게임 참고 튜닝)
export const GRAVITY = 0.55   // 프레임당 중력 (서브스텝 내에서 나눠서 적용)
export const BOUNCE = 0.25    // 낮은 반발 (무거운 느낌)
export const FRICTION = 0.85  // 강한 바닥 마찰
export const AIR_RESISTANCE = 0.995 // 공중 저항 (vx, vy 모두 적용)
export const SPACING_FACTOR = 0.94  // 충돌 거리 (버블 반지름과 일치)
export const SUB_STEPS = 5

// 서브스텝당 중력 (프레임당 중력을 서브스텝으로 나눔)
const GRAVITY_PER_STEP = GRAVITY / SUB_STEPS

// 동적 중력 배율 (난이도 시스템에서 조정)
export let gravityScale = 1.0
export function setGravityScale(s) { gravityScale = s }

// 게임 영역
export const CANVAS_W = 360
export const CANVAS_H = 640
export const WALL = 6
export const FLOOR_Y = CANVAS_H - WALL
export const LEFT = WALL
export const RIGHT = CANVAS_W - WALL
export const DROP_Y = 80
export const DANGER_Y = 130

let _uid = 0
export function nextId() { return _uid++ }

// 단일 공의 위치 업데이트 (서브스텝 1회분)
export function updateBall(b) {
  b.vy += GRAVITY_PER_STEP * gravityScale
  b.vx *= AIR_RESISTANCE
  b.vy *= AIR_RESISTANCE  // 수직 공중 저항도 적용
  b.x += b.vx
  b.y += b.vy

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
    b.vx *= FRICTION
    if (Math.abs(b.vy) < 0.3) b.vy = 0
    if (Math.abs(b.vx) < 0.1) b.vx = 0
  }
}

// 두 공 간 충돌 해소
export function resolvePair(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.sqrt(dx * dx + dy * dy) || 0.1
  const minDist = (a.r + b.r) * SPACING_FACTOR

  if (d >= minDist) return

  const nx = dx / d
  const ny = dy / d
  const overlap = minDist - d
  const totalR = a.r + b.r

  // 위치 보정 (0.7로 빠르게 해소 → 스택 안정화)
  const pushFactor = 0.7
  a.x -= nx * overlap * (b.r / totalR) * pushFactor
  a.y -= ny * overlap * (b.r / totalR) * pushFactor
  b.x += nx * overlap * (a.r / totalR) * pushFactor
  b.y += ny * overlap * (a.r / totalR) * pushFactor

  // 상대 속도에 따른 임펄스
  const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (dvn > 0) {
    const imp = dvn * 0.5
    a.vx -= imp * nx * (b.r / totalR)
    a.vy -= imp * ny * (b.r / totalR)
    b.vx += imp * nx * (a.r / totalR)
    b.vy += imp * ny * (a.r / totalR)
    // 충돌 시 마찰 (양축 대칭 적용)
    a.vx *= 0.92
    a.vy *= 0.98
    b.vx *= 0.92
    b.vy *= 0.98
  }
}
