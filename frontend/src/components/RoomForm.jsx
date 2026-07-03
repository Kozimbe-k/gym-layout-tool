import { useState } from 'react'

export default function RoomForm({ onSubmit, loading }) {
  const [lengthM, setLengthM] = useState('12')
  const [widthM, setWidthM] = useState('9')

  const length = Number(lengthM)
  const width = Number(widthM)
  const valid = length > 0 && width > 0 && length <= 100 && width <= 100
  const areaSqm = valid ? length * width : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (valid) onSubmit({ lengthM: length, widthM: width })
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
            value={lengthM}
            onChange={(e) => setLengthM(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Width (m)</span>
          <input
            type="number"
            min="1"
            max="100"
            step="0.1"
            value={widthM}
            onChange={(e) => setWidthM(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>
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
