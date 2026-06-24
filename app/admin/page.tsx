'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, AlertTriangle } from 'lucide-react'
import { verifyAdminPassword, setAdminSession, generateAdminToken } from '@/app/lib/adminAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!password.trim()) {
      setError('Masukkan password admin')
      setLoading(false)
      return
    }

    if (verifyAdminPassword(password)) {
      const token = generateAdminToken()
      setAdminSession(token)
      router.push('/admin/dashboard')
    } else {
      setError('Password admin tidak valid')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2463] via-[#0a2463] to-[#247ba0] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#0a2463] text-white rounded-full p-3">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#0a2463]">Admin Panel</CardTitle>
          <CardDescription>Masukkan password untuk akses admin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password Admin
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="border-gray-200"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a2463] hover:bg-[#0a2463]/90 text-white font-medium"
            >
              {loading ? 'Memproses...' : 'Masuk ke Admin'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500 text-center">
              Hanya untuk administrator KELOLA KOSMU
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
