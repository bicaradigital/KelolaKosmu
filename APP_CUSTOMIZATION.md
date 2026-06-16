# KELOLA KOSMU - App Customization Features

## Overview

Fitur customization aplikasi yang telah ditambahkan untuk KELOLA KOSMU mencakup:

1. **Setup Wizard Persistence** - Wizard tidak ditampilkan lagi setelah selesai
2. **License System** - Aktivasi lisensi dengan device fingerprinting
3. **Domain Guard** - Membatasi akses hanya ke domain tertentu

---

## Feature 1: Setup Wizard Persistence

### Deskripsi
Setup wizard hanya ditampilkan sekali. Setelah pengguna menyelesaikan setup, aplikasi tidak akan menampilkan wizard lagi (bahkan setelah refresh atau akses kembali).

### Implementasi

**File-file:**
- `app/lib/setupStorage.ts` - Helper untuk menyimpan setup completion status
- `app/components/SetupWizard.tsx` - Updated untuk memanggil `setSetupCompleted()`
- `app/page.tsx` - Updated untuk check setup completion on mount

**Cara Kerja:**

1. Pengguna membuka aplikasi untuk pertama kali
2. Setup wizard ditampilkan (karena tidak ada boardingHouse data)
3. Pengguna mengisi form dan klik "Selesai"
4. `setSetupCompleted()` disimpan ke localStorage dengan key: `kelola_kosmu_setup_completed`
5. Saat akses kembali, `isSetupCompleted()` check akan skip wizard
6. App langsung menampilkan dashboard

**API:**

```typescript
// Check if setup completed
isSetupCompleted(): boolean

// Mark setup as completed (called automatically when wizard finishes)
setSetupCompleted(): void

// Reset setup (for testing/re-setup)
resetSetupCompletion(): void

// Get setup completion date
getSetupCompletionDate(): Date | null
```

**LocalStorage Keys:**
- `kelola_kosmu_setup_completed` - Boolean flag
- `kelola_kosmu_setup_date` - ISO date string

---

## Feature 2: License System

### Deskripsi
Sistem lisensi dengan aktivasi key dan device fingerprinting untuk mencegah penggunaan ilegal di device lain.

### Komponen

#### 2.1 License Storage (`app/lib/licenseStorage.ts`)
Mengelola penyimpanan dan retrieval informasi lisensi di localStorage.

**API:**

```typescript
// Get current license info
getLicenseInfo(): LicenseInfo

// Save license activation
saveLicenseActivation(licenseKey: string, deviceFingerprint: string): void

// Clear license
clearLicense(): void

// Check if license activated
isLicenseActivated(): boolean

// Get stored license key
getStoredLicenseKey(): string

// Get stored device fingerprint
getStoredDeviceFingerprint(): string
```

#### 2.2 Device Fingerprint (`app/lib/deviceFingerprint.ts`)
Membuat unique identifier untuk device/browser combination.

**API:**

```typescript
// Generate device fingerprint
generateDeviceFingerprint(): string

// Compare two fingerprints
compareDeviceFingerprint(fp1: string, fp2: string): boolean

// Get or create fingerprint
getOrCreateDeviceFingerprint(getStored: () => string): string
```

**Fingerprint Components:**
- User Agent
- Browser Language
- Screen Resolution (Width x Height)
- Color Depth
- Timezone Offset
- Storage availability

#### 2.3 License Validator (`app/lib/licenseValidator.ts`)
Validasi format dan status lisensi.

**API:**

```typescript
// Validate license format
validateLicenseFormat(licenseKey: string): boolean

// Create trial license
createTrialLicense(): string

// Check if trial license
isTrialLicense(licenseKey: string): boolean

// Validate device fingerprint match
validateDeviceFingerprint(stored: string, current: string): LicenseValidationResult

// Validate complete license
validateLicense(key: string, storedFp: string | null, currentFp: string): LicenseValidationResult

// Generate license key (for testing/admin)
generateLicenseKey(): string
```

**License Format:**
- Format: `KELOLA-XXXX-XXXX-XXXX`
- Length: 20-50 characters
- Trial format: `TRIAL-{timestamp}-{random}`

#### 2.4 License Activation UI (`app/components/LicenseActivation.tsx`)
Component untuk mengaktifkan lisensi.

**Features:**
- Input field dengan placeholder format lisensi
- Real-time validation
- Error handling
- Success message
- Link ke website untuk mendapat lisensi

**Props:**
```typescript
interface LicenseActivationProps {
  onSuccess: () => void
  onCancel?: () => void
}
```

#### 2.5 License Hook (`app/hooks/useLicense.ts`)
React hook untuk managing license state.

**API:**

```typescript
const {
  isActivated,      // boolean
  licenseKey,       // string
  deviceFingerprint, // string
  isValidLicense,   // boolean
  isLoading,        // boolean
} = useLicense()
```

---

## Feature 3: Domain Guard

### Deskripsi
Membatasi akses aplikasi hanya ke domain yang diizinkan (kelolakosmu.id).

### Implementasi

**File:**
- `app/components/DomainGuard.tsx` - Guard component
- `app/layout.tsx` - Integrated sebagai wrapper

**Allowed Domains:**
- `kelolakosmu.id`
- `www.kelolakosmu.id`
- `localhost` (development)
- `127.0.0.1` (development)
- Subdomains of `kelolakosmu.id`

**Cara Kerja:**

1. Component check `window.location.hostname`
2. Jika domain tidak diizinkan, tampilkan error screen
3. Jika domain diizinkan, render children (aplikasi)

**Error Screen:**
- Menampilkan domain saat ini
- List domain yang diizinkan
- Link untuk kembali ke domain resmi

---

## App Access Flow

```
┌─────────────────────────────────┐
│  User Akses Aplikasi            │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  DomainGuard Check              │
│  ✓ Akses domain allowed?        │
└──────────────┬──────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
    ALLOWED      NOT ALLOWED
        │             │
        ↓             ↓
    Continue    ✗ Error Screen
        │
        ↓
┌─────────────────────────────────┐
│  License Check                  │
│  ✓ License activated?           │
└──────────────┬──────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
    ACTIVATED   NOT ACTIVATED
        │             │
        ↓             ↓
    Continue    ↓ License Activation UI
        │             │
        ↓             ↓ (user enters key)
        │
        ↓
┌─────────────────────────────────┐
│  Setup Wizard Check             │
│  ✓ Setup completed?             │
└──────────────┬──────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
    COMPLETED  NOT COMPLETED
        │             │
        ↓             ↓
    Skip        ↓ Show Setup Wizard
        │             │
        ↓             ↓ (user fills form)
        │
        ↓
┌─────────────────────────────────┐
│  Dashboard / Main App            │
└─────────────────────────────────┘
```

---

## Configuration

### Environment Variables
Tidak ada environment variables yang diperlukan (semua hardcoded untuk development).

### Domain Configuration
Edit `DomainGuard.tsx`:

```typescript
const ALLOWED_DOMAINS = [
  'kelolakosmu.id',
  'www.kelolakosmu.id',
  'localhost',
  '127.0.0.1',
]
```

### License Validation
Edit `licenseValidator.ts`:

```typescript
export const validateLicenseFormat = (licenseKey: string): boolean => {
  const formatRegex = /^[A-Z0-9\-]{20,50}$/
  return formatRegex.test(licenseKey.toUpperCase())
}
```

---

## Testing

### Test License Key
Gunakan format: `KELOLA-XXXX-XXXX-XXXX`

Contoh valid keys:
- `KELOLA-TEST-1234-5678`
- `KELOLA-DEMO-ABCD-EFGH`

Generate dengan: `generateLicenseKey()` dari `licenseValidator.ts`

### Reset States (Development)
```typescript
// Reset setup
import { resetSetupCompletion } from '@/app/lib/setupStorage'
resetSetupCompletion()

// Reset license
import { clearLicense } from '@/app/lib/licenseStorage'
clearLicense()

// Clear all
localStorage.clear()
```

### LocalStorage Keys
```
Startup:
- kelola_kosmu_setup_completed (boolean)
- kelola_kosmu_setup_date (ISO string)

License:
- kelola_kosmu_license_key (string)
- kelola_kosmu_license_activated (boolean)
- kelola_kosmu_license_activation_date (ISO string)
- kelola_kosmu_device_fingerprint (string)
```

---

## Future Enhancements

1. **Backend License Validation**
   - Validate license keys dengan server/database
   - Check license expiry date
   - Track license usage

2. **License Management Dashboard**
   - View license info
   - Renew/upgrade license
   - Device management (register/unregister devices)

3. **Advanced Device Fingerprinting**
   - Hardware-based fingerprinting
   - Browser extension detection
   - Geographic IP validation

4. **License Tiering**
   - Trial/Free
   - Basic/Standard
   - Professional/Enterprise
   - Custom features per tier

5. **Multi-User Account**
   - User management
   - Role-based access control
   - Team collaboration

---

## Files Modified/Created

**Created:**
- `app/lib/setupStorage.ts` - Setup persistence
- `app/lib/licenseStorage.ts` - License storage
- `app/lib/deviceFingerprint.ts` - Device fingerprinting
- `app/lib/licenseValidator.ts` - License validation
- `app/hooks/useLicense.ts` - License state hook
- `app/components/DomainGuard.tsx` - Domain guard
- `app/components/LicenseActivation.tsx` - License activation UI
- `APP_CUSTOMIZATION.md` - This documentation

**Modified:**
- `app/components/SetupWizard.tsx` - Added setup completion tracking
- `app/page.tsx` - Added license check and setup check
- `app/layout.tsx` - Integrated DomainGuard

---

## Security Notes

1. **Device Fingerprinting**
   - Tidak sepenuhnya foolproof (user dapat clear localStorage)
   - Untuk production, gunakan server-side device validation
   - Pertimbangkan fingerprinting library seperti `fingerprintjs2`

2. **License Keys**
   - Saat ini tidak tervalidasi dengan server
   - Untuk production, validate dengan backend
   - Gunakan encrypted license keys
   - Implement rate limiting pada license activation

3. **Domain Lock**
   - Hanya berfungsi pada browser (dapat dibypass)
   - Untuk production, validate domain di server
   - Gunakan SSL certificate pinning
   - Implement server-side domain validation

4. **LocalStorage**
   - Data tersimpan di client (tidak aman)
   - User dapat modify data via browser console
   - Untuk production, combine dengan server-side verification
   - Implement token-based authentication

---

## Troubleshooting

### Setup Wizard Terus Muncul
- Clear localStorage: `localStorage.clear()`
- Atau: `localStorage.removeItem('kelola_kosmu_setup_completed')`

### License Activation Tidak Bekerja
- Check format: `KELOLA-XXXX-XXXX-XXXX`
- Check device fingerprint match
- Check console untuk error messages

### Domain Guard Memblokir Akses
- Check domain di browser address bar
- Verify domain di `ALLOWED_DOMAINS` list
- Untuk development, gunakan `localhost` atau `127.0.0.1`

### License tidak Tervalidasi
- Check `deviceFingerprint` di localStorage
- Buka di device berbeda? Device fingerprint akan berbeda
- Check browser console untuk validation error

---

## Support

Untuk issues atau questions, hubungi tim development di:
- Email: support@kelolakosmu.id
- Website: https://kelolakosmu.id
