import { Router } from 'express'
import { supabase } from '../supabaseClient.js'

const router = Router()

const TABLE_HINT =
  'layouts table missing — run backend/db/migrations/002_create_layouts.sql in the Supabase SQL Editor'

function dbError(res, error) {
  if (/schema cache|does not exist/i.test(error.message)) {
    return res.status(503).json({ error: TABLE_HINT })
  }
  return res.status(500).json({ error: error.message })
}

router.post('/', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })
  const { name, lengthM, widthM, data } = req.body ?? {}
  const valid = (n) => Number.isFinite(Number(n)) && Number(n) > 0 && Number(n) <= 100
  if (!valid(lengthM) || !valid(widthM) || typeof data !== 'object' || data === null) {
    return res.status(400).json({ error: 'lengthM, widthM and data are required' })
  }
  const row = {
    name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : null,
    length_m: Number(lengthM),
    width_m: Number(widthM),
    data,
  }
  const { data: inserted, error } = await supabase.from('layouts').insert(row).select('id, name, length_m, width_m, created_at').single()
  if (error) return dbError(res, error)
  res.status(201).json(inserted)
})

router.get('/', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })
  const { data, error } = await supabase
    .from('layouts')
    .select('id, name, length_m, width_m, created_at')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return dbError(res, error)
  res.json(data)
})

router.get('/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid id' })
  const { data, error } = await supabase.from('layouts').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ error: 'layout not found' })
    return dbError(res, error)
  }
  res.json(data)
})

export default router
