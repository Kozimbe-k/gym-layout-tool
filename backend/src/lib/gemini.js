import { supabase } from '../supabaseClient.js'
import { BUCKET } from '../routes/photos.js'

const MODEL = 'gemini-2.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

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
  const key = process.env.GEMINI_API_KEY
  return Boolean(key && /^AIza[\w-]{30,}$/.test(key))
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
