/**
 * Domain Guard Component
 * Checks if application is running on allowed domain
 */

import { AlertCircle, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DomainGuardProps {
  children: React.ReactNode
}

export default function DomainGuard({ children }: DomainGuardProps) {
  // List of allowed domains
  const ALLOWED_DOMAINS = [
    'kelolakosmu.id',
    'www.kelolakosmu.id',
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
  ]

  // Get current domain
  const getCurrentDomain = (): string => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.hostname
  }

  // Check if current domain is allowed
  const isAllowedDomain = (): boolean => {
    if (typeof window === 'undefined') {
      return true // Allow on server-side
    }

    const currentDomain = getCurrentDomain()
    
    // Allow localhost for development
    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
      return true
    }

    // Check against allowed production domains
    return ALLOWED_DOMAINS.some(domain => {
      // Exact match
      if (currentDomain === domain) {
        return true
      }
      // Domain ends with allowed domain (e.g., subdomain.kelolakosmu.id)
      if (domain.includes('kelolakosmu.id') && currentDomain.endsWith('kelolakosmu.id')) {
        return true
      }
      return false
    })
  }

  // If domain is not allowed, show error
  if (typeof window !== 'undefined' && !isAllowedDomain()) {
    const currentDomain = getCurrentDomain()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-red-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-red-700">Domain Tidak Diizinkan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Aplikasi KELOLA KOSMU hanya dapat diakses melalui domain yang resmi.
            </p>

            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs font-mono text-red-700 break-all">
                Domain saat ini: <strong>{currentDomain}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">Domain yang diizinkan:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  kelolakosmu.id
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  www.kelolakosmu.id
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-700">
                Jika Anda adalah pengguna resmi, silakan akses aplikasi melalui link resmi yang telah diberikan.
              </p>
            </div>

            <Button
              onClick={() => {
                window.location.href = 'https://kelolakosmu.id'
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Domain Resmi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Domain is allowed, render children
  return <>{children}</>
}
