# Supabase Setup Guide untuk KELOLA KOSMU

## 1. Database Schema - Buat Tabel `licenses`

Jalankan SQL berikut di Supabase SQL Editor (https://hcvzsiawtrogesjoiuog.supabase.co/project/hcvzsiawtrogesjoiuog/sql):

```sql
-- Create licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) NOT NULL UNIQUE,
  buyer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  device_fingerprint TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 year',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_licenses_key ON licenses(key);
CREATE INDEX idx_licenses_buyer_name ON licenses(buyer_name);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_created_at ON licenses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Policy untuk select (semua user bisa baca)
CREATE POLICY "Allow all users to read licenses"
ON licenses FOR SELECT
USING (true);

-- Policy untuk insert (hanya admin yang bisa insert)
CREATE POLICY "Only admin can insert licenses"
ON licenses FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy untuk update
CREATE POLICY "Only admin can update licenses"
ON licenses FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  )
);
```

## 2. Buat License Request Table (Optional - untuk tracking requests)

```sql
CREATE TABLE license_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  requested_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  license_id UUID REFERENCES licenses(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_license_requests_status ON license_requests(status);
CREATE INDEX idx_license_requests_email ON license_requests(email);
```

## 3. Environment Variables

Tambahkan ke file `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://hcvzsiawtrogesjoiuog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Generate License Keys Format

Format: `KK-YYYY-AAAA-DDDD`
- `KK` = Kelola Kosmu prefix
- `YYYY` = Year (4 digits)
- `AAAA` = Random alphanumeric (4 characters)
- `DDDD` = Random digits (4 digits)

Contoh: `KK-2024-ABCD-1234`, `KK-2024-WXYZ-5678`

## 5. Cara User Mendapatkan License Key

### Opsi 1: Direct dari Admin Panel
- User menghubungi admin
- Admin login ke `/admin` 
- Admin membuat license key di dashboard
- Admin share license key ke user

### Opsi 2: Request Form (New)
- User pergi ke halaman Request License
- Isi form dengan data perusahaan
- Request masuk ke admin untuk approval
- Admin approve dan generate license key
- User menerima notification dengan license key

## 6. Verifikasi Koneksi

Cek di aplikasi apakah Supabase sudah terhubung:
1. Buka aplikasi
2. Buka browser DevTools (F12)
3. Lihat Console untuk log Supabase connection
4. Coba login dengan license key yang sudah dibuat

## Troubleshooting

### Error: "Cannot read property 'from' of null"
- Supabase ANON_KEY tidak ditemukan
- Set environment variable dengan benar

### Error: "relation 'public.licenses' does not exist"  
- Tabel licenses belum dibuat
- Jalankan SQL schema di atas

### License key tidak diterima
- Format key tidak sesuai KK-YYYY-AAAA-DDDD
- Key belum ada di database
- Check di admin dashboard apakah key sudah dibuat
