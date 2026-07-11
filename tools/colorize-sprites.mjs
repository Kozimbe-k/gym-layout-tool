// AI-colorize floor-plan sprites: renders each CAD line-art sprite as a
// photorealistic top-down Matrix machine (dark graphite + green accents) via
// the Gemini image model, and generates decor sprites from scratch.
// Raw results land in the output dir with WHITE backgrounds — run
// tools/finalize_sprites.py afterwards to make the outside transparent.
//
// Usage: node tools/colorize-sprites.mjs <out-dir> [onlySlug]

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SPRITES = join(ROOT, 'frontend', 'public', 'sprites')
const OUT = process.argv[2]
const ONLY = process.argv[3]
if (!OUT) {
  console.error('usage: node tools/colorize-sprites.mjs <out-dir> [onlySlug]')
  process.exit(1)
}
mkdirSync(join(OUT, 'machines'), { recursive: true })
mkdirSync(join(OUT, 'decor'), { recursive: true })

const env = readFileSync(join(ROOT, 'backend', '.env'), 'utf8')
const KEY = env.match(/^GEMINI_API_KEY=(.+)$/m)?.[1]?.trim()
if (!KEY) {
  console.error('GEMINI_API_KEY not found in backend/.env')
  process.exit(1)
}

const MODELS = ['gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview']

const MACHINE_PROMPT = [
  'This is a precise top-view CAD line drawing of a Matrix Fitness gym machine, looking straight down.',
  'Render it as a photorealistic top-down product image of the same machine:',
  'matte black and dark graphite frame, black upholstery, subtle Matrix Fitness green accents,',
  'realistic materials, evenly lit.',
  'Keep EXACTLY the same geometry, outline, proportions and orientation — every part in the same position as the drawing.',
  'Pure white background. No shadow, no text, no watermark, no extra objects.',
].join(' ')

const DECOR = {
  plant: 'Photorealistic top-down view (looking straight down) of a potted interior plant with green leaves in a dark round pot, for an architectural floor plan. Pure white background, no shadow, no text.',
  bench: 'Photorealistic top-down view (looking straight down) of a simple rectangular wooden locker-room bench with light oak seat slats and dark metal legs, wider than deep, for an architectural floor plan. Pure white background, no shadow, no text.',
  'reception-desk': 'Photorealistic top-down view (looking straight down) of an L-shaped modern reception desk, dark wood top with a lighter inner counter, for an architectural floor plan. Pure white background, no shadow, no text.',
  'water-cooler': 'Photorealistic top-down view (looking straight down) of an office water cooler with a blue bottle, small round footprint, for an architectural floor plan. Pure white background, no shadow, no text.',
}

async function generate(parts, outFile) {
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          }),
        },
      )
      if (res.status === 404) break // try next model
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 15000 * attempt))
        continue
      }
      if (!res.ok) throw new Error(`${model} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      const data = await res.json()
      const img = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)
      if (!img) throw new Error('no image in response')
      writeFileSync(outFile, Buffer.from(img.inlineData.data, 'base64'))
      return true
    }
  }
  throw new Error('all models exhausted')
}

const machineSlugs = readdirSync(SPRITES)
  .filter((f) => f.endsWith('.png'))
  .map((f) => f.replace(/\.png$/, ''))
  .filter((s) => !ONLY || s === ONLY)

let done = 0
for (const slug of machineSlugs) {
  const out = join(OUT, 'machines', `${slug}.png`)
  if (existsSync(out)) {
    console.log(`skip (exists) ${slug}`)
    continue
  }
  const b64 = readFileSync(join(SPRITES, `${slug}.png`)).toString('base64')
  try {
    await generate(
      [{ text: MACHINE_PROMPT }, { inline_data: { mime_type: 'image/png', data: b64 } }],
      out,
    )
    console.log(`OK machine ${slug}`)
    done++
  } catch (e) {
    console.log(`FAIL machine ${slug}: ${e.message}`)
  }
  await new Promise((r) => setTimeout(r, 2000))
}

if (!ONLY) {
  for (const [name, prompt] of Object.entries(DECOR)) {
    const out = join(OUT, 'decor', `${name}.png`)
    if (existsSync(out)) continue
    try {
      await generate([{ text: prompt }], out)
      console.log(`OK decor ${name}`)
      done++
    } catch (e) {
      console.log(`FAIL decor ${name}: ${e.message}`)
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
}

console.log(`done: ${done} images generated`)
