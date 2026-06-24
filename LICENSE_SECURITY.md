# License Key Security - KELOLA KOSMU

## Overview

KELOLA KOSMU implements strict license key validation and verification to ensure that only authorized users with valid, officially-generated license keys can access the application.

## Security Architecture

### 1. License Key Format (Strict)

License keys follow a strict format: `KK-YYYY-AAAA-DDDD`

- **KK** - Kelola Kosmu prefix (constant)
- **YYYY** - Year of issue (4 digits, e.g., 2024)
- **AAAA** - Random alphanumeric characters (4 chars, A-Z, 0-9)
- **DDDD** - Random digits (4 digits, 0-9)

**Example:** `KK-2024-ABCD-1234`

### 2. Format Validation (Client-Side)

The license format is validated using a strict regex pattern:
```typescript
/^KK-\d{4}-[A-Z0-9]{4}-\d{4}$/
```

This pattern prevents users from entering arbitrary strings that don't follow the official format. Only keys in the exact format are accepted.

**Validation Details:**
- Rejects formats like: `KELOLA-XXXX-XXXX-XXXX`, `TRIAL-12345-ABCDE`, `RANDOM-STRING`
- Rejects any key not matching the strict pattern
- Case-insensitive comparison (converted to uppercase)

### 3. License Key Verification (Server-Side)

After format validation, the system verifies that the license key actually exists in the database:

```typescript
verifyLicenseKeyExists(licenseKey: string): Promise<boolean>
```

This critical security check ensures:
- Only officially-generated keys (created in admin panel) are accepted
- Users cannot bypass the system by entering random keys that happen to match the format
- Each activation is verified against the official license database/mock store

### 4. Error Messages

Clear error messages guide users while protecting security:

| Scenario | Error Message |
|----------|---------------|
| Empty input | "Kode lisensi harus diisi" |
| Invalid format | "Format kode lisensi tidak valid. Gunakan format: KK-YYYY-AAAA-DDDD" |
| Key not in database | "Kode lisensi tidak valid atau belum terdaftar. Hubungi admin untuk mendapatkan lisensi resmi." |
| Activation successful | Success screen with green checkmark |

## Security Layers

### Layer 1: Format Validation
- Strict regex pattern matching
- Prevents obviously wrong inputs
- Fast client-side check

### Layer 2: Database Verification
- Verifies key exists in database/mock store
- Ensures only officially-generated keys work
- Cannot bypass with creative inputs

### Layer 3: Device Fingerprinting
- Each activation is tied to a device fingerprint
- Prevents license sharing across devices
- Uses: user agent, screen resolution, timezone, etc.

### Layer 4: Domain Guard
- Only accessible from authorized domain (kelolakosmu.id in production)
- Additional protection layer at application level

## License Key Generation

Admin panel generates license keys in the required format:

```
Format: KK-[YEAR]-[RANDOM_4_CHAR]-[RANDOM_4_DIGITS]
Example: KK-2024-QWER-5678
```

Key generation components:
- **Year**: Current year (e.g., 2024)
- **Random Alphanumeric (AAAA)**: 4 random A-Z/0-9 characters
- **Random Digits (DDDD)**: 4 random digits 0-9

## Testing Security

### Test Case 1: Invalid Format Rejection
```
Input: KELOLA-1234-5678-9999
Result: Format validation error ✓
Result: No database verification attempted ✓
```

### Test Case 2: Invalid Format Detection
```
Input: TRIAL-12345-ABCDE
Result: Format validation error ✓
Result: User-friendly error message ✓
```

### Test Case 3: Valid Format, Invalid Key
```
Input: KK-2024-TEST-9999 (not in database)
Result: Format validation passes ✓
Result: Database verification fails ✓
Result: Clear error message about contacting admin ✓
```

### Test Case 4: Valid Format, Valid Key
```
Input: KK-2024-ABC1-1234 (from mock data)
Result: Format validation passes ✓
Result: Database verification passes ✓
Result: Activation successful ✓
Result: Transition to setup wizard ✓
```

## Production Considerations

### Database Setup
Replace mock implementation with real Supabase:
1. Set environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Create `licenses` table with required schema
3. Admin panel will automatically use real database

### Key Generation Strategy
- Ensure year in license matches fiscal year (for easy tracking)
- Use cryptographically secure random generation
- Log all license generation events
- Maintain license inventory in admin panel

### Expiration Policy
- Default: 1 year from issue date
- Can be customized per customer
- System checks expiration during activation
- Send notifications before expiration

### Revocation
- Admin panel supports marking licenses as inactive
- Prevents further activation with revoked keys
- Cannot be reactivated once marked inactive

### Audit Trail
- Log all license activations
- Record device fingerprints for troubleshooting
- Track failed activation attempts
- Maintain license history

## Preventing Common Attacks

### Attack: Brute Force Invalid Keys
**Prevention:** Format validation rejects 99.99% of random inputs before DB check

### Attack: Social Engineering
**Prevention:** Clear message that licenses must come from official admin

### Attack: License Sharing
**Prevention:** Device fingerprinting prevents use on different devices

### Attack: Reverse Engineering
**Prevention:** Format validation and DB verification happen server-side

### Attack: Downgrading/Tampering
**Prevention:** License stored in localStorage with verification on each load

## File Structure

```
app/
├── lib/
│   ├── licenseValidator.ts          # Strict format validation
│   ├── licenseVerification.ts       # Database verification (NEW)
│   ├── licenseStorage.ts            # License activation storage
│   ├── licenseGenerator.ts          # License CRUD (admin)
│   ├── mockLicenses.ts              # Mock data store
│   └── deviceFingerprint.ts         # Device identification
├── components/
│   ├── LicenseActivation.tsx        # License entry UI (updated)
│   ├── DomainGuard.tsx              # Domain verification
│   └── PasswordGuard.tsx            # Admin password protection
└── admin/
    └── dashboard/
        └── page.tsx                  # License management UI
```

## Related Documentation

- [APP_CUSTOMIZATION.md](./APP_CUSTOMIZATION.md) - Setup wizard and license system overview
- [ADMIN_PANEL.md](./ADMIN_PANEL.md) - Admin panel usage and license generation

## Changelog

### Version 1.0 (Current)
- Strict format validation (KK-YYYY-AAAA-DDDD)
- Server-side license verification
- Device fingerprinting for activation tracking
- Admin panel for license generation
- Mock data support for testing
- Clear security error messages
