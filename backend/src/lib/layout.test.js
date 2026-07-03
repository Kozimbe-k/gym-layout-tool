import test from 'node:test'
import assert from 'node:assert/strict'
import { recommend } from './recommendation.js'
import { layoutRoom } from './layout.js'
import { spaceTypes, equipment } from '../data/seedData.js'

const EPS = 1e-6
const ROOMS = [
  [12, 9],
  [20, 10],
  [25, 20],
  [6, 5],
  [40, 25],
  [15, 8],
  [3, 3],
  [80, 40],
]

const runLayout = (lengthM, widthM) => {
  const recommendation = recommend({ areaSqm: lengthM * widthM, spaceTypes, equipment })
  return {
    recommendation,
    layout: layoutRoom({ lengthM, widthM, recommendation, equipment }),
  }
}

test('placed + unplaced quantities equal recommended quantities', () => {
  for (const [l, w] of ROOMS) {
    const { recommendation, layout } = runLayout(l, w)
    const unplacedCount = layout.unplaced.reduce((s, u) => s + u.quantity, 0)
    assert.equal(
      layout.placements.length + unplacedCount,
      recommendation.totalUnits,
      `conservation broken for ${l}x${w}`,
    )
  }
})

test('no placement extends outside the room', () => {
  for (const [l, w] of ROOMS) {
    const { layout } = runLayout(l, w)
    for (const p of layout.placements) {
      assert.ok(p.x >= -EPS && p.y >= -EPS, `${p.id} negative origin in ${l}x${w}`)
      assert.ok(p.x + p.w <= l + EPS, `${p.id} exceeds length in ${l}x${w}`)
      assert.ok(p.y + p.h <= w + EPS, `${p.id} exceeds width in ${l}x${w}`)
    }
  }
})

test('no two placements overlap', () => {
  for (const [l, w] of ROOMS) {
    const { layout } = runLayout(l, w)
    const ps = layout.placements
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i]
        const b = ps[j]
        const overlap =
          a.x < b.x + b.w - EPS &&
          b.x < a.x + a.w - EPS &&
          a.y < b.y + b.h - EPS &&
          b.y < a.y + a.h - EPS
        assert.ok(!overlap, `${a.id} overlaps ${b.id} in ${l}x${w}`)
      }
    }
  }
})

test('non-overflow placements stay inside their zone rectangle', () => {
  for (const [l, w] of ROOMS) {
    const { layout } = runLayout(l, w)
    const rectByZone = new Map(layout.zoneRects.map((r) => [r.zone, r]))
    for (const p of layout.placements) {
      if (p.overflow) continue
      const r = rectByZone.get(p.zone)
      assert.ok(r, `no zone rect for ${p.id} in ${l}x${w}`)
      assert.ok(
        p.x >= r.x - EPS &&
          p.y >= r.y - EPS &&
          p.x + p.w <= r.x + r.w + EPS &&
          p.y + p.h <= r.y + r.h + EPS,
        `${p.id} outside its zone rect in ${l}x${w}`,
      )
    }
  }
})

test('placement rate stays reasonable', () => {
  // floors set slightly below observed rates; a regression below these means
  // the packing genuinely got worse, not just noise
  const floors = [
    [12, 9, 0.84],
    [20, 10, 0.8],
    [25, 20, 0.9],
    [40, 25, 0.85],
    [6, 5, 0.75],
  ]
  for (const [l, w, floor] of floors) {
    const { recommendation, layout } = runLayout(l, w)
    const rate = layout.placements.length / recommendation.totalUnits
    assert.ok(rate >= floor, `placement rate ${rate.toFixed(2)} < ${floor} for ${l}x${w}`)
  }
})

test('degenerate rooms do not crash', () => {
  for (const [l, w] of [
    [1, 1],
    [2, 40],
    [0.5, 0.5],
  ]) {
    const { recommendation, layout } = runLayout(l, w)
    const unplacedCount = layout.unplaced.reduce((s, u) => s + u.quantity, 0)
    assert.equal(layout.placements.length + unplacedCount, recommendation.totalUnits)
  }
})
