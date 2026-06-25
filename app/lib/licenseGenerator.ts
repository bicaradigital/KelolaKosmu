import { createClient } from '@/app/utils/supabase/client'
import {
  getMockLicenses,
  createMockLicense,
  getMockLicenseCount,
  getActiveMockLicenseCount,
  updateMockLicenseStatus,
  searchMockLicenses,
} from './mockLicenses'

export interface License {
  id: string
  key: string
  buyer_name: string
  status: 'active' | 'inactive'
  created_at: string
  expires_at?: string
  notes?: string
  device_fingerprint?: string
}

const supabase = createClient()
// Check if Supabase is configured by checking for URL
const hasSupabaseConfig = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const USE_MOCK = !hasSupabaseConfig

// Generate license key in format: KK-[YEAR]-[4CHAR]-[4DIGITS]
export function generateLicenseKey(): string {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomChars = ''
  for (let i = 0; i < 4; i++) {
    randomChars += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const randomDigits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')

  return `KK-${year}-${randomChars}-${randomDigits}`
}

export interface CreateLicenseInput {
  buyer_name: string
  notes?: string
  quantity?: number
}

export async function createLicense(input: CreateLicenseInput): Promise<License | null> {
  try {
    if (USE_MOCK) {
      return await createMockLicense(input.buyer_name, input.notes)
    }

    const licenseKey = generateLicenseKey()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year

    const { data, error } = await supabase!.from('licenses').insert({
      key: licenseKey,
      buyer_name: input.buyer_name,
      status: 'active',
      created_at: now,
      expires_at: expiresAt,
      notes: input.notes || null,
      device_fingerprint: null,
    }).select().single()

    if (error) {
      console.error('Error creating license:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating license:', error)
    return null
  }
}

export async function getLicenses(limit = 50, offset = 0): Promise<License[]> {
  try {
    if (USE_MOCK) {
      return await getMockLicenses(limit, offset)
    }

    const { data, error } = await supabase!
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching licenses:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching licenses:', error)
    return []
  }
}

export async function updateLicenseStatus(
  licenseId: string,
  status: 'active' | 'inactive'
): Promise<boolean> {
  try {
    if (USE_MOCK) {
      return await updateMockLicenseStatus(licenseId, status)
    }

    const { error } = await supabase!
      .from('licenses')
      .update({ status })
      .eq('id', licenseId)

    if (error) {
      console.error('Error updating license status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating license status:', error)
    return false
  }
}

export async function searchLicenses(query: string): Promise<License[]> {
  try {
    if (USE_MOCK) {
      return await searchMockLicenses(query)
    }

    const { data, error } = await supabase!
      .from('licenses')
      .select('*')
      .or(`key.ilike.%${query}%,buyer_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching licenses:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching licenses:', error)
    return []
  }
}

export async function getLicenseCount(): Promise<number> {
  try {
    if (USE_MOCK) {
      return await getMockLicenseCount()
    }

    const { count, error } = await supabase!
      .from('licenses')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error fetching license count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching license count:', error)
    return 0
  }
}

export async function getActiveLicenseCount(): Promise<number> {
  try {
    if (USE_MOCK) {
      return await getActiveMockLicenseCount()
    }

    const { count, error } = await supabase!
      .from('licenses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching active license count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching active license count:', error)
    return 0
  }
}
