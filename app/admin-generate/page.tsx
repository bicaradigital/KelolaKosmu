'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'

const ADMIN_PASSWORD = 'kelola_kos_admin_gen'

interface GeneratedKey {
  key: string
  buyerName: string
  timestamp: number
}

export default function AdminGeneratePage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [generatedKeys, setGeneratedKeys] = useState<GeneratedKey[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [copiedMessage, setCopiedMessage] = useState(false)

  // Check sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('admin_auth') === 'true'
      if (isAuth) {
        setAuthenticated(true)
      }
    }
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
      setPassword('')
    } else {
      alert('Password salah!')
      setPassword('')
    }
  }

  const generateKey = () => {
    const year = new Date().getFullYear()
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let charPart = ''
    for (let i = 0; i < 4; i++) {
      charPart += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const digitPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    const key = `KK-${year}-${charPart}-${digitPart}`
    setCurrentKey(key)
    setGeneratedKeys([
      ...generatedKeys,
      {
        key,
        buyerName,
        timestamp: Date.now(),
      },
    ])
  }

  const copyKey = () => {
    if (currentKey) {
      navigator.clipboard.writeText(currentKey)
      setCopiedKey(currentKey)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  const copyWhatsAppMessage = () => {
    if (currentKey) {
      const message = `Halo ${buyerName || 'Pembeli'}, berikut kode lisensi Kelola Kos kamu:

🔑 ${currentKey}

Cara aktivasi:
1. Buka kelolakosmu.id
2. Masukkan kode di atas
3. Klik Aktifkan Sekarang

Terima kasih sudah membeli! 🙏`
      navigator.clipboard.writeText(message)
      setCopiedMessage(true)
      setTimeout(() => setCopiedMessage(false), 2000)
    }
  }

  const logout = () => {
    setAuthenticated(false)
    sessionStorage.removeItem('admin_auth')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white text-center">
                Admin Generator
              </h1>
              <p className="text-slate-400 text-center mt-2">
                License Key Generator - Kelola Kos
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login
              </Button>
            </form>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Generator License Key
            </h1>
            <p className="text-slate-400 mt-1">Kelola Kos - Admin Panel</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            Logout
          </Button>
        </div>

        {/* Generator Card */}
        <Card className="mb-8 p-8 bg-slate-800 border-slate-700">
          <div className="space-y-6">
            {/* Buyer Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Nama Pembeli
              </label>
              <Input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Masukkan nama pembeli (untuk catatan WhatsApp)"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Catatan: Nama ini hanya untuk ditampilkan di pesan WhatsApp
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateKey}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-base"
            >
              Generate Key Baru
            </Button>

            {/* Result Display */}
            {currentKey && (
              <div className="space-y-4 pt-6 border-t border-slate-700">
                <div>
                  <p className="text-sm text-slate-300 mb-3">License Key:</p>
                  <div className="bg-slate-900 border border-slate-600 rounded-lg p-6 font-mono text-2xl font-bold text-green-400 text-center break-all">
                    {currentKey}
                  </div>
                </div>

                {/* Copy Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={copyKey}
                    className={`flex items-center justify-center gap-2 ${
                      copiedKey === currentKey
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-slate-700 hover:bg-slate-600'
                    } text-white`}
                  >
                    {copiedKey === currentKey ? (
                      <>
                        <Check className="w-4 h-4" />
                        Disalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Key
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={copyWhatsAppMessage}
                    className={`flex items-center justify-center gap-2 ${
                      copiedMessage
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-4 h-4" />
                        Pesan Disalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Pesan WhatsApp
                      </>
                    )}
                  </Button>
                </div>

                {/* Note */}
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong>Catatan:</strong> Setelah generate, copy key ini
                    dan tambahkan manual ke array{' '}
                    <code className="bg-slate-900 px-2 py-1 rounded text-blue-200">
                      VALID_LICENSES
                    </code>{' '}
                    di file{' '}
                    <code className="bg-slate-900 px-2 py-1 rounded text-blue-200">
                      app/api/verify-license/route.ts
                    </code>
                    , lalu commit ke GitHub.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* History */}
        {generatedKeys.length > 0 && (
          <Card className="p-8 bg-slate-800 border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Riwayat Generate ({generatedKeys.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {generatedKeys.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-slate-700/50 p-3 rounded border border-slate-600"
                >
                  <div>
                    <p className="font-mono text-green-400 font-semibold">
                      {item.key}
                    </p>
                    <p className="text-sm text-slate-400">
                      {item.buyerName || 'Tanpa nama'}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(item.key)
                      setCopiedKey(item.key)
                      setTimeout(() => setCopiedKey(null), 2000)
                    }}
                    size="sm"
                    className={`${
                      copiedKey === item.key
                        ? 'bg-green-600'
                        : 'bg-slate-600 hover:bg-slate-500'
                    } text-white`}
                  >
                    {copiedKey === item.key ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
