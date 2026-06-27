/**
 * License Verification Utility
 * Verifies that a license key exists in the database/mock store
 * This prevents users from entering arbitrary license keys
 */

import {
  getLicenseByKey,
  getAllMockLicenses,
} from './mockLicenses'

// Check if Supabase is configured by checking for URL
const hasSupabaseConfig = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const USE_MOCK = !hasSupabaseConfig

// Initialize Supabase client only in browser
let supabase: any = null
if (typeof window !== 'undefined' && hasSupabaseConfig) {
  try {
    const { createClient } = require('@/app/utils/supabase/client')
    supabase = createClient()
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
  }
}

/**
 * Verify that a license key exists in the system
 * This ensures only officially generated keys are accepted
 * Checks both Supabase and mock data for maximum compatibility
 */
export async function verifyLicenseKeyExists(licenseKey: string): Promise<boolean> {
  try {
    console.log('[v0] License Verification START - Input key:', licenseKey)
    console.log('[v0] hasSupabaseConfig:', hasSupabaseConfig)
    console.log('[v0] supabase instance exists:', !!supabase)
    
    // First try Supabase if configured
    if (hasSupabaseConfig && supabase) {
      try {
        console.log('[v0] Attempting Supabase query for key:', licenseKey.toUpperCase())
        
        // Query with all possible status/active columns
        const { data, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('key', licenseKey.toUpperCase())
          .maybeSingle()

        console.log('[v0] Supabase query returned - data:', data, 'error:', error)

        if (error) {
          console.error('[v0] Supabase error code:', error.code, 'message:', error.message)
        }

        if (data) {
          console.log('[v0] License found in Supabase - full data:', data)
          
          // Check if license is active using either status or is_active field
          const isActive = data.status === 'active' || 
                          data.is_active === true || 
                          data.is_used === false
          
          console.log('[v0] License is_active check:', {
            status_field: data.status,
            is_active_field: data.is_active,
            is_used_field: data.is_used,
            final_result: isActive
          })
          
          if (isActive) {
            console.log('[v0] License VERIFIED - active in Supabase')
            return true
          } else {
            console.warn('[v0] License found but NOT active - status:', data.status, 'is_active:', data.is_active)
            return false
          }
        } else {
          console.log('[v0] No data returned from Supabase (license not found)')
        }
      } catch (supabaseError) {
        console.error('[v0] Supabase query exception:', supabaseError)
      }
    } else {
      console.warn('[v0] Supabase not configured or instance missing')
    }

    // Fallback to mock data
    console.log('[v0] Falling back to mock data...')
    const allLicenses = await getAllMockLicenses()
    console.log('[v0] Mock licenses count:', allLicenses.length)
    
    const found = allLicenses.some(
      (lic) => lic.key.toUpperCase() === licenseKey.toUpperCase() && lic.status === 'active'
    )
    
    if (found) {
      console.log('[v0] License VERIFIED - found in mock data')
      return true
    }

    console.warn('[v0] License key NOT FOUND in any data source')
    return false
  } catch (error) {
    console.error('[v0] Unexpected error in license verification:', error)
    return false
  }
}

/**
 * Verify license and get its full details
 * Returns license object if valid and active, null otherwise
 */
export async function verifyLicenseKey(licenseKey: string) {
  try {
    console.log('[v0] Getting full license details for key:', licenseKey)

    // First try Supabase if configured
    if (hasSupabaseConfig && supabase) {
      try {
        console.log('[v0] Querying Supabase for full license data...')
        const { data, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('key', licenseKey.toUpperCase())
          .maybeSingle()

        console.log('[v0] Supabase query result - data:', data, 'error:', error)

        if (data) {
          console.log('[v0] Full license data from Supabase:', data)
          
          // Check if active using either status or is_active field
          const isActive = data.status === 'active' || 
                          data.is_active === true || 
                          data.is_used === false
          
          if (isActive) {
            console.log('[v0] Returning active license from Supabase')
            return data
          } else {
            console.warn('[v0] License found but not active - returning null')
            return null
          }
        }

        if (error) {
          console.error('[v0] Supabase query error:', error)
        }
      } catch (supabaseError) {
        console.error('[v0] Supabase lookup exception:', supabaseError)
      }
    }

    // Fallback to mock data
    console.log('[v0] Falling back to mock data for license details...')
    const mockLicense = await getLicenseByKey(licenseKey)
    if (mockLicense && mockLicense.status === 'active') {
      console.log('[v0] Returning active license from mock data')
      return mockLicense
    }

    console.warn('[v0] License not found or inactive - returning null')
    return null
  } catch (error) {
    console.error('[v0] Unexpected error getting license details:', error)
    return null
  }
}
