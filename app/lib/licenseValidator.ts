/**
 * License Validation Utilities
 * Validates license keys and manages license state
 */

export interface LicenseValidationResult {
  isValid: boolean
  error?: string
  reason?: 'invalid_format' | 'expired' | 'device_mismatch' | 'unknown'
}

/**
 * Validate license key format
 * License key format: KELOLA-XXXX-XXXX-XXXX (example format)
 */
export const validateLicenseFormat = (licenseKey: string): boolean => {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return false
  }

  // Simple format validation - customize based on your license key format
  // Currently accepts: KELOLA-XXXX-XXXX-XXXX or any key with length 20-50
  const formatRegex = /^[A-Z0-9\-]{20,50}$/
  return formatRegex.test(licenseKey.toUpperCase())
}

/**
 * Create a trial period license key
 * Used for initial setup without license
 */
export const createTrialLicense = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 12).toUpperCase()
  return `TRIAL-${timestamp}-${random}`
}

/**
 * Check if license is a trial license
 */
export const isTrialLicense = (licenseKey: string): boolean => {
  return licenseKey.startsWith('TRIAL-')
}

/**
 * Validate device fingerprint match
 */
export const validateDeviceFingerprint = (
  storedFingerprint: string,
  currentFingerprint: string
): LicenseValidationResult => {
  if (!storedFingerprint || !currentFingerprint) {
    return {
      isValid: false,
      error: 'Device fingerprint missing',
      reason: 'device_mismatch',
    }
  }

  if (storedFingerprint !== currentFingerprint) {
    return {
      isValid: false,
      error: 'License is registered to a different device',
      reason: 'device_mismatch',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate complete license
 * Combines format, device, and expiry checks
 */
export const validateLicense = (
  licenseKey: string,
  storedDeviceFingerprint: string | null,
  currentDeviceFingerprint: string
): LicenseValidationResult => {
  // Check format
  if (!validateLicenseFormat(licenseKey)) {
    return {
      isValid: false,
      error: 'Invalid license key format',
      reason: 'invalid_format',
    }
  }

  // Skip device validation for trial licenses
  if (!isTrialLicense(licenseKey)) {
    if (!storedDeviceFingerprint) {
      return {
        isValid: false,
        error: 'License information incomplete',
        reason: 'device_mismatch',
      }
    }

    // Validate device match
    const deviceCheck = validateDeviceFingerprint(
      storedDeviceFingerprint,
      currentDeviceFingerprint
    )
    if (!deviceCheck.isValid) {
      return deviceCheck
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Generate a valid license key (for testing/admin)
 * In production, this should come from your license server
 */
export const generateLicenseKey = (): string => {
  const segments = []
  for (let i = 0; i < 4; i++) {
    const segment = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()
      .padEnd(4, '0')
    segments.push(segment)
  }
  return `KELOLA-${segments.join('-')}`
}
