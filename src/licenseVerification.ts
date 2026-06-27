/**
 * SIMPLIFIED LICENSE VERIFICATION
 * Satu file, satu fungsi jelas, tanpa fallback mock, tanpa kompleksitas.
 * 
 * CARA PAKAI:
 * 1. Ganti isi app/lib/licenseVerification.ts dengan file ini
 * 2. Pastikan tabel Supabase "licenses" punya kolom: key, is_active, is_used
 * 3. Tidak perlu ubah file lain - fungsi yang di-export namanya sama
 */

import { createClient } from '@supabase/supabase-js'

// Buat koneksi langsung di sini, tidak tergantung file supabase.ts lain
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Cek apakah license key valid dan boleh dipakai.
 * Mengembalikan true/false saja - simpel.
 */
export async function verifyLicenseKeyExists(licenseKey: string): Promise<boolean> {
  const cleanKey = licenseKey.trim().toUpperCase()

  console.log('[License] Mengecek key:', cleanKey)

  const { data, error } = await supabase
    .from('licenses')
    .select('key, is_active, is_used')
    .eq('key', cleanKey)
    .maybeSingle()

  console.log('[License] Hasil dari Supabase:', { data, error })

  if (error) {
    console.error('[License] Error query Supabase:', error.message, error.code)
    return false
  }

  if (!data) {
    console.warn('[License] Key tidak ditemukan di database:', cleanKey)
    return false
  }

  if (data.is_active !== true) {
    console.warn('[License] Key ditemukan tapi tidak aktif (dinonaktifkan admin)')
    return false
  }

  console.log('[License] Key VALID, boleh diaktifkan')
  return true
}

/**
 * Tandai license sebagai sudah dipakai (dipanggil setelah verifikasi berhasil)
 * Tidak wajib berhasil - kalau gagal pun user tetap bisa lanjut pakai app,
 * supaya tidak ada blocking point tambahan.
 */
export async function markLicenseAsUsed(licenseKey: string): Promise<void> {
  const cleanKey = licenseKey.trim().toUpperCase()

  try {
    const { error } = await supabase
      .from('licenses')
      .update({
        is_used: true,
        activated_at: new Date().toISOString(),
      })
      .eq('key', cleanKey)

    if (error) {
      console.warn('[License] Gagal update is_used (tidak fatal):', error.message)
    } else {
      console.log('[License] Berhasil menandai key sebagai used')
    }
  } catch (e) {
    console.warn('[License] Error saat update is_used (tidak fatal):', e)
  }
}

/**
 * Versi lengkap: verifikasi DAN langsung tandai sebagai used.
 * Ini fungsi yang sebaiknya dipanggil dari komponen LicenseActivation.
 */
export async function activateLicense(licenseKey: string): Promise<{
  success: boolean
  message: string
}> {
  const isValid = await verifyLicenseKeyExists(licenseKey)

  if (!isValid) {
    return {
      success: false,
      message: 'Kode lisensi tidak ditemukan atau sudah dinonaktifkan. Hubungi admin via WhatsApp.',
    }
  }

  // Tandai sebagai used (best-effort, tidak blocking)
  await markLicenseAsUsed(licenseKey)

  return {
    success: true,
    message: 'Lisensi berhasil diaktifkan!',
  }
}
