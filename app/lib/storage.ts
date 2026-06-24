// Utility functions for localStorage management
import { saveData, loadData } from "./localStorage"

export interface BoardingHouse {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  imageData?: string // Base64 encoded image
  imageFileName?: string
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: string
  number: string
  type: string
  rent: number
  status: "available" | "occupied" | "maintenance"
  tenantId?: string
  facilities: string[]
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  phone: string
  email: string
  idNumber: string
  roomId?: string
  checkInDate: string
  emergencyContact: {
    name: string
    phone: string
    relation: string
  }
  createdAt: string
}

export interface Payment {
  id: string
  tenantId: string
  roomId: string
  amount: number
  month: string
  year: number
  dueDate: string
  paidDate?: string
  status: "pending" | "paid" | "overdue"
  notes?: string
  reminderSent?: boolean
  reminderSentDate?: string
  paymentPeriod: "monthly" | "semester" | "yearly"
  createdAt: string
}

export interface FinancialRecord {
  id: string
  type: "income" | "expense"
  category: string
  subcategory?: string
  amount: number
  description: string
  date: string
  paymentMethod: "cash" | "bank_transfer" | "e_wallet" | "other"
  reference?: string
  attachments?: string[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface FinancialCategory {
  id: string
  name: string
  type: "income" | "expense"
  color: string
  icon: string
  subcategories: string[]
  isDefault: boolean
}

export interface Settings {
  kosName: string
  address: string
  phone: string
  email: string
  defaultRentDueDay: number
  whatsappConfig?: {
    apiUrl: string
    accessToken: string
    phoneNumberId: string
    businessAccountId: string
    enabled: boolean
  }
  reminderSettings?: {
    sendBeforeDue: boolean
    daysBefore: number
    sendOnOverdue: boolean
    sendConfirmation: boolean
  }
  security?: {
    enablePassword: boolean
    passwordHash?: string
    enableAutoBackup: boolean
    backupFrequency: "daily" | "weekly" | "monthly"
    lastBackup?: string
    enableEncryption: boolean
  }
  financial?: {
    currency: string
    fiscalYearStart: number // month (1-12)
    enableBudgeting: boolean
    defaultPaymentMethod: string
  }
}

export interface ReminderLog {
  id: string
  paymentId: string
  tenantId: string
  type: "before_due" | "overdue" | "confirmation"
  sentDate: string
  success: boolean
  message?: string
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  period: "monthly" | "quarterly" | "yearly"
  year: number
  month?: number
  quarter?: number
  spent: number
  createdAt: string
}

export interface BackupData {
  id: string
  timestamp: string
  data: {
    rooms: Room[]
    tenants: Tenant[]
    payments: Payment[]
    financialRecords: FinancialRecord[]
    categories: FinancialCategory[]
    budgets: Budget[]
    settings: Settings
  }
  encrypted: boolean
  checksum: string
}

// Storage keys
const STORAGE_KEYS = {
  ROOMS: "griya_carmel_rooms",
  TENANTS: "griya_carmel_tenants",
  PAYMENTS: "griya_carmel_payments",
  FINANCIAL_RECORDS: "griya_carmel_financial_records",
  FINANCIAL_CATEGORIES: "griya_carmel_financial_categories",
  BUDGETS: "griya_carmel_budgets",
  SETTINGS: "griya_carmel_settings",
  REMINDER_LOGS: "griya_carmel_reminder_logs",
  BACKUPS: "griya_carmel_backups",
  AUTH_TOKEN: "griya_carmel_auth_token",
}

// Default financial categories
export const DEFAULT_CATEGORIES: FinancialCategory[] = [
  {
    id: "income_rent",
    name: "Sewa Kamar",
    type: "income",
    color: "#10b981",
    icon: "home",
    subcategories: ["Sewa Bulanan", "Deposit", "Denda Keterlambatan"],
    isDefault: true,
  },
  {
    id: "income_other",
    name: "Pendapatan Lain",
    type: "income",
    color: "#3b82f6",
    icon: "plus-circle",
    subcategories: ["Laundry", "Parkir", "Lain-lain"],
    isDefault: true,
  },
  {
    id: "expense_utilities",
    name: "Utilitas",
    type: "expense",
    color: "#f59e0b",
    icon: "zap",
    subcategories: ["Listrik", "Air", "Gas", "Internet", "Telepon"],
    isDefault: true,
  },
  {
    id: "expense_maintenance",
    name: "Maintenance",
    type: "expense",
    color: "#ef4444",
    icon: "wrench",
    subcategories: ["Perbaikan AC", "Perbaikan Kamar Mandi", "Cat", "Furniture", "Elektronik"],
    isDefault: true,
  },
  {
    id: "expense_operational",
    name: "Operasional",
    type: "expense",
    color: "#8b5cf6",
    icon: "briefcase",
    subcategories: ["Gaji Karyawan", "Kebersihan", "Keamanan", "Administrasi"],
    isDefault: true,
  },
  {
    id: "expense_other",
    name: "Pengeluaran Lain",
    type: "expense",
    color: "#6b7280",
    icon: "minus-circle",
    subcategories: ["Pajak", "Asuransi", "Lain-lain"],
    isDefault: true,
  },
]

// Encryption utilities
const ENCRYPTION_KEY = "griya_carmel_secret_key_2024"

export const encryptData = (data: string): string => {
  // Simple XOR encryption for demo purposes
  // In production, use proper encryption libraries
  let encrypted = ""
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
  }
  return btoa(encrypted)
}

export const decryptData = (encryptedData: string): string => {
  try {
    const encrypted = atob(encryptedData)
    let decrypted = ""
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    }
    return decrypted
  } catch {
    return ""
  }
}

// Password hashing (simple implementation)
export const hashPassword = (password: string): string => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

// Checksum calculation
export const calculateChecksum = (data: string): string => {
  let checksum = 0
  for (let i = 0; i < data.length; i++) {
    checksum += data.charCodeAt(i)
  }
  return checksum.toString(36)
}

// Room functions
export const saveRooms = (rooms: Room[]): void => {
  if (typeof window !== "undefined") {
    saveData(STORAGE_KEYS.ROOMS, rooms)
  }
}

export const loadRooms = (): Room[] => {
  if (typeof window !== "undefined") {
    return loadData(STORAGE_KEYS.ROOMS)
  }
  return []
}

// Tenant functions
export const saveTenants = (tenants: Tenant[]): void => {
  if (typeof window !== "undefined") {
    saveData(STORAGE_KEYS.TENANTS, tenants)
  }
}

export const loadTenants = (): Tenant[] => {
  if (typeof window !== "undefined") {
    return loadData(STORAGE_KEYS.TENANTS)
  }
  return []
}

// Payment functions
export const savePayments = (payments: Payment[]): void => {
  if (typeof window !== "undefined") {
    saveData(STORAGE_KEYS.PAYMENTS, payments)
  }
}

export const loadPayments = (): Payment[] => {
  if (typeof window !== "undefined") {
    return loadData(STORAGE_KEYS.PAYMENTS)
  }
  return []
}

// Financial record functions
export const saveFinancialRecords = (records: FinancialRecord[]): void => {
  if (typeof window !== "undefined") {
    saveData(STORAGE_KEYS.FINANCIAL_RECORDS, records)
  }
}

export const loadFinancialRecords = (): FinancialRecord[] => {
  if (typeof window !== "undefined") {
    return loadData(STORAGE_KEYS.FINANCIAL_RECORDS)
  }
  return []
}

// Financial category functions
export const saveFinancialCategories = (categories: FinancialCategory[]): void => {
  if (typeof window !== "undefined") {
    saveData(STORAGE_KEYS.FINANCIAL_CATEGORIES, categories)
  }
}

export const loadFinancialCategories = (): FinancialCategory[] => {
  if (typeof window !== "undefined") {
    const saved = loadData(STORAGE_KEYS.FINANCIAL_CATEGORIES)
    return saved.length > 0 ? saved : DEFAULT_CATEGORIES
  }
  return DEFAULT_CATEGORIES
}

// Budget functions
export const saveBudgets = (budgets: Budget[]): void => {
  if (typeof window !== "undefined") {
    saveData(STORAGE_KEYS.BUDGETS, budgets)
  }
}

export const loadBudgets = (): Budget[] => {
  if (typeof window !== "undefined") {
    return loadData(STORAGE_KEYS.BUDGETS)
  }
  return []
}

// Boarding House functions
export const saveBoardingHouse = (boardingHouse: BoardingHouse): void => {
  if (typeof window !== "undefined") {
    saveData("boarding_house", boardingHouse)
  }
}

export const loadBoardingHouse = (): BoardingHouse | null => {
  if (typeof window !== "undefined") {
    const saved = loadData("boarding_house")
    return saved && Object.keys(saved).length > 0 ? saved : null
  }
  return null
}

// Settings functions
export const saveSettingsToStorage = (settings: Settings): void => {
  if (typeof window !== "undefined") {
    const settingsToSave = { ...settings }
    if (settings.security?.enableEncryption) {
      const encrypted = encryptData(JSON.stringify(settingsToSave))
      localStorage.setItem(STORAGE_KEYS.SETTINGS, encrypted)
    } else {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsToSave))
    }
  }
}

export const loadSettingsFromStorage = (): Settings => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (data) {
      try {
        // Try to parse as regular JSON first
        return JSON.parse(data)
      } catch {
        // If that fails, try to decrypt
        try {
          const decrypted = decryptData(data)
          return JSON.parse(decrypted)
        } catch {
          // If both fail, return default settings
        }
      }
    }
  }
  return {
    kosName: "",
    address: "",
    phone: "",
    email: "",
    defaultRentDueDay: 10,
    whatsappConfig: {
      apiUrl: "https://graph.facebook.com/v18.0",
      accessToken: "",
      phoneNumberId: "",
      businessAccountId: "",
      enabled: false,
    },
    reminderSettings: {
      sendBeforeDue: true,
      daysBefore: 3,
      sendOnOverdue: true,
      sendConfirmation: true,
    },
    security: {
      enablePassword: false,
      enableAutoBackup: true,
      backupFrequency: "weekly",
      enableEncryption: false,
    },
    financial: {
      currency: "IDR",
      fiscalYearStart: 1,
      enableBudgeting: true,
      defaultPaymentMethod: "cash",
    },
  }
}

// Reminder log functions
export const saveReminderLogs = (logs: ReminderLog[]): void => {
  if (typeof window !== "undefined") {
    saveData(STORAGE_KEYS.REMINDER_LOGS, logs)
  }
}

export const loadReminderLogs = (): ReminderLog[] => {
  if (typeof window !== "undefined") {
    return loadData(STORAGE_KEYS.REMINDER_LOGS)
  }
  return []
}

// Backup functions
export const saveBackups = (backups: BackupData[]): void => {
  if (typeof window !== "undefined") {
    saveData(STORAGE_KEYS.BACKUPS, backups)
  }
}

export const loadBackups = (): BackupData[] => {
  if (typeof window !== "undefined") {
    return loadData(STORAGE_KEYS.BACKUPS)
  }
  return []
}

// Authentication functions
export const saveAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  }
}

export const loadAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  }
  return null
}

export const clearAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  }
}

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date()
}

export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getDaysOverdue = (dueDate: string): number => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = today.getTime() - due.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Backup and restore functions
export const createBackup = (
  rooms: Room[],
  tenants: Tenant[],
  payments: Payment[],
  financialRecords: FinancialRecord[],
  categories: FinancialCategory[],
  budgets: Budget[],
  settings: Settings,
): BackupData => {
  const data = {
    rooms,
    tenants,
    payments,
    financialRecords,
    categories,
    budgets,
    settings,
  }

  const dataString = JSON.stringify(data)
  const checksum = calculateChecksum(dataString)

  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    data,
    encrypted: settings.security?.enableEncryption || false,
    checksum,
  }
}

export const exportBackup = (backup: BackupData): void => {
  const dataStr = JSON.stringify(backup, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `griya-carmel-backup-${backup.timestamp.split("T")[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export const importBackup = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string) as BackupData
        // Validate backup structure
        if (!backup.data || !backup.timestamp || !backup.checksum) {
          throw new Error("Invalid backup file format")
        }
        resolve(backup)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
