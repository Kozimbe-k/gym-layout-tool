import { Router } from 'express'
import crypto from 'node:crypto'
import { supabase } from '../supabaseClient.js'
import { geminiConfigured, renderRedesign } from '../lib/gemini.js'
import { BUCKET } from './photos.js'

const router = Router()

router.post('/', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })
  if (!geminiConfigured()) {
    return res.status(503).json({
      error:
        'GEMINI_API_KEY is missing or invalid in backend/.env — get a key at https://aistudio.google.com/apikey',
    })
  }

  const { photoPath, suggestions, equipment } = req.body ?? {}
  if (typeof photoPath !== 'string' || !photoPath.startsWith('rooms/')) {
    return res.status(400).json({ error: 'photoPath must be a stored room photo path' })
  }
  if (
    !Array.isArray(suggestions?.wallColors) ||
    !Array.isArray(suggestions?.flooring) ||
    !Array.isArray(suggestions?.lighting)
  ) {
    return res.status(400).json({ error: 'suggestions object is required — get design suggestions first' })
  }
  if (!Array.isArray(equipment) || equipment.length === 0) {
    return res.status(400).json({ error: 'equipment list is required' })
  }

  const equipmentSummary = equipment
    .slice(0, 40)
    .map((e) => `${e.name} x${e.quantity}`)
    .join(', ')

  try {
    const { buffer, mimeType } = await renderRedesign({ photoPath, suggestions, equipmentSummary })
    const ext = mimeType.includes('jpeg') ? 'jpg' : 'png'
    const path = `renders/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: mimeType })
    if (upErr) return res.status(500).json({ error: `render upload failed: ${upErr.message}` })

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600)
    if (signErr) return res.status(500).json({ error: `signed url: ${signErr.message}` })

    res.json({ path, url: signed.signedUrl })
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

export default router
