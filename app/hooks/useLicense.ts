/**
 * License State Management Hook
 * Manages license validation and state
 */

import { useState, useEffect } from 'react'
import { isLicenseActivated, getLicenseInfo } from '@/app/lib/licenseStorage'
import { generateDeviceFingerprint } from '@/app/lib/deviceFingerprint'
import { validateLicense } from '@/app/lib/licenseValidator'

export interface UseLicenseState {
  isActivated: boolean
  licenseKey: string
  deviceFingerprint: string
  isValidLicense: boolean
  isLoading: boolean
}

export const useLicense = (): UseLicenseState => {
  const [isActivated, setIsActivated] = useState(false)
  const [licenseKey, setLicenseKey] = useState('')
  const [deviceFingerprint, setDeviceFingerprint] = useState('')
  const [isValidLicense, setIsValidLicense] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check license status on mount
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    try {
      const licenseInfo = getLicenseInfo()
      const currentFingerprint = generateDeviceFingerprint()

      setIsActivated(licenseInfo.isActivated)
      setLicenseKey(licenseInfo.licenseKey)
      setDeviceFingerprint(currentFingerprint)

      // Validate license if activated
      if (licenseInfo.isActivated && licenseInfo.licenseKey) {
        const validation = validateLicense(
          licenseInfo.licenseKey,
          licenseInfo.deviceFingerprint,
          currentFingerprint,
        )
        setIsValidLicense(validation.isValid)
      }
    } catch (error) {
      console.error('[useLicense] Error checking license:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isActivated,
    licenseKey,
    deviceFingerprint,
    isValidLicense,
    isLoading,
  }
}
