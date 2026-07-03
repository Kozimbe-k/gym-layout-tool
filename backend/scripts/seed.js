// Seeds the placeholder catalog into Supabase. Idempotent (upserts).
// Usage: node scripts/seed.js  (run from the backend/ directory)
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { spaceTypes, equipment } from '../src/data/seedData.js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const st = await supabase.from('space_types').upsert(spaceTypes, { onConflict: 'zone' })
if (st.error) {
  console.error('space_types seed failed:', st.error.message)
  process.exit(1)
}

const eq = await supabase.from('equipment').upsert(equipment, { onConflict: 'name' })
if (eq.error) {
  console.error('equipment seed failed:', eq.error.message)
  process.exit(1)
}

const counts = await Promise.all([
  supabase.from('space_types').select('*', { count: 'exact', head: true }),
  supabase.from('equipment').select('*', { count: 'exact', head: true }),
])
console.log(`Seeded OK: ${counts[0].count} space types, ${counts[1].count} equipment items`)
