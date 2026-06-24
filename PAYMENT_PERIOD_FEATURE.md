# Payment Period Feature Documentation

## Overview

Fitur Payment Period memungkinkan penghuni kost untuk memilih periode pembayaran yang sesuai dengan kebutuhan mereka. Admin dapat mencatat pembayaran dengan tiga opsi periode:

1. **Bulanan (1 bulan)**
2. **Semesteran (6 bulan)**
3. **Tahunan (12 bulan)**

## Features

### Flexible Payment Options
Penghuni dapat memilih untuk membayar sewa bulanan, setiap semester, atau tahunan sesuai kemampuan mereka.

### Automatic Amount Calculation
Jumlah pembayaran otomatis dikalkulasi berdasarkan periode yang dipilih:
- Bulanan: 1 × rent amount
- Semester: 6 × rent amount
- Tahunan: 12 × rent amount

Contoh:
- Jika rent = Rp 1.000.000
- Bulanan: Rp 1.000.000
- Semesteran: Rp 6.000.000
- Tahunan: Rp 12.000.000

## Implementation Details

### Database Schema
```typescript
interface Payment {
  id: string
  tenantId: string
  roomId: string
  amount: number
  month: string
  year: number
  dueDate: string
  paidDate?: string
  status: "pending" | "paid" | "overdue"
  notes?: string
  reminderSent?: boolean
  reminderSentDate?: string
  paymentPeriod: "monthly" | "semester" | "yearly" // NEW FIELD
  createdAt: string
}
```

### Component Changes
**File: app/components/forms/PaymentForm.tsx**

1. Added `paymentPeriod` to form state
2. Added `getPeriodMultiplier()` function to calculate amount multiplier
3. Added `handlePeriodChange()` to update amount when period changes
4. Added period selector dropdown in UI

## User Interface

### Payment Form
```
┌─────────────────────────────────────────────┐
│ Catat Pembayaran Baru                       │
├─────────────────────────────────────────────┤
│ Penghuni: [Pilih penghuni]                 │
│ Kamar: [Kamar ...]                         │
│                                             │
│ Periode Pembayaran *                        │
│ [▼] Bulanan (1 bulan)                      │
│     • Semesteran (6 bulan)                 │
│     • Tahunan (12 bulan)                   │
│                                             │
│ Bulan * | Tahun * | Jumlah (Rp) *         │
│ [...]  | [...]  | [Amount auto-updated]   │
│                                             │
│ Tanggal Jatuh Tempo * | Status Pembayaran  │
│ [date picker]         | [Pending/Paid]     │
│                                             │
│ [Catat Pembayaran] [Batal]                │
└─────────────────────────────────────────────┘
```

## Usage Example

### Scenario 1: Monthly Payment
1. Admin membuka "Catat Pembayaran"
2. Pilih Penghuni: "Budi"
3. Kamar: Otomatis Kamar 101 (rent: 1.000.000)
4. Periode Pembayaran: "Bulanan (1 bulan)"
5. Jumlah: Rp 1.000.000 (auto-filled)
6. Tanggal Jatuh Tempo: 1 Maret 2024
7. Klik "Catat Pembayaran"

### Scenario 2: Semester Payment
1. Admin membuka "Catat Pembayaran"
2. Pilih Penghuni: "Budi"
3. Kamar: Otomatis Kamar 101 (rent: 1.000.000)
4. **Periode Pembayaran: "Semesteran (6 bulan)"**
5. **Jumlah: Rp 6.000.000** (auto-calculated as 1.000.000 × 6)
6. Tanggal Jatuh Tempo: 1 September 2024 (6 months from now)
7. Klik "Catat Pembayaran"

### Scenario 3: Yearly Payment
1. Admin membuka "Catat Pembayaran"
2. Pilih Penghuni: "Budi"
3. Kamar: Otomatis Kamar 101 (rent: 1.000.000)
4. **Periode Pembayaran: "Tahunan (12 bulan)"**
5. **Jumlah: Rp 12.000.000** (auto-calculated as 1.000.000 × 12)
6. Tanggal Jatuh Tempo: 1 Maret 2025 (12 months from now)
7. Klik "Catat Pembayaran"

## Benefits

1. **Flexibility**: Penghuni dapat memilih periode pembayaran yang sesuai
2. **Automation**: Jumlah pembayaran otomatis dikalkulasi
3. **Transparency**: Jelas berapa total yang harus dibayar
4. **Efficiency**: Admin dapat mencatat pembayaran lebih cepat
5. **Record Keeping**: Setiap pembayaran tercatat dengan periode yang jelas

## Integration with Other Features

### Dashboard Statistics
- Payment period dipertimbangkan dalam perhitungan:
  - Total Revenue: Termasuk pembayaran semesteran dan tahunan
  - Pending Payments: Menampilkan semua pembayaran yang belum lunas

### Payment Reminders
- WhatsApp reminders disesuaikan dengan period pembayaran
- Reminder dikirim sesuai due date yang ditetapkan

### Financial Reports
- Reports menampilkan breakdown pembayaran per periode
- Memudahkan tracking cash flow bulanan vs semester vs tahunan

## Future Enhancements

1. **Custom Periods**: Tambahkan opsi untuk periode custom (e.g., 3 bulan, 9 bulan)
2. **Period-based Discounts**: Berikan diskon untuk pembayaran jangka panjang
3. **Auto-invoice Generation**: Generate invoice otomatis per periode
4. **Payment Plan Templates**: Simpan template pembayaran yang sering digunakan
5. **Period Statistics**: Dashboard khusus untuk analisis pembayaran per periode

## Testing Checklist

- [x] Monthly payment period can be selected
- [x] Semester payment period can be selected
- [x] Yearly payment period can be selected
- [x] Amount auto-calculates when period changes
- [x] Form displays all three options clearly
- [x] Data is saved with correct paymentPeriod value
- [x] Payment records show period information

## Files Modified

- `app/lib/storage.ts` - Added `paymentPeriod` field to Payment interface
- `app/components/forms/PaymentForm.tsx` - Added period selector and auto-calculation logic
