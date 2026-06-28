// Stub file for backward compatibility with admin dashboard
// License system has been migrated to simple API-based verification

export interface License {
  id: string
  key: string
  buyer_name: string
  status: 'active' | 'inactive'
  created_at: string
}

// Deprecated - use /api/verify-license instead
export async function createLicense(data: any): Promise<License> {
  throw new Error('License creation has been simplified. Use admin panel instead.')
}

export async function getLicenses(limit: number): Promise<License[]> {
  return []
}

export async function getLicenseCount(): Promise<number> {
  return 0
}

export async function getActiveLicenseCount(): Promise<number> {
  return 0
}

export async function searchLicenses(query: string): Promise<License[]> {
  return []
}

export async function updateLicenseStatus(id: string, status: 'active' | 'inactive'): Promise<boolean> {
  return false
}
