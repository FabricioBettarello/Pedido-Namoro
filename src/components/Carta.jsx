import { useEffect, useRef, useState } from 'react'
import { CARTA, PROMESSAS, ASSINATURA, PS } from '../config'
import { burst, heartFirework, confettiRain, screenSize } from '../fx'

const VELOCIDADE = 26 // ms por letra
const PAUSA_PARAGRAFO = 700

function hoje() {
  return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Carta() {
  const [fase, setFase] = useState('fechada') // fechada | abrindo | lendo
  const [n, setN] = useState(0) // letras já escritas
  const [promessas, setPromessas] = useState(0)
  const [fim, setFim] = useState(false)
  const papelRef = useRef(null)
  const terminouTexto = n >= CARTA.length

  const abrir = (e) => {
    if (fase !== 'fechada') return
    burst(e.clientX, e.clientY, 30)
    setFase('abrindo')
    setTimeout(() => setFase('lendo'), 1500)
  }

  // máquina de escrever, com pausa entre parágrafos
  useEffect(() => {
    if (fase !== 'lendo' || terminouTexto) return
    const prox = CARTA[n]
    const atraso = prox === '\n' && CARTA[n + 1] === '\n' ? PAUSA_PARAGRAFO : /[.,!?…]/.test(CARTA[n - 1] || '') ? VELOCIDADE * 6 : VELOCIDADE
    const t = setTimeout(() => setN((v) => v + 1), atraso)
    return () => clearTimeout(t)
  }, [fase, n, terminouTexto])

  // acompanha a pena: rola a página pra linha que está sendo escrita
  useEffect(() => {
    if (fase !== 'lendo') return
    const on = papelRef.current?.querySelectorAll('.promessa.on') || []
    const alvo = fim
      ? papelRef.current?.querySelector('.ps')
      : terminouTexto
        ? on[on.length - 1] || papelRef.current?.querySelector('.promessas-titulo')
        : papelRef.current?.querySelector('.pena')
    if (!alvo) return
    const r = alvo.getBoundingClientRect()
    const limite = window.innerHeight - 190 // espaço do player de música
    if (r.bottom > limite) window.scrollBy({ top: r.bottom - limite + 60, behavior: 'smooth' })
  }, [fase, n, promessas, fim, terminouTexto])

  // promessas aparecendo uma a uma
  useEffect(() => {
    if (!terminouTexto) return
    if (promessas >= PROMESSAS.length) {
      const t = setTimeout(() => setFim(true), 900)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setPromessas((p) => p + 1)
      const li = papelRef.current?.querySelectorAll('.promessa')[promessas]
      if (li) {
        const r = li.getBoundingClientRect()
        burst(r.left + 20, r.top + r.height / 2, 10)
      }
    }, promessas === 0 ? 900 : 1100)
    return () => clearTimeout(t)
  }, [terminouTexto, promessas])

  // final: chuva de corações
  useEffect(() => {
    if (!fim) return
    const { w, h } = screenSize()
    confettiRain(60)
    const ts = [0, 400, 800].map((d, i) =>
      setTimeout(() => heartFirework(w * (0.25 + 0.25 * i), h * 0.3, 1.2), d),
    )
    return () => ts.forEach(clearTimeout)
  }, [fim])

  // tocar no papel pula a digitação (útil se quiser ir direto)
  const pular = () => {
    if (fase === 'lendo' && !terminouTexto) setN(CARTA.length)
  }

  return (
    <section className="carta-sec">
      <h2 className="section-title">uma carta pra você 💌</h2>

      {fase !== 'lendo' ? (
        <div className={`envelope ${fase === 'abrindo' ? 'abrindo' : ''}`} onClick={abrir}>
          <div className="env-back" />
          <div className="env-letter">
            <span>Para o amor da minha vida</span>
          </div>
          <div className="env-front" />
          <div className="env-flap" />
          <div className="env-seal">❤</div>
          {fase === 'fechada' && <div className="env-hint">toque pra abrir</div>}
        </div>
      ) : (
        <article className="papel" ref={papelRef} onClick={pular}>
          <span className="papel-fita" />
          <span className="papel-flor">🌷</span>
          <div className="papel-data">{hoje()}</div>

          {/* o texto inteiro já ocupa o espaço (invisível); só vai ficando visível */}
          <p className="papel-texto">
            {CARTA.slice(0, n)}
            {!terminouTexto && <span className="pena">✒️</span>}
            <span className="falta" aria-hidden="true">{CARTA.slice(n)}</span>
          </p>

          {(
            <div className={`promessas ${terminouTexto ? 'on' : ''}`}>
              <div className="promessas-titulo">Minhas promessas pra você:</div>
              <ul>
                {PROMESSAS.map((p, i) => (
                  <li key={i} className={`promessa ${i < promessas ? 'on' : ''}`}>
                    <span className="promessa-coracao">{i < promessas ? '💖' : '♡'}</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={`assinatura-bloco ${fim ? 'on' : ''}`}>
            <div className="assinatura">{ASSINATURA}</div>
            <svg className="assinatura-risco" viewBox="0 0 300 40" aria-hidden="true">
              <path d="M5 25 C 60 5, 90 38, 140 22 S 230 8, 260 24 C 270 30, 285 18, 295 12" />
            </svg>
            <div className="ps">{PS}</div>
          </div>
        </article>
      )}
    </section>
  )
}
