import { supabase } from '../supabaseClient.js'
import { spaceTypes as seedSpaceTypes, equipment as seedEquipment } from '../data/seedData.js'

// Loads the equipment catalog from Supabase, falling back to the bundled seed
// data when the tables don't exist yet or are empty. `source` tells the caller
// (and the API consumer) which one they got.
export async function loadCatalog() {
  if (supabase) {
    const [st, eq] = await Promise.all([
      supabase.from('space_types').select('zone, area_pct, description'),
      supabase.from('equipment').select('zone, name, priority, length_m, width_m, clearance_m'),
    ])
    if (!st.error && !eq.error && st.data?.length && eq.data?.length) {
      return { spaceTypes: st.data, equipment: eq.data, source: 'database' }
    }
  }
  return { spaceTypes: seedSpaceTypes, equipment: seedEquipment, source: 'seed' }
}
