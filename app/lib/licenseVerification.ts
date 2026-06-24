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
 */
export async function verifyLicenseKeyExists(licenseKey: string): Promise<boolean> {
  try {
    if (USE_MOCK) {
      // Check in mock data
      const allLicenses = await getAllMockLicenses()
      return allLicenses.some(
        (lic) => lic.key.toUpperCase() === licenseKey.toUpperCase()
      )
    }

    // Check in Supabase database
    const { data, error } = await supabase!
      .from('licenses')
      .select('id')
      .eq('key', licenseKey.toUpperCase())
      .single()

    if (error) {
      console.error('[License Verification] Supabase error:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('[License Verification] Error verifying license:', error)
    return false
  }
}

/**
 * Verify license and get its details
 */
export async function verifyLicenseKey(licenseKey: string) {
  try {
    if (USE_MOCK) {
      return await getLicenseByKey(licenseKey)
    }

    const { data, error } = await supabase!
      .from('licenses')
      .select('*')
      .eq('key', licenseKey.toUpperCase())
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error('[License Verification] Error:', error)
    return null
  }
}
