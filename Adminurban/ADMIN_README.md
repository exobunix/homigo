## Admin Panel - Login Credentials

**Email**: `admin@urban.com`  
**Password**: `password123`

## How to Access

### Web:
```bash
cd Adminurban
npm run web
```
Then open: `http://localhost:8083`

### Mobile:
```bash
cd Adminurban
npm start
```

## Current Status

✅ **Working:**
- Backend authentication
- Login screen (web & mobile)
- Dashboard (web & mobile)

⚠️ **Needs Manual Fix:**
Due to file corruption during automated edits, please manually verify these files are complete:
1. `src/screens/users/UserManagement.tsx`
2. `src/screens/vendors/VendorManagement.tsx`
3. `src/screens/bookings/BookingManagement.tsx`

Each should have:
- `onNavigate` prop in function signature
- Pass `onNavigate` and `currentPage` to `WebLayout`

## Features

- **Dashboard**: Stats overview, recent activity
- **User Management**: Search, block/unblock users
- **Vendor Management**: Approve/reject vendors
- **Booking Management**: View and manage bookings

All pages work on both web and mobile with the same codebase!
