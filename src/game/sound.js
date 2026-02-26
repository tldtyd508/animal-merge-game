// Web Audio API 합성음 사운드 시스템
let audioCtx = null
let muted = false

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    audioCtx = new AC()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

export function toggleMute() { muted = !muted; return muted }
export function isMuted() { return muted }

// 모바일 진동 피드백
export function vibrate(ms) {
  try { navigator.vibrate && navigator.vibrate(ms) } catch (e) { /* unsupported */ }
}

// 드롭 사운드: 짧은 뚝 소리
export function playDrop() {
  if (muted) return
  try {
    const ctx = getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(420, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1)
  } catch (e) { /* ignore */ }
}

// 자동드롭 사운드: 낮은 경고 톤
export function playAutoDrop() {
  if (muted) return
  try {
    const ctx = getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15)
  } catch (e) { /* ignore */ }
}

// 합체 사운드: 동물 레벨에 따라 피치 상승
export function playMerge(animalType) {
  if (muted) return
  try {
    const ctx = getCtx()
    if (!ctx) return
    const freq = 300 + animalType * 50
    // 메인 톤
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2)
    // 하모닉
    const o2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    o2.connect(g2); g2.connect(ctx.destination)
    o2.type = 'triangle'
    o2.frequency.setValueAtTime(freq * 2, ctx.currentTime + 0.05)
    g2.gain.setValueAtTime(0.08, ctx.currentTime + 0.05)
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.15)
  } catch (e) { /* ignore */ }
}

// 콤보 사운드: 연속 상승 음
export function playCombo(combo) {
  if (muted) return
  try {
    const ctx = getCtx()
    if (!ctx) return
    const base = 500 + combo * 40
    const noteCount = Math.min(combo, 4)
    for (let i = 0; i < noteCount; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'triangle'
      const t = ctx.currentTime + i * 0.06
      osc.frequency.setValueAtTime(base + i * 100, t)
      gain.gain.setValueAtTime(0.1, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      osc.start(t); osc.stop(t + 0.08)
    }
  } catch (e) { /* ignore */ }
}

// 게임오버 사운드: 하강 톤
export function playGameOver() {
  if (muted) return
  try {
    const ctx = getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(350, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.6)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.7)
    // 두 번째 하강음
    const o2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    o2.connect(g2); g2.connect(ctx.destination)
    o2.type = 'sine'
    o2.frequency.setValueAtTime(250, ctx.currentTime + 0.2)
    o2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.8)
    g2.gain.setValueAtTime(0.08, ctx.currentTime + 0.2)
    g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9)
    o2.start(ctx.currentTime + 0.2); o2.stop(ctx.currentTime + 0.9)
  } catch (e) { /* ignore */ }
}
