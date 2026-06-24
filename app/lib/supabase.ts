import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('[Supabase] URL configured:', !!supabaseUrl)
  console.log('[Supabase] Key configured:', !!supabaseKey)
}

// Create Supabase client - only if both URL and Key are present
export let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
    if (typeof window !== 'undefined') {
      console.log('[Supabase] Client initialized successfully')
    }
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error)
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('[Supabase] Not configured - will use mock data')
  }
}

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
