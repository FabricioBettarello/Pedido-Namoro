import { useEffect, useRef, useState } from 'react'
import { startFx } from './fx'
import { prepareLocal, prepareSpotify, playMusic, hasLocalMusic } from './music'
import Boot from './components/Boot'
import Question from './components/Question'
import Celebration from './components/Celebration'
import { useCasal } from './casal'

export default function App() {
  const { MUSICA_LOCAL, SPOTIFY_TRACK_ID } = useCasal()
  const canvasRef = useRef(null)
  const spotifyRef = useRef(null)
  // atalho de ensaio: abrir com #sim no final do endereço pula direto pra comemoração
  const [stage, setStage] = useState(() => (window.location.hash === '#sim' ? 'yes' : 'boot')) // boot | question | yes
  const [flash, setFlash] = useState(false)
  const [musicSource, setMusicSource] = useState(null)

  useEffect(() => startFx(canvasRef.current), [])

  useEffect(() => {
    prepareLocal(MUSICA_LOCAL)
    prepareSpotify(spotifyRef.current, SPOTIFY_TRACK_ID)
  }, [MUSICA_LOCAL, SPOTIFY_TRACK_ID])

  const handleYes = async () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 700)
    setStage('yes')
    const src = await playMusic()
    setMusicSource(src)
  }

  return (
    <>
      <div className="bg-gradient" />
      <canvas ref={canvasRef} className="fx-canvas" />
      {flash && <div className="flash" />}

      {stage === 'boot' && <Boot onDone={() => setStage('question')} />}
      {stage === 'question' && <Question onYes={handleYes} />}
      {stage === 'yes' && <Celebration />}

      <div className={`music-dock ${stage === 'yes' ? 'show' : ''}`}>
        <div className="music-label">
          <span className="eq"><i /><i /><i /><i /></span> tocando: nossa música
        </div>
        <div ref={spotifyRef} className={hasLocalMusic() ? 'hidden-player' : ''} />
        {stage === 'yes' && !musicSource && (
          <div className="music-hint">aperta o play aqui 👆</div>
        )}
      </div>
    </>
  )
}
