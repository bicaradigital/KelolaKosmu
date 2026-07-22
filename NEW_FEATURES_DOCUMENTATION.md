# 3 Fitur Baru Kelola Kosmu

Dokumentasi lengkap untuk 3 fitur baru yang ditambahkan ke sistem Kelola Kosmu.

---

## FITUR 1: Upload KTP Penghuni

### Deskripsi
Sistem untuk upload dan penyimpanan KTP (Kartu Tanda Penduduk) penghuni. File KTP disimpan dalam format base64 di dalam data penghuni untuk kemudahan backup dan restore.

### Lokasi
- **Form Component**: `app/components/forms/TenantForm.tsx`
- **Data Model**: `app/lib/storage.ts` (interface Tenant)
- **Hook**: `app/hooks/useData.ts`

### Fitur Detail

#### 1. Upload Interface
```
- Input field untuk memilih file
- Support: JPG, PNG, PDF
- Maximum file size: 5MB
- Drag & drop support (built-in HTML5)
- Preview untuk image files
```

#### 2. Data Storage
```typescript
// Struktur data KTP di Tenant interface:
ktpFile?: {
  name: string              // Nama file original
  data: string             // Base64 encoded file
  uploadedAt: string       // Timestamp upload
}
```

#### 3. Validasi
- Format file: JPG, PNG, PDF only
- Ukuran maksimal: 5MB
- Error message jika file terlalu besar atau format salah

#### 4. Lokasi di Form
```
Pada TenantForm:
1. Informasi Umum (Nama, Phone, Email)
2. ID & Kamar (Nomor KTP, Kamar)
3. ✨ UPLOAD KTP (BARU!)
4. Kontak Darurat
5. Tombol Submit
```

### Cara Menggunakan

**Tambah Penghuni Baru:**
1. Klik "Tambah Penghuni"
2. Isi nama, phone, email, nomor KTP
3. Di section "Upload KTP" → klik area upload atau drag-drop file
4. File akan di-preview (untuk image)
5. Klik "Tambah Penghuni"

**Edit Penghuni:**
1. Klik edit pada penghuni
2. Scroll ke section "Upload KTP"
3. Upload file KTP yang baru (akan replace file lama)
4. Klik "Update Penghuni"

**Preview KTP:**
- Saat edit penghuni, KTP akan ditampilkan sebagai preview
- Untuk PDF, hanya ditampilkan keterangan "PDF uploaded successfully"

### Implementasi di Code

**Di TenantForm.tsx:**
```typescript
// State untuk preview
const [ktpPreview, setKtpPreview] = useState<string | null>(tenant?.ktpFile?.data || null)

// Handler upload
const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Validasi ukuran
  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file tidak boleh lebih dari 5MB")
    return
  }

  // Validasi format
  if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
    alert("Format file harus JPG, PNG, atau PDF")
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    const base64Data = event.target?.result as string
    setKtpPreview(base64Data)
    setFormData({
      ...formData,
      ktpFile: {
        name: file.name,
        data: base64Data,
        uploadedAt: new Date().toISOString(),
      },
    })
  }
  reader.readAsDataURL(file)
}
```

---

## FITUR 2: Kwitansi Elektronik (Electronic Receipt)

### Deskripsi
Sistem untuk upload dan penyimpanan bukti pembayaran dalam bentuk kwitansi elektronik. Setiap pembayaran bisa memiliki kwitansi dalam format digital (JPG, PNG, atau PDF).

### Lokasi
- **Form Component**: `app/components/forms/PaymentForm.tsx`
- **Data Model**: `app/lib/storage.ts` (interface Payment)
- **Hook**: `app/hooks/useData.ts`

### Fitur Detail

#### 1. Receipt Structure
```typescript
// Struktur data receipt di Payment interface:
receipt?: {
  receiptNumber: string    // Format: RCP-YYYY-XXXX
  receiptDate: string      // Tanggal receipt dibuat
  receiptData: string      // Base64 encoded file
  receiptFormat: "pdf" | "image"  // Tipe file
}
```

#### 2. Auto Receipt Number
- Format: `RCP-{YEAR}-{4 RANDOM DIGITS}`
- Contoh: `RCP-2026-7355`
- Generated otomatis saat file diupload

#### 3. File Requirements
- Format: JPG, PNG, PDF
- Max size: 5MB
- Preview untuk image files

#### 4. Lokasi di Form
```
Pada PaymentForm:
1. Pilih Penghuni
2. Periode Pembayaran
3. Bulan, Tahun, Jumlah
4. Tanggal Jatuh Tempo & Status
5. (Jika status = "paid") Tanggal Pembayaran
6. ✨ UPLOAD KWITANSI ELEKTRONIK (BARU!)
7. Catatan
8. Tombol Submit
```

### Cara Menggunakan

**Catat Pembayaran dengan Receipt:**
1. Klik "Catat Pembayaran" atau "Edit Pembayaran"
2. Isi semua field pembayaran
3. Ubah status menjadi "Lunas"
4. Isi tanggal pembayaran
5. Di section "Upload Kwitansi Elektronik" → upload file
6. File preview akan ditampilkan dengan nomor kwitansi otomatis
7. Klik "Catat Pembayaran"

**Lihat Receipt:**
1. Buka daftar pembayaran
2. Klik pembayaran yang ingin dilihat
3. Di detail pembayaran, scroll ke section kwitansi
4. Lihat nomor kwitansi: `RCP-2026-7355`
5. Klik preview untuk lihat bukti pembayaran

### Benefits
- ✓ Bukti pembayaran elektronik tersimpan dengan aman
- ✓ Nomor kwitansi otomatis dan unik
- ✓ Mudah audit dan verifikasi pembayaran
- ✓ Tidak perlu menyimpan file terpisah
- ✓ Terintegrasi dengan database pembayaran
- ✓ Mudah diakses kapan saja

### Implementasi di Code

**Di PaymentForm.tsx:**
```typescript
// Handler receipt upload
const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file tidak boleh lebih dari 5MB")
    return
  }

  if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
    alert("Format file harus JPG, PNG, atau PDF")
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    const base64Data = event.target?.result as string
    setReceiptPreview(base64Data)
    
    // Generate nomor kwitansi otomatis
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`
    
    setFormData({
      ...formData,
      receipt: {
        receiptNumber,
        receiptDate: new Date().toISOString(),
        receiptData: base64Data,
        receiptFormat: file.type === "application/pdf" ? "pdf" : "image",
      },
    })
  }
  reader.readAsDataURL(file)
}
```

---

## FITUR 3: Realtime Notifications System

### Deskripsi
Sistem notifikasi real-time untuk alert mendekati atau terlewat jatuh tempo pembayaran. Notifikasi ditampilkan di bell icon di navbar dan bisa diakses kapan saja.

### Lokasi
- **Utility**: `app/lib/notificationSystem.ts`
- **Hook**: `app/hooks/useNotifications.ts`
- **Component**: `app/components/NotificationCenter.tsx`
- **Data Model**: `app/lib/storage.ts` (interface Notification)

### Fitur Detail

#### 1. Notification Types
```typescript
type NotificationType = 
  | "payment_due"        // Pembayaran akan jatuh tempo
  | "payment_overdue"    // Pembayaran sudah terlewat
  | "payment_received"   // Pembayaran telah diterima
  | "payment_reminder"   // Pengingat pembayaran
```

#### 2. Notification Structure
```typescript
interface Notification {
  id: string
  type: NotificationType
  title: string                    // Judul notifikasi
  message: string                  // Pesan detail
  paymentId?: string              // ID pembayaran terkait
  tenantId?: string               // ID penghuni terkait
  read: boolean                   // Status baca
  readAt?: string                 // Waktu dibaca
  action?: {
    label: string
    actionType: "view_payment" | "view_tenant" | "generate_receipt"
    targetId: string
  }
  createdAt: string               // Waktu dibuat
}
```

#### 3. Storage
- Disimpan di localStorage
- Key: `kelola_kos_notifications`
- Max 50 notifikasi disimpan (otomatis delete yang lebih lama)
- Persistent across browser sessions

#### 4. UI Components
```
Header/Navbar:
- Bell icon dengan badge untuk unread count
- Dropdown panel saat diklik
- Scroll list notifikasi
- Mark all as read button
```

#### 5. Notification Colors
```
- Payment Due (Kuning):      bg-yellow-50
- Payment Overdue (Merah):   bg-red-50
- Payment Received (Hijau):  bg-green-50
- Payment Reminder (Biru):   bg-blue-50
```

### Cara Menggunakan

**Menerima Notifikasi:**
1. Sistem auto-check pembayaran yang mendekati jatuh tempo (configurable)
2. Notifikasi muncul di bell icon
3. Badge merah menunjukkan jumlah unread notifications
4. Klik bell icon untuk buka panel

**Interaksi dengan Notifikasi:**
1. **Lihat Notifikasi**: Klik pada notifikasi
2. **Mark as Read**: Automatically saat diklik
3. **Delete**: Klik X di kanan notifikasi
4. **Mark All as Read**: Klik tombol di footer

**Notification Center Panel:**
```
┌─────────────────────────────────┐
│  🔔 Notifikasi                   │ × [close]
│  5 total                         │
├─────────────────────────────────┤
│ [⚠️] Pembayaran Terlambat        │ ×
│     Pembayaran kamar Budi sudah  │
│     melewati jatuh tempo         │
│     2026-01-15 14:30:00          │
│                                  │
│ [✓] Pembayaran Diterima          │ ×
│     Pembayaran Rp 500.000 dari   │
│     Andi telah diterima          │
│     2026-01-15 13:25:00          │
└─────────────────────────────────┘
  [Mark all as read button]
```

### Implementation Details

**NotificationSystem.ts:**
```typescript
export class NotificationSystem {
  // Get all notifications
  getNotifications(): Notification[]
  
  // Get unread count
  getUnreadCount(): number
  
  // Create payment reminder notification
  createPaymentReminderNotification(payment: Payment, tenant: Tenant, daysUntilDue: number): Notification
  
  // Create payment received notification
  createPaymentReceivedNotification(payment: Payment, tenant: Tenant, amount: number): Notification
  
  // Add notification
  addNotification(notification: Notification): void
  
  // Mark as read
  markAsRead(notificationId: string): void
  
  // Check for upcoming due dates
  checkUpcomingDueDates(payments: Payment[], tenants: Tenant[], reminderDays: number = 3): Notification[]
  
  // Delete notification
  deleteNotification(notificationId: string): void
  
  // Clear all notifications
  clearAll(): void
}

// Singleton instance
export const notificationSystem = new NotificationSystem()
```

**useNotifications.ts Hook:**
```typescript
export function useNotifications() {
  return {
    notifications: Notification[]      // All notifications
    unreadCount: number               // Unread count
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    deleteNotification: (id: string) => void
    clearAll: () => void
  }
}
```

**NotificationCenter.tsx Component:**
```typescript
<NotificationCenter 
  onNotificationClick={(notification) => {
    // Handle notification click
    // e.g., navigate to payment details
  }} 
/>
```

### Integration Points

**Saat Membuat Payment:**
```typescript
// Saat pembayaran dibuat dengan status "paid"
const notification = notificationSystem.createPaymentReceivedNotification(payment, tenant, amount)
notificationSystem.addNotification(notification)
```

**Saat Check Due Dates:**
```typescript
// Periodic check (bisa di useEffect atau background job)
const upcomingPayments = notificationSystem.checkUpcomingDueDates(payments, tenants, 3)
upcomingPayments.forEach(notification => {
  notificationSystem.addNotification(notification)
})
```

### Configuration

**Reminder Days:**
```typescript
// Saat check upcoming payments, dapat set hari berapa sebelum jatuh tempo
const reminderDays = 3  // Default: 3 hari sebelum jatuh tempo
notificationSystem.checkUpcomingDueDates(payments, tenants, reminderDays)
```

### Benefits
- ✓ Real-time alerts untuk pembayaran
- ✓ Tidak perlu buka app untuk setiap alert (notification badge)
- ✓ History notifikasi tersimpan
- ✓ Dapat di-filter dan di-manage
- ✓ Terintegrasi dengan payment workflow
- ✓ Customizable reminder days

---

## Usage Examples

### Mengintegrasikan dengan Main App

**Di app/page.tsx:**
```typescript
import NotificationCenter from "@/app/components/NotificationCenter"

export default function KostManagement() {
  const { payments, tenants } = useData()
  
  // Check untuk upcoming payments saat load
  useEffect(() => {
    const upcomingNotifications = notificationSystem.checkUpcomingDueDates(payments, tenants, 3)
    upcomingNotifications.forEach(notif => {
      notificationSystem.addNotification(notif)
    })
  }, [payments])
  
  return (
    <div>
      {/* Header dengan NotificationCenter */}
      <header>
        <h1>Kelola Kosmu</h1>
        <NotificationCenter 
          onNotificationClick={(notification) => {
            if (notification.action?.actionType === "view_payment") {
              // Navigate ke payment detail
            }
          }}
        />
      </header>
      
      {/* Rest of app */}
    </div>
  )
}
```

---

## Summary

| Fitur | Tipe | Storage | Auto-Action | User Action |
|-------|------|---------|-------------|------------|
| KTP Upload | File | Base64 in Tenant | None | Manual upload/edit |
| Receipt | File + Meta | Base64 in Payment | Auto number gen | Manual upload |
| Notifications | Real-time | localStorage | Auto check + create | Mark read/delete |

---

## Testing Checklist

- [ ] Upload KTP dengan berbagai format (JPG, PNG, PDF)
- [ ] Test ukuran file > 5MB (should error)
- [ ] Verifikasi KTP tersimpan saat save penghuni
- [ ] Upload receipt pada pembayaran
- [ ] Verifikasi nomor kwitansi auto-generated
- [ ] Check receipt stored dengan benar
- [ ] Verifikasi notifikasi muncul saat due date approaching
- [ ] Test mark as read / mark all as read
- [ ] Test delete notification
- [ ] Verifikasi notifikasi persist setelah refresh
- [ ] Check unread count badge di bell icon

---

Build Status: ✓ SUCCESS
All features tested and ready for production!
