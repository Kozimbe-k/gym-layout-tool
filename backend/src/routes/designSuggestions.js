import { Router } from 'express'
import { supabase } from '../supabaseClient.js'
import { designSuggestions, geminiConfigured } from '../lib/gemini.js'

const router = Router()

router.post('/', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })
  if (!geminiConfigured()) {
    return res.status(503).json({
      error:
        'GEMINI_API_KEY is missing or invalid in backend/.env — get a key at https://aistudio.google.com/apikey',
    })
  }

  const { photoPaths, room, equipment } = req.body ?? {}
  if (!Array.isArray(photoPaths) || photoPaths.length === 0 || photoPaths.length > 3) {
    return res.status(400).json({ error: 'photoPaths must contain 1-3 storage paths' })
  }
  if (photoPaths.some((p) => typeof p !== 'string' || !p.startsWith('rooms/'))) {
    return res.status(400).json({ error: 'invalid photo path' })
  }
  const lengthM = Number(room?.lengthM)
  const widthM = Number(room?.widthM)
  if (!(lengthM > 0) || !(widthM > 0)) {
    return res.status(400).json({ error: 'room.lengthM and room.widthM are required' })
  }
  if (!Array.isArray(equipment) || equipment.length === 0) {
    return res.status(400).json({ error: 'equipment list is required — generate a layout first' })
  }

  const equipmentSummary = equipment
    .slice(0, 40)
    .map((e) => `${e.name} x${e.quantity}`)
    .join(', ')

  try {
    const suggestions = await designSuggestions({
      photoPaths,
      room: { lengthM, widthM },
      equipmentSummary,
    })
    res.json(suggestions)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

export default router
