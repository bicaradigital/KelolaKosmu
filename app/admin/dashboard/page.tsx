'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LogOut,
  Plus,
  Search,
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Key,
  Users,
  CheckCheck,
  Eye,
} from 'lucide-react'
import { isAdminAuthenticated, clearAdminSession } from '@/app/lib/adminAuth'
import { createLicense, getLicenses, searchLicenses, updateLicenseStatus, getLicenseCount, getActiveLicenseCount, License } from '@/app/lib/licenseGenerator'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [licenses, setLicenses] = useState<License[]>([])
  const [totalLicenses, setTotalLicenses] = useState(0)
  const [activeLicenses, setActiveLicenses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form states
  const [buyerName, setBuyerName] = useState('')
  const [notes, setNotes] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [creatingLicense, setCreatingLicense] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    loadDashboard()
  }, [router])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [licensesData, totalCount, activeCount] = await Promise.all([
        getLicenses(100),
        getLicenseCount(),
        getActiveLicenseCount(),
      ])
      setLicenses(licensesData)
      setTotalLicenses(totalCount)
      setActiveLicenses(activeCount)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      loadDashboard()
      return
    }

    try {
      setSearching(true)
      const results = await searchLicenses(query)
      setLicenses(results)
    } catch (error) {
      console.error('Error searching licenses:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleCreateLicense = async () => {
    if (!buyerName.trim()) {
      setCreateError('Nama pembeli harus diisi')
      return
    }

    try {
      setCreatingLicense(true)
      setCreateError('')

      for (let i = 0; i < quantity; i++) {
        await createLicense({
          buyer_name: buyerName,
          notes: notes || undefined,
        })
      }

      setBuyerName('')
      setNotes('')
      setQuantity(1)
      setShowCreateDialog(false)
      loadDashboard()
    } catch (error) {
      setCreateError('Gagal membuat lisensi')
      console.error('Error creating license:', error)
    } finally {
      setCreatingLicense(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedLicense) return

    try {
      const success = await updateLicenseStatus(selectedLicense.id, newStatus)
      if (success) {
        setShowStatusDialog(false)
        loadDashboard()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const handleLogout = () => {
    clearAdminSession()
    router.push('/admin')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a2463] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0a2463] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Key className="w-8 h-8" />
            <h1 className="text-3xl font-bold">KELOLA KOSMU - Admin</h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-[#0a2463]/80"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Lisensi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-[#0a2463]">{totalLicenses}</div>
                <Key className="w-5 h-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Lisensi Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-green-600">{activeLicenses}</div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Lisensi Nonaktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-red-600">{totalLicenses - activeLicenses}</div>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Utilitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#0a2463]">
                {totalLicenses > 0 ? Math.round((activeLicenses / totalLicenses) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create & Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="md:col-span-1 bg-[#0a2463] hover:bg-[#0a2463]/90 text-white h-auto py-6 flex flex-col items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-semibold">Buat Lisensi</span>
          </Button>

          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari kode lisensi atau nama pembeli..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={searching}
              className="pl-10"
            />
          </div>
        </div>

        {/* Licenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Lisensi</CardTitle>
            <CardDescription>{licenses.length} lisensi ditemukan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#0a2463]" />
              </div>
            ) : licenses.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Belum ada lisensi yang dibuat
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Lisensi</TableHead>
                      <TableHead>Pembeli</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Kadaluarsa</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell className="font-mono font-semibold text-[#0a2463]">
                          <div className="flex items-center gap-2">
                            {license.key}
                            <button
                              onClick={() => copyToClipboard(license.key, license.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy
                                className={`w-4 h-4 ${
                                  copiedId === license.id ? 'text-green-600' : 'text-gray-400'
                                }`}
                              />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>{license.buyer_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={license.status === 'active' ? 'default' : 'secondary'}
                            className={
                              license.status === 'active'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-400'
                            }
                          >
                            {license.status === 'active' ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aktif
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Nonaktif
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(license.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {license.expires_at ? new Date(license.expires_at).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedLicense(license)
                              setNewStatus(license.status === 'active' ? 'inactive' : 'active')
                              setShowStatusDialog(true)
                            }}
                            className="text-[#0a2463] hover:text-[#0a2463]/70 font-medium text-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create License Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Lisensi Baru</DialogTitle>
            <DialogDescription>Isi form untuk membuat satu atau lebih lisensi</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {createError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{createError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Pembeli</label>
              <Input
                placeholder="Nama pembeli lisensi"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                disabled={creatingLicense}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan (Opsional)</label>
              <Textarea
                placeholder="Catatan tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={creatingLicense}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jumlah Lisensi</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={creatingLicense}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creatingLicense}
              >
                Batal
              </Button>
              <Button
                onClick={handleCreateLicense}
                disabled={creatingLicense}
                className="bg-[#0a2463] hover:bg-[#0a2463]/90"
              >
                {creatingLicense ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Lisensi
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ubah Status Lisensi</DialogTitle>
            <DialogDescription>
              Ubah status untuk lisensi: <span className="font-mono font-semibold">{selectedLicense?.key}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Status saat ini:</p>
              <Badge
                className={
                  selectedLicense?.status === 'active'
                    ? 'bg-green-600'
                    : 'bg-gray-400'
                }
              >
                {selectedLicense?.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </Badge>
              <p className="text-sm text-gray-600 mt-4 mb-2">Status baru:</p>
              <Badge
                className={
                  newStatus === 'active'
                    ? 'bg-green-600'
                    : 'bg-gray-400'
                }
              >
                {newStatus === 'active' ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleStatusChange}
                className="bg-[#0a2463] hover:bg-[#0a2463]/90"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Konfirmasi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
