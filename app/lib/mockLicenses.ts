// Mock implementation for testing without Supabase
import { License } from './supabase'

let mockLicenses: License[] = [
  {
    id: '1',
    key: 'KK-2024-ABC1-1234',
    buyer_name: 'PT Griya Sejahtera',
    status: 'active',
    device_fingerprint: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 358 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Lisensi standar untuk satu kos',
  },
  {
    id: '2',
    key: 'KK-2024-DEF2-5678',
    buyer_name: 'Rumah Tinggal Ceria',
    status: 'active',
    device_fingerprint: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 362 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Trial lisensi',
  },
  {
    id: '3',
    key: 'KK-2024-GHI3-9012',
    buyer_name: 'Kos Tua',
    status: 'inactive',
    device_fingerprint: null,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Expired',
  },
]

export async function getMockLicenses(limit = 50, offset = 0): Promise<License[]> {
  return mockLicenses.slice(offset, offset + limit)
}

export async function createMockLicense(
  buyerName: string,
  notes?: string,
): Promise<License> {
  const key = `KK-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`

  const license: License = {
    id: Date.now().toString(),
    key,
    buyer_name: buyerName,
    status: 'active',
    device_fingerprint: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    notes: notes || null,
  }

  mockLicenses.push(license)
  return license
}

export async function getMockLicenseCount(): Promise<number> {
  return mockLicenses.length
}

export async function getActiveMockLicenseCount(): Promise<number> {
  return mockLicenses.filter((l) => l.status === 'active').length
}

export async function updateMockLicenseStatus(
  licenseId: string,
  status: 'active' | 'inactive',
): Promise<boolean> {
  const license = mockLicenses.find((l) => l.id === licenseId)
  if (license) {
    license.status = status
    return true
  }
  return false
}

export async function searchMockLicenses(query: string): Promise<License[]> {
  const q = query.toLowerCase()
  return mockLicenses.filter(
    (l) => l.key.toLowerCase().includes(q) || l.buyer_name.toLowerCase().includes(q),
  )
}

export async function getAllMockLicenses(): Promise<License[]> {
  return mockLicenses
}

export async function getLicenseByKey(licenseKey: string): Promise<License | null> {
  return (
    mockLicenses.find((l) => l.key.toUpperCase() === licenseKey.toUpperCase()) || null
  )
}
