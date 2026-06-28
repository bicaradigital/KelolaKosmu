'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle, Loader, MessageCircle } from 'lucide-react'

interface LicenseActivationProps {
  onSuccess: () => void
}

export default function LicenseActivation({ onSuccess }: LicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleActivate = async () => {
    setError(null)
    setSuccess(false)

    // Validate input
    if (!licenseKey.trim()) {
      setError('Kode lisensi harus diisi')
      return
    }

    setLoading(true)

    try {
      // Send to API
      const response = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      })

      const data = await response.json()

      if (data.valid) {
        // Save to localStorage
        localStorage.setItem('kelola_kos_license_active', 'true')
        setSuccess(true)

        // Call onSuccess after a brief delay
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        setError(data.message || 'Kode lisensi tidak valid')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memverifikasi lisensi')
      console.error('[LicenseActivation] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && licenseKey.trim()) {
      handleActivate()
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-green-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-green-700">Aktivasi Berhasil!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Lisensi Anda telah berhasil diaktifkan. Aplikasi siap digunakan.
            </p>
            <div className="text-center text-xs text-gray-600">
              Sedang memuat...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Aktivasi Lisensi</CardTitle>
          <CardDescription>
            Masukkan kode lisensi KELOLA KOSMU Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Kode Lisensi
            </label>
            <Input
              placeholder="KK-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="font-mono tracking-widest text-center"
            />
          </div>

          <Button
            onClick={handleActivate}
            disabled={loading || !licenseKey.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Mengaktifkan...
              </>
            ) : (
              'Aktifkan Sekarang'
            )}
          </Button>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-600 mb-3">
              Belum punya kode lisensi? Hubungi kami di WhatsApp:
            </p>
            <a
              href="https://wa.me/6282133467984"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi WhatsApp
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
