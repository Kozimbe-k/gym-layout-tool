import { useEffect, useState } from 'react'

export default function SavedLayouts({ layout, positions, decor, floorStyle, onLoad }) {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const refresh = async () => {
    try {
      const res = await fetch('/api/layouts')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setItems(body)
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const save = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          lengthM: layout.lengthM,
          widthM: layout.widthM,
          data: { layout, positions, decor, floorStyle },
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setName('')
      setMsg({ type: 'ok', text: 'Saved.' })
      refresh()
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  const load = async (id) => {
    setMsg(null)
    try {
      const res = await fetch(`/api/layouts/${id}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      onLoad(body)
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 font-medium text-gray-900">Saved layouts</h2>

      {layout && (
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            placeholder="Layout name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {msg && (
        <p className={`mb-2 text-sm ${msg.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
          {msg.text}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No saved layouts yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-gray-800">
                  {it.name || `${it.length_m} × ${it.width_m} m`}
                </p>
                <p className="text-xs text-gray-400">
                  {it.length_m} × {it.width_m} m · {new Date(it.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => load(it.id)}
                className="shrink-0 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Load
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
