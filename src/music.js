import { SPOTIFY_TRACK_ID, MUSICA_LOCAL } from './config'

let spotifyController = null
let wantPlay = false // clicou em "sim" antes do player ficar pronto
let localAudio = null
let localOk = false

// Verifica se existe /public/musica.mp3 (o Vite devolve index.html quando não existe)
export async function prepareLocal() {
  try {
    const r = await fetch(MUSICA_LOCAL, { method: 'HEAD', cache: 'no-store' })
    const type = r.headers.get('content-type') || ''
    if (r.ok && type.includes('audio')) {
      localAudio = new Audio(MUSICA_LOCAL)
      localAudio.preload = 'auto'
      localAudio.loop = true
      localOk = true
    }
  } catch {
    /* sem música local */
  }
  return localOk
}

// Cria o player do Spotify dentro do container (via IFrame API oficial)
export function prepareSpotify(container) {
  if (!container || container.dataset.ready) return
  container.dataset.ready = '1'
  const target = document.createElement('div')
  container.appendChild(target)

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    IFrameAPI.createController(
      target,
      { uri: `spotify:track:${SPOTIFY_TRACK_ID}`, width: '100%', height: 80, theme: 'dark' },
      (ctrl) => {
        spotifyController = ctrl
        // Sem login o Spotify só toca uma prévia de ~30s: quando acaba, recomeça
        let restarting = false
        ctrl.addListener('playback_update', (e) => {
          const { isPaused, position, duration } = e.data || {}
          if (!wantPlay || restarting || !duration) return
          if (isPaused && position >= duration - 1500) {
            restarting = true
            setTimeout(() => {
              ctrl.play()
              restarting = false
            }, 400)
          }
        })
        ctrl.addListener('ready', () => {
          if (wantPlay && !localOk) ctrl.play()
        })
      },
    )
  }
  const s = document.createElement('script')
  s.src = 'https://open.spotify.com/embed/iframe-api/v1'
  s.async = true
  document.body.appendChild(s)
}

export async function playMusic() {
  wantPlay = true
  if (localOk && localAudio) {
    try {
      localAudio.currentTime = 0
      await localAudio.play()
      return 'local'
    } catch {
      /* tenta o Spotify */
    }
  }
  if (spotifyController) {
    spotifyController.play()
    return 'spotify'
  }
  return 'pending' // vai tocar quando o player do Spotify terminar de carregar
}

export function hasLocalMusic() {
  return localOk
}
