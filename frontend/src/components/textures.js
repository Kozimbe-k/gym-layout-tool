// Runtime-generated tileable floor textures (no asset files needed).
// Each returns a small canvas used as a Konva fillPatternImage.

export const TILE_PX = 32 // one pattern cell; scaled so a tile = 0.5 m on canvas

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
