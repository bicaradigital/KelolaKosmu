# License Verification Debugging Guide

## Status Saat Ini

Kode verifikasi sudah diperbaiki untuk menangani berbagai format status field dari Supabase.

## Perbaikan yang Telah Dilakukan

Verifikasi sekarang:
- Query ALL kolom dari tabel licenses (bukan hanya status field)
- Cek multiple status conditions:
  - `status = 'active'` (format lama)
  - `is_active = true` (format baru)
  - `is_used = false` (untuk mengecek availability)
- Log detailed debug dengan prefix `[v0]` untuk mudah ditemukan
- Tampilkan full data dari Supabase untuk inspection

## Cara Debug

### Step 1: Buka Browser Developer Console

1. Buka aplikasi di browser: http://localhost:3000
2. Tekan **F12** atau **Ctrl+Shift+I** (Windows/Linux) / **Cmd+Option+I** (Mac)
3. Klik tab **Console**

### Step 2: Masukkan License Key

1. Masukkan license key Anda: `KK-2026-QEQU-4726`
2. Klik tombol **Aktivasi**

### Step 3: Lihat Debug Logs

Console akan menampilkan logs dengan format `[v0]` seperti:

```
[v0] License Verification START - Input key: KK-2026-QEQU-4726
[v0] hasSupabaseConfig: true
[v0] supabase instance exists: true
[v0] Attempting Supabase query for key: KK-2026-QEQU-4726
[v0] Supabase query returned - data: {...}, error: null
[v0] License found in Supabase - full data: {
  id: "uuid",
  key: "KK-2026-QEQU-4726",
  buyer_name: "...",
  status: "active",
  is_active: true,
  is_used: false,
  created_at: "2026-01-15T...",
  ...
}
[v0] License is_active check: {
  status_field: "active",
  is_active_field: true,
  is_used_field: false,
  final_result: true
}
[v0] License VERIFIED - active in Supabase
```

## Kemungkinan Masalah dan Solusi

### 1. Error: "License key not found in any data source"

**Penyebab:**
- License key belum ada di Supabase
- Format key tidak match (case-sensitive atau spasi)
- Tabel licenses kosong atau tidak ada

**Debug Check:**
```
[v0] Supabase query returned - data: null, error: null
[v0] No data returned from Supabase (license not found)
```

**Solusi:**
1. Pastikan license key sudah dibuat di admin panel
2. Check di Supabase dashboard apakah data ada di tabel `licenses`
3. Pastikan format key benar: `KK-YYYY-AAAA-DDDD`

### 2. Error: Supabase query error

**Debug Check:**
```
[v0] Supabase query error code: PGRST116, message: "No rows found"
```

**Solusi:**
1. Pastikan RLS policy sudah dikonfigurasi untuk SELECT dengan role `anon`
2. Check NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
3. Pastikan `.env.local` sudah di-save

### 3. Error: License found but NOT active

**Debug Check:**
```
[v0] License is_active check: {
  status_field: "inactive",
  is_active_field: false,
  is_used_field: true,
  final_result: false
}
[v0] License found but NOT active
```

**Solusi:**
1. Check di admin panel atau Supabase dashboard
2. Pastikan status = 'active' dan is_active = true
3. Pastikan is_used = false (belum digunakan)

### 4. Supabase instance tidak initialized

**Debug Check:**
```
[v0] supabase instance exists: false
[v0] Supabase not configured or instance missing
```

**Solusi:**
1. Pastikan .env.local sudah ada dengan:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hcvzsiawtrogesjoiuog.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
2. Restart dev server
3. Check console untuk error messages

## Checking Supabase Data

### Method 1: Via Supabase Dashboard

1. Buka https://hcvzsiawtrogesjoiuog.supabase.co
2. Login
3. Pergi ke **SQL Editor** atau **Table Editor**
4. Lihat tabel `licenses`
5. Cari row dengan key `KK-2026-QEQU-4726`
6. Check kolom:
   - `key`: harus cocok dengan input
   - `status`: harus 'active'
   - `is_active`: harus true
   - `is_used`: harus false

### Method 2: Via SQL Query

```sql
SELECT * FROM licenses 
WHERE key = 'KK-2026-QEQU-4726'
LIMIT 1;
```

### Method 3: Check All Licenses

```sql
SELECT id, key, status, is_active, is_used, created_at 
FROM licenses 
ORDER BY created_at DESC 
LIMIT 20;
```

## Testing Different Scenarios

### Test 1: License exists and active
**Expected:** License activation succeeds
**Debug log:** `[v0] License VERIFIED - active in Supabase`

### Test 2: License exists but inactive
**Expected:** Error "License found but inactive"
**Debug log:** `[v0] License found but NOT active`

### Test 3: License doesn't exist
**Expected:** Error "License not found"
**Debug log:** `[v0] No data returned from Supabase`

### Test 4: Supabase not configured
**Expected:** Falls back to mock data
**Debug log:** `[v0] Supabase not configured or instance missing`

## Network Debugging

### Check Supabase API Calls

1. Buka Developer Tools (F12)
2. Klik tab **Network**
3. Filter untuk requests ke Supabase
4. Lihat:
   - Request URL: `/rest/v1/licenses`
   - Method: GET
   - Status: 200 (success) atau 400+ (error)
   - Response: Data JSON atau error message

## Common Issues

| Issue | Debug Log | Fix |
|-------|-----------|-----|
| License tidak ada | `No data returned from Supabase` | Buat license di admin panel |
| RLS tidak boleh | `status: 403` | Setup RLS policy untuk anon role |
| Key case mismatch | `License key KK-2026-... not found` | Query menggunakan uppercase |
| Database kosong | `License not found in any data source` | Check tabel licenses ada data |
| Env var missing | `Missing Supabase environment variables` | Set .env.local dengan credentials |

## Quick Commands

### Reload Console (hapus log lama)
```
console.clear()
```

### Filter logs (hanya [v0])
Di console search box, ketik: `[v0]`

### Copy full license data
Klik kanan pada object di console → Copy object

## Next Steps

1. Check browser console dengan steps di atas
2. Share debug logs yang ada di console
3. Check Supabase dashboard untuk verify data
4. Pastikan RLS policies sudah correct
5. Restart dev server jika perlu

## Contact & Support

Untuk bantuan lebih lanjut, siapkan:
1. Screenshot dari browser console (debug logs)
2. Confirmasi license key di Supabase database
3. Status tabel licenses di Supabase
