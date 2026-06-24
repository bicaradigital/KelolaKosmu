/**
 * Device Fingerprint Generator
 * Creates a unique identifier for the device/browser combination
 */

/**
 * Generate a simple device fingerprint based on browser/device characteristics
 * This is a client-side identifier that helps detect installation on different devices
 */
export const generateDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') {
    return 'server-side'
  }

  try {
    const navigator_ = navigator
    const screen_ = window.screen

    // Collect device/browser characteristics
    const fingerprints = [
      navigator_.userAgent,
      navigator_.language,
      screen_.width + 'x' + screen_.height,
      screen_.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
    ]

    // Create a simple hash from collected data
    const combined = fingerprints.join('|')
    let hash = 0

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }

    return Math.abs(hash).toString(16)
  } catch (error) {
    console.error('[Device Fingerprint] Error generating fingerprint:', error)
    // Fallback to random identifier
    return 'fp-' + Math.random().toString(36).substring(2, 15)
  }
}

/**
 * Compare two device fingerprints
 * Returns true if they match (same device/browser)
 */
export const compareDeviceFingerprint = (fp1: string, fp2: string): boolean => {
  return fp1 === fp2
}

/**
 * Get or create device fingerprint
 * Creates a new one if not exists, otherwise returns stored one
 */
export const getOrCreateDeviceFingerprint = (getStored: () => string): string => {
  const stored = getStored()
  if (stored) {
    return stored
  }
  return generateDeviceFingerprint()
}
