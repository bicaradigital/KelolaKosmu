import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export interface License {
  id: string
  key: string
  buyer_name: string
  notes?: string
  is_active: boolean
  is_used: boolean
  activated_at?: string
  device_fingerprint?: string
  created_at: string
}

// Generate license key format: KK-YYYY-AAAA-DDDD
function generateLicenseKey(): string {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let charPart = ''
  for (let i = 0; i < 4; i++) {
    charPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const digitPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `KK-${year}-${charPart}-${digitPart}`
}

async function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured in environment variables')
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function createLicense(
  buyerName: string,
  notes?: string,
  quantity: number = 1
): Promise<License[]> {
  try {
    console.log('[v0] Creating licenses:', { buyerName, quantity })
    const supabase = await getSupabaseClient()
    
    const licensesToCreate: any[] = []
    const generatedKeys = new Set<string>()
    
    // Generate unique license keys
    for (let i = 0; i < quantity; i++) {
      let key = generateLicenseKey()
      // Ensure uniqueness
      while (generatedKeys.has(key)) {
        key = generateLicenseKey()
      }
      generatedKeys.add(key)
      licensesToCreate.push({
        key,
        buyer_name: buyerName,
        notes: notes || null,
        is_active: true,
        is_used: false,
      })
    }

    console.log('[v0] Generated license keys:', Array.from(generatedKeys))

    // Insert into Supabase
    const { data, error } = await supabase
      .from('licenses')
      .insert(licensesToCreate)
      .select()

    if (error) {
      console.error('[v0] Supabase insert error:', error)
      throw new Error(`Failed to create license: ${error.message}`)
    }

    console.log('[v0] Licenses created successfully:', data?.length)
    return data || []
  } catch (error) {
    console.error('[v0] Error creating license:', error)
    throw error
  }
}

export async function getLicenses(limit: number = 100): Promise<License[]> {
  try {
    console.log('[v0] Fetching licenses...')
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[v0] Supabase fetch error:', error)
      throw new Error(`Failed to fetch licenses: ${error.message}`)
    }

    console.log('[v0] Fetched licenses:', data?.length)
    return data || []
  } catch (error) {
    console.error('[v0] Error fetching licenses:', error)
    return []
  }
}

export async function getLicenseCount(): Promise<number> {
  try {
    const supabase = await getSupabaseClient()
    
    const { count, error } = await supabase
      .from('licenses')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('[v0] Count error:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('[v0] Error getting license count:', error)
    return 0
  }
}

export async function getActiveLicenseCount(): Promise<number> {
  try {
    const supabase = await getSupabaseClient()
    
    const { count, error } = await supabase
      .from('licenses')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (error) {
      console.error('[v0] Active count error:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('[v0] Error getting active count:', error)
    return 0
  }
}

export async function updateLicenseStatus(
  id: string,
  isActive: boolean
): Promise<License | null> {
  try {
    console.log('[v0] Updating license status:', { id, isActive })
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from('licenses')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Update error:', error)
      throw new Error(`Failed to update license: ${error.message}`)
    }

    console.log('[v0] License updated successfully')
    return data
  } catch (error) {
    console.error('[v0] Error updating license:', error)
    return null
  }
}

export async function searchLicenses(query: string): Promise<License[]> {
  try {
    console.log('[v0] Searching licenses:', query)
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .or(`key.ilike.%${query}%,buyer_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Search error:', error)
      return []
    }

    console.log('[v0] Search results:', data?.length)
    return data || []
  } catch (error) {
    console.error('[v0] Error searching licenses:', error)
    return []
  }
}
