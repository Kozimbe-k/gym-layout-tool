// 2D placement engine: turns a recommendation (quantities per zone) into
// non-overlapping equipment positions inside the room.
//
// Strategy: guillotine partition — zones are processed most-constrained first
// (largest unit min-dimension) and each slices a strip off the remaining free
// rectangle, sized to its recommended share but allowed to grow up to +25%
// when that rescues units. Equipment is shelf-packed inside the slice, trying
// both slice directions and both orientation preferences, keeping the variant
// that places the most. A final overflow pass packs still-homeless units into
// the room's unused pockets. Anything left is reported as unplaced rather
// than overlapped. Coordinates are meters; x runs along room length.

const EPS = 1e-6
const GROWTH_STEPS = [1, 1.1, 1.25]

function expandUnits(recZone, equipmentByName) {
  const units = []
  for (const item of recZone.items) {
    const eq = equipmentByName.get(item.name)
    if (!eq) continue
    const c = Number(eq.clearance_m)
    const effL = Number(eq.length_m) + 2 * c
    const effW = Number(eq.width_m) + 2 * c
    for (let i = 0; i < item.quantity; i++) {
      units.push({ name: item.name, zone: recZone.zone, effL, effW, clearanceM: c })
    }
  }
  return units
}

function orientations(unit) {
  const opts = [{ w: unit.effL, h: unit.effW }]
  if (Math.abs(unit.effL - unit.effW) > EPS) opts.push({ w: unit.effW, h: unit.effL })
  return opts
}

// Packs units into a W×H rectangle using shelf packing (rows stacked along h).
// mode 'landscape' lays units flat (lower rows); 'portrait' stands them up
// (pairs wide units side by side) — callers try both and keep the better pack.
function shelfPack(units, W, H, mode) {
  const sorted = [...units].sort(
    (a, b) => b.effL * b.effW - a.effL * a.effW || a.name.localeCompare(b.name),
  )
  const placed = []
  const unplaced = []
  let shelfY = 0
  let shelfH = 0
  let cursorX = 0

  const better = (a, b) => {
    if (a.newShelf !== b.newShelf) return !a.newShelf
    if (mode === 'portrait' && Math.abs(a.h - b.h) > EPS) return a.h > b.h
    if (Math.abs(a.shelfH - b.shelfH) > EPS) return a.shelfH < b.shelfH
    return a.w < b.w
  }

  for (const unit of sorted) {
    let best = null
    for (const o of orientations(unit)) {
      if (o.w > W + EPS) continue
      // current shelf
      if (cursorX + o.w <= W + EPS) {
        const grownH = Math.max(shelfH, o.h)
        if (shelfY + grownH <= H + EPS) {
          const cand = { x: cursorX, y: shelfY, w: o.w, h: o.h, newShelf: false, shelfH: grownH }
          if (!best || better(cand, best)) best = cand
          continue
        }
      }
      // fresh shelf below
      const nextY = shelfY + shelfH
      if (nextY + o.h <= H + EPS) {
        const cand = { x: 0, y: nextY, w: o.w, h: o.h, newShelf: true, shelfH: o.h }
        if (!best || better(cand, best)) best = cand
      }
    }
    if (!best) {
      unplaced.push(unit)
      continue
    }
    placed.push({ ...unit, x: best.x, y: best.y, w: best.w, h: best.h })
    if (best.newShelf) shelfY += shelfH
    cursorX = best.x + best.w
    shelfH = best.shelfH
  }
  return { placed, unplaced }
}

function packScore(pack) {
  return [pack.placed.length, pack.placed.reduce((s, p) => s + p.w * p.h, 0)]
}

function scoreBetter(a, b) {
  if (a[0] !== b[0]) return a[0] > b[0]
  return a[1] > b[1] + EPS
}

// Slices a strip for the zone off `free` and packs into it, trying direction,
// growth, and packing mode; returns the best variant.
function sliceAndPack(free, units, isLast) {
  const targetArea = units.reduce((s, u) => s + u.effL * u.effW, 0)
  const candidates = []

  if (isLast) {
    for (const mode of ['landscape', 'portrait']) {
      candidates.push({ rect: { ...free }, dir: 'last', mode })
    }
  } else {
    // thickness a slice must have for the zone's chunkiest unit to fit at all
    const tNeeded = Math.max(...units.map((u) => Math.min(u.effL, u.effW)))
    for (const dir of ['v', 'h']) {
      const span = dir === 'v' ? free.h : free.w
      const avail = dir === 'v' ? free.w : free.h
      const base = targetArea / span
      const thicknesses = [...new Set(
        [...GROWTH_STEPS.map((g) => base * g), Math.max(base, tNeeded)].map((t) =>
          Math.min(avail, t),
        ),
      )]
      for (const t of thicknesses) {
        if (t < 0.1) continue
        const rect =
          dir === 'v'
            ? { x: free.x, y: free.y, w: t, h: free.h }
            : { x: free.x, y: free.y, w: free.w, h: t }
        for (const mode of ['landscape', 'portrait']) {
          candidates.push({ rect, dir, mode })
        }
      }
    }
  }

  let best = null
  for (const cand of candidates) {
    const pack = shelfPack(units, cand.rect.w, cand.rect.h, cand.mode)
    const score = packScore(pack)
    const thickness = cand.dir === 'h' ? cand.rect.h : cand.rect.w
    if (
      !best ||
      scoreBetter(score, best.score) ||
      (!scoreBetter(best.score, score) && thickness < best.thickness - EPS)
    ) {
      best = { ...cand, pack, score, thickness }
    }
  }
  return best
}

function runPass(zonesWithUnits, lengthM, widthM) {
  let free = { x: 0, y: 0, w: lengthM, h: widthM }
  const zoneRects = []
  const placements = []
  const pockets = [] // unused sub-rectangles for the overflow pass
  let homeless = []

  zonesWithUnits.forEach((z, idx) => {
    if (free.w < 0.1 || free.h < 0.1) {
      homeless.push(...z.units)
      return
    }
    const isLast = idx === zonesWithUnits.length - 1
    const best = sliceAndPack(free, z.units, isLast)
    if (!best || best.pack.placed.length === 0) {
      homeless.push(...z.units)
      return
    }

    const { rect, dir, pack } = best
    pack.placed.forEach((p, i) => {
      placements.push({
        id: `${z.zone}-${i}`,
        name: p.name,
        zone: z.zone,
        x: rect.x + p.x,
        y: rect.y + p.y,
        w: p.w,
        h: p.h,
        clearanceM: p.clearanceM,
      })
    })
    homeless.push(...pack.unplaced)

    const extentX = Math.max(...pack.placed.map((p) => p.x + p.w))
    const extentY = Math.max(...pack.placed.map((p) => p.y + p.h))
    zoneRects.push({ zone: z.zone, x: rect.x, y: rect.y, w: extentX, h: extentY })

    // shrink `free` by the space actually used and bank the rest as pockets
    if (dir === 'v') {
      pockets.push({ x: rect.x, y: rect.y + extentY, w: extentX, h: free.h - extentY })
      free = { x: free.x + extentX, y: free.y, w: free.w - extentX, h: free.h }
    } else if (dir === 'h') {
      pockets.push({ x: rect.x + extentX, y: rect.y, w: free.w - extentX, h: extentY })
      free = { x: free.x, y: free.y + extentY, w: free.w, h: free.h - extentY }
    } else {
      pockets.push({ x: rect.x + extentX, y: rect.y, w: free.w - extentX, h: free.h })
      pockets.push({ x: rect.x, y: rect.y + extentY, w: extentX, h: free.h - extentY })
      free = { x: free.x, y: free.y, w: 0, h: 0 }
    }
  })

  if (free.w > 0.1 && free.h > 0.1) pockets.push(free)

  // overflow pass: pack homeless units into unused pockets, biggest pocket first
  let overflowSeq = 0
  pockets.sort((a, b) => b.w * b.h - a.w * a.h)
  for (const pocket of pockets) {
    if (homeless.length === 0) break
    if (pocket.w < 0.1 || pocket.h < 0.1) continue
    let best = null
    for (const mode of ['landscape', 'portrait']) {
      const pack = shelfPack(homeless, pocket.w, pocket.h, mode)
      if (!best || scoreBetter(packScore(pack), packScore(best))) best = pack
    }
    if (!best || best.placed.length === 0) continue
    for (const p of best.placed) {
      placements.push({
        id: `overflow-${overflowSeq++}`,
        name: p.name,
        zone: p.zone,
        x: pocket.x + p.x,
        y: pocket.y + p.y,
        w: p.w,
        h: p.h,
        clearanceM: p.clearanceM,
        overflow: true,
      })
    }
    homeless = best.unplaced
  }

  return { zoneRects, placements, homeless }
}

export function layoutRoom({ lengthM, widthM, recommendation, equipment }) {
  const equipmentByName = new Map(equipment.map((e) => [e.name, e]))
  const zonesWithUnits = recommendation.zones
    .map((z) => ({ zone: z.zone, units: expandUnits(z, equipmentByName) }))
    .filter((z) => z.units.length > 0)

  let result = runPass(zonesWithUnits, lengthM, widthM)

  // retry with starved zones first; keep whichever pass places more
  if (result.homeless.length > 0) {
    const homelessByZone = new Map()
    for (const u of result.homeless) {
      homelessByZone.set(u.zone, (homelessByZone.get(u.zone) || 0) + 1)
    }
    const reordered = [...zonesWithUnits].sort(
      (a, b) => (homelessByZone.get(b.zone) || 0) - (homelessByZone.get(a.zone) || 0),
    )
    const retry = runPass(reordered, lengthM, widthM)
    if (retry.placements.length > result.placements.length) result = retry
  }

  const unplaced = []
  for (const u of result.homeless) {
    const entry = unplaced.find((e) => e.name === u.name && e.zone === u.zone)
    if (entry) entry.quantity += 1
    else unplaced.push({ name: u.name, zone: u.zone, quantity: 1 })
  }

  return { zoneRects: result.zoneRects, placements: result.placements, unplaced }
}
