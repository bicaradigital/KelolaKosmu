'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/lib/adminAuth'

interface PasswordGuardProps {
  children: ReactNode
  redirectTo?: string
}

export function PasswordGuard({ children, redirectTo = '/admin' }: PasswordGuardProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push(redirectTo)
    }
  }, [router, redirectTo])

  if (!isAdminAuthenticated()) {
    return null
  }

  return <>{children}</>
}
