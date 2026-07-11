import { useMemo, useState } from 'react'
import RoomForm from './components/RoomForm.jsx'
import RoomCanvas from './components/RoomCanvas.jsx'
import RecommendationPanel from './components/RecommendationPanel.jsx'
import SavedLayouts from './components/SavedLayouts.jsx'
import DesignSuggestions from './components/DesignSuggestions.jsx'

const rectsOverlap = (a, b) =>
  a.x < b.x + b.w - 0.01 &&
  b.x < a.x + a.w - 0.01 &&
  a.y < b.y + b.h - 0.01 &&
  b.y < a.y + a.h - 0.01

const DECOR_TYPES = {
  plant: { label: 'Plant', w: 0.5, h: 0.5 },
  bench: { label: 'Bench', w: 1.5, h: 0.4 },
  'reception-desk': { label: 'Reception desk', w: 2.0, h: 1.6 },
  'water-cooler': { label: 'Water cooler', w: 0.45, h: 0.45 },
}

const FLOOR_OPTIONS = [
  { value: 'wood', label: 'Wood planks' },
  { value: 'rubber', label: 'Gray rubber' },
  { value: 'dark-rubber', label: 'Dark rubber' },
]

function App() {
  const [room, setRoom] = useState({ lengthM: '12', widthM: '9', doors: [], windows: [] })
  const [layout, setLayout] = useState(null)
  const [positions, setPositions] = useState({})
  const [floorStyle, setFloorStyle] = useState('wood')
  const [decor, setDecor] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (body) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`)
      setLayout(await res.json())
      setPositions({})
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMove = (id, pos) => {
    setPositions((prev) => ({ ...prev, [id]: pos }))
  }

  const addDecor = (type) => {
    if (!layout) return
    const spec = DECOR_TYPES[type]
    setDecor((prev) => {
      // stagger spawns so consecutive items don't stack on each other
      const shift = (prev.length % 5) * 0.7
      return [
        ...prev,
        {
          id: `decor-${Date.now()}-${prev.length}`,
          type,
          x: Math.min(Math.max(0, layout.lengthM / 2 - spec.w / 2 + shift), layout.lengthM - spec.w),
          y: Math.min(Math.max(0, layout.widthM / 2 - spec.h / 2 + shift), layout.widthM - spec.h),
          w: spec.w,
          h: spec.h,
        },
      ]
    })
  }

  const handleDecorMove = (id, pos) => {
    setDecor((prev) => prev.map((d) => (d.id === id ? { ...d, ...pos } : d)))
  }

  const handleDecorRemove = (id) => {
    setDecor((prev) => prev.filter((d) => d.id !== id))
  }

  const handleLoad = (saved) => {
    const l = saved.data?.layout
    if (!l) return
    setLayout(l)
    setPositions(saved.data.positions || {})
    setDecor(saved.data.decor || [])
    setFloorStyle(saved.data.floorStyle || 'wood')
    setRoom({
      lengthM: String(l.lengthM),
      widthM: String(l.widthM),
      doors: (l.doors || []).map((d) => ({ ...d, offsetM: String(d.offsetM), widthM: String(d.widthM) })),
      windows: (l.windows || []).map((w) => ({ ...w, offsetM: String(w.offsetM), widthM: String(w.widthM) })),
    })
    setError(null)
  }

  const conflictIds = useMemo(() => {
    const ids = new Set()
    if (!layout) return ids
    // halo = footprint + clearance; halos may share walkway space, but a
    // solid footprint must not intrude into another unit's halo or a door swing
    const items = layout.placements.map((p) => {
      const pos = positions[p.id] || p
      const c = p.clearanceM
      return {
        id: p.id,
        halo: { x: pos.x, y: pos.y, w: p.w, h: p.h },
        foot: { x: pos.x + c, y: pos.y + c, w: p.w - 2 * c, h: p.h - 2 * c },
      }
    })
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]
        const b = items[j]
        if (rectsOverlap(a.foot, b.halo) || rectsOverlap(b.foot, a.halo)) {
          ids.add(a.id)
          ids.add(b.id)
        }
      }
      for (const z of layout.doorZones || []) {
        if (rectsOverlap(items[i].foot, z)) ids.add(items[i].id)
      }
    }
    return ids
  }, [layout, positions])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Gym Layout Tool</h1>
        <p className="text-sm text-gray-500">
          Enter room dimensions to get an equipment plan and floor layout
        </p>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 font-medium text-gray-900">Room dimensions</h2>
            <RoomForm value={room} onChange={setRoom} onSubmit={handleSubmit} loading={loading} />
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
          <SavedLayouts
            layout={layout}
            positions={positions}
            decor={decor}
            floorStyle={floorStyle}
            onLoad={handleLoad}
          />
          <RecommendationPanel result={layout} />
        </aside>

        <div className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          {layout && (
            <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Floor
                <select
                  value={floorStyle}
                  onChange={(e) => setFloorStyle(e.target.value)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {FLOOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="mx-1 h-5 w-px bg-gray-200" />
              <span className="text-sm text-gray-600">Add:</span>
              {Object.entries(DECOR_TYPES).map(([type, spec]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addDecor(type)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  + {spec.label}
                </button>
              ))}
            </div>
          )}
          {layout ? (
            <>
              <RoomCanvas
                layout={layout}
                positions={positions}
                onMove={handleMove}
                conflictIds={conflictIds}
                floorStyle={floorStyle}
                decor={decor}
                onDecorMove={handleDecorMove}
                onDecorRemove={handleDecorRemove}
              />
              {conflictIds.size > 0 ? (
                <p className="mt-2 text-sm font-medium text-red-600">
                  ⚠ {conflictIds.size} item{conflictIds.size > 1 ? 's' : ''} overlap or block a
                  door — drag them apart.
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-400">
                  Drag equipment and decor to adjust the layout. Dashed border = required
                  clearance zone. Double-click a decor item to remove it.
                </p>
              )}
            </>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center text-gray-400">
              Room layout appears here
            </div>
          )}
        </section>
        <DesignSuggestions layout={layout} />
        </div>
      </main>
    </div>
  )
}

export default App
