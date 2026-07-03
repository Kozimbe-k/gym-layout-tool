export default function RecommendationPanel({ result }) {
  if (!result) return null

  const unplaced = result.unplaced || []

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recommended equipment</h2>
        <span className="text-sm text-gray-500">
          {result.totalUnits} units · {result.totalUsedSqm} m² used (
          {(result.utilization * 100).toFixed(1)}%)
        </span>
      </div>
      {unplaced.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">
            Didn't fit on the floor plan:
          </p>
          <ul className="mt-1 space-y-0.5">
            {unplaced.map((u) => (
              <li key={`${u.zone}-${u.name}`} className="text-sm text-amber-700">
                {u.name} × {u.quantity}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-amber-600">
            The room is too tight for these — try different dimensions or remove them from the
            plan.
          </p>
        </div>
      )}
      {result.zones.map((zone) => {
        const items = zone.items.filter((i) => i.quantity > 0)
        return (
          <div key={zone.zone} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium text-gray-900">{zone.zone}</h3>
              <span className="text-xs text-gray-500">
                {zone.usedSqm} / {zone.budgetSqm} m²
              </span>
            </div>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">Zone too small for equipment</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {items.map((item) => (
                  <li key={item.name} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium text-gray-900">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
