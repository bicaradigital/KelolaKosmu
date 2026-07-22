# Panduan Kwitansi Digital - Fitur Sharing ke Penyewa

Dokumentasi lengkap untuk sistem kwitansi digital yang dapat dibagikan langsung ke penyewa kos.

---

## Ringkasan Fitur

Sistem **Kwitansi Digital** adalah fitur untuk membuat dan membagikan kwitansi pembayaran elektronik langsung ke penyewa, tanpa perlu print manual atau copy file terpisah.

### Workflow Utama

```
1. Catat Pembayaran (Status: Lunas)
   ↓
2. Klik "Generate Kwitansi Digital"
   ↓
3. Isi Metode Pembayaran & Catatan
   ↓
4. Tanda Tangan Pemilik (Canvas)
   ↓
5. Preview Kwitansi
   ↓
6. Simpan Kwitansi
   ↓
7. Download / Print / Share ke Penyewa
```

---

## Komponen Sistem

### 1. DigitalReceiptGenerator (Wizard)
**File**: `app/components/DigitalReceiptGenerator.tsx`

3-Step Wizard untuk generate kwitansi:

**Step 1: Info Pembayaran**
- Nomor kwitansi (auto-generated): RCP-YYYY-XXXX
- Tanggal: auto-filled dengan tanggal hari ini
- Pilih Metode Pembayaran (dropdown)
  - Cash
  - Bank Transfer
  - E-Wallet
  - Lainnya
- Catatan/Remarks (optional)

**Step 2: Tanda Tangan**
- Canvas signature pad
- Draw signature pemilik/pengelola
- Clear button untuk redraw
- Preview signature

**Step 3: Preview & Save**
- Preview kwitansi profesional
- Verifikasi data
- Klik "Simpan Kwitansi"
- Otomatis diubah ke ReceiptViewer

### 2. ReceiptViewer (View & Share)
**File**: `app/components/ReceiptViewer.tsx`

Interface untuk view dan share kwitansi:

**Info Kwitansi**
- Nomor kwitansi
- Tanggal
- Metode pembayaran
- Status (Lunas/Paid)

**Preview**
- Render kwitansi dalam iframe
- Tampilkan signature pemilik

**Action Buttons**
- Download (HTML file)
- Print (direct print)
- Share (WhatsApp/Email/Native Share)

### 3. DigitalReceiptGenerator Utility
**File**: `app/lib/digitalReceiptGenerator.ts`

Functions:
- `generateReceiptHTML()` - Create professional HTML template
- `generateReceiptNumber()` - Auto-generate RCP-YYYY-XXXX
- `downloadReceiptAsHTML()` - Download as file
- `printReceipt()` - Print directly

### 4. SignaturePad Component
**File**: `app/components/SignaturePad.tsx`

Canvas untuk capture tanda tangan:
- Mouse & touch support
- Clear & Save buttons
- Export as PNG (base64)

---

## Data Structure

### Payment Interface Update

```typescript
digitalReceipt?: {
  receiptNumber: string        // RCP-2026-7355
  receiptDate: string         // Tanggal kwitansi
  generatedAt: string         // Timestamp dibuat
  ownerSignature?: string     // Base64 signature PNG
  paymentMethod: string       // cash, bank_transfer, etc
  note?: string              // Catatan/remarks
  receiptPDF: string         // Full HTML content
}
```

---

## Kwitansi Template

Professional receipt layout dengan elemen:

```
┌─────────────────────────────────────────┐
│      KWITANSI ELEKTRONIK                │
│    Bukti Pembayaran Sewa Kamar          │
├─────────────────────────────────────────┤
│ INFORMASI PEMILIK                       │
│ Nama: [Boarding House Name]             │
│ Alamat: [Address]                       │
│ Phone: [Phone]                          │
│ Email: [Email]                          │
├─────────────────────────────────────────┤
│ INFORMASI PENYEWA                       │
│ Nama: [Tenant Name]                     │
│ No. KTP: [ID Number]                    │
│ Phone: [Tenant Phone]                   │
│ Email: [Tenant Email]                   │
├─────────────────────────────────────────┤
│ DETAIL PEMBAYARAN                       │
│ Nomor Kwitansi: RCP-2026-7355          │
│ Tanggal: 15 Januari 2026                │
│ Kamar: 101                              │
│ Periode: Januari 2026 (Bulanan)        │
│ Metode: Transfer Bank                   │
│ Jumlah: Rp 500.000                      │
│ Tanggal Pembayaran: 15 Januari 2026    │
├─────────────────────────────────────────┤
│ TANDA TANGAN                            │
│                    Pemilik/Pengelola     │
│                    [Signature Image]    │
│                    Nama: ___            │
│                    Tanggal: ___         │
└─────────────────────────────────────────┘
```

---

## Cara Menggunakan

### Generate Kwitansi

1. **Buka Payment Detail** (pembayaran status = "Lunas")
2. **Klik "Generate Kwitansi Digital"**
   - Modal DigitalReceiptGenerator terbuka
3. **Step 1: Isi Info**
   - Nomor kwitansi sudah auto-generated
   - Pilih metode pembayaran
   - Isi catatan (optional)
   - Klik "Lanjut ke Tanda Tangan"
4. **Step 2: Tanda Tangan**
   - Canvas terbuka
   - Draw signature dengan mouse/stylus
   - Klik "Simpan Tanda Tangan"
5. **Step 3: Preview**
   - Review kwitansi
   - Klik "Simpan Kwitansi"
   - Kwitansi disimpan ke Payment record

### Share Kwitansi dengan Penyewa

**Setelah Generate Kwitansi:**

1. **Download**
   - Klik tombol "Download"
   - File `.html` tersimpan
   - Bisa dibuka di browser
   - Bisa di-email ke penyewa

2. **Print**
   - Klik tombol "Print"
   - Browser print dialog terbuka
   - Save as PDF atau print ke printer
   - Beri ke penyewa

3. **Share**
   - Klik tombol "Share"
   - Pilih opsi:
     - Native Share (WhatsApp/Email/SMS)
     - Copy to Clipboard (manual paste ke chat)
   - Penyewa dapat kwitansi langsung

---

## Fitur Detail

### Auto-Generated Receipt Number
```
Format: RCP-YYYY-XXXX
Contoh: RCP-2026-7355

Generated secara random setiap kali membuat kwitansi baru
Menjamin uniknya setiap receipt number
```

### Owner Signature
```
- Capture tanda tangan di SignaturePad
- Disimpan as PNG (base64)
- Ditampilkan di kwitansi
- Sebagai verifikasi otentikasi
```

### Professional Design
```
- Header dengan branding
- Clear section headers
- Professional layout
- Print-friendly CSS
- Responsive design
```

### Download Format
```
- Format: HTML
- Nama file: Kwitansi-RCP-2026-7355.html
- Bisa dibuka di browser apa pun
- Bisa di-print langsung
- Bisa di-email
```

---

## Integration Points

### Dengan Payment Form
```
1. Catat pembayaran di PaymentForm
2. Set status = "Lunas"
3. Klik submit
4. Payment tersimpan
5. (Optional) Generate kwitansi digital
```

### Dengan Payment Detail View
```
1. Buka detail pembayaran
2. Jika status = "Lunas", tampilkan button "Generate Kwitansi"
3. Klik button → buka DigitalReceiptGenerator
4. Atau tampilkan ReceiptViewer jika sudah ada kwitansi
```

### Dengan Settings
```
- Gunakan kosName dari settings
- Gunakan alamat dari settings (jika ada)
- Gunakan phone/email dari settings
- Format default untuk kwitansi
```

---

## Benefits

### Untuk Pemilik Kos
- ✓ Generate kwitansi profesional dengan cepat
- ✓ Signature digital sebagai verifikasi
- ✓ Tidak perlu print manual
- ✓ Arsip digital otomatis
- ✓ Mudah di-audit

### Untuk Penyewa
- ✓ Kwitansi digital profesional
- ✓ Bisa didownload/print sendiri
- ✓ Bisa di-forward ke pihak lain
- ✓ Verifikasi asli (ada signature pemilik)
- ✓ Instant delivery via WhatsApp/Email

---

## Troubleshooting

### Kwitansi tidak muncul setelah generate
- Check: Payment status = "Lunas"?
- Check: Signature sudah di-capture?
- Refresh halaman
- Coba generate ulang

### Signature tidak tersimpan
- Pastikan sudah klik "Simpan Tanda Tangan" di Step 2
- Canvas harus memiliki stroke (jangan kosong)
- Coba draw signature lagi

### Download/Print tidak bekerja
- Check: Browser support HTML5
- Try: Refresh halaman & coba lagi
- Try: Print preview terlebih dahulu

### Share tidak bekerja
- Jika native share tidak tersedia: fallback ke copy clipboard
- Manual paste ke WhatsApp/Email
- Atau gunakan download & email file

---

## Security Considerations

1. **Signature Storage**
   - Disimpan as base64 PNG
   - Tidak di-encrypt (review jika needed)
   - Consider adding: Digital signature timestamp

2. **Receipt Data**
   - HTML stored locally in Payment
   - Consider adding: Server-side signing timestamp
   - Consider adding: QR code for verification

3. **Access Control**
   - Only owner can generate kwitansi
   - Tenant dapat download/view
   - Consider: Role-based access

---

## Future Enhancements

1. **PDF Export** - Export sebagai PDF (bukan HTML)
2. **Email Integration** - Auto-send receipt ke tenant email
3. **QR Code** - Add QR code untuk verification
4. **Digital Signature** - Server-side signing timestamp
5. **Template Customization** - Allow custom receipt design
6. **Batch Generate** - Generate multiple receipts sekaligus
7. **Receipt Archive** - Searchable receipt history
8. **Audit Trail** - Track receipt generation & sharing

---

## Technical Stack

- **Component**: React/Next.js
- **Signature**: HTML5 Canvas
- **Storage**: localStorage (Payment object)
- **Export**: HTML5 Download API
- **Print**: Browser Print API
- **Share**: Navigator.share API

---

## File Locations

```
app/components/DigitalReceiptGenerator.tsx    - Wizard 3-step
app/components/ReceiptViewer.tsx              - View & share
app/components/SignaturePad.tsx               - Canvas signature
app/lib/digitalReceiptGenerator.ts            - Utility functions
app/lib/storage.ts                            - Updated Payment interface
```

---

## Summary

Fitur Kwitansi Digital menyediakan solusi lengkap untuk:
- Generate kwitansi profesional dengan tanda tangan
- Share langsung ke penyewa (download/print/WhatsApp)
- Archive digital otomatis
- Verifikasi otentik dengan signature pemilik

**Status**: ✅ Production Ready

---
