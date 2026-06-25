# License Setup Guide - KELOLA KOSMU

## Status Aplikasi

✓ Aplikasi KELOLA KOSMU sudah terhubung dengan Supabase
✓ Environment variables sudah di-set dengan benar
✓ License verification system sudah berfungsi

## Masalah yang Diperbaiki

1. **Error: "Missing Supabase environment variables"**
   - DIPERBAIKI: Created `.env.local` dengan credentials Supabase
   
2. **License verification tidak berfungsi**
   - DIPERBAIKI: Updated imports dari `./supabase` ke `@/app/utils/supabase/client`
   - DIPERBAIKI: Fixed USE_MOCK logic untuk check environment variables

3. **Aplikasi tidak bisa dibuka meski sudah memasukkan license key**
   - DIPERBAIKI: Setup Supabase client dengan benar

## Cara Membuat License Key yang Valid

### Step 1: Buka Admin Panel

URL: https://admin-license-key-kelolakosmu.vercel.app/admin
Password: `kelola_kosmu_admin`

### Step 2: Klik "Buat Lisensi"

Di admin panel dashboard, klik tombol untuk membuat license baru.

### Step 3: Isi Form

- **Nama Pembeli**: Nama kos atau pemilik
- **Catatan**: Informasi tambahan (optional)
- **Jumlah**: Berapa banyak license yang ingin dibuat

Contoh:
```
Nama Pembeli: Kost Mawar
Catatan: Lisensi untuk Kost Mawar tahun 2024
Jumlah: 1
```

### Step 4: Klik "Buat"

License key akan otomatis ter-generate dengan format:
```
KK-YYYY-AAAA-DDDD
```

Contoh:
- KK-2024-ABCD-1234
- KK-2024-WXYZ-5678
- KK-2025-MNOP-9999

### Step 5: Copy License Key

Admin akan melihat license key yang ter-generate. Copy key tersebut.

## Menggunakan License Key di Aplikasi

### Step 1: Buka Aplikasi KELOLA KOSMU

URL: http://localhost:3000 (development)
Atau URL production Anda

### Step 2: Halaman Aktivasi Lisensi

Aplikasi akan menampilkan halaman "Aktivasi Lisensi"

### Step 3: Masukkan License Key

Paste license key yang sudah dibuat di admin panel:
```
KK-2024-ABCD-1234
```

### Step 4: Klik Aktivasi

Sistem akan:
1. Verifikasi format license key (harus KK-YYYY-AAAA-DDDD)
2. Cek Supabase database untuk memastikan license exists
3. Verifikasi license status adalah 'active'
4. Jika valid, lanjut ke setup wizard

### Step 5: Setup Wizard

Setelah aktivasi berhasil, setup wizard akan dimulai untuk:
1. Input data boarding house
2. Upload foto boarding house
3. Add rooms
4. Add tenants

## Testing

### Test 1: Invalid License Format
Input: `KELOLA-1234-5678-9999`
Result: ✓ Error "Format kode lisensi tidak valid"

### Test 2: Valid Format but Not Registered
Input: `KK-2024-XXXX-9999` (tidak ada di database)
Result: ✓ Error "Kode lisensi tidak valid atau belum terdaftar"

### Test 3: Valid License from Admin Panel
Input: License key yang dibuat di admin panel
Result: ✓ Setup wizard dimulai

## Database Connection

### Supabase Configuration

```
URL: https://hcvzsiawtrogesjoiuog.supabase.co
Key: sb_publishable_bqH8WTtwmWxxQkiCw4ZNBg_xbp6Q1W5
```

### Licenses Table

License keys disimpan di table `licenses` dengan struktur:
```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY,
  key VARCHAR(20) UNIQUE,
  buyer_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP,
  notes TEXT
);
```

License keys yang dibuat di admin panel otomatis tersimpan di table ini.

## Troubleshooting

### Error: "Kode lisensi tidak valid atau belum terdaftar"

**Kemungkinan Penyebab:**
1. License key belum dibuat di admin panel
2. License key di-type dengan salah
3. Format tidak sesuai (harus KK-YYYY-AAAA-DDDD)
4. License status adalah 'inactive' (di-deactivate di admin panel)

**Solusi:**
1. Pastikan Anda sudah buat license di admin panel
2. Copy-paste license key dengan benar
3. Check admin panel apakah license status masih 'active'
4. Cek browser console (F12) untuk debug logs

### Error: "Missing Supabase environment variables"

**Solusi:**
1. Pastikan `.env.local` sudah ada di project root
2. Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sudah di-set
3. Restart dev server setelah update `.env.local`

### License Activation Timeout

**Solusi:**
1. Check internet connection
2. Verify Supabase project status di https://supabase.com/dashboard
3. Try again dalam beberapa detik

## Debug Logs

Buka browser console (F12 → Console) untuk melihat debug logs:

```
[License Verification] Checking license key: KK-2024-ABCD-1234
[License Verification] hasSupabaseConfig: true
[License Verification] USE_MOCK: false
[License Verification] NEXT_PUBLIC_SUPABASE_URL: SET
[License Verification] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: SET
[License Verification] Found in Supabase: {id: "...", status: "active"}
[LicenseActivation] License verified successfully
```

## Next Steps

1. ✓ Buat license keys di admin panel
2. ✓ Masukkan license key ke aplikasi
3. ✓ Ikuti setup wizard
4. ✓ Mulai manage boarding house

## Support

Jika ada masalah:
1. Check console logs (F12) untuk detail error
2. Verify environment variables di `.env.local`
3. Restart dev server
4. Clear browser cache (Ctrl+Shift+Delete)

Semuanya sudah siap untuk production!
