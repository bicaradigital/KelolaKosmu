/**
 * License Management Storage
 * Manages license activation and validation state
 */

const LICENSE_KEY_STORAGE = 'kelola_kosmu_license_key'
const LICENSE_ACTIVATED_STORAGE = 'kelola_kosmu_license_activated'
const LICENSE_ACTIVATION_DATE_STORAGE = 'kelola_kosmu_license_activation_date'
const DEVICE_FINGERPRINT_STORAGE = 'kelola_kosmu_device_fingerprint'

export interface LicenseInfo {
  licenseKey: string
  isActivated: boolean
  activationDate: string | null
  deviceFingerprint: string | null
  expiryDate: string | null
}

/**
 * Get current license information
 */
export const getLicenseInfo = (): LicenseInfo => {
  if (typeof window === 'undefined') {
    return {
      licenseKey: '',
      isActivated: false,
      activationDate: null,
      deviceFingerprint: null,
      expiryDate: null,
    }
  }

  try {
    return {
      licenseKey: localStorage.getItem(LICENSE_KEY_STORAGE) || '',
      isActivated: localStorage.getItem(LICENSE_ACTIVATED_STORAGE) === 'true',
      activationDate: localStorage.getItem(LICENSE_ACTIVATION_DATE_STORAGE),
      deviceFingerprint: localStorage.getItem(DEVICE_FINGERPRINT_STORAGE),
      expiryDate: null,
    }
  } catch (error) {
    console.error('[License Storage] Error getting license info:', error)
    return {
      licenseKey: '',
      isActivated: false,
      activationDate: null,
      deviceFingerprint: null,
      expiryDate: null,
    }
  }
}

/**
 * Save license activation
 */
export const saveLicenseActivation = (
  licenseKey: string,
  deviceFingerprint: string,
): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(LICENSE_KEY_STORAGE, licenseKey)
    localStorage.setItem(LICENSE_ACTIVATED_STORAGE, 'true')
    localStorage.setItem(LICENSE_ACTIVATION_DATE_STORAGE, new Date().toISOString())
    localStorage.setItem(DEVICE_FINGERPRINT_STORAGE, deviceFingerprint)
  } catch (error) {
    console.error('[License Storage] Error saving license activation:', error)
  }
}

/**
 * Clear license information
 */
export const clearLicense = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(LICENSE_KEY_STORAGE)
    localStorage.removeItem(LICENSE_ACTIVATED_STORAGE)
    localStorage.removeItem(LICENSE_ACTIVATION_DATE_STORAGE)
    localStorage.removeItem(DEVICE_FINGERPRINT_STORAGE)
  } catch (error) {
    console.error('[License Storage] Error clearing license:', error)
  }
}

/**
 * Check if license is activated
 */
export const isLicenseActivated = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(LICENSE_ACTIVATED_STORAGE) === 'true'
  } catch {
    return false
  }
}

/**
 * Get stored license key
 */
export const getStoredLicenseKey = (): string => {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(LICENSE_KEY_STORAGE) || ''
  } catch {
    return ''
  }
}

/**
 * Get stored device fingerprint
 */
export const getStoredDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(DEVICE_FINGERPRINT_STORAGE) || ''
  } catch {
    return ''
  }
}
