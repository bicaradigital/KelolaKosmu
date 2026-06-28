import { useState, useEffect } from 'react'

export function useLicense() {
  const [isActivated, setIsActivated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const activated = localStorage.getItem('kelola_kos_license_active') === 'true'
    setIsActivated(activated)
    setIsLoading(false)
  }, [])

  return { isActivated, isLoading }
}
