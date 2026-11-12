// Lê largura/altura de cada JPG em public/fotos e salva em src/fotos-tamanhos.json
// (assim a página reserva o espaço de cada foto e nada pula enquanto carrega)
import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve('public/fotos')
const out = {}

function jpegSize(buf) {
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue }
    const marker = buf[i + 1]
    const len = buf.readUInt16BE(i + 2)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }
    }
    i += 2 + len
  }
  return null
}

// percorre public/fotos e as subpastas de cada casal (ex.: public/fotos/vinilucca)
function medir(pasta, prefixo) {
  for (const f of fs.readdirSync(pasta, { withFileTypes: true })) {
    if (f.isDirectory()) {
      medir(path.join(pasta, f.name), `${prefixo}${f.name}/`)
      continue
    }
    if (!/\.jpe?g$/i.test(f.name)) continue
    const s = jpegSize(fs.readFileSync(path.join(pasta, f.name)))
    if (s) out[`${prefixo}${f.name}`] = s
  }
}
medir(dir, '/fotos/')
fs.writeFileSync('src/fotos-tamanhos.json', JSON.stringify(out, null, 1))
console.log(`medidas de ${Object.keys(out).length} fotos salvas`)
