import { Router } from 'express'
import { loadCatalog } from '../lib/catalog.js'
import { recommend } from '../lib/recommendation.js'
import { layoutRoom } from '../lib/layout.js'

const router = Router()

router.post('/', async (req, res) => {
  const lengthM = Number(req.body?.lengthM)
  const widthM = Number(req.body?.widthM)
  const valid = (n) => Number.isFinite(n) && n > 0 && n <= 100
  if (!valid(lengthM) || !valid(widthM)) {
    return res.status(400).json({ error: 'lengthM and widthM must be numbers between 0 and 100' })
  }

  const { spaceTypes, equipment, source } = await loadCatalog()
  const recommendation = recommend({ areaSqm: lengthM * widthM, spaceTypes, equipment })
  const layout = layoutRoom({ lengthM, widthM, recommendation, equipment })

  res.json({ source, lengthM, widthM, ...recommendation, ...layout })
})

export default router
