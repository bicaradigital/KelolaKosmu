# License Key Integration Guide

## Masalah Sebelumnya

License key hanya bisa dipakai jika hardcoded di `app/api/verify-license/route.ts`. License key yang dibuat di admin panel tidak berfungsi.

**Penyebab:**
- Admin panel menyimpan license ke Supabase table `licenses`
- API route `/api/verify-license` hanya cek hardcoded array
- Kedua sistem tidak terhubung

## Solusi yang Diterapkan

API route `/api/verify-license` sekarang:

1. **Query Supabase terlebih dahulu**
   - Cek apakah license key ada di tabel `licenses`
   - Verifikasi status `is_active = true`

2. **Fallback ke hardcoded array**
   - Jika Supabase tidak configured
   - Jika query gagal
   - Memastikan app tetap berfungsi

3. **Validasi format**
   - Format harus: `KK-YYYY-AAAA-DDDD`
   - Reject license dengan format salah

## Cara Kerja Sekarang

### Flow 1: Admin membuat license di panel

```
1. Admin masuk ke http://localhost:3000/admin
2. Login dengan password
3. Masuk ke "Buat Lisensi"
4. Isi: Nama Pembeli, Catatan, Jumlah
5. Klik "Buat Lisensi"
6. License otomatis tersimpan di Supabase table `licenses`
7. Contoh yang ter-generate: KK-2026-QEQU-4726
```

### Flow 2: User mengaktifkan license

```
1. User buka app: http://localhost:3000
2. Akan melihat "Aktivasi Lisensi" screen
3. User masukkan license key: KK-2026-QEQU-4726
4. Klik "Aktifkan Sekarang"
5. POST ke /api/verify-license
6. API query Supabase: SELECT * FROM licenses WHERE key='KK-2026-QEQU-4726'
7. Jika found & is_active=true → License diterima
8. Browser simpan ke localStorage
9. User langsung masuk dashboard
```

## Step-by-Step Setup

### 1. Pastikan Supabase Terintegrasi

Check `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://hcvzsiawtrogesjoiuog.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Jika tidak ada, tambahkan:
```bash
echo 'NEXT_PUBLIC_SUPABASE_URL=https://hcvzsiawtrogesjoiuog.supabase.co' >> .env.local
echo 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...' >> .env.local
```

### 2. Buat Tabel Licenses di Supabase (jika belum ada)

Login ke https://supabase.com/dashboard/project/hcvzsiawtrogesjoiuog

Klik "SQL Editor" dan jalankan:

```sql
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(20) UNIQUE NOT NULL,
  buyer_name VARCHAR(255),
  notes TEXT,
  is_used BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMP,
  device_fingerprint VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key);
```

### 3. Pastikan RLS Policy Benar

Di Supabase dashboard → Table `licenses` → Security → RLS:

```sql
-- Allow SELECT from licenses table for anon role
CREATE POLICY "Allow anon read licenses" ON licenses
  FOR SELECT 
  USING (true);
```

### 4. Setup Admin Panel

Buka `/admin/dashboard`:
- URL: http://localhost:3000/admin
- Password: `kelola_kosmu_admin` (default dari adminAuth.ts)

### 5. Buat License Key Baru

Di admin dashboard:
1. Isi form "Buat Lisensi"
2. Klik tombol "Buat Lisensi"
3. License otomatis tersimpan ke Supabase
4. Copy license key yang ter-generate

### 6. Test License Activation

Buka http://localhost:3000:
1. Masukkan license key yang baru dibuat
2. Klik "Aktifkan Sekarang"
3. Jika valid → masuk dashboard
4. Jika error → cek browser console untuk debug logs

## Debugging

### Jika license key tidak diterima

**Step 1: Check browser console**
```
Buka F12 → Console tab
Lihat error message yang ditampilkan
```

**Step 2: Check Supabase database**
```
1. Buka https://supabase.com/dashboard
2. Pilih project: hcvzsiawtrogesjoiuog
3. Klik "Table Editor"
4. Pilih tabel "licenses"
5. Cek apakah license key ada
6. Cek kolom:
   - key: cocok dengan input?
   - is_active: true atau false?
```

**Step 3: Check API response**
```
1. Buka DevTools → Network tab
2. Masukkan license key
3. Klik "Aktifkan"
4. Lihat request ke /api/verify-license
5. Check response JSON:
   { "valid": true/false, "message": "..." }
```

### Common Issues

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| "Format kode lisensi tidak valid" | Format tidak sesuai | Gunakan format `KK-YYYY-AAAA-DDDD` |
| "Kode lisensi tidak valid atau belum terdaftar" | License tidak ada di Supabase | Buat license baru di admin panel |
| License ada tapi tetap error | is_active = false | Update di admin dashboard atau Supabase |
| Supabase error 403 | RLS policy tidak benar | Setup policy di Supabase |

## How It Works (Technical)

### API Route: /api/verify-license

```typescript
POST /api/verify-license
{
  "licenseKey": "KK-2026-QEQU-4726"
}

// Response jika valid:
{
  "valid": true,
  "message": "Lisensi valid"
}

// Response jika invalid:
{
  "valid": false,
  "message": "Kode lisensi tidak valid atau belum terdaftar"
}
```

### Database Query

```sql
SELECT id, is_active FROM licenses 
WHERE key = 'KK-2026-QEQU-4726'
LIMIT 1
```

Jika query return data dan `is_active = true` → License valid
Jika tidak ada → License invalid

### Fallback Logic

```
1. Try query Supabase
2. If Supabase error → fallback to hardcoded array
3. If Supabase not configured → use hardcoded array
4. If no data found → return invalid
```

## Best Practices

### 1. Admin Panel Management

- Selalu maintain license di Supabase (via admin panel)
- Jangan manually edit hardcoded array
- Track license usage di table

### 2. Monitoring

- Check admin dashboard untuk lihat:
  - Total licenses sold
  - Licenses yang sudah dipakai
  - Licenses yang inactive
  - Status setiap license

### 3. License Status

- `is_active = true`: License bisa diaktifkan
- `is_active = false`: License tidak bisa diaktifkan
- `is_used = true`: License sudah digunakan
- `is_used = false`: License belum digunakan

## Future Enhancements

Bisa ditambahkan:

- [ ] Expiration date untuk license
- [ ] License deactivation dari admin panel
- [ ] Usage analytics
- [ ] License transfer ke device lain
- [ ] Bulk license generation
- [ ] License CSV export/import

## Testing Checklist

- [ ] License key format validated (KK-YYYY-AAAA-DDDD)
- [ ] License created in admin panel appears in dashboard
- [ ] License activation works from main app
- [ ] License persisted to localStorage after activation
- [ ] Browser refresh skips activation (uses localStorage)
- [ ] Invalid license rejected with error message
- [ ] Supabase query works (check admin dashboard data)
- [ ] Fallback works when Supabase unavailable

## Support

Untuk bantuan:
1. Check browser console (F12)
2. Check admin dashboard untuk verify license exists
3. Check Supabase dashboard untuk verify data
4. Check network tab untuk debug API calls
