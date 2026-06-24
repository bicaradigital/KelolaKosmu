# Admin Panel - License Key Management

## Overview

The KELOLA KOSMU admin panel provides complete license key management functionality for administrators. Access the admin panel at `/admin` to manage all license keys, track usage, and generate new licenses for customers.

## Features

### 1. Admin Authentication
- Secure password-protected access to admin panel
- Session-based authentication using `sessionStorage`
- Password: `kelola_kosmu_admin`
- Location: `/admin`

### 2. License Management Dashboard
- **Statistics Cards**: Quick view of key metrics
  - Total Licenses: Total number of licenses created
  - Active Licenses: Licenses currently active
  - Inactive Licenses: Licenses disabled/revoked
  - Utilization: Percentage of active licenses

### 3. License Generation
- Create new license keys in format: `KK-[YEAR]-[4CHAR]-[4DIGITS]`
  - Example: `KK-2024-ABC1-1234`
- Bulk generation: Create multiple licenses at once
- Add buyer information and notes
- One-year expiration by default

### 4. License Management
- **Search & Filter**: Find licenses by key or buyer name
- **View Details**: See license metadata (created date, expiration, buyer, notes)
- **Status Control**: Toggle license status between active/inactive
- **Copy to Clipboard**: Quickly copy license keys for sharing
- **Responsive Table**: View all license information at a glance

### 5. Database Integration
- Supabase integration for persistent storage
- Fallback to mock data for testing without Supabase
- Automatic migration path when Supabase is configured

## Access Routes

```
/admin              - Login page
/admin/dashboard    - License management dashboard (requires authentication)
```

## Technical Details

### Files Structure
```
app/
├── admin/
│   ├── page.tsx                    # Admin login page
│   └── dashboard/
│       └── page.tsx                # License management dashboard
├── lib/
│   ├── supabase.ts                 # Supabase client setup
│   ├── adminAuth.ts                # Admin authentication utilities
│   ├── licenseGenerator.ts         # License generation & CRUD operations
│   └── mockLicenses.ts             # Mock data for testing
└── components/
    └── PasswordGuard.tsx            # Route protection component
```

### Authentication Flow
1. User visits `/admin`
2. Admin login page prompts for password
3. On correct password entry, token generated and stored in `sessionStorage`
4. User redirected to `/admin/dashboard`
5. Dashboard checks for valid session on load
6. Logout clears session and redirects to login page

### License Key Format
```
KK-[YEAR]-[RANDOM_CHARS]-[RANDOM_DIGITS]
├─ KK = KELOLA KOSMU prefix
├─ YEAR = Current year (4 digits)
├─ RANDOM_CHARS = 4 random alphanumeric characters
└─ RANDOM_DIGITS = 4 random digits
```

Example: `KK-2024-XYZ9-5678`

### Data Structure
```typescript
interface License {
  id: string                    // Unique identifier
  key: string                   // License key (KK-XXXX-XXXX-XXXX)
  buyer_name: string            // Name of license buyer
  status: 'active' | 'inactive' // Current status
  device_fingerprint: string    // Device fingerprint (if activated)
  created_at: string            // Creation timestamp
  expires_at: string            // Expiration timestamp
  notes: string                 // Optional notes
}
```

## Supabase Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Schema (SQL)
```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,
  buyer_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  device_fingerprint TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX licenses_key_idx ON licenses(key);
CREATE INDEX licenses_buyer_name_idx ON licenses(buyer_name);
CREATE INDEX licenses_status_idx ON licenses(status);
```

## Testing Without Supabase

The admin panel includes mock data for testing:
- 3 sample licenses pre-loaded
- Full CRUD operations functional
- Perfect for UI/UX testing and development

Mock licenses automatically load when Supabase is not configured.

## Usage Guide

### Creating a License
1. Log in to `/admin` with password `kelola_kosmu_admin`
2. Click "Buat Lisensi" (Create License) button
3. Fill in:
   - **Nama Pembeli** (Buyer Name) - Required
   - **Catatan** (Notes) - Optional
   - **Jumlah Lisensi** (Quantity) - 1-10 licenses
4. Click "Buat Lisensi" to generate
5. Licenses are immediately active and ready to use

### Managing Licenses
1. View all licenses in the license table
2. Search by license key or buyer name using search bar
3. Copy license key using the copy icon
4. View license details (dates, buyer, notes)
5. Toggle active/inactive status using the eye icon

### Statistics
- Real-time updates of license counts
- Automatic calculation of utilization percentage
- Color-coded status badges (green for active, gray for inactive)

## Security Considerations

### Production Deployment
1. **Change default password** in `app/lib/adminAuth.ts`
   - Update `ADMIN_PASSWORD_HASH` constant
   - Use bcrypt or similar for password hashing in production

2. **Enable HTTPS** - All connections must be encrypted

3. **Use environment variables** for sensitive data:
   ```env
   ADMIN_PASSWORD=your_secure_password
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```

4. **Implement IP Whitelisting** - Restrict admin panel access to known IPs

5. **Rate Limiting** - Add rate limiting to prevent brute force attacks

6. **Audit Logging** - Track all license changes for compliance

### Session Management
- Sessions stored in browser `sessionStorage` (not persisted after browser close)
- In production, consider using server-side sessions
- Token expires when browser is closed
- Implement session timeout for inactivity

## Performance Tips

- License table pagination for large datasets (currently 100 licenses per page)
- Search functionality filters on client-side (consider server-side for large datasets)
- Mock data loads instantly for development/testing
- Database queries optimized with indexes

## Future Enhancements

- [ ] Advanced license analytics and usage reports
- [ ] License renewal/extension functionality
- [ ] License transfer between buyers
- [ ] API for license validation
- [ ] Email notifications for expiring licenses
- [ ] License quota management per buyer
- [ ] Audit trail and activity logging
- [ ] Multi-admin user management
- [ ] Two-factor authentication
- [ ] License templates for different products

## Troubleshooting

### Licenses Not Loading
- Check browser console for errors
- Verify Supabase credentials if using real database
- Mock data should load automatically if Supabase is not configured

### Login Issues
- Verify password: `kelola_kosmu_admin`
- Check `sessionStorage` is enabled in browser
- Clear browser cookies/cache and try again

### License Creation Failing
- Ensure buyer name is filled (required field)
- Check browser console for detailed error messages
- Verify database connection if using Supabase

## Support

For issues or questions about the admin panel:
1. Check the troubleshooting section above
2. Review error messages in browser console
3. Check Supabase dashboard for database errors
4. Contact development team for assistance

---

**Admin Panel Version**: 1.0.0  
**Last Updated**: 2024  
**Compatible with**: KELOLA KOSMU v1.0.0+
