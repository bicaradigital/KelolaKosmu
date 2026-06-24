# Cara Mendapatkan License Key KELOLA KOSMU

## Untuk User (Pengguna Kos)

### Cara 1: Hubungi Admin Langsung

1. **Hubungi admin KELOLA KOSMU** melalui:
   - Email
   - WhatsApp
   - Telepon

2. **Informasi yang diperlukan:**
   - Nama perusahaan/kos
   - Nama pemilik
   - Email
   - Nomor telepon

3. **Admin akan memberikan:**
   - License key dalam format: `KK-YYYY-AAAA-DDDD`
   - Contoh: `KK-2024-ABCD-1234`

4. **Untuk mengakses aplikasi:**
   - Buka https://kelolakosmu.id (atau domain Anda)
   - Masukkan license key
   - Selesai! Bisa mulai setup awal dan akses dashboard

### Cara 2: Request License Online

1. **Pergi ke halaman Request License** (URL akan disediakan)
2. **Isi form dengan data:**
   - Nama perusahaan/kos
   - Nama pemilik
   - Email
   - Nomor telepon
3. **Kirim request**
4. **Tunggu approval dari admin** (biasanya 1-2 hari kerja)
5. **Admin akan kirim license key** via email

## Untuk Admin

### Setup Awal

1. **Buat Supabase Project:**
   - Pergi ke https://supabase.com
   - Buat project baru
   - Dapatkan Supabase URL dan Anon Key

2. **Setup Database:**
   - Buka SQL Editor di Supabase dashboard
   - Jalankan SQL schema dari `SUPABASE_SETUP.md`
   - Buat tabel `licenses` dan `license_requests`

3. **Setup Environment Variables:**
   - Add ke `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
     ```

### Cara Membuat License Key

1. **Login ke Admin Panel:**
   - URL: `/admin`
   - Password: `kelola_kosmu_admin` (ubah ini di production!)

2. **Di Dashboard Admin:**
   - Klik "Buat Lisensi"
   - Isi:
     - Nama Pembeli: `PT Nama Kos`
     - Catatan: `Opsional - untuk tracking`
     - Jumlah Lisensi: `1` (atau lebih untuk bulk)

3. **Sistem otomatis akan:**
   - Generate license key: `KK-2024-ABCD-1234`
   - Simpan ke database
   - Tampilkan license key untuk di-copy

4. **Berikan license key ke user:**
   - Copy license key
   - Kirim via email/WhatsApp/cara lain
   - User bisa langsung pakai untuk login

### Manage License Keys

**Di Admin Dashboard, bisa:**
- Lihat semua license keys yang sudah dibuat
- Search by license key atau nama pembeli
- Lihat status (active/inactive)
- Toggle status (enable/disable)
- Copy license key ke clipboard
- Lihat statistik:
  - Total licenses
  - Active licenses
  - Inactive licenses
  - Utilization percentage

### Review License Requests (Optional)

1. **Pergi ke tab "License Requests"**
2. **Lihat daftar requests yang pending**
3. **Approve atau reject:**
   - Klik "Approve" → sistem auto-generate license key
   - Klik "Reject" → dengan alasan
4. **User akan dapat notifikasi** (jika implemented)

## Format License Key

```
KK-YYYY-AAAA-DDDD

KK    = Kelola Kosmu (prefix tetap)
YYYY  = Tahun (4 digit, contoh: 2024, 2025)
AAAA  = Random alphanumeric (4 karakter)
DDDD  = Random digit (4 digit)
```

**Contoh license key yang valid:**
- `KK-2024-ABCD-1234`
- `KK-2024-WXYZ-5678`
- `KK-2025-MNOP-9999`

## Validasi License

Ketika user memasukkan license key:

1. **Format Check:**
   - Harus exact format: `KK-YYYY-AAAA-DDDD`
   - Rejected jika: `KELOLA-*`, `TRIAL-*`, atau string random

2. **Database Check:**
   - License key harus ada di database
   - Status harus "active"
   - Belum mencapai expiration date

3. **Device Check:**
   - License terikat ke device fingerprint
   - Satu license hanya bisa active di satu device
   - Ubah device = perlu re-activate dengan manual verification

## Troubleshooting

### User tidak bisa input license key
- Pastikan format sesuai: `KK-YYYY-AAAA-DDDD`
- Pastikan tidak ada spasi di awal/akhir
- Cek apakah license sudah dibuat di admin panel

### License key tidak diterima
- License key belum ada di database
- Hubungi admin untuk membuat license key
- Atau submit request di halaman Request License

### Admin tidak bisa login ke admin panel
- Password default: `kelola_kosmu_admin`
- Pastikan mengakses `/admin`
- Jika lupa password, ubah di file `.env.local`: `ADMIN_PASSWORD`

### License key tidak valid padahal sudah dibuat
- Pastikan license status "active" di admin dashboard
- Cek expiration date
- Device fingerprint mungkin berubah → re-activate diperlukan

## Timeline Implementasi

1. **Day 1-2:** Setup Supabase database
2. **Day 3:** Test admin panel + create sample licenses
3. **Day 4:** Setup license request form (optional)
4. **Day 5:** Deploy to production + test dengan user
5. **Day 6+:** Monitor dan optimize

## Security Notes

- **License key tidak boleh di-share** antar user/device
- **Admin password harus di-ubah** dari default di production
- **Supabase Anon Key aman** untuk dipublikasikan (hanya read data)
- **Service Role Key harus tetap private** (simpan di `.env.local` saja)
- Implement IP whitelisting di production untuk extra security
