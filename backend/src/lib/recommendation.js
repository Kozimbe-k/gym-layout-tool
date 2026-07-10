// Pure recommendation engine mirroring phase1/equipment-recommendation-model.xlsx.
// Greedy fill: each zone gets areaSqm * area_pct as its budget, then equipment
// is packed in priority order until the remaining budget can't fit another unit.

export function effectiveAreaSqm(item) {
  const length = Number(item.length_m) + 2 * Number(item.clearance_m)
  const width = Number(item.width_m) + 2 * Number(item.clearance_m)
  return length * width
}

const round = (n, dp = 2) => Number(n.toFixed(dp))

export function recommend({ areaSqm, spaceTypes, equipment }) {
  const zones = spaceTypes.map((st) => {
    const budget = areaSqm * Number(st.area_pct)
    let used = 0
    const items = equipment
      .filter((e) => e.zone === st.zone)
      .sort((a, b) => Number(a.priority) - Number(b.priority))
      .map((e) => {
        const unitArea = effectiveAreaSqm(e)
        // max_qty caps how many units of one model a gym should get
        const cap = Number(e.max_qty) > 0 ? Number(e.max_qty) : Infinity
        const quantity = Math.min(Math.max(0, Math.floor((budget - used) / unitArea)), cap)
        used += quantity * unitArea
        return {
          name: e.name,
          priority: Number(e.priority),
          unitAreaSqm: round(unitArea),
          quantity,
          areaUsedSqm: round(quantity * unitArea),
        }
      })
    return {
      zone: st.zone,
      budgetSqm: round(budget),
      usedSqm: round(used),
      utilization: round(used / budget, 4),
      items,
    }
  })

  const totalUsed = zones.reduce((sum, z) => sum + z.usedSqm, 0)
  const totalUnits = zones.reduce(
    (sum, z) => sum + z.items.reduce((s, i) => s + i.quantity, 0),
    0,
  )
  return {
    areaSqm,
    zones,
    totalUsedSqm: round(totalUsed),
    totalUnits,
    utilization: round(totalUsed / areaSqm, 4),
  }
}
