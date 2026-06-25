# Setup Supabase License Verification untuk kelolakosmu.id

Dokumen ini menjelaskan cara menghubungkan aplikasi kelolakosmu.id dengan Supabase untuk validasi license key real-time dari admin panel.

## 1. Development Setup (Local)

### Step 1: Copy Environment Template
```bash
cp .env.example .env.local
```

### Step 2: Add Supabase Credentials
Edit file `.env.local` dan masukkan:
```
NEXT_PUBLIC_SUPABASE_URL=https://hcvzsiawtrogesjoiuog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdnpzaWF3dHJvZ2Vzam9pdW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzOTEyNDEsImV4cCI6MTcyOTE0NzI0MX0.N0wEcyH5L8vXfLHRoM5d0jJ0YW8z0q8N7E8L3Q8Z9pE
```

### Step 3: Test Locally
```bash
npm run dev
# atau
pnpm dev
```

Buka http://localhost:3000 dan test input license key dari admin panel.

## 2. Production Setup (Vercel)

### Step 1: Akses Vercel Dashboard
1. Buka https://vercel.com
2. Login dengan akun Anda
3. Pilih project **kelolakosmu.id**

### Step 2: Add Environment Variables
1. Klik **Settings** di navbar
2. Pilih **Environment Variables** di sidebar
3. Add dua variables:

**Variable 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://hcvzsiawtrogesjoiuog.supabase.co`
- Environments: Production, Preview, Development

**Variable 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdnpzaWF3dHJvZ2Vzam9pdW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzOTEyNDEsImV4cCI6MTcyOTE0NzI0MX0.N0wEcyH5L8vXfLHRoM5d0jJ0YW8z0q8N7E8L3Q8Z9pE`
- Environments: Production, Preview, Development

### Step 3: Deploy
1. Klik **Deployments** di navbar
2. Klik tombol **Redeploy** pada deployment terbaru
3. Tunggu hingga deploy selesai

## 3. Testing License Verification

### Test di kelolakosmu.id:
1. Buka https://kelolakosmu.id
2. Klik "Aktivasi Lisensi"
3. Input license key yang sudah dibuat di admin panel
4. Jika berhasil, aplikasi akan menerima license dan user bisa akses

### Contoh License Keys Valid:
Gunakan license keys yang sudah dihasilkan dari admin panel:
- Format: `KK-2026-XXXX-####`
- Status: Aktif (is_active = true)
- Belum Digunakan: is_used = false

## 4. Troubleshooting

### Error: "Kode lisensi tidak valid atau belum terdaftar"

**Kemungkinan penyebab:**
1. Environment variables belum set di Vercel
   - Solusi: Verify di Vercel Settings > Environment Variables

2. License key belum dibuat di admin panel
   - Solusi: Generate license key terlebih dahulu di admin panel

3. License key sudah digunakan (is_used = true)
   - Solusi: Generate license key baru atau hubungi admin

4. License key sudah dinonaktifkan (is_active = false)
   - Solusi: Aktifkan kembali dari admin panel

### Test Koneksi Supabase
Untuk debugging, jalankan di browser console:
```javascript
// Check if Supabase credentials loaded
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

## 5. Admin Panel untuk Generate License

Gunakan admin panel di repository lain untuk generate dan manage license keys:
- URL: Admin Panel (internal)
- Password: kelolakosmu50jutapengguna
- Akses di: http://localhost:3000/admin (development) atau domain admin panel (production)

## 6. Database Schema

Tabel `licenses` di Supabase dengan fields:
- `id` (UUID) - Primary key
- `key` (VARCHAR) - License key format KK-2026-XXXX-####
- `buyer_name` (VARCHAR) - Nama pembeli
- `notes` (TEXT) - Catatan tambahan
- `is_used` (BOOLEAN) - Flag apakah sudah digunakan
- `is_active` (BOOLEAN) - Flag apakah aktif
- `activated_at` (TIMESTAMP) - Waktu aktivasi
- `created_at` (TIMESTAMP) - Waktu pembuatan

## 7. Support

Untuk pertanyaan atau issue, hubungi admin dengan informasi:
- License key yang digunakan
- Error message yang muncul
- Browser dan device yang digunakan
