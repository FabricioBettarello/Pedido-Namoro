import { useRef, useState } from 'react'
import { NOME } from '../config'
import { burst } from '../fx'

const NAO_TEXTOS = [
  'Não', 'Tem certeza?', 'Pensa bem...', 'Erro 404', 'Nem vem 🙅', 'Clica no sim',
  'Tá difícil né?', 'Desiste 😂', 'Impossível', 'Esse botão é fake', 'Para 😭',
  'Olha o sim ali 👉', 'Sem chance', 'Botão travado',
]

const ALERTAS = [
  '⚠ SISTEMA: a opção "não" foi desativada pelo coração',
  '⚠ ERRO 0xAMOR: resposta inválida',
  '⚠ acesso negado: você não tem permissão pra dizer não',
  '⚠ o botão "não" fugiu de vergonha',
  '⚠ tentativa registrada e ignorada com sucesso',
  '⚠ dica do sistema: o botão rosa é o certo 💖',
  '⚠ firewall do amor bloqueou essa ação',
  '⚠ o botão "não" pediu demissão',
]

const VIRA_SIM = 16 // depois de tantas tentativas o "não" vira "sim"

export default function Question({ onYes }) {
  const [tries, setTries] = useState(0)
  const [pos, setPos] = useState(null)
  const [alerts, setAlerts] = useState([])
  const naoRef = useRef(null)
  const lastMove = useRef(0)

  const fugir = (e) => {
    const now = performance.now()
    if (now - lastMove.current < 120) return
    lastMove.current = now

    const btn = naoRef.current
    const bw = btn?.offsetWidth || 120
    const bh = btn?.offsetHeight || 50
    const margin = 16
    const W = window.innerWidth
    const H = window.innerHeight
    // escolhe um ponto longe de onde o mouse está
    const px = e?.clientX ?? e?.touches?.[0]?.clientX ?? W / 2
    const py = e?.clientY ?? e?.touches?.[0]?.clientY ?? H / 2
    let x, y, tentativas = 0
    do {
      x = margin + Math.random() * (W - bw - margin * 2)
      y = margin + Math.random() * (H - bh - margin * 2)
      tentativas++
    } while (Math.hypot(x + bw / 2 - px, y + bh / 2 - py) < Math.min(W, H) * 0.35 && tentativas < 30)

    setPos({ x, y, r: Math.random() * 50 - 25 })
    setTries((t) => t + 1)

    const id = Math.random()
    setAlerts((a) => [...a.slice(-2), { id, text: ALERTAS[(Math.random() * ALERTAS.length) | 0] }])
    setTimeout(() => setAlerts((a) => a.filter((x) => x.id !== id)), 2600)
  }

  const sim = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    burst(r.left + r.width / 2, r.top + r.height / 2, 40)
    onYes()
  }

  const virouSim = tries >= VIRA_SIM
  const simScale = Math.min(1 + tries * 0.12, 2.6)
  const naoScale = Math.max(1 - tries * 0.045, 0.45)

  return (
    <section className="question">
      <div className="synth-sun" />
      <div className="synth-grid" />

      <div className="alerts">
        {alerts.map((a) => (
          <div key={a.id} className="alert">{a.text}</div>
        ))}
      </div>

      <div className="q-card">
        <p className="q-pre">{NOME}, eu tenho uma pergunta muito séria...</p>
        <h1 className="glitch" data-text="Quer namorar comigo?">
          Quer namorar comigo?
        </h1>
        <div className="big-heart">💘</div>

        <div className="q-buttons">
          <button
            className="btn-sim"
            style={{ transform: `scale(${simScale})` }}
            onClick={sim}
          >
            SIM 💖
          </button>

          {!pos && (
            <button
              ref={naoRef}
              className="btn-nao"
              onPointerEnter={fugir}
              onPointerDown={fugir}
              onTouchStart={fugir}
              onFocus={fugir}
              onClick={fugir}
            >
              Não
            </button>
          )}
        </div>

        {tries > 0 && (
          <p className="tries">
            tentativas de dizer não: <b>{tries}</b> · chance de sucesso: <b>0,000%</b>
          </p>
        )}
      </div>

      {pos && (
        <button
          ref={naoRef}
          className={`btn-nao fugindo ${virouSim ? 'virou-sim' : ''}`}
          style={{
            left: pos.x,
            top: pos.y,
            transform: `rotate(${pos.r}deg) scale(${virouSim ? 1.1 : naoScale})`,
          }}
          onPointerEnter={virouSim ? undefined : fugir}
          onPointerDown={virouSim ? undefined : fugir}
          onTouchStart={virouSim ? undefined : fugir}
          onClick={virouSim ? sim : fugir}
        >
          {virouSim ? 'Tá bom, SIM 💖' : NAO_TEXTOS[tries % NAO_TEXTOS.length]}
        </button>
      )}
    </section>
  )
}
