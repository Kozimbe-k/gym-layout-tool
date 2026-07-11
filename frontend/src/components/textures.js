// Runtime-generated tileable floor textures (no asset files needed).
// Each returns a small canvas used as a Konva fillPatternImage.

export const TILE_PX = 32 // one pattern cell; scaled so a tile = 0.5 m on canvas

// simple deterministic pseudo-random for repeatable grain
const rng = (seed) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

export function rubberTilePattern() {
  const c = document.createElement('canvas')
  c.width = TILE_PX * 2
  c.height = TILE_PX * 2
  const ctx = c.getContext('2d')

  const shades = ['#d7dadd', '#d2d5d9', '#d4d8db', '#d9dcdf']
  let i = 0
  for (const y of [0, TILE_PX]) {
    for (const x of [0, TILE_PX]) {
      ctx.fillStyle = shades[i++ % shades.length]
      ctx.fillRect(x, y, TILE_PX, TILE_PX)
      // speckle for a rubber look
      ctx.fillStyle = 'rgba(120, 126, 133, 0.25)'
      for (let s = 0; s < 14; s++) {
        const sx = x + ((s * 7919 + y * 31) % TILE_PX)
        const sy = y + ((s * 104729 + x * 17) % TILE_PX)
        ctx.fillRect(sx, sy, 1, 1)
      }
    }
  }
  // grout lines
  ctx.strokeStyle = '#c3c7cb'
  ctx.lineWidth = 1
  for (const p of [0.5, TILE_PX + 0.5]) {
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, c.height)
    ctx.moveTo(0, p)
    ctx.lineTo(c.width, p)
    ctx.stroke()
  }
  return c
}

export function woodPlankPattern() {
  // 4 plank rows with staggered joints; tile = 128x96 px, one plank row ≈ 0.15 m
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 96
  const ctx = c.getContext('2d')
  const rand = rng(7)
  const base = [216, 181, 138] // warm oak
  const rowH = 24
  for (let row = 0; row < 4; row++) {
    const y = row * rowH
    const shade = (rand() - 0.5) * 26
    ctx.fillStyle = `rgb(${base[0] + shade}, ${base[1] + shade * 0.9}, ${base[2] + shade * 0.8})`
    ctx.fillRect(0, y, c.width, rowH)
    // grain streaks
    ctx.strokeStyle = `rgba(150, 110, 70, ${0.12 + rand() * 0.1})`
    ctx.lineWidth = 1
    for (let g = 0; g < 3; g++) {
      const gy = y + 4 + rand() * (rowH - 8)
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.bezierCurveTo(c.width * 0.3, gy + rand() * 3 - 1.5, c.width * 0.7, gy + rand() * 3 - 1.5, c.width, gy)
      ctx.stroke()
    }
    // plank seam (bottom of row)
    ctx.strokeStyle = 'rgba(120, 88, 55, 0.55)'
    ctx.beginPath()
    ctx.moveTo(0, y + rowH - 0.5)
    ctx.lineTo(c.width, y + rowH - 0.5)
    ctx.stroke()
    // staggered end joint
    const jx = ((row * 53) % c.width) + 0.5
    ctx.beginPath()
    ctx.moveTo(jx, y)
    ctx.lineTo(jx, y + rowH)
    ctx.stroke()
  }
  return c
}

export function darkRubberPattern() {
  const c = document.createElement('canvas')
  c.width = TILE_PX * 2
  c.height = TILE_PX * 2
  const ctx = c.getContext('2d')
  const shades = ['#3f434a', '#3a3e45', '#42464d', '#3c4047']
  let i = 0
  const rand = rng(11)
  for (const y of [0, TILE_PX]) {
    for (const x of [0, TILE_PX]) {
      ctx.fillStyle = shades[i++ % shades.length]
      ctx.fillRect(x, y, TILE_PX, TILE_PX)
      ctx.fillStyle = 'rgba(160, 166, 175, 0.18)'
      for (let s = 0; s < 12; s++) {
        ctx.fillRect(x + rand() * TILE_PX, y + rand() * TILE_PX, 1, 1)
      }
    }
  }
  ctx.strokeStyle = 'rgba(28, 30, 34, 0.8)'
  ctx.lineWidth = 1
  for (const p of [0.5, TILE_PX + 0.5]) {
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, c.height)
    ctx.moveTo(0, p)
    ctx.lineTo(c.width, p)
    ctx.stroke()
  }
  return c
}

export const FLOOR_STYLES = {
  wood: { label: 'Wood planks', make: woodPlankPattern, tileMeters: 0.6, tilePx: 96 },
  rubber: { label: 'Gray rubber tile', make: rubberTilePattern, tileMeters: 1.0, tilePx: TILE_PX * 2 },
  'dark-rubber': { label: 'Dark rubber tile', make: darkRubberPattern, tileMeters: 1.0, tilePx: TILE_PX * 2 },
}
