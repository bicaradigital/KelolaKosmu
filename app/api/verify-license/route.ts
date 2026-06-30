import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// Fallback hardcoded licenses if Supabase not configured
const FALLBACK_LICENSES = [
    'KK-2026-PWNG-3259',
]

async function verifyLicenseFromSupabase(licenseKey: string): Promise<boolean> {
  try {
    console.log('[v0] Verifying license key:', licenseKey)
    console.log('[v0] Supabase URL configured:', !!supabaseUrl)
    console.log('[v0] Supabase Key configured:', !!supabaseKey)

    if (!supabaseUrl || !supabaseKey) {
      console.log('[v0] Supabase not configured, using fallback')
      return FALLBACK_LICENSES.includes(licenseKey)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('[v0] Querying Supabase for license:', licenseKey)
    const { data, error } = await supabase
      .from('licenses')
      .select('id, is_active, key, buyer_name')
      .eq('key', licenseKey)
      .maybeSingle()

    console.log('[v0] Query result - data:', data, 'error:', error)

    if (error) {
      console.error('[v0] Supabase error:', error.code, error.message)
      // Fallback to hardcoded licenses if query fails
      const fallbackResult = FALLBACK_LICENSES.includes(licenseKey)
      console.log('[v0] Using fallback result:', fallbackResult)
      return fallbackResult
    }

    // License valid if it exists and is_active is true
    const isValid = data !== null && data.is_active === true
    console.log('[v0] License valid:', isValid)
    return isValid
  } catch (error) {
    console.error('[v0] Exception in verification:', error)
    // Fallback to hardcoded licenses on any error
    return FALLBACK_LICENSES.includes(licenseKey)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] License verification request received')
    const body = await request.json()
    const { licenseKey } = body

    console.log('[v0] Request body:', { licenseKey })

    // Validate input
    if (!licenseKey || typeof licenseKey !== 'string') {
      console.log('[v0] Invalid input - license key missing or not string')
      return NextResponse.json(
        { valid: false, message: 'Kode lisensi harus diisi' },
        { status: 400 }
      )
    }

    // Normalize input: trim and uppercase
    const normalizedKey = licenseKey.trim().toUpperCase()
    console.log('[v0] Normalized key:', normalizedKey)

    // Validate format: KK-YYYY-AAAA-DDDD
    const formatRegex = /^KK-\d{4}-[A-Z]{4}-\d{4}$/
    if (!formatRegex.test(normalizedKey)) {
      console.log('[v0] Format validation failed')
      return NextResponse.json(
        { valid: false, message: 'Format kode lisensi tidak valid. Gunakan format: KK-YYYY-AAAA-DDDD' },
        { status: 400 }
      )
    }

    // Check if license key is valid (from Supabase or fallback)
    console.log('[v0] Starting verification process...')
    const isValid = await verifyLicenseFromSupabase(normalizedKey)

    console.log('[v0] Verification complete - isValid:', isValid)

    if (isValid) {
      console.log('[v0] License verification SUCCESS')
      return NextResponse.json(
        { valid: true, message: 'Lisensi valid' },
        { status: 200 }
      )
    } else {
      console.log('[v0] License verification FAILED - invalid or not found')
      return NextResponse.json(
        { valid: false, message: 'Kode lisensi tidak valid atau belum terdaftar' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('[v0] Error in license verification:', error)
    return NextResponse.json(
      { valid: false, message: 'Terjadi kesalahan saat memverifikasi lisensi' },
      { status: 500 }
    )
  }
}
