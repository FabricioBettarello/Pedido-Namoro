// Cada casal tem a sua rota: /<slug>. A rota "/" é a página original.
import * as fabricio from './fabricio'
import * as vinilucca from './vinilucca'

export const CASAIS = {
  '': fabricio,
  vinilucca,
}

// "/vinilucca", "/vinilucca/" ou "/VINILUCCA" -> casal "vinilucca"
export function casalDaRota(pathname) {
  const slug = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '').toLowerCase()
  return CASAIS[slug] ?? null
}
