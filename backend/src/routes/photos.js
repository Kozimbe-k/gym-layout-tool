import { Router } from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import { supabase } from '../supabaseClient.js'

const BUCKET = 'room-photos'
const MAX_SIZE = 8 * 1024 * 1024
const ALLOWED = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 3 },
  fileFilter: (req, file, cb) => cb(null, Boolean(ALLOWED[file.mimetype])),
})

let bucketReady = false
async function ensureBucket() {
  if (bucketReady) return
  const { data } = await supabase.storage.getBucket(BUCKET)
  if (!data) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_SIZE,
      allowedMimeTypes: Object.keys(ALLOWED),
    })
    if (error && !/already exists/i.test(error.message)) throw new Error(error.message)
  }
  bucketReady = true
}

router.post('/', upload.array('photos', 3), async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })
  const files = req.files || []
  if (files.length === 0) {
    return res.status(400).json({ error: 'attach 1-3 photos (jpeg, png or webp, max 8 MB each)' })
  }

  try {
    await ensureBucket()
  } catch (e) {
    return res.status(500).json({ error: `storage bucket: ${e.message}` })
  }

  const results = []
  for (const file of files) {
    const path = `rooms/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ALLOWED[file.mimetype]}`
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file.buffer, { contentType: file.mimetype })
    if (error) return res.status(500).json({ error: `upload failed: ${error.message}` })

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600)
    if (signErr) return res.status(500).json({ error: `signed url: ${signErr.message}` })
    results.push({ path, url: signed.signedUrl })
  }

  res.status(201).json({ photos: results })
})

export { BUCKET }
export default router
