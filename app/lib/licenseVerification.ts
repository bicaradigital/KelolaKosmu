/**
 * License Verification Utility
 * Verifies that a license key exists in the database/mock store
 * This prevents users from entering arbitrary license keys
 */

import { supabase } from './supabase'
import {
  getLicenseByKey,
  getAllMockLicenses,
} from './mockLicenses'

const USE_MOCK = !supabase

/**
 * Verify that a license key exists in the system
 * This ensures only officially generated keys are accepted
 * Checks both Supabase and mock data for maximum compatibility
 */
export async function verifyLicenseKeyExists(licenseKey: string): Promise<boolean> {
  try {
    console.log('[License Verification] Checking license key:', licenseKey)
    console.log('[License Verification] USE_MOCK:', USE_MOCK)
    
    // First try Supabase if configured
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('licenses')
          .select('id, status')
          .eq('key', licenseKey.toUpperCase())
          .maybeSingle()

        if (!error && data) {
          console.log('[License Verification] Found in Supabase:', data)
          // Check if license is active
          if (data.status === 'active') {
            return true
          } else {
            console.warn('[License Verification] License found but inactive:', data.status)
            return false
          }
        }

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is expected
          console.error('[License Verification] Supabase query error:', error)
        }
      } catch (supabaseError) {
        console.warn('[License Verification] Supabase check failed, falling back to mock:', supabaseError)
      }
    }

    // Fallback to mock data
    console.log('[License Verification] Checking mock data...')
    const allLicenses = await getAllMockLicenses()
    console.log('[License Verification] Mock licenses count:', allLicenses.length)
    
    const found = allLicenses.some(
      (lic) => lic.key.toUpperCase() === licenseKey.toUpperCase() && lic.status === 'active'
    )
    
    if (found) {
      console.log('[License Verification] Found in mock data')
      return true
    }

    console.warn('[License Verification] License key not found in any data source')
    return false
  } catch (error) {
    console.error('[License Verification] Unexpected error:', error)
    return false
  }
}

/**
 * Verify license and get its full details
 * Returns license object if valid and active, null otherwise
 */
export async function verifyLicenseKey(licenseKey: string) {
  try {
    console.log('[License Verification] Getting license details:', licenseKey)

    // First try Supabase if configured
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('key', licenseKey.toUpperCase())
          .maybeSingle()

        if (!error && data) {
          console.log('[License Verification] License details from Supabase:', data)
          // Only return if active
          if (data.status === 'active') {
            return data
          } else {
            console.warn('[License Verification] License inactive')
            return null
          }
        }

        if (error && error.code !== 'PGRST116') {
          console.error('[License Verification] Supabase error:', error)
        }
      } catch (supabaseError) {
        console.warn('[License Verification] Supabase lookup failed, trying mock:', supabaseError)
      }
    }

    // Fallback to mock data
    const mockLicense = await getLicenseByKey(licenseKey)
    if (mockLicense && mockLicense.status === 'active') {
      console.log('[License Verification] License details from mock')
      return mockLicense
    }

    console.warn('[License Verification] License not found or inactive')
    return null
  } catch (error) {
    console.error('[License Verification] Unexpected error getting license:', error)
    return null
  }
}
