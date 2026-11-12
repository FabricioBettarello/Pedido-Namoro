import { useEffect, useState } from 'react'
import { useCasal } from '../casal'

const montarLinhas = (NOME, MEMORIAS) => [
  '> iniciando amor.exe ...',
  '> conectando ao meu coração ......... OK',
  `> escaneando sentimentos por ${NOME} ...`,
  '> nível de paixão detectado: ██████████ 9999%',
  '> ⚠ ALERTA: sentimento acima da capacidade do sistema',
  `> compilando memórias: ${MEMORIAS} ... OK`,
  '> carregando a pergunta mais importante da vida ...',
]

export default function Boot({ onDone }) {
  const { NOME, MEMORIAS } = useCasal()
  const [LINES] = useState(() => montarLinhas(NOME, MEMORIAS))
  const [shown, setShown] = useState([])
  const [typing, setTyping] = useState('')
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let line = 0
    let ch = 0
    let timer
    const tick = () => {
      if (line >= LINES.length) {
        // barra de progresso
        let p = 0
        const iv = setInterval(() => {
          p += Math.random() * 9 + 2
          if (p >= 100) {
            p = 100
            clearInterval(iv)
            setTimeout(() => setReady(true), 300)
          }
          setProgress(Math.floor(p))
        }, 70)
        return
      }
      const text = LINES[line]
      if (ch <= text.length) {
        setTyping(text.slice(0, ch))
        ch++
        timer = setTimeout(tick, 18 + Math.random() * 25)
      } else {
        setShown((s) => [...s, text])
        setTyping('')
        line++
        ch = 0
        timer = setTimeout(tick, 260)
      }
    }
    timer = setTimeout(tick, 500)
    return () => clearTimeout(timer)
  }, [])

  const go = () => {
    setLeaving(true)
    setTimeout(onDone, 900)
  }

  return (
    <section className={`boot ${leaving ? 'glitch-out' : ''}`}>
      <div className="crt">
        <div className="terminal">
          <div className="term-bar">
            <span className="dot r" /><span className="dot y" /><span className="dot g" />
            <span className="term-title">C:\coração\amor.exe</span>
          </div>
          <div className="term-body">
            {shown.map((l, i) => (
              <div key={i} className={l.includes('⚠') ? 'warn' : ''}>{l}</div>
            ))}
            {typing && <div>{typing}<span className="caret">█</span></div>}
            {shown.length === LINES.length && (
              <div className="progress-wrap">
                <div className="progress"><div style={{ width: `${progress}%` }} /></div>
                <span>{progress}%</span>
              </div>
            )}
            {ready && (
              <button className="exec-btn" onClick={go}>
                ▶ EXECUTAR PERGUNTA
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
