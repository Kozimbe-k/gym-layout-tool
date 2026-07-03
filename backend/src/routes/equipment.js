import { Router } from 'express'
import { loadCatalog } from '../lib/catalog.js'

const router = Router()

router.get('/', async (req, res) => {
  const { spaceTypes, equipment, source } = await loadCatalog()
  res.json({ source, spaceTypes, equipment })
})

export default router
