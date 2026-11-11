import { useEffect, useRef, useState } from 'react'
import { FOTOS, BILHETES, NOME } from '../config'
import Carta from './Carta'
import TAMANHOS from '../fotos-tamanhos.json'
import { burst, heartFirework, confettiRain, setAmbient, screenSize } from '../fx'

// 2 colunas em tela larga, 1 no celular
function useColumns() {
  const query = '(min-width: 860px)'
  const [two, setTwo] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setTwo(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return two ? 2 : 1
}

// Distribui os itens sempre na coluna mais baixa (fixo: nada troca de coluna depois)
function splitColumns(items, n) {
  const cols = Array.from({ length: n }, () => [])
  const heights = Array(n).fill(0)
  for (const it of items) {
    const est = it.type === 'foto' ? Math.min(it.h / it.w, 1.9) + 0.3 : 0.55
    const c = heights.indexOf(Math.min(...heights))
    cols[c].push(it)
    heights[c] += est
  }
  return cols
}

function useCounter() {
  const start = useRef(Date.now())
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])
  const s = Math.floor((now - start.current) / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    d: Math.floor(s / 86400),
    h: pad(Math.floor((s % 86400) / 3600)),
    m: pad(Math.floor((s % 3600) / 60)),
    s: pad(s % 60),
  }
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setOn(true),
      { threshold: 0.2 },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function Celebration() {
  const t = useCounter()
  const [lightbox, setLightbox] = useState(null)

  // show de fogos ao entrar
  useEffect(() => {
    setAmbient(0.45)
    confettiRain(70)
    const timers = []
    for (let i = 0; i < 8; i++) {
      timers.push(
        setTimeout(() => {
          const { w, h } = screenSize()
          heartFirework(w * (0.15 + Math.random() * 0.7), h * (0.15 + Math.random() * 0.4), 0.9 + Math.random() * 0.5)
        }, 300 + i * 600),
      )
    }
    timers.push(setTimeout(() => setAmbient(0.25), 8000))
    return () => timers.forEach(clearTimeout)
  }, [])

  const cols = useColumns()
  const items = []
  FOTOS.forEach((f, i) => {
    const size = TAMANHOS[f.src] || { w: 4, h: 5 }
    items.push({ type: 'foto', ...f, ...size, i, k: items.length })
    if (i % 3 === 2 && BILHETES[Math.floor(i / 3)]) {
      items.push({ type: 'bilhete', text: BILHETES[Math.floor(i / 3)], k: items.length })
    }
  })

  return (
    <section className="celebration">
      <header className="hero">
        <div className="hero-badge">✔ STATUS DE RELACIONAMENTO ATUALIZADO</div>
        <h1 className="hero-title">
          <span>VOCÊ</span> <span>DISSE</span> <span className="sim-word">SIM!!!</span>
        </h1>
        <p className="hero-sub">agora é oficial, {NOME} 💍</p>

        <div className="counter">
          <div className="counter-label">namorando há</div>
          <div className="counter-digits">
            <div><b>{t.d}</b><small>dias</small></div>
            <div><b>{t.h}</b><small>horas</small></div>
            <div><b>{t.m}</b><small>min</small></div>
            <div><b>{t.s}</b><small>seg</small></div>
          </div>
          <div className="counter-foot">e contando pra sempre ∞</div>
        </div>

        <div className="scroll-hint">role pra baixo ↓ tem mais coisa</div>
      </header>

      <h2 className="section-title">nossa galeria 📸</h2>

      <div className="gallery">
        {splitColumns(items, cols).map((col, c) => (
          <div className="gallery-col" key={c}>
            {col.map((it) =>
              it.type === 'foto' ? (
                <Reveal key={it.k} className="polaroid-wrap">
                  <figure
                    className="polaroid"
                    style={{ '--rot': `${(it.k % 2 ? 1 : -1) * (2 + (it.k % 3) * 1.5)}deg` }}
                    onClick={(e) => {
                      burst(e.clientX, e.clientY, 15)
                      setLightbox(it)
                    }}
                  >
                    <span className="tape" />
                    <img
                      src={it.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={it.w}
                      height={it.h}
                      style={{ aspectRatio: `${it.w} / ${it.h}` }}
                    />
                    <figcaption>{it.legenda}</figcaption>
                  </figure>
                </Reveal>
              ) : (
                <Reveal key={it.k} className="bilhete-wrap">
                  <div className="bilhete">
                    <span className="pin">📌</span>
                    {it.text}
                  </div>
                </Reveal>
              ),
            )}
          </div>
        ))}
      </div>

      <Carta />

      <footer className="final">
        <div className="final-heart">💖</div>
        <p>eu te amo</p>
        <button
          className="btn-mais"
          onClick={(e) => {
            burst(e.clientX, e.clientY, 30)
            confettiRain(40)
            const { w, h } = screenSize()
            for (let i = 0; i < 3; i++) setTimeout(() => heartFirework(w * (0.2 + Math.random() * 0.6), h * (0.2 + Math.random() * 0.3)), i * 350)
          }}
        >
          mais amor 💥
        </button>
      </footer>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <figure className="polaroid big">
            <img src={lightbox.src} alt="" />
            <figcaption>{lightbox.legenda}</figcaption>
          </figure>
        </div>
      )}
    </section>
  )
}
