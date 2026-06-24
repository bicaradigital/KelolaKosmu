/**
 * License Activation Component
 * Allows users to activate license key
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { generateDeviceFingerprint } from '@/app/lib/deviceFingerprint'
import { saveLicenseActivation } from '@/app/lib/licenseStorage'
import { validateLicenseFormat, isTrialLicense } from '@/app/lib/licenseValidator'
import { verifyLicenseKeyExists } from '@/app/lib/licenseVerification'

interface LicenseActivationProps {
  onSuccess: () => void
  onCancel?: () => void
}

export default function LicenseActivation({ onSuccess, onCancel }: LicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleActivate = async () => {
    // Reset states
    setError(null)
    setSuccess(false)

    // Validate input
    if (!licenseKey.trim()) {
      setError('Kode lisensi harus diisi')
      return
    }

    // Validate format
    if (!validateLicenseFormat(licenseKey)) {
      setError('Format kode lisensi tidak valid. Gunakan format: KK-YYYY-AAAA-DDDD')
      return
    }

    setLoading(true)

    try {
      // Verify license key exists in database (critical security check)
      const licenseExists = await verifyLicenseKeyExists(licenseKey)
      
      if (!licenseExists) {
        setError('Kode lisensi tidak valid atau belum terdaftar. Hubungi admin untuk mendapatkan lisensi resmi.')
        setLoading(false)
        return
      }

      // Generate device fingerprint
      const deviceFingerprint = generateDeviceFingerprint()

      // Save activation
      saveLicenseActivation(licenseKey.toUpperCase(), deviceFingerprint)

      setSuccess(true)

      // Call onSuccess after a brief delay to show success message
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      setError('Terjadi kesalahan saat mengaktifkan lisensi')
      console.error('[License Activation] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
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
              placeholder="KELOLA-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="font-mono tracking-widest"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
            <p className="text-xs font-semibold text-blue-900">Format Lisensi:</p>
            <p className="text-xs text-blue-700 font-mono">
              KELOLA-XXXX-XXXX-XXXX
            </p>
            <p className="text-xs text-blue-700">
              Anda akan menerima kode lisensi ini setelah membeli atau mendaftar.
            </p>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Batal
              </Button>
            )}
            <Button
              onClick={handleActivate}
              disabled={loading || !licenseKey.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Mengaktifkan...
                </>
              ) : (
                'Aktivasi'
              )}
            </Button>
          </div>

          <div className="text-center border-t pt-4 space-y-2">
            <p className="text-xs text-gray-700 font-semibold">
              Belum memiliki lisensi?
            </p>
            <p className="text-xs text-gray-600">
              Hubungi admin untuk membeli lisensi KELOLA KOSMU. Anda akan menerima kode lisensi resmi dalam format:
            </p>
            <p className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 p-2 rounded">
              KK-YYYY-AAAA-DDDD
            </p>
            <p className="text-xs text-gray-500">
              Contoh: KK-2024-ABCD-1234
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
