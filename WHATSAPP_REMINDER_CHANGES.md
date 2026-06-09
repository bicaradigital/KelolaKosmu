# WhatsApp Reminder - Simplified wa.me Link Implementation

## Overview
Fitur reminder WhatsApp telah disederhanakan menggunakan wa.me link otomatis, sehingga pengguna tidak perlu mengkonfigurasi WhatsApp Business API. Pesan sudah terisi otomatis dan tinggal diklik untuk mengirim.

## Perubahan yang Dilakukan

### 1. **File: `app/lib/whatsapp.ts`**
- Menambahkan fungsi baru `generateWhatsAppLink()` yang membuat wa.me link otomatis
- Format link: `https://wa.me/{phoneNumber}?text={encodedMessage}`
- Pesan otomatis: `Halo {nama}, sewa kamar {nomor kamar} jatuh tempo {tanggal}`
- Format tanggal: DD/MM/YYYY (contoh: 15/06/2026)

```typescript
export const generateWhatsAppLink = (
  phoneNumber: string,
  tenantName: string,
  roomNumber: string,
  dueDate: string,
): string => {
  const formattedPhone = formatPhoneNumber(phoneNumber)
  const date = new Date(dueDate)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const formattedDate = `${day}/${month}/${year}`
  const messageText = `Halo ${tenantName}, sewa kamar ${roomNumber} jatuh tempo ${formattedDate}`
  const encodedMessage = encodeURIComponent(messageText)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}
```

### 2. **File: `app/components/ReminderManager.tsx`**

#### Import Changes
- Menambahkan `generateWhatsAppLink` ke dalam imports

#### Removed Features
- Menghapus state `sending` dan `results` (tidak lagi diperlukan)
- Menghapus fungsi `sendReminder()` (API-based approach)
- Menghapus fungsi `sendBulkReminders()` (tidak lagi perlu)
- Menghapus tombol "Kirim Semua" (bulk send)

#### UI Changes - Before Due Reminders Section
**Before:**
- Tombol "Kirim" yang mengirim via WhatsApp Business API
- Loading state dan result badges

**After:**
- Link button "Buka WA" yang langsung membuka WhatsApp dengan pesan terisi
- Warna biru untuk before due reminders

#### UI Changes - Overdue Reminders Section
**Before:**
- Tombol "Kirim" (API-based)
- Loading state dan result badges

**After:**
- Link button "Buka WA" (wa.me link)
- Warna merah untuk overdue reminders

## User Flow

1. Admin membuka tab "Reminder WhatsApp"
2. Admin melihat list pembayaran yang perlu diingatkan (sebelum jatuh tempo / terlambat)
3. Admin klik tombol "Buka WA" pada salah satu payment
4. WhatsApp terbuka otomatis dengan:
   - Nomor penghuni yang terdaftar (dari field `phone`)
   - Pesan sudah terisi: "Halo [Nama], sewa kamar [No Kamar] jatuh tempo [Tanggal]"
5. Penghuni tinggal tekan "Send" di WhatsApp

## Keuntungan Implementasi Baru

✅ **Lebih Sederhana** - Tidak perlu setup WhatsApp Business API  
✅ **Lebih Cepat** - User action langsung ke WhatsApp (tidak ada proses API call)  
✅ **Personalisasi** - Pesan otomatis sesuai nama penghuni, nomor kamar, dan tanggal jatuh tempo  
✅ **Mobile Friendly** - Bisa diakses dari mobile dengan mudah  
✅ **Gratis** - Menggunakan wa.me link (free service dari WhatsApp)  

## Technical Notes

- Nomor telepon otomatis diformat ke format internasional (62xxxxx)
- Pesan di-encode menggunakan `encodeURIComponent()` untuk menangani karakter spesial
- Link dibuka di tab baru dengan `target="_blank"` dan `rel="noopener noreferrer"`
- Kompatibel dengan semua perangkat yang memiliki WhatsApp terinstall

## Environment & Configuration

Fitur ini **tidak memerlukan** konfigurasi WhatsApp Business API lagi. Field `whatsappConfig` di Settings masih disimpan untuk backward compatibility, tetapi tidak digunakan untuk reminder wa.me link.
