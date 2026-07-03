import { Router } from 'express'
import { loadCatalog } from '../lib/catalog.js'
import { recommend } from '../lib/recommendation.js'
import { layoutRoom } from '../lib/layout.js'

const router = Router()

const WALLS = ['top', 'bottom', 'left', 'right']

function validateOpenings(list, lengthM, widthM, { min, max, maxCount }, label) {
  if (!Array.isArray(list)) return `${label} must be an array`
  if (list.length > maxCount) return `at most ${maxCount} ${label}`
  for (const o of list) {
    if (!WALLS.includes(o?.wall)) return `${label}: wall must be one of ${WALLS.join(', ')}`
    const offsetM = Number(o.offsetM)
    const widthMv = Number(o.widthM)
    if (!Number.isFinite(offsetM) || offsetM < 0) return `${label}: offsetM must be >= 0`
    if (!Number.isFinite(widthMv) || widthMv < min || widthMv > max)
      return `${label}: widthM must be between ${min} and ${max}`
    const wallLen = o.wall === 'top' || o.wall === 'bottom' ? lengthM : widthM
    if (offsetM + widthMv > wallLen) return `${label}: opening extends past the wall`
    o.offsetM = offsetM
    o.widthM = widthMv
  }
  return null
}

router.post('/', async (req, res) => {
  const lengthM = Number(req.body?.lengthM)
  const widthM = Number(req.body?.widthM)
  const valid = (n) => Number.isFinite(n) && n > 0 && n <= 100
  if (!valid(lengthM) || !valid(widthM)) {
    return res.status(400).json({ error: 'lengthM and widthM must be numbers between 0 and 100' })
  }

  const doors = req.body?.doors ?? []
  const windows = req.body?.windows ?? []
  const doorErr = validateOpenings(doors, lengthM, widthM, { min: 0.5, max: 4, maxCount: 4 }, 'doors')
  if (doorErr) return res.status(400).json({ error: doorErr })
  const winErr = validateOpenings(windows, lengthM, widthM, { min: 0.3, max: 10, maxCount: 8 }, 'windows')
  if (winErr) return res.status(400).json({ error: winErr })

  const { spaceTypes, equipment, source } = await loadCatalog()
  const recommendation = recommend({ areaSqm: lengthM * widthM, spaceTypes, equipment })
  const layout = layoutRoom({ lengthM, widthM, recommendation, equipment, doors })

  res.json({ source, lengthM, widthM, doors, windows, ...recommendation, ...layout })
})

export default router
