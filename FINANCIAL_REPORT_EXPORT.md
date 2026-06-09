# Fitur Export Laporan Keuangan

## Deskripsi Fitur

Fitur export laporan keuangan memungkinkan pengguna untuk mengekspor data pemasukan dan pengeluaran dalam dua format:
- **CSV** - Format spreadsheet untuk analisis data lebih lanjut
- **PDF** - Format dokumen profesional untuk presentasi dan arsip

Laporan dapat difilter berdasarkan rentang tanggal dan menampilkan ringkasan terkelompok per kategori.

## File yang Ditambahkan

### 1. `app/lib/reportExporter.ts`
Utility library untuk menghasilkan laporan keuangan dalam format CSV dan PDF.

#### Interface
```typescript
interface FinancialRecord {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  paymentMethod?: string
}

interface GroupedFinancialData {
  income: { [category: string]: FinancialRecord[] }
  expense: { [category: string]: FinancialRecord[] }
}

interface CategorySummary {
  category: string
  total: number
  count: number
  records: FinancialRecord[]
}
```

#### Fungsi Utama

**`groupRecordsByCategory(records: FinancialRecord[]): GroupedFinancialData`**
- Mengelompokkan records berdasarkan tipe (income/expense) dan kategori
- Mengembalikan struktur data terkelompok

**`calculateCategoryTotals(grouped: GroupedFinancialData)`**
- Menghitung total dan count untuk setiap kategori
- Mengembalikan array CategorySummary untuk income dan expense

**`generateCSV(records, kosName, startDate, endDate): string`**
- Generate CSV content dengan format:
  ```
  Laporan Keuangan - [Nama Kos]
  Periode: [Tanggal Mulai] - [Tanggal Akhir]
  
  PEMASUKAN
  Kategori,Jumlah,Jumlah Transaksi,Rincian
  [Kategori1],[Total1],[Count1],"[Rincian Detail]"
  ...
  Total Pemasukan,[Total],,...
  
  PENGELUARAN
  Kategori,Jumlah,Jumlah Transaksi,Rincian
  [Kategori1],[Total1],[Count1],"[Rincian Detail]"
  ...
  Total Pengeluaran,[Total],,...
  
  SALDO BERSIH,[Net],,...
  ```

**`generatePDF(records, kosName, startDate, endDate): jsPDF`**
- Generate PDF dokumen profesional dengan:
  - Header dengan nama kos dan periode
  - Tabel income terkelompok per kategori (header biru)
  - Total pemasukan
  - Tabel expense terkelompok per kategori (header merah)
  - Total pengeluaran
  - Summary box dengan saldo surplus/defisit
  - Footer dengan waktu pembuatan

**`exportToCSV(records, kosName, startDate, endDate, filename): void`**
- Mengunduh CSV file ke client
- Format filename: `Laporan-Keuangan-[StartDate]_[EndDate].csv`

**`exportToPDF(records, kosName, startDate, endDate, filename): void`**
- Mengunduh PDF file ke client
- Format filename: `Laporan-Keuangan-[StartDate]_[EndDate].pdf`

### 2. `app/components/FinancialReportExporter.tsx`
Komponen React untuk UI export laporan keuangan.

#### Props
```typescript
interface FinancialReportExporterProps {
  records: FinancialRecord[]
  kosName: string
}
```

#### Features

**Date Range Picker**
- Input tanggal mulai dan akhir
- Validasi: endDate tidak boleh sebelum startDate
- Default: bulan saat ini

**Summary Statistics**
- Total Pemasukan (dengan jumlah transaksi)
- Total Pengeluaran (dengan jumlah transaksi)
- Saldo Surplus/Defisit (dinamis berubah warna)

**Export Buttons**
- Export CSV button (outline style)
- Export PDF button (red background)
- Disabled ketika data kosong atau sedang mengexport

**Category Breakdown**
- Menampilkan ringkasan per kategori untuk income dan expense
- Setiap kategori menampilkan: nama, jumlah transaksi, total

## Integrasi di Financial Tab

Komponen `FinancialReportExporter` diintegrasikan di `app/page.tsx` dalam Financial tab:

```typescript
{boardingHouse && (
  <FinancialReportExporter
    records={financialRecords.map((record) => ({
      id: record.id,
      type: record.type as 'income' | 'expense',
      category: financialCategories.find((cat) => cat.id === record.category)?.name || record.category,
      description: record.description,
      amount: record.amount,
      date: record.date,
      paymentMethod: record.paymentMethod,
    }))}
    kosName={boardingHouse.name || 'Laporan Keuangan'}
  />
)}
```

## Dependencies

```json
{
  "jspdf": "^4.2.1",
  "jspdf-autotable": "^5.0.8",
  "date-fns": "^4.4.0"
}
```

## Penggunaan

### Admin akan melihat komponen FinancialReportExporter di Financial Tab dengan:

1. **Pilih Periode**
   - Input date untuk tanggal mulai
   - Input date untuk tanggal akhir
   - Auto-filled dengan bulan saat ini

2. **Lihat Summary**
   - Statistik real-time berdasarkan periode yang dipilih
   - Total income, expense, dan net income

3. **Export Data**
   - Klik "Export CSV" untuk mengunduh spreadsheet
   - Klik "Export PDF" untuk mengunduh dokumen resmi

4. **Analisis Breakdown**
   - Lihat ringkasan per kategori di bawah
   - Setiap kategori menunjukkan detail transaksi

## Format Output

### CSV Format
- Separator: koma
- Encoding: UTF-8
- Struktur terpisah untuk income, expense, dan summary
- Tanggal dalam format: DD/MM/YYYY
- Mata uang: IDR dengan pemformatan

### PDF Format
- Ukuran: A4
- Header berwarna (blue untuk income, red untuk expense)
- Responsive table layout
- Professional styling dengan warna kategori
- Summary box dengan highlight
- Footer dengan timestamp

## Contoh Output File

**CSV Filename:**
```
Laporan-Keuangan-01-06-2026_30-06-2026.csv
```

**PDF Filename:**
```
Laporan-Keuangan-01-06-2026_30-06-2026.pdf
```

## Fitur Keamanan & Validation

- Date validation: end date harus >= start date
- Null check untuk boarding house name
- Empty data handling dengan pesan warning
- Format currency sesuai locale Indonesia (IDR)

## Future Enhancements

- [ ] Email laporan langsung
- [ ] Schedule laporan otomatis
- [ ] Custom date range templates (This Month, Last Quarter, dll)
- [ ] Advanced filtering (payment method, tags)
- [ ] Comparison laporan periode berbeda
- [ ] Export dalam format lain (Excel, XML)
- [ ] Chart/graph di PDF export
- [ ] Watermark untuk laporan resmi

## Troubleshooting

**PDF tidak terdownload**
- Cek browser settings untuk block downloads
- Verify jsPDF library sudah loaded
- Check console untuk error messages

**CSV data tidak correct**
- Verify date range selection
- Check category names di storage
- Verify currency formatting di browser locale

**Performance issues**
- Jika data terlalu banyak (>10k records), pertimbangkan date range lebih kecil
- Optimize grouping logic jika perlu

## Technical Notes

- CSV generation menggunakan native JavaScript string concatenation
- PDF generation menggunakan jsPDF library dengan autoTable plugin
- Date formatting menggunakan date-fns dengan locale Indonesia
- Currency formatting menggunakan Intl.NumberFormat untuk localization
- All calculations dilakukan client-side (no server load)
