// Motor de partículas leve: corações pré-desenhados (sprites) num único canvas.
// Nada de emoji/shadowBlur por frame — só drawImage, que é barato.
const COLORS = ['#ff2e88', '#ff6ec7', '#ffd166', '#b14dff', '#ff4d6d', '#ffffff']
const MAX = 220 // limite de partículas na tela
const SPRITE = 64

let ctx = null
let canvas = null
let particles = []
let raf = 0
let ambientEvery = 700 // ms entre corações subindo no fundo
let lastAmbient = 0
let w = 0
let h = 0
let sprites = []

const rand = (a, b) => a + Math.random() * (b - a)
const pickIdx = (n) => (Math.random() * n) | 0

function makeHeartSprite(color) {
  const c = document.createElement('canvas')
  c.width = c.height = SPRITE
  const g = c.getContext('2d')
  g.translate(SPRITE / 2, SPRITE / 2 + 4)
  g.scale(SPRITE / 40, SPRITE / 40)
  g.beginPath()
  g.moveTo(0, 8)
  g.bezierCurveTo(-18, -4, -10, -18, 0, -9)
  g.bezierCurveTo(10, -18, 18, -4, 0, 8)
  g.closePath()
  g.fillStyle = color
  g.fill()
  return c
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  w = window.innerWidth
  h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function add(p) {
  if (particles.length < MAX) particles.push(p)
}

function loop(t) {
  raf = requestAnimationFrame(loop)

  if (t - lastAmbient > ambientEvery) {
    lastAmbient = t
    add({
      heart: true, s: pickIdx(sprites.length), x: rand(0, w), y: h + 20,
      vx: rand(-0.2, 0.2), vy: rand(-1.2, -0.5), g: 0, size: rand(14, 30),
      life: 1, decay: 0.002, drag: 1,
    })
  }

  ctx.clearRect(0, 0, w, h)
  let n = particles.length
  for (let i = n - 1; i >= 0; i--) {
    const p = particles[i]
    p.vy += p.g
    p.vx *= p.drag
    p.vy *= p.drag
    p.x += p.vx
    p.y += p.vy
    p.life -= p.decay
    if (p.life <= 0 || p.y > h + 40 || p.y < -60) {
      particles[i] = particles[particles.length - 1]
      particles.pop()
      continue
    }
    ctx.globalAlpha = p.life > 1 ? 1 : p.life
    if (p.heart) {
      const sz = p.size
      ctx.drawImage(sprites[p.s], p.x - sz / 2, p.y - sz / 2, sz, sz)
    } else {
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.5)
    }
  }
  ctx.globalAlpha = 1
}

export function startFx(el) {
  canvas = el
  ctx = el.getContext('2d')
  if (!sprites.length) sprites = COLORS.map(makeHeartSprite)
  resize()
  window.addEventListener('resize', resize)
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
  }
}

/** intensidade dos corações de fundo: 0 = poucos, 1 = muitos */
export function setAmbient(v) {
  ambientEvery = 900 - v * 1400 // 0.15 → ~690ms · 0.45 → ~270ms
  if (ambientEvery < 200) ambientEvery = 200
}

/** Explosão de corações + confete num ponto */
export function burst(x, y, n = 30) {
  n = Math.min(n, 40)
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2)
    const s = rand(2, 9)
    const heart = Math.random() < 0.6
    add({
      heart, s: pickIdx(sprites.length), color: COLORS[pickIdx(COLORS.length)],
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, g: 0.18, drag: 0.98,
      size: heart ? rand(14, 28) : rand(6, 10), life: 1, decay: rand(0.012, 0.02),
    })
  }
}

/** Fogos em formato de coração (feito de coraçõezinhos) */
export function heartFirework(x, y, scale = 1) {
  const s = pickIdx(sprites.length)
  const pts = 28
  for (let i = 0; i < pts; i++) {
    const t = (i / pts) * Math.PI * 2
    const hx = 16 * Math.sin(t) ** 3
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    add({
      heart: true, s, x, y, vx: hx * 0.32 * scale, vy: hy * 0.32 * scale,
      g: 0.03, drag: 0.95, size: 10, life: 1, decay: 0.014,
    })
  }
}

/** Chuva de confete/corações caindo do topo */
export function confettiRain(n = 60) {
  n = Math.min(n, 80)
  for (let i = 0; i < n; i++) {
    const heart = Math.random() < 0.4
    add({
      heart, s: pickIdx(sprites.length), color: COLORS[pickIdx(COLORS.length)],
      x: rand(0, w), y: rand(-50, -5), vx: rand(-0.6, 0.6), vy: rand(1.5, 4), g: 0.02, drag: 1,
      size: heart ? rand(14, 26) : rand(6, 10), life: 1.5, decay: 0.004,
    })
  }
}

export function screenSize() {
  return { w, h }
}
