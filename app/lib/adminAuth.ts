// Admin authentication using sessionStorage
const ADMIN_SESSION_KEY = 'admin_session_token'
const ADMIN_PASSWORD_HASH = 'kelola_kosmu_admin_2024'

export function setAdminSession(token: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ADMIN_SESSION_KEY, token)
  }
}

export function getAdminSession(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(ADMIN_SESSION_KEY)
  }
  return null
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  }
}

export function verifyAdminPassword(password: string): boolean {
  // Simple hash verification - in production, use proper password hashing
  return password === 'kelola_kosmu_admin'
}

export function generateAdminToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function isAdminAuthenticated(): boolean {
  const session = getAdminSession()
  return session !== null && session.length > 0
}
