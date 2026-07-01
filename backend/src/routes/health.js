import { Router } from 'express'
import { supabase } from '../supabaseClient.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    supabaseConfigured: Boolean(supabase),
  })
})

export default router
