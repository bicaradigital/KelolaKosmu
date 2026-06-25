# Deployment Guide - Kelola Kosmu License Activation

## Production Deployment ke Vercel

### Step 1: Setup Environment Variables di Vercel Dashboard

1. Buka Vercel Dashboard → Pilih project `KelolaKosmu`
2. Klik **Settings** → **Environment Variables**
3. Tambahkan 2 environment variables berikut:

```
NEXT_PUBLIC_SUPABASE_URL = https://hcvzsiawtrogesjoiuog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdnpzaWF3dHJvZ2Vzam9pdW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzOTEyNDEsImV4cCI6MTcyOTE0NzI0MX0.N0wEcyH5L8vXfLHRoM5d0jJ0YW8z0q8N7E8L3Q8Z9pE
```

**Pilih:** Production, Preview, dan Development

### Step 2: Redeploy di Vercel

1. Klik **Deployments** 
2. Klik **Redeploy** pada deployment terbaru
3. Tunggu hingga selesai (biasanya 30-60 detik)

### Step 3: Verify License Activation

1. Buka https://kelolakosmu.id
2. Jika ada halaman "Aktivasi Lisensi", input license key dari admin panel
3. Jika berhasil, halaman aplikasi akan tampil
4. Jika error, lihat browser console untuk debugging

---

## Development Setup (Local)

### Setup 1: Copy Environment Template

```bash
cp .env.example .env.local
```

### Setup 2: Install Dependencies

```bash
pnpm install
```

### Setup 3: Run Development Server

```bash
pnpm dev
```

Aplikasi akan tersedia di `http://localhost:3000`

---

## Testing License Key

### Test 1: Generate License Key di Admin Panel

1. Buka http://localhost:3000/admin (atau https://admin-panel-url)
2. Masukkan password admin
3. Generate license key baru dengan format: `KK-2026-XXXX-XXXX`

### Test 2: Activate License di Aplikasi

1. Buka http://localhost:3000 (atau https://kelolakosmu.id)
2. Halaman "Aktivasi Lisensi" akan muncul
3. Input license key yang baru dibuat
4. Click "Aktivasi"
5. Jika berhasil, aplikasi akan membuka
6. Jika gagal, cek error message

---

## Troubleshooting

### Error: "Kode lisensi tidak valid atau belum terdaftar"

**Solusi:**
1. Pastikan license key sudah di-generate dari admin panel
2. Pastikan format license key benar: `KK-2026-XXXX-XXXX`
3. Cek browser console untuk error detail
4. Pastikan environment variables sudah dikonfigurasi di Vercel

### Error: Supabase tidak terkoneksi

**Solusi:**
1. Buka browser DevTools → Console
2. Lihat apakah ada error dari Supabase client initialization
3. Pastikan URL dan API key benar di .env.local
4. Pastikan environment variables sudah diset di Vercel

### License Key tidak muncul di tabel

**Solusi:**
1. Refresh halaman admin panel
2. Cek apakah ada error di browser console
3. Cek apakah Supabase database accessible
4. Tunggu beberapa detik untuk data sync

---

## Database Schema

**Tabel: licenses**

```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) NOT NULL UNIQUE,           -- Format: KK-2026-XXXX-XXXX
  buyer_name VARCHAR(255) NOT NULL,         -- Nama pembeli
  notes TEXT,                                -- Catatan tambahan
  is_used BOOLEAN DEFAULT FALSE,             -- Sudah digunakan?
  is_active BOOLEAN DEFAULT TRUE,            -- Masih aktif?
  activated_at TIMESTAMP WITH TIME ZONE,     -- Kapan diaktifkan
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Support

Jika ada masalah dengan license activation:
- Admin Panel: https://admin-panel-url
- Aplikasi: https://kelolakosmu.id
- Hubungi: support@bicaradigital.com

