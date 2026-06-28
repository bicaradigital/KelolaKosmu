import { NextRequest, NextResponse } from 'next/server'

// Hardcoded list of valid license keys
const VALID_LICENSES = [
  'KK-2026-QEQU-4726',
  'KK-2024-ABC1-1234',
  'KK-2024-TEST-0001',
  // Add more licenses here as needed
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey } = body

    // Validate input
    if (!licenseKey || typeof licenseKey !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Kode lisensi harus diisi' },
        { status: 400 }
      )
    }

    // Normalize input: trim and uppercase
    const normalizedKey = licenseKey.trim().toUpperCase()

    // Check if license key is valid
    const isValid = VALID_LICENSES.includes(normalizedKey)

    if (isValid) {
      return NextResponse.json(
        { valid: true, message: 'Lisensi valid' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { valid: false, message: 'Kode lisensi tidak valid atau belum terdaftar' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('[License API] Error:', error)
    return NextResponse.json(
      { valid: false, message: 'Terjadi kesalahan saat memverifikasi lisensi' },
      { status: 500 }
    )
  }
}
