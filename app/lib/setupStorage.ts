/**
 * Setup Wizard Persistence Utilities
 * Manages setup wizard completion state and initial app configuration
 */

const SETUP_COMPLETED_KEY = 'kelola_kosmu_setup_completed'
const SETUP_COMPLETED_DATE_KEY = 'kelola_kosmu_setup_date'

/**
 * Check if setup wizard has been completed
 */
export const isSetupCompleted = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const completed = localStorage.getItem(SETUP_COMPLETED_KEY)
    return completed === 'true'
  } catch (error) {
    console.error('[Setup Storage] Error checking setup completion:', error)
    return false
  }
}

/**
 * Mark setup wizard as completed
 */
export const setSetupCompleted = (): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETUP_COMPLETED_KEY, 'true')
    localStorage.setItem(SETUP_COMPLETED_DATE_KEY, new Date().toISOString())
  } catch (error) {
    console.error('[Setup Storage] Error marking setup completed:', error)
  }
}

/**
 * Reset setup completion (for testing or re-setup)
 */
export const resetSetupCompletion = (): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SETUP_COMPLETED_KEY)
    localStorage.removeItem(SETUP_COMPLETED_DATE_KEY)
  } catch (error) {
    console.error('[Setup Storage] Error resetting setup:', error)
  }
}

/**
 * Get setup completion date
 */
export const getSetupCompletionDate = (): Date | null => {
  if (typeof window === 'undefined') return null
  try {
    const dateStr = localStorage.getItem(SETUP_COMPLETED_DATE_KEY)
    return dateStr ? new Date(dateStr) : null
  } catch (error) {
    console.error('[Setup Storage] Error getting setup date:', error)
    return null
  }
}
