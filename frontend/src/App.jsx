import { useState } from 'react'
import RoomForm from './components/RoomForm.jsx'
import RoomCanvas from './components/RoomCanvas.jsx'
import RecommendationPanel from './components/RecommendationPanel.jsx'

function App() {
  const [room, setRoom] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async ({ lengthM, widthM }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaSqm: lengthM * widthM }),
      })
      if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`)
      setResult(await res.json())
      setRoom({ lengthM, widthM })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Gym Layout Tool</h1>
        <p className="text-sm text-gray-500">Enter room dimensions to get an equipment plan</p>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 font-medium text-gray-900">Room dimensions</h2>
            <RoomForm onSubmit={handleSubmit} loading={loading} />
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
          <RecommendationPanel result={result} />
        </aside>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          {room ? (
            <RoomCanvas lengthM={room.lengthM} widthM={room.widthM} />
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center text-gray-400">
              Room preview appears here
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
