# Supabase Integration untuk KELOLA KOSMU

## Overview

KELOLA KOSMU sekarang terhubung dengan Supabase untuk penyimpanan dan manajemen data terpusat, termasuk license key management.

## Konfigurasi Supabase

### Environment Variables

Aplikasi sudah dikonfigurasi dengan credentials Anda di `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://hcvzsiawtrogesjoiuog.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_bqH8WTtwmWxxQkiCw4ZNBg_xbp6Q1W5
```

### Setup Struktur

Aplikasi menggunakan SSR pattern dari Supabase dengan struktur:

```
app/utils/supabase/
├── server.ts       # Server-side client untuk Next.js Server Components
├── client.ts       # Browser client untuk Client Components  
└── middleware.ts   # Middleware untuk session management
```

### Client Usage

**Server Component (Server-Side):**
```typescript
import { createClient } from '@/app/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('licenses').select()
  
  return <div>{/* render data */}</div>
}
```

**Client Component (Browser):**
```typescript
'use client'

import { createClient } from '@/app/utils/supabase/client'
import { useEffect, useState } from 'react'

export function LicenseComponent() {
  const [licenses, setLicenses] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    const fetchLicenses = async () => {
      const { data } = await supabase.from('licenses').select()
      setLicenses(data)
    }
    
    fetchLicenses()
  }, [])
  
  return <div>{/* render licenses */}</div>
}
```

## License Management

### Membuat License Key

1. Buka Admin Panel: https://admin-license-key-kelolakosmu.vercel.app/admin
2. Login dengan password: `kelola_kosmu_admin`
3. Klik "Buat Lisensi"
4. Isi:
   - **Nama Pembeli**: Nama kos/pemilik
   - **Catatan**: Informasi tambahan (optional)
   - **Jumlah**: Berapa license key yang ingin dibuat
5. Klik "Buat Lisensi"
6. Copy license key yang ter-generate

### Format License Key

Format license key yang valid: **KK-YYYY-AAAA-DDDD**

Contoh:
- `KK-2024-ABCD-1234`
- `KK-2024-WXYZ-5678`
- `KK-2025-MNOP-9999`

### Menggunakan License Key

1. Buka aplikasi KELOLA KOSMU
2. Halaman "Aktivasi Lisensi" akan muncul
3. Masukkan license key yang sudah dibuat
4. Klik "Aktivasi"
5. Jika berhasil, setup wizard akan muncul

## Supabase Database Schema

### Tabel: licenses

License keys disimpan di tabel `licenses` dengan struktur:

```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(20) UNIQUE NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  device_fingerprint VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP,
  notes TEXT
);
```

**Kolom:**
- `id`: UUID unik untuk setiap license
- `key`: Kode license (KK-YYYY-AAAA-DDDD)
- `buyer_name`: Nama pembeli/pemilik kos
- `status`: Status license ('active' atau 'inactive')
- `device_fingerprint`: Fingerprint device untuk licensing
- `created_at`: Tanggal pembuatan
- `expires_at`: Tanggal kadaluarsa (nullable)
- `notes`: Catatan tambahan

### Tabel: boarding_houses

Informasi kos/boarding house disimpan di tabel `boarding_houses`:

```sql
CREATE TABLE boarding_houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key VARCHAR(20) REFERENCES licenses(key),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(512),
  phone VARCHAR(20),
  email VARCHAR(255),
  owner_name VARCHAR(255),
  photo_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Tabel: tenants

Data penghuni kos:

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boarding_house_id UUID REFERENCES boarding_houses(id),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  id_number VARCHAR(50),
  address VARCHAR(512),
  emergency_contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);
```

### Tabel: rooms

Data kamar kos:

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boarding_house_id UUID REFERENCES boarding_houses(id),
  room_number VARCHAR(50) NOT NULL,
  rent DECIMAL(12,2) NOT NULL,
  capacity INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT now()
);
```

### Tabel: payments

Data pembayaran penghuni:

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  room_id UUID REFERENCES rooms(id),
  amount DECIMAL(12,2) NOT NULL,
  period VARCHAR(20), -- 'monthly', 'semester', 'yearly'
  month VARCHAR(20),
  year INT,
  due_date DATE,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

## Debugging

### Cek Supabase Connection

Buka browser console (F12 → Console) untuk melihat:

```
[Supabase] URL configured: true
[Supabase] Key configured: true
[Supabase] Client initialized successfully
```

### License Verification Logs

Saat mengaktifkan license, lihat logs:

```
[License Verification] Checking license key: KK-2024-ABCD-1234
[License Verification] USE_MOCK: false
[License Verification] Checking mock data...
[License Verification] Found in Supabase: {id: "...", status: "active"}
```

### Troubleshooting

**Error: "Kode lisensi tidak valid atau belum terdaftar"**

Solusi:
1. Pastikan license key sudah dibuat di admin panel
2. Periksa format: KK-YYYY-AAAA-DDDD
3. Pastikan status license adalah 'active'
4. Buka DevTools → Console untuk melihat error details

**Error: "Missing Supabase environment variables"**

Solusi:
1. Pastikan `.env.local` sudah ada dengan credentials
2. Restart dev server
3. Check bahwa NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY sudah di-set

**Connection Timeout**

Solusi:
1. Pastikan internet connection stabil
2. Check status Supabase di dashboard
3. Verify NEXT_PUBLIC_SUPABASE_URL correct

## Data Synchronization

### Real-time Updates

Untuk fitur real-time (optional, memerlukan konfigurasi tambahan):

```typescript
const supabase = createClient()

// Subscribe ke perubahan
const subscription = supabase
  .channel('licenses')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'licenses' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Backup Strategy

1. Regular backups di Supabase (built-in)
2. Export data monthly via Supabase dashboard
3. Implement backup API endpoint jika diperlukan

## Security Notes

- Publishable key hanya bisa read data publik
- Row Level Security (RLS) dapat dikonfigurasi untuk keamanan lebih
- Sensitive operations harus menggunakan service role key (server-side only)
- Database sebelumnya menggunakan mock data - data lama perlu dimigrase

## Migration dari Mock Data ke Supabase

Jika sudah punya data dari mock storage:

1. Export data dari localStorage / mock store
2. Buat script migration ke Supabase
3. Jalankan migration
4. Verify data sudah ada di Supabase

Contoh migration:
```typescript
async function migrateData() {
  const supabase = await createClient()
  
  // Get mock data
  const mockLicenses = getMockLicenses()
  
  // Insert ke Supabase
  const { data, error } = await supabase
    .from('licenses')
    .insert(mockLicenses)
    .select()
  
  if (error) console.error('Migration failed:', error)
  else console.log('Migrated', data.length, 'licenses')
}
```

## API Endpoints yang Bisa Dibuat

Untuk enhanced functionality, bisa membuat API endpoints:

```typescript
// app/api/licenses/route.ts
import { createClient } from '@/app/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('licenses').select()
  return Response.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('licenses')
    .insert(body)
    .select()
    .single()
  
  if (error) return Response.json({ error }, { status: 400 })
  return Response.json(data)
}
```

## Next Steps

1. ✓ Supabase sudah terintegrasi
2. ✓ Environment variables sudah dikonfigurasi
3. Create database tables (SQL provided above)
4. Generate license keys di admin panel
5. Test license activation di aplikasi
6. (Optional) Setup RLS policies untuk keamanan
7. (Optional) Setup real-time subscriptions
8. (Optional) Migrate existing data dari mock ke Supabase

## Support

Untuk bantuan lebih lanjut:
- Lihat Supabase docs: https://supabase.com/docs
- Check browser console untuk debug logs
- Review file `app/lib/licenseVerification.ts` untuk verification logic
