import { supabase } from '../supabaseClient.js'
import { spaceTypes as seedSpaceTypes, equipment as seedEquipment } from '../data/seedData.js'

// Loads the equipment catalog from Supabase, falling back to the bundled seed
// data when the tables don't exist yet or are empty. `source` tells the caller
// (and the API consumer) which one they got.
// max_qty is business logic kept in code, not a DB column — merge it onto DB
// rows by name so both sources behave identically
const capsByName = new Map(seedEquipment.map((e) => [e.name, e.max_qty ?? null]))

export async function loadCatalog() {
  if (supabase) {
    const [st, eq] = await Promise.all([
      supabase.from('space_types').select('zone, area_pct, description'),
      supabase.from('equipment').select('zone, name, priority, length_m, width_m, clearance_m'),
    ])
    if (!st.error && !eq.error && st.data?.length && eq.data?.length) {
      const equipment = eq.data.map((row) => ({
        ...row,
        max_qty: capsByName.get(row.name) ?? null,
      }))
      return { spaceTypes: st.data, equipment, source: 'database' }
    }
  }
  return { spaceTypes: seedSpaceTypes, equipment: seedEquipment, source: 'seed' }
}
