import { useRef, useState } from 'react'

export default function DesignSuggestions({ layout }) {
  const [photos, setPhotos] = useState([]) // { path, url }
  const [suggestions, setSuggestions] = useState(null)
  const [render, setRender] = useState(null) // { path, url }
  const [uploading, setUploading] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const equipment = layout
    ? layout.zones.flatMap((z) => z.items.filter((i) => i.quantity > 0))
    : []

  const handleFiles = async (e) => {
    const files = [...e.target.files].slice(0, 3)
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      files.forEach((f) => form.append('photos', f))
      const res = await fetch('/api/photos', { method: 'POST', body: form })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setPhotos(body.photos)
      setSuggestions(null)
      setRender(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const getSuggestions = async () => {
    setThinking(true)
    setError(null)
    try {
      const res = await fetch('/api/design-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoPaths: photos.map((p) => p.path),
          room: { lengthM: layout.lengthM, widthM: layout.widthM },
          equipment: equipment.map((e) => ({ name: e.name, quantity: e.quantity })),
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setSuggestions(body)
      setRender(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setThinking(false)
    }
  }

  const visualize = async () => {
    setRendering(true)
    setError(null)
    try {
      const res = await fetch('/api/design-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoPath: photos[0].path,
          suggestions,
          equipment: equipment.map((e) => ({ name: e.name, quantity: e.quantity })),
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setRender(body)
    } catch (err) {
      setError(err.message)
    } finally {
      setRendering(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="font-medium text-gray-900">Design suggestions</h2>
      <p className="mt-1 text-sm text-gray-500">
        Upload 1–3 photos of the room and get wall color, flooring and lighting ideas for the
        planned equipment.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFiles}
          disabled={uploading}
          className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        {uploading && <span className="text-sm text-gray-400">Uploading…</span>}
      </div>

      {photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {photos.map((p) => (
            <img
              key={p.path}
              src={p.url}
              alt="Room photo"
              className="h-20 w-20 rounded-md border border-gray-200 object-cover"
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={getSuggestions}
        disabled={!layout || photos.length === 0 || thinking}
        className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {thinking ? 'Analyzing photos…' : 'Get design suggestions'}
      </button>
      {!layout && (
        <p className="mt-2 text-xs text-gray-400">Generate a layout first.</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {suggestions && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Wall colors</h3>
            <ul className="mt-2 space-y-2">
              {suggestions.wallColors.map((c) => (
                <li key={c.hex + c.name} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border border-gray-300"
                    style={{ backgroundColor: c.hex }}
                  />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{c.name}</span>{' '}
                    <span className="text-gray-400">{c.hex}</span> — {c.reason}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Flooring</h3>
            <ul className="mt-2 space-y-1">
              {suggestions.flooring.map((f, i) => (
                <li key={i} className="text-sm text-gray-700">
                  <span className="font-medium">{f.type}</span> ({f.color}) — {f.reason}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Lighting</h3>
            <ul className="mt-2 space-y-1">
              {suggestions.lighting.map((l, i) => (
                <li key={i} className="text-sm text-gray-700">
                  <span className="font-medium">{l.type}</span> ({l.placement}) — {l.reason}
                </li>
              ))}
            </ul>
          </div>
          {suggestions.generalNotes && (
            <p className="text-sm text-gray-500">{suggestions.generalNotes}</p>
          )}

          <div>
            <button
              type="button"
              onClick={visualize}
              disabled={rendering}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {rendering ? 'Generating image… (~20 s)' : render ? 'Regenerate visualization' : 'Visualize in photo'}
            </button>
            {render && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-gray-400">Before</p>
                  <img
                    src={photos[0].url}
                    alt="Room before"
                    className="w-full rounded-md border border-gray-200"
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-gray-400">After (AI visualization)</p>
                  <img
                    src={render.url}
                    alt="Room redesigned"
                    className="w-full rounded-md border border-gray-200"
                  />
                </div>
                <p className="text-xs text-gray-400 sm:col-span-2">
                  Indicative visualization — proportions and equipment models are approximate.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
