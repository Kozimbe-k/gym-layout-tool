import { Router } from 'express'
import { loadCatalog } from '../lib/catalog.js'
import { recommend } from '../lib/recommendation.js'

const router = Router()

router.post('/', async (req, res) => {
  const areaSqm = Number(req.body?.areaSqm)
  if (!Number.isFinite(areaSqm) || areaSqm <= 0 || areaSqm > 100000) {
    return res.status(400).json({ error: 'areaSqm must be a number between 0 and 100000' })
  }

  const { spaceTypes, equipment, source } = await loadCatalog()
  res.json({ source, ...recommend({ areaSqm, spaceTypes, equipment }) })
})

export default router
