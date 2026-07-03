const WALL_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

const inputCls =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'
const smallCls =
  'rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none'

function OpeningsEditor({ label, kind, items, onChange, max, defaultWidth }) {
  const update = (idx, patch) =>
    onChange(items.map((o, i) => (i === idx ? { ...o, ...patch } : o)))

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {items.length < max && (
          <button
            type="button"
            onClick={() => onChange([...items, { wall: 'top', offsetM: '1', widthM: String(defaultWidth) }])}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            + Add
          </button>
        )}
      </div>
      {items.length > 0 && (
        <div className="mt-1 space-y-1">
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem_1.25rem] gap-1 text-[10px] uppercase text-gray-400">
            <span>Wall</span>
            <span>Offset</span>
            <span>Width</span>
            <span />
          </div>
          {items.map((o, i) => (
            <div key={`${kind}${i}`} className="grid grid-cols-[1fr_3.5rem_3.5rem_1.25rem] gap-1">
              <select
                value={o.wall}
                onChange={(e) => update(i, { wall: e.target.value })}
                className={smallCls}
              >
                {WALL_OPTIONS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.1"
                value={o.offsetM}
                onChange={(e) => update(i, { offsetM: e.target.value })}
                className={smallCls}
              />
              <input
                type="number"
                min="0.3"
                step="0.1"
                value={o.widthM}
                onChange={(e) => update(i, { widthM: e.target.value })}
                className={smallCls}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoomForm({ value, onChange, onSubmit, loading }) {
  const length = Number(value.lengthM)
  const width = Number(value.widthM)
  const valid = length > 0 && width > 0 && length <= 100 && width <= 100
  const areaSqm = valid ? length * width : 0

  const set = (patch) => onChange({ ...value, ...patch })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!valid) return
    const numeric = (list) =>
      list.map((o) => ({ wall: o.wall, offsetM: Number(o.offsetM), widthM: Number(o.widthM) }))
    onSubmit({
      lengthM: length,
      widthM: width,
      doors: numeric(value.doors),
      windows: numeric(value.windows),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Length (m)</span>
          <input
            type="number"
            min="1"
            max="100"
            step="0.1"
            value={value.lengthM}
            onChange={(e) => set({ lengthM: e.target.value })}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Width (m)</span>
          <input
            type="number"
            min="1"
            max="100"
            step="0.1"
            value={value.widthM}
            onChange={(e) => set({ widthM: e.target.value })}
            className={inputCls}
          />
        </label>
      </div>

      <OpeningsEditor
        label="Doors"
        kind="door"
        items={value.doors}
        onChange={(doors) => set({ doors })}
        max={4}
        defaultWidth={1}
      />
      <OpeningsEditor
        label="Windows"
        kind="window"
        items={value.windows}
        onChange={(windows) => set({ windows })}
        max={8}
        defaultWidth={2}
      />

      <p className="text-sm text-gray-500">
        Area: <span className="font-medium text-gray-900">{areaSqm.toFixed(1)} m²</span>
      </p>
      <button
        type="submit"
        disabled={!valid || loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Calculating…' : 'Get recommendations'}
      </button>
    </form>
  )
}
