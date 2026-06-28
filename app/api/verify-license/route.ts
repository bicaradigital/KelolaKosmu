import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// Fallback hardcoded licenses if Supabase not configured
const FALLBACK_LICENSES = [
  'KK-2026-QEQU-4726',
  'KK-2024-ABC1-1234',
  'KK-2024-TEST-0001',
]

async function verifyLicenseFromSupabase(licenseKey: string): Promise<boolean> {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.log('[License API] Supabase not configured, using fallback')
      return FALLBACK_LICENSES.includes(licenseKey)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data, error } = await supabase
      .from('licenses')
      .select('id, is_active')
      .eq('key', licenseKey)
      .maybeSingle()

    if (error) {
      console.error('[License API] Supabase error:', error)
      // Fallback to hardcoded licenses if query fails
      return FALLBACK_LICENSES.includes(licenseKey)
    }

    // License valid if it exists and is_active is true
    return data !== null && data.is_active === true
  } catch (error) {
    console.error('[License API] Exception:', error)
    // Fallback to hardcoded licenses on any error
    return FALLBACK_LICENSES.includes(licenseKey)
  }
}

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

    // Validate format: KK-YYYY-AAAA-DDDD
    const formatRegex = /^KK-\d{4}-[A-Z]{4}-\d{4}$/
    if (!formatRegex.test(normalizedKey)) {
      return NextResponse.json(
        { valid: false, message: 'Format kode lisensi tidak valid. Gunakan format: KK-YYYY-AAAA-DDDD' },
        { status: 400 }
      )
    }

    // Check if license key is valid (from Supabase or fallback)
    const isValid = await verifyLicenseFromSupabase(normalizedKey)

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
