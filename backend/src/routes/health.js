import { Router } from 'express'
import { supabase } from '../supabaseClient.js'

const router = Router()

router.get('/', async (req, res) => {
  if (!supabase) {
    return res.json({ status: 'ok', supabaseConfigured: false })
  }

  const { error } = await supabase.storage.listBuckets()
  res.json({
    status: 'ok',
    supabaseConfigured: true,
    supabaseConnected: !error,
    supabaseError: error?.message,
  })
})

export default router
