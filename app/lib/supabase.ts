import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// License table interface
export interface License {
  id: string
  key: string
  buyer_name: string
  status: 'active' | 'inactive'
  device_fingerprint: string | null
  created_at: string
  expires_at: string | null
  notes: string | null
}

// Create licenses table if it doesn't exist
export async function initializeLicenseTable() {
  try {
    // Check if table exists by querying it
    const { data, error } = await supabase.from('licenses').select('count', { count: 'exact' }).limit(1)
    
    if (error) {
      console.log('Licenses table does not exist yet. Create it in Supabase dashboard.')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error initializing license table:', error)
    return false
  }
}
