"use client"

import { useState, useEffect } from "react"
import {
  type Room,
  type Tenant,
  type Payment,
  type Settings,
  type ReminderLog,
  type FinancialRecord,
  type FinancialCategory,
  type Budget,
  type BackupData,
  type BoardingHouse,
  loadRooms,
  saveRooms,
  loadTenants,
  saveTenants,
  loadPayments,
  savePayments,
  loadFinancialRecords,
  saveFinancialRecords,
  loadFinancialCategories,
  saveFinancialCategories,
  loadBudgets,
  saveBudgets,
  loadReminderLogs,
  saveReminderLogs,
  loadBackups,
  saveBackups,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  generateId,
  isOverdue,
  createBackup,
  loadBoardingHouse,
  saveBoardingHouse,
} from "@/app/lib/storage"

export const useData = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([])
  const [financialCategories, setFinancialCategories] = useState<FinancialCategory[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [boardingHouse, setBoardingHouse] = useState<BoardingHouse | null>(null)
  const [settings, setSettings] = useState<Settings>({
    kosName: "",
    address: "",
    phone: "",
    email: "",
    defaultRentDueDay: 10,
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([])
  const [backups, setBackups] = useState<BackupData[]>([])

  // Load data on mount
  useEffect(() => {
    const loadedRooms = loadRooms()
    const loadedTenants = loadTenants()
    const loadedPayments = loadPayments()
    const loadedFinancialRecords = loadFinancialRecords()
    const loadedFinancialCategories = loadFinancialCategories()
    const loadedBudgets = loadBudgets()
    const loadedSettings = loadSettingsFromStorage()
    const loadedReminderLogs = loadReminderLogs()
    const loadedBackups = loadBackups()
    const loadedBoardingHouse = loadBoardingHouse()

    setRooms(loadedRooms)
    setTenants(loadedTenants)
    setPayments(loadedPayments)
    setFinancialRecords(loadedFinancialRecords)
    setFinancialCategories(loadedFinancialCategories)
    setBudgets(loadedBudgets)
    setSettings(loadedSettings)
    setReminderLogs(loadedReminderLogs)
    setBackups(loadedBackups)
    setBoardingHouse(loadedBoardingHouse)
    setIsLoaded(true)

    // Update overdue payments
    const updatedPayments = loadedPayments.map((payment) => {
      if (payment.status === "pending" && isOverdue(payment.dueDate)) {
        return { ...payment, status: "overdue" as const }
      }
      return payment
    })

    if (JSON.stringify(updatedPayments) !== JSON.stringify(loadedPayments)) {
      setPayments(updatedPayments)
      savePayments(updatedPayments)
    }

    // Auto-create financial records from payments
    const existingPaymentRecords = loadedFinancialRecords.filter((record) =>
      record.description.includes("Pembayaran sewa"),
    )

    const newPaymentRecords: FinancialRecord[] = []
    loadedPayments
      .filter((payment) => payment.status === "paid")
      .forEach((payment) => {
        const exists = existingPaymentRecords.some((record) =>
          record.description.includes(`${payment.month} ${payment.year}`),
        )

        if (!exists) {
          const tenant = loadedTenants.find((t) => t.id === payment.tenantId)
          const room = loadedRooms.find((r) => r.id === payment.roomId)

          if (tenant && room) {
            newPaymentRecords.push({
              id: generateId(),
              type: "income",
              category: "income_rent",
              subcategory: "Sewa Bulanan",
              amount: payment.amount,
              description: `Pembayaran sewa ${tenant.name} - Kamar ${room.number} (${payment.month} ${payment.year})`,
              date: payment.paidDate || payment.dueDate,
              paymentMethod: "cash",
              tags: ["sewa", "otomatis"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }
        }
      })

    if (newPaymentRecords.length > 0) {
      const updatedFinancialRecords = [...loadedFinancialRecords, ...newPaymentRecords]
      setFinancialRecords(updatedFinancialRecords)
      saveFinancialRecords(updatedFinancialRecords)
    }
  }, [])

  // Room functions
  const addRoom = (roomData: Omit<Room, "id" | "createdAt">) => {
    const newRoom: Room = {
      ...roomData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    const updatedRooms = [...rooms, newRoom]
    setRooms(updatedRooms)
    saveRooms(updatedRooms)
    return newRoom
  }

  const updateRoom = (id: string, roomData: Partial<Room>) => {
    const updatedRooms = rooms.map((room) => (room.id === id ? { ...room, ...roomData } : room))
    setRooms(updatedRooms)
    saveRooms(updatedRooms)
  }

  const deleteRoom = (id: string) => {
    const updatedRooms = rooms.filter((room) => room.id !== id)
    setRooms(updatedRooms)
    saveRooms(updatedRooms)
  }

  // Tenant functions
  const addTenant = (tenantData: Omit<Tenant, "id" | "createdAt">) => {
    const newTenant: Tenant = {
      ...tenantData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    const updatedTenants = [...tenants, newTenant]
    setTenants(updatedTenants)
    saveTenants(updatedTenants)

    // Update room status if roomId is provided
    if (newTenant.roomId) {
      updateRoom(newTenant.roomId, {
        status: "occupied",
        tenantId: newTenant.id,
      })
    }

    return newTenant
  }

  const updateTenant = (id: string, tenantData: Partial<Tenant>) => {
    const updatedTenants = tenants.map((tenant) => (tenant.id === id ? { ...tenant, ...tenantData } : tenant))
    setTenants(updatedTenants)
    saveTenants(updatedTenants)
  }

  const deleteTenant = (id: string) => {
    const tenant = tenants.find((t) => t.id === id)
    const updatedTenants = tenants.filter((tenant) => tenant.id !== id)
    setTenants(updatedTenants)
    saveTenants(updatedTenants)

    // Update room status
    if (tenant?.roomId) {
      updateRoom(tenant.roomId, {
        status: "available",
        tenantId: undefined,
      })
    }
  }

  // Payment functions
  const addPayment = (paymentData: Omit<Payment, "id" | "createdAt">) => {
    const newPayment: Payment = {
      ...paymentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    const updatedPayments = [...payments, newPayment]
    setPayments(updatedPayments)
    savePayments(updatedPayments)

    // Auto-create financial record if payment is paid
    if (newPayment.status === "paid" && newPayment.paidDate) {
      const tenant = tenants.find((t) => t.id === newPayment.tenantId)
      const room = rooms.find((r) => r.id === newPayment.roomId)

      if (tenant && room) {
        const financialRecord: FinancialRecord = {
          id: generateId(),
          type: "income",
          category: "income_rent",
          subcategory: "Sewa Bulanan",
          amount: newPayment.amount,
          description: `Pembayaran sewa ${tenant.name} - Kamar ${room.number} (${newPayment.month} ${newPayment.year})`,
          date: newPayment.paidDate,
          paymentMethod: "cash",
          tags: ["sewa", "otomatis"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const updatedFinancialRecords = [...financialRecords, financialRecord]
        setFinancialRecords(updatedFinancialRecords)
        saveFinancialRecords(updatedFinancialRecords)
      }
    }

    return newPayment
  }

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    const updatedPayments = payments.map((payment) => (payment.id === id ? { ...payment, ...paymentData } : payment))
    setPayments(updatedPayments)
    savePayments(updatedPayments)
  }

  const deletePayment = (id: string) => {
    const updatedPayments = payments.filter((payment) => payment.id !== id)
    setPayments(updatedPayments)
    savePayments(updatedPayments)
  }

  // Financial record functions
  const addFinancialRecord = (recordData: Omit<FinancialRecord, "id" | "createdAt" | "updatedAt">) => {
    const newRecord: FinancialRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updatedRecords = [...financialRecords, newRecord]
    setFinancialRecords(updatedRecords)
    saveFinancialRecords(updatedRecords)
    return newRecord
  }

  const updateFinancialRecord = (id: string, recordData: Partial<FinancialRecord>) => {
    const updatedRecords = financialRecords.map((record) =>
      record.id === id ? { ...record, ...recordData, updatedAt: new Date().toISOString() } : record,
    )
    setFinancialRecords(updatedRecords)
    saveFinancialRecords(updatedRecords)
  }

  const deleteFinancialRecord = (id: string) => {
    const updatedRecords = financialRecords.filter((record) => record.id !== id)
    setFinancialRecords(updatedRecords)
    saveFinancialRecords(updatedRecords)
  }

  // Settings functions
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    saveSettingsToStorage(newSettings)
  }

  // Backup functions
  const createManualBackup = () => {
    const backup = createBackup(rooms, tenants, payments, financialRecords, financialCategories, budgets, settings)
    const updatedBackups = [...backups, backup]
    setBackups(updatedBackups)
    saveBackups(updatedBackups)
    return backup
  }

  const restoreFromBackup = (backup: BackupData) => {
    setRooms(backup.data.rooms)
    setTenants(backup.data.tenants)
    setPayments(backup.data.payments)
    setFinancialRecords(backup.data.financialRecords)
    setFinancialCategories(backup.data.categories)
    setBudgets(backup.data.budgets)
    setSettings(backup.data.settings)

    saveRooms(backup.data.rooms)
    saveTenants(backup.data.tenants)
    savePayments(backup.data.payments)
    saveFinancialRecords(backup.data.financialRecords)
    saveFinancialCategories(backup.data.categories)
    saveBudgets(backup.data.budgets)
    saveSettingsToStorage(backup.data.settings)
  }

  // Helper functions
  const getRoomWithTenant = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    const tenant = room?.tenantId ? tenants.find((t) => t.id === room.tenantId) : null
    return { room, tenant }
  }

  const getTenantWithRoom = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId)
    const room = tenant?.roomId ? rooms.find((r) => r.id === tenant.roomId) : null
    return { tenant, room }
  }

  const getPaymentsForTenant = (tenantId: string) => {
    return payments.filter((p) => p.tenantId === tenantId)
  }

  const getPaymentsForRoom = (roomId: string) => {
    return payments.filter((p) => p.roomId === roomId)
  }

  // Statistics
  const getStats = () => {
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter((r) => r.status === "occupied").length
    const availableRooms = rooms.filter((r) => r.status === "available").length
    const maintenanceRooms = rooms.filter((r) => r.status === "maintenance").length

    const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)

    const pendingPayments = payments.filter((p) => p.status === "pending").length
    const overduePayments = payments.filter((p) => p.status === "overdue").length

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    // Financial stats
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyIncome = financialRecords
      .filter(
        (record) =>
          record.type === "income" &&
          new Date(record.date).getMonth() === currentMonth &&
          new Date(record.date).getFullYear() === currentYear,
      )
      .reduce((sum, record) => sum + record.amount, 0)

    const monthlyExpenses = financialRecords
      .filter(
        (record) =>
          record.type === "expense" &&
          new Date(record.date).getMonth() === currentMonth &&
          new Date(record.date).getFullYear() === currentYear,
      )
      .reduce((sum, record) => sum + record.amount, 0)

    const monthlyProfit = monthlyIncome - monthlyExpenses

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      totalRevenue,
      pendingPayments,
      overduePayments,
      occupancyRate,
      monthlyIncome,
      monthlyExpenses,
      monthlyProfit,
    }
  }

  // Boarding House functions
  const updateBoardingHouse = (newBoardingHouse: BoardingHouse) => {
    setBoardingHouse(newBoardingHouse)
    saveBoardingHouse(newBoardingHouse)
    return newBoardingHouse
  }

  // Reminder log functions
  const addReminderLog = (logData: ReminderLog) => {
    const updatedLogs = [...reminderLogs, logData]
    setReminderLogs(updatedLogs)
    saveReminderLogs(updatedLogs)
    return logData
  }

  const getReminderLogsForPayment = (paymentId: string) => {
    return reminderLogs.filter((log) => log.paymentId === paymentId)
  }

  return {
    // Data
    rooms,
    tenants,
    payments,
    financialRecords,
    financialCategories,
    budgets,
    boardingHouse,
    settings,
    isLoaded,
    reminderLogs,
    backups,

    // Room functions
    addRoom,
    updateRoom,
    deleteRoom,

    // Tenant functions
    addTenant,
    updateTenant,
    deleteTenant,

    // Payment functions
    addPayment,
    updatePayment,
    deletePayment,

    // Financial functions
    addFinancialRecord,
    updateFinancialRecord,
    deleteFinancialRecord,

    // Settings functions
    updateSettings,

    // Boarding House functions
    updateBoardingHouse,

    // Backup functions
    createManualBackup,
    restoreFromBackup,

    // Helper functions
    getRoomWithTenant,
    getTenantWithRoom,
    getPaymentsForTenant,
    getPaymentsForRoom,
    getStats,

    // Reminder log functions
    addReminderLog,
    getReminderLogsForPayment,
  }
}
