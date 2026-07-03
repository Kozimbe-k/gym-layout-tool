import test from 'node:test'
import assert from 'node:assert/strict'
import { recommend } from './recommendation.js'
import { spaceTypes, equipment } from '../data/seedData.js'

// Expected values come from phase1/equipment-recommendation-model.xlsx
// (Scenario Summary + Recommendation Model sheets), computed independently
// via spreadsheet formulas — not from this engine.

const run = (areaSqm) => recommend({ areaSqm, spaceTypes, equipment })

const qtyOf = (result, name) => {
  for (const zone of result.zones) {
    const item = zone.items.find((i) => i.name === name)
    if (item) return item.quantity
  }
  throw new Error(`item not found: ${name}`)
}

const zoneOf = (result, zone) => result.zones.find((z) => z.zone === zone)

test('scenario A: 100 sqm matches spreadsheet', () => {
  const r = run(100)
  assert.equal(r.totalUsedSqm, 90.13)
  assert.equal(r.utilization, 0.9013)
  assert.equal(r.totalUnits, 11)

  assert.deepEqual(
    r.zones.map((z) => [z.zone, z.budgetSqm, z.usedSqm]),
    [
      ['Cardio Zone', 30, 28.56],
      ['Free Weight Zone', 25, 24.5],
      ['Machine Zone', 20, 15.75],
      ['Functional Zone', 15, 12],
      ['Recovery Zone', 10, 9.32],
    ],
  )

  assert.equal(qtyOf(r, 'Treadmill'), 4)
  assert.equal(qtyOf(r, 'Elliptical'), 0)
  assert.equal(qtyOf(r, 'Power Rack'), 2)
  assert.equal(qtyOf(r, 'Cable Crossover Station'), 1)
  assert.equal(qtyOf(r, 'Battle Ropes Station'), 2)
  assert.equal(qtyOf(r, 'Stretching Mat Area'), 1)
  assert.equal(qtyOf(r, 'Foam Roller Station'), 1)
})

test('scenario B: 200 sqm matches spreadsheet', () => {
  const r = run(200)
  assert.equal(r.totalUsedSqm, 195.04)
  assert.equal(r.utilization, 0.9752)
  assert.equal(r.totalUnits, 23)

  assert.equal(qtyOf(r, 'Treadmill'), 8)
  assert.equal(qtyOf(r, 'Upright Exercise Bike'), 1)
  assert.equal(qtyOf(r, 'Power Rack'), 4)
  assert.equal(qtyOf(r, 'Cable Crossover Station'), 2)
  assert.equal(qtyOf(r, 'Lat Pulldown Machine'), 1)
  assert.equal(qtyOf(r, 'Turf Sprint Lane'), 1)
  assert.equal(qtyOf(r, 'Battle Ropes Station'), 2)
  assert.equal(qtyOf(r, 'Stretching Mat Area'), 2)
  assert.equal(qtyOf(r, 'Foam Roller Station'), 2)
})

test('scenario C: 500 sqm matches spreadsheet', () => {
  const r = run(500)
  assert.equal(r.totalUsedSqm, 490.82)
  assert.equal(r.utilization, 0.9816)
  assert.equal(r.totalUnits, 50)

  assert.equal(qtyOf(r, 'Treadmill'), 21)
  assert.equal(qtyOf(r, 'Power Rack'), 10)
  assert.equal(qtyOf(r, 'Cable Crossover Station'), 6)
  assert.equal(qtyOf(r, 'Turf Sprint Lane'), 4)
  assert.equal(qtyOf(r, 'Plyo Box Set'), 1)
  assert.equal(qtyOf(r, 'Stretching Mat Area'), 7)
  assert.equal(qtyOf(r, 'Foam Roller Station'), 1)
})

test('zone budgets never overfill', () => {
  for (const area of [37, 80, 143, 999]) {
    const r = run(area)
    for (const z of r.zones) {
      assert.ok(z.usedSqm <= z.budgetSqm + 0.01, `${z.zone} overfilled at ${area} sqm`)
    }
  }
})

test('tiny room recommends nothing rather than overfilling', () => {
  const r = run(5)
  const cardio = zoneOf(r, 'Cardio Zone')
  assert.equal(cardio.usedSqm, 0)
})
