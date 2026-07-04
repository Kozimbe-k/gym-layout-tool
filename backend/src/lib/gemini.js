import { supabase } from '../supabaseClient.js'
import { BUCKET } from '../routes/photos.js'

const MODEL = 'gemini-2.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
// "nano banana" — Gemini's image generation/editing model; GA id first, preview id as fallback
const IMAGE_MODELS = ['gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview']

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    wallColors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          hex: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['name', 'hex', 'reason'],
      },
    },
    flooring: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          color: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['type', 'color', 'reason'],
      },
    },
    lighting: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          placement: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['type', 'placement', 'reason'],
      },
    },
    generalNotes: { type: 'string' },
  },
  required: ['wallColors', 'flooring', 'lighting', 'generalNotes'],
}

export function geminiConfigured() {
  // accepts both classic AIza... keys and newer AQ.... Google Cloud keys;
  // rejects obvious non-keys (paths, spaces)
  const key = process.env.GEMINI_API_KEY
  return Boolean(key && key.length >= 20 && !/[\\/\s]/.test(key))
}

async function photoAsInlineData(path) {
  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error) throw new Error(`photo download failed (${path}): ${error.message}`)
  const buf = Buffer.from(await data.arrayBuffer())
  const mime = data.type || 'image/jpeg'
  return { inline_data: { mime_type: mime, data: buf.toString('base64') } }
}

export async function designSuggestions({ photoPaths, room, equipmentSummary }) {
  const images = await Promise.all(photoPaths.map(photoAsInlineData))

  const prompt = [
    'You are an interior design consultant for commercial gyms.',
    `The room is ${room.lengthM} x ${room.widthM} m (${(room.lengthM * room.widthM).toFixed(0)} sqm).`,
    `Planned equipment: ${equipmentSummary}.`,
    'Look at the attached photos of the room in its current state.',
    'Suggest 2-3 wall color options (with hex codes), 1-2 flooring options, and 2-3 lighting recommendations that suit a modern gym, work with the existing daylight and features visible in the photos, and complement the planned equipment zones.',
    'Keep every reason to one sentence. Answer in the same language as this prompt.',
  ].join(' ')

  const body = {
    contents: [{ parts: [{ text: prompt }, ...images] }],
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: RESPONSE_SCHEMA,
      temperature: 0.4,
    },
  }

  const res = await fetch(`${ENDPOINT}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Gemini API ${res.status}: ${detail.slice(0, 300)}`)
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no content')
  return JSON.parse(text)
}

// Edits the room photo into a redesigned version applying the suggestions.
// Returns a PNG/JPEG buffer.
export async function renderRedesign({ photoPath, suggestions, equipmentSummary }) {
  const image = await photoAsInlineData(photoPath)

  const walls = suggestions.wallColors.map((c) => `${c.name} (${c.hex})`).join(', ')
  const flooring = suggestions.flooring.map((f) => `${f.type} in ${f.color}`).join(' and ')
  const lighting = suggestions.lighting.map((l) => `${l.type} (${l.placement})`).join('; ')

  const prompt = [
    'Edit this photo of the room. Keep the exact same room geometry, camera angle, windows and doors.',
    `Repaint the walls using: ${walls} — use the first as the main wall color and the second as a single accent wall.`,
    `Install this flooring: ${flooring}.`,
    `Add this lighting: ${lighting}.`,
    `Furnish it as a modern commercial gym with this equipment, arranged in sensible zones: ${equipmentSummary}.`,
    'Photorealistic interior visualization, realistic proportions, clean and well-lit.',
  ].join(' ')

  const body = {
    contents: [{ parts: [{ text: prompt }, image] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  }

  let lastError = new Error('no image model available')
  for (const model of IMAGE_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
    if (res.status === 404) {
      lastError = new Error(`model ${model} not found`)
      continue
    }
    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`Gemini image API ${res.status}: ${detail.slice(0, 300)}`)
    }
    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts || []
    const imagePart = parts.find((p) => p.inlineData?.data || p.inline_data?.data)
    if (!imagePart) throw new Error('Gemini returned no image')
    const inline = imagePart.inlineData || imagePart.inline_data
    return { buffer: Buffer.from(inline.data, 'base64'), mimeType: inline.mimeType || inline.mime_type || 'image/png' }
  }
  throw lastError
}
