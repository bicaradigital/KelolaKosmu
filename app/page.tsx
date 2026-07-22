"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { isSetupCompleted } from "@/app/lib/setupStorage"
import LicenseActivation from "./components/LicenseActivation"
import { useLicense } from "@/app/hooks/useLicense"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  DollarSign,
  Settings,
  Plus,
  UserCheck,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Building2,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useData } from "./hooks/useData"
import { formatCurrency, formatDate } from "./lib/storage"
import Logo from "./components/Logo"
import RoomForm from "./components/forms/RoomForm"
import TenantForm from "./components/forms/TenantForm"
import PaymentForm from "./components/forms/PaymentForm"
import FinancialForm from "./components/forms/FinancialForm"
import FinancialReportExporter from "./components/FinancialReportExporter"
import ReminderManager from "./components/ReminderManager"
import SecuritySettings from "./components/SecuritySettings"
import NavigationTabs from "./components/NavigationTabs"
import SetupWizard from "./components/SetupWizard"
import BoardingHouseSettings from "./components/BoardingHouseSettings"
import DigitalReceiptGenerator from "./components/DigitalReceiptGenerator"
import ReceiptViewer from "./components/ReceiptViewer"

export default function KostManagement() {
  const {
    rooms,
    tenants,
    payments,
    financialRecords,
    financialCategories,
    boardingHouse,
    settings,
    reminderLogs,
    backups,
    isLoaded,
    addRoom,
    updateRoom,
    deleteRoom,
    addTenant,
    updateTenant,
    deleteTenant,
    addPayment,
    updatePayment,
    deletePayment,
    addFinancialRecord,
    updateFinancialRecord,
    deleteFinancialRecord,
    addReminderLog,
    getRoomWithTenant,
    getTenantWithRoom,
    getStats,
    updateSettings,
    updateBoardingHouse,
    createManualBackup,
    restoreFromBackup,
  } = useData()

  const { isActivated: licenseActivated, isLoading: licenseLoading } = useLicense()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showFinancialForm, setShowFinancialForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [editingTenant, setEditingTenant] = useState(null)
  const [editingPayment, setEditingPayment] = useState(null)
  const [editingFinancial, setEditingFinancial] = useState(null)
  const [showSetupWizard, setShowSetupWizard] = useState(!boardingHouse)
  const [showLicenseActivation, setShowLicenseActivation] = useState(!licenseActivated)
  const [showReceiptGenerator, setShowReceiptGenerator] = useState(false)
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null)

  // Check setup completion on mount
  useEffect(() => {
    if (!boardingHouse && isSetupCompleted()) {
      // Setup was completed before, don't show wizard
      setShowSetupWizard(false)
    } else if (!boardingHouse) {
      // No boarding house and setup not completed, show wizard
      setShowSetupWizard(true)
    }
  }, [boardingHouse])

  // Check license activation on mount
  useEffect(() => {
    if (!licenseLoading) {
      setShowLicenseActivation(!licenseActivated)
    }
  }, [licenseActivated, licenseLoading])

  const stats = getStats()

  if (!isLoaded || licenseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Logo size="md" showText={false} />
            </div>
          </div>
          <p className="mt-6 text-blue-600 font-medium">Memuat data...</p>
        </div>
      </div>
    )
  }

  // Show license activation screen if not licensed
  if (showLicenseActivation) {
    return (
      <LicenseActivation
        onSuccess={() => {
          setShowLicenseActivation(false)
        }}
      />
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "occupied":
        return <Badge className="bg-green-500 hover:bg-green-600">Terisi</Badge>
      case "available":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Tersedia</Badge>
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">Lunas</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Terlambat</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleRoomSubmit = (roomData) => {
    if (editingRoom) {
      updateRoom(editingRoom.id, roomData)
      setEditingRoom(null)
    } else {
      addRoom(roomData)
    }
    setShowRoomForm(false)
  }

  const handleTenantSubmit = (tenantData) => {
    if (editingTenant) {
      updateTenant(editingTenant.id, tenantData)
      setEditingTenant(null)
    } else {
      addTenant(tenantData)
    }
    setShowTenantForm(false)
  }

  const handlePaymentSubmit = (paymentData) => {
    if (editingPayment) {
      updatePayment(editingPayment.id, paymentData)
      setEditingPayment(null)
    } else {
      addPayment(paymentData)
    }
    setShowPaymentForm(false)
  }

  const handleFinancialSubmit = (financialData) => {
    if (editingFinancial) {
      updateFinancialRecord(editingFinancial.id, financialData)
      setEditingFinancial(null)
    } else {
      addFinancialRecord(financialData)
    }
    setShowFinancialForm(false)
  }

  const availableRooms = rooms.filter((room) => room.status === "available")
  const occupiedTenants = tenants.filter((tenant) => tenant.roomId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100 sticky top-0 z-40">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Logo size="lg" boardingHouse={boardingHouse} />
              <div className="hidden sm:block h-8 w-px bg-blue-200 flex-shrink-0"></div>
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Sistem Manajemen Kos Modern</p>
                <p className="text-xs text-blue-400">Dashboard & Analytics</p>
              </div>
            </div>
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Settings className="w-4 h-4" />
                    Pengaturan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogTitle className="sr-only">Pengaturan Sistem</DialogTitle>
                  <Tabs defaultValue="boarding-house" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="boarding-house">Kos Info</TabsTrigger>
                    <TabsTrigger value="security">Keamanan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="boarding-house">
                    <BoardingHouseSettings
                      boardingHouse={boardingHouse}
                      onUpdate={updateBoardingHouse}
                    />
                  </TabsContent>
                  <TabsContent value="security">
                    <SecuritySettings
                      settings={settings}
                      onSave={updateSettings}
                      onBackupCreate={createManualBackup}
                      onBackupRestore={restoreFromBackup}
                      backups={backups}
                    />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-4 sm:p-8 text-white shadow-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                  <div className="w-full lg:flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Selamat Datang! 👋</h1>
                    <p className="text-sm sm:text-lg text-blue-100">Kelola kost Anda dengan mudah dan efisien</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                        <span className="text-xs sm:text-base text-blue-100">{stats.occupiedRooms} Kamar Terisi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                        <span className="text-xs sm:text-base text-blue-100">
                          {stats.pendingPayments + stats.overduePayments} Pending
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-shrink-0">
                    <Logo size="lg" variant="white" showText={false} />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Total Kamar</CardTitle>
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-800">{stats.totalRooms}</div>
                    <p className="text-xs text-blue-600 mt-1">
                      {stats.occupiedRooms} terisi, {stats.availableRooms} kosong
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-green-700">Tingkat Hunian</CardTitle>
                    <div className="p-2 bg-green-600 rounded-lg">
                      <UserCheck className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-green-800">
                      {Math.round(stats.occupancyRate)}%
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.occupiedRooms} dari {stats.totalRooms} kamar
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700">
                      Pemasukan Bulan Ini
                    </CardTitle>
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-800">
                      {formatCurrency(stats.monthlyIncome)}
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">Total pemasukan</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-purple-700">
                      Keuntungan Bulan Ini
                    </CardTitle>
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <PieChart className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl sm:text-3xl font-bold ${stats.monthlyProfit >= 0 ? "text-emerald-800" : "text-red-600"}`}
                    >
                      {formatCurrency(stats.monthlyProfit)}
                    </div>
                    <p className="text-xs text-purple-600 mt-1">Pengeluaran: {formatCurrency(stats.monthlyExpenses)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-blue-800">Aksi Cepat</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Akses fitur utama dengan cepat</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    <Button
                      onClick={() => setShowRoomForm(true)}
                      className="h-16 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm py-2"
                    >
                      <Building2 className="w-5 sm:w-6 h-5 sm:h-6" />
                      <span>Tambah Kamar</span>
                    </Button>
                    <Button
                      onClick={() => setShowTenantForm(true)}
                      className="h-16 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm py-2"
                    >
                      <Users className="w-5 sm:w-6 h-5 sm:h-6" />
                      <span>Tambah Penghuni</span>
                    </Button>
                    <Button
                      onClick={() => setShowPaymentForm(true)}
                      className="h-16 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm py-2"
                    >
                      <DollarSign className="w-5 sm:w-6 h-5 sm:h-6" />
                      <span>Catat Pembayaran</span>
                    </Button>
                    <Button
                      onClick={() => setShowFinancialForm(true)}
                      className="h-16 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm py-2"
                    >
                      <Wallet className="w-5 sm:w-6 h-5 sm:h-6" />
                      <span>Tambah Transaksi</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg text-blue-800 flex items-center gap-2">
                      <Wallet className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">Transaksi Keuangan Terbaru</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">5 transaksi terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {financialRecords
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((record) => {
                          const category = financialCategories.find((cat) => cat.id === record.category)
                          return (
                            <div
                              key={record.id}
                              className="flex items-center justify-between p-2 sm:p-4 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div
                                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm flex-shrink-0`}
                                  style={{ backgroundColor: category?.color || "#6b7280" }}
                                ></div>
                                <div className="min-w-0">
                                  <p className="font-medium text-xs sm:text-sm text-gray-800 truncate">
                                    {record.description}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {category?.name} • {formatDate(record.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p
                                  className={`font-bold text-xs sm:text-sm ${record.type === "income" ? "text-emerald-600" : "text-red-500"}`}
                                >
                                  {record.type === "income" ? "+" : "-"}
                                  {formatCurrency(record.amount)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      {financialRecords.length === 0 && (
                        <div className="text-center py-6 sm:py-8">
                          <Wallet className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                          <p className="text-xs sm:text-sm text-gray-500">Belum ada transaksi keuangan</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg text-blue-800 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">Pembayaran Terbaru</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">5 pembayaran terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {payments
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((payment) => {
                          const tenant = tenants.find((t) => t.id === payment.tenantId)
                          return (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between p-2 sm:p-4 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="flex-shrink-0">{getPaymentStatusBadge(payment.status)}</div>
                                <div className="min-w-0">
                                  <p className="font-medium text-xs sm:text-sm text-gray-800 truncate">
                                    {tenant?.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">{formatDate(payment.date)}</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className="font-bold text-xs sm:text-sm text-emerald-600">
                                  {formatCurrency(payment.amount)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      {payments.length === 0 && (
                        <div className="text-center py-6 sm:py-8">
                          <DollarSign className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                          <p className="text-xs sm:text-sm text-gray-500">Belum ada pembayaran</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Rooms Tab */}
            <TabsContent value="rooms" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-blue-800">Manajemen Kamar</h2>
                  <p className="text-blue-600 mt-1">Kelola semua kamar di {settings.kosName}</p>
                </div>
                <Dialog open={showRoomForm} onOpenChange={setShowRoomForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Kamar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <RoomForm
                      room={editingRoom}
                      onSubmit={handleRoomSubmit}
                      onCancel={() => {
                        setShowRoomForm(false)
                        setEditingRoom(null)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => {
                  const { tenant } = getRoomWithTenant(room.id)
                  return (
                    <Card key={room.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-blue-800">Kamar {room.number}</CardTitle>
                          {getStatusBadge(room.status)}
                        </div>
                        <CardDescription className="text-lg font-semibold text-gray-700">
                          {room.type} - {formatCurrency(room.rent)}/bulan
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {tenant ? (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">
                                <strong>Penghuni:</strong> {tenant.name}
                              </p>
                              <p className="text-sm text-blue-600">
                                <strong>Telepon:</strong> {tenant.phone}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-500 text-center">Kamar kosong</p>
                            </div>
                          )}

                          {room.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {room.facilities.slice(0, 3).map((facility, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700">
                                  {facility}
                                </Badge>
                              ))}
                              {room.facilities.length > 3 && (
                                <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                  +{room.facilities.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRoom(room)
                              setShowRoomForm(true)
                            }}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Yakin ingin menghapus kamar ini?")) {
                                deleteRoom(room.id)
                              }
                            }}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {rooms.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <div className="bg-blue-50 rounded-2xl p-8 max-w-md mx-auto">
                      <Building2 className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">Belum ada kamar</h3>
                      <p className="text-blue-600 mb-6">Mulai dengan menambahkan kamar pertama Anda</p>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onClick={() => setShowRoomForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kamar Pertama
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tenants Tab */}
            <TabsContent value="tenants" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-blue-800">Data Penghuni</h2>
                  <p className="text-blue-600 mt-1">Kelola informasi semua penghuni kos</p>
                </div>
                <Dialog open={showTenantForm} onOpenChange={setShowTenantForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Penghuni
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <TenantForm
                      tenant={editingTenant}
                      availableRooms={
                        editingTenant
                          ? [...availableRooms, rooms.find((r) => r.id === editingTenant.roomId)].filter(Boolean)
                          : availableRooms
                      }
                      onSubmit={handleTenantSubmit}
                      onCancel={() => {
                        setShowTenantForm(false)
                        setEditingTenant(null)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map((tenant) => {
                  const { room } = getTenantWithRoom(tenant.id)
                  return (
                    <Card key={tenant.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-blue-800">
                          {tenant.name}
                          {room && <Badge className="bg-blue-500 hover:bg-blue-600">Kamar {room.number}</Badge>}
                        </CardTitle>
                        <CardDescription>Masuk: {formatDate(tenant.checkInDate)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{tenant.phone}</span>
                          </div>
                          {tenant.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">{tenant.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">KTP: {tenant.idNumber}</span>
                          </div>
                          {room && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">
                                <strong>Sewa:</strong> {formatCurrency(room.rent)}/bulan
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTenant(tenant)
                              setShowTenantForm(true)
                            }}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Yakin ingin menghapus penghuni ini?")) {
                                deleteTenant(tenant.id)
                              }
                            }}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {tenants.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <div className="bg-blue-50 rounded-2xl p-8 max-w-md mx-auto">
                      <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">Belum ada penghuni</h3>
                      <p className="text-blue-600 mb-6">Tambahkan penghuni pertama untuk memulai</p>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onClick={() => setShowTenantForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Penghuni Pertama
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-blue-800">Manajemen Pembayaran</h2>
                  <p className="text-blue-600 mt-1">Kelola pembayaran sewa dan tagihan</p>
                </div>
                <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Catat Pembayaran
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <PaymentForm
                      payment={editingPayment}
                      tenants={occupiedTenants}
                      rooms={rooms}
                      settings={settings}
                      onSubmit={handlePaymentSubmit}
                      onCancel={() => {
                        setShowPaymentForm(false)
                        setEditingPayment(null)
                      }}
                      onAddReminderLog={addReminderLog}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-800">Riwayat Pembayaran</CardTitle>
                  <CardDescription>Daftar semua pembayaran sewa kamar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((payment) => {
                        const { tenant, room } = getTenantWithRoom(payment.tenantId)
                        return (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-4 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{tenant?.name || "Unknown"}</h3>
                              <p className="text-sm text-gray-600">
                                Kamar {room?.number} - {payment.month} {payment.year}
                              </p>
                              <p className="text-xs text-gray-500">
                                Jatuh tempo: {formatDate(payment.dueDate)}
                                {payment.paidDate && ` | Dibayar: ${formatDate(payment.paidDate)}`}
                              </p>
                            </div>
                            <div className="text-right mr-4">
                              <p className="font-bold text-gray-800">{formatCurrency(payment.amount)}</p>
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                            <div className="flex gap-2">
                              {payment.status === "paid" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPaymentForReceipt(payment)
                                    setShowReceiptGenerator(true)
                                  }}
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                  title="Generate kwitansi digital untuk dibagikan ke penyewa"
                                >
                                  <span className="text-xs">Kwitansi</span>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPayment(payment)
                                  setShowPaymentForm(true)
                                }}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Yakin ingin menghapus pembayaran ini?")) {
                                    deletePayment(payment.id)
                                  }
                                }}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}

                    {payments.length === 0 && (
                      <div className="text-center py-16">
                        <div className="bg-blue-50 rounded-2xl p-8 max-w-md mx-auto">
                          <DollarSign className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-blue-800 mb-2">Belum ada pembayaran</h3>
                          <p className="text-blue-600 mb-6">Catat pembayaran pertama untuk memulai</p>
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            onClick={() => setShowPaymentForm(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Catat Pembayaran Pertama
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Digital Receipt Generator Modal */}
              <Dialog open={showReceiptGenerator} onOpenChange={setShowReceiptGenerator}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  {selectedPaymentForReceipt && (
                    <DigitalReceiptGenerator
                      payment={selectedPaymentForReceipt}
                      tenant={tenants.find((t) => t.id === selectedPaymentForReceipt.tenantId) || ({} as any)}
                      room={rooms.find((r) => r.id === selectedPaymentForReceipt.roomId) || ({} as any)}
                      settings={settings}
                      boardingHouse={boardingHouse ? {
                        name: boardingHouse.name,
                        address: boardingHouse.address,
                        phone: boardingHouse.phone,
                      } : undefined}
                      onReceiptGenerated={(receipt) => {
                        // Update payment with digital receipt
                        updatePayment(selectedPaymentForReceipt.id, {
                          ...selectedPaymentForReceipt,
                          digitalReceipt: receipt,
                        })
                        setShowReceiptGenerator(false)
                        setSelectedPaymentForReceipt(null)
                      }}
                      onClose={() => {
                        setShowReceiptGenerator(false)
                        setSelectedPaymentForReceipt(null)
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-blue-800">Manajemen Keuangan</h2>
                  <p className="text-blue-600 mt-1">Kelola pemasukan dan pengeluaran operasional</p>
                </div>
                <Dialog open={showFinancialForm} onOpenChange={setShowFinancialForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Transaksi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <FinancialForm
                      record={editingFinancial}
                      categories={financialCategories}
                      onSubmit={handleFinancialSubmit}
                      onCancel={() => {
                        setShowFinancialForm(false)
                        setEditingFinancial(null)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-700">Pemasukan Bulan Ini</CardTitle>
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-800">{formatCurrency(stats.monthlyIncome)}</div>
                    <p className="text-xs text-emerald-600 mt-1">
                      {
                        financialRecords.filter(
                          (r) => r.type === "income" && new Date(r.date).getMonth() === new Date().getMonth(),
                        ).length
                      }{" "}
                      transaksi
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-700">Pengeluaran Bulan Ini</CardTitle>
                    <div className="p-2 bg-red-600 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-800">{formatCurrency(stats.monthlyExpenses)}</div>
                    <p className="text-xs text-red-600 mt-1">
                      {
                        financialRecords.filter(
                          (r) => r.type === "expense" && new Date(r.date).getMonth() === new Date().getMonth(),
                        ).length
                      }{" "}
                      transaksi
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">Keuntungan Bersih</CardTitle>
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <PieChart className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-3xl font-bold ${stats.monthlyProfit >= 0 ? "text-emerald-800" : "text-red-600"}`}
                    >
                      {formatCurrency(stats.monthlyProfit)}
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      {stats.monthlyProfit >= 0 ? "Untung" : "Rugi"} bulan ini
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Export Laporan Keuangan */}
              {boardingHouse && (
                <FinancialReportExporter
                  records={financialRecords.map((record) => ({
                    id: record.id,
                    type: record.type as 'income' | 'expense',
                    category: financialCategories.find((cat) => cat.id === record.category)?.name || record.category,
                    description: record.description,
                    amount: record.amount,
                    date: record.date,
                    paymentMethod: record.paymentMethod,
                  }))}
                  kosName={boardingHouse.name || 'Laporan Keuangan'}
                />
              )}

              {/* Financial Records Table */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-800">Riwayat Transaksi Keuangan</CardTitle>
                  <CardDescription>Daftar semua transaksi pemasukan dan pengeluaran</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {financialRecords
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((record) => {
                        const category = financialCategories.find((cat) => cat.id === record.category)
                        return (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-4 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: category?.color || "#6b7280" }}
                              ></div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{record.description}</h3>
                                <p className="text-sm text-gray-600">
                                  {category?.name} {record.subcategory && `• ${record.subcategory}`} •{" "}
                                  {formatDate(record.date)}
                                </p>
                                {record.tags && record.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {record.tags.map((tag, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs border-blue-200 text-blue-700"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right mr-4">
                              <p
                                className={`font-bold text-lg ${record.type === "income" ? "text-emerald-600" : "text-red-500"}`}
                              >
                                {record.type === "income" ? "+" : "-"}
                                {formatCurrency(record.amount)}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {record.paymentMethod.replace("_", " ")}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingFinancial(record)
                                  setShowFinancialForm(true)
                                }}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Yakin ingin menghapus transaksi ini?")) {
                                    deleteFinancialRecord(record.id)
                                  }
                                }}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}

                    {financialRecords.length === 0 && (
                      <div className="text-center py-16">
                        <div className="bg-blue-50 rounded-2xl p-8 max-w-md mx-auto">
                          <Wallet className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-blue-800 mb-2">Belum ada transaksi</h3>
                          <p className="text-blue-600 mb-6">Tambahkan transaksi keuangan pertama</p>
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            onClick={() => setShowFinancialForm(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Transaksi Pertama
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-blue-800">WhatsApp Integration</h2>
                <p className="text-blue-600 mt-1">Kelola reminder dan notifikasi WhatsApp</p>
              </div>

              <ReminderManager
                payments={payments}
                tenants={tenants}
                rooms={rooms}
                settings={settings}
                reminderLogs={reminderLogs}
                onUpdatePayment={updatePayment}
                onAddReminderLog={addReminderLog}
              />
            </TabsContent>
          </Tabs>

          {/* Hidden Forms */}
          <Dialog open={showRoomForm} onOpenChange={setShowRoomForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <RoomForm
                room={editingRoom}
                onSubmit={handleRoomSubmit}
                onCancel={() => {
                  setShowRoomForm(false)
                  setEditingRoom(null)
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showTenantForm} onOpenChange={setShowTenantForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <TenantForm
                tenant={editingTenant}
                availableRooms={
                  editingTenant
                    ? [...availableRooms, rooms.find((r) => r.id === editingTenant.roomId)].filter(Boolean)
                    : availableRooms
                }
                onSubmit={handleTenantSubmit}
                onCancel={() => {
                  setShowTenantForm(false)
                  setEditingTenant(null)
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <PaymentForm
                payment={editingPayment}
                tenants={occupiedTenants}
                rooms={rooms}
                settings={settings}
                onSubmit={handlePaymentSubmit}
                onCancel={() => {
                  setShowPaymentForm(false)
                  setEditingPayment(null)
                }}
                onAddReminderLog={addReminderLog}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showFinancialForm} onOpenChange={setShowFinancialForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <FinancialForm
                record={editingFinancial}
                categories={financialCategories}
                onSubmit={handleFinancialSubmit}
                onCancel={() => {
                  setShowFinancialForm(false)
                  setEditingFinancial(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </main>

      {/* Setup Wizard */}
      <SetupWizard
        isOpen={showSetupWizard}
        onComplete={(newBoardingHouse) => {
          updateBoardingHouse(newBoardingHouse)
          setShowSetupWizard(false)
        }}
      />
    </div>
  )
}
