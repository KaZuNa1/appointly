# Admin Dashboard Guide

## Overview

The Admin Dashboard provides comprehensive platform management capabilities for administrators. Only users with the `ADMIN` role can access these features.

## Features

### 1. Dashboard Overview (`/admin`)
- **Platform Statistics**
  - Total users, providers, bookings, services
  - Total revenue across all bookings
  - New users and bookings this week
  - Booking status breakdown
- **Quick Actions** - Navigate to all admin sections
- **Recent Activity Feed** - Last 10 system actions

### 2. User Management (`/admin/users`)
**Capabilities:**
- View all users (customers, providers, admins)
- Search by name or email
- Filter by role (CUSTOMER, PROVIDER, ADMIN)
- Pagination (20 users per page)
- **Delete users** - Remove accounts (cannot delete other admins)

**Note:** Role changing is not available in the UI. Use the scripts (`promote-admin.js`, `demote-user.js`) for role changes to prevent conflicts (e.g., can't convert provider to customer without removing business data).

**User Information Displayed:**
- Full name and email
- Role with color-coded badges
- Contact information (phone, location)
- Email verification status
- Registration date

### 3. Provider Management (`/admin/providers`)
**Capabilities:**
- View all business providers
- Search by business name or nickname
- Pagination (20 providers per page)
- **Delete providers** - Remove business accounts
- View detailed statistics per provider

**Provider Information Displayed:**
- Business name and nickname
- Category and contact details
- Location (city, district)
- Total appointments and services count
- Owner information
- Registration date

### 4. Booking Management (`/admin/bookings`)
**Capabilities:**
- View all bookings across the platform
- Filter by status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Pagination (20 bookings per page)
- **Cancel bookings** - Admin can cancel any booking with a reason
- Both customer and provider receive notifications when admin cancels

**Booking Information Displayed:**
- Customer and provider details
- Service name, duration, and price
- Appointment date and time
- Current status with color-coded badges
- Cancellation reason (if cancelled)

### 5. Audit Logs (`/admin/audit-logs`)
**Capabilities:**
- View all system actions and user activities
- Pagination (50 logs per page)
- Color-coded action types:
  - 🔴 Red: Delete/Cancel actions
  - 🟢 Green: Create/Register actions
  - 🔵 Blue: Update/Change actions
  - 🟣 Purple: Login actions

**Log Information Displayed:**
- Action type
- User who performed the action
- Detailed JSON information
- Timestamp

## Admin Access Control

### Backend Protection
- `adminMiddleware` validates JWT token
- Checks if user has `ADMIN` role
- Returns 403 error if not authorized

### Frontend Protection
- `ProtectedRoute` with `role="ADMIN"` prop
- Redirects to home if not admin
- Admin badge displayed in navbar

### API Endpoints
All admin endpoints are prefixed with `/api/admin/`:

```
GET    /api/admin/stats                    # Dashboard statistics
GET    /api/admin/recent-activity          # Recent activity logs
GET    /api/admin/users                    # List all users
GET    /api/admin/users/:id                # Get user details
DELETE /api/admin/users/:id                # Delete user
GET    /api/admin/providers                # List all providers
GET    /api/admin/providers/:id            # Get provider details
DELETE /api/admin/providers/:id            # Delete provider
GET    /api/admin/bookings                 # List all bookings
POST   /api/admin/bookings/:id/cancel      # Cancel booking (admin)
GET    /api/admin/audit-logs               # Get audit logs
```

## Promoting a User to Admin

### Method 1: Using the Script
Run the promotion script from the backend directory:

```bash
cd backend
node promote-admin.js
```

Follow the prompts:
1. Enter the user's email address
2. Confirm the user details
3. Type "yes" to confirm promotion

### Method 2: Using demote-user.js Script
To change any user's role (including demoting admins):

```bash
cd backend
node demote-user.js
```

This interactive script lets you change any user to any role (CUSTOMER, PROVIDER, or ADMIN).

### Method 3: Direct Database Update
Using Prisma Studio or database client:

```bash
# Open Prisma Studio
npx prisma studio

# Or use SQL
UPDATE "User" SET role = 'ADMIN' WHERE email = 'user@example.com';
```

## Security Considerations

1. **Limited Admin Accounts** - Only create admin accounts for trusted personnel
2. **Audit Logging** - All admin actions are logged in the audit log
3. **Cannot Delete Other Admins** - Prevents accidental removal of admin access
4. **Role-Based Access** - Admin middleware strictly enforces ADMIN role requirement
5. **Protected Routes** - All admin routes require authentication and ADMIN role

## UI/UX Features

### Navigation
- Admin badge in navbar (red "админ" badge)
- Dropdown menu with direct link to admin dashboard
- Back buttons on all sub-pages
- Quick action cards on main dashboard

### Design
- Consistent color scheme:
  - Indigo for primary actions
  - Red for delete/cancel/admin
  - Purple for providers
  - Green for success/confirmed
  - Yellow for pending/warnings
- Responsive grid layouts
- Hover effects and transitions
- Loading states with spinners
- Empty states with helpful messages

### Data Display
- Paginated tables and grids
- Search and filter capabilities
- Color-coded status badges
- Formatted dates in Mongolian locale
- Formatted currency (MNT)
- Truncated long text with tooltips

## Common Tasks

### Creating Your First Admin
1. Register a new user account at `/register`
2. Verify the email (if email verification is enabled)
3. Run the promotion script: `node backend/promote-admin.js`
4. Enter the email and confirm
5. Log in and navigate to `/admin`

### Managing Users
1. Go to `/admin/users`
2. Use search to find specific users
3. Filter by role if needed
4. Click delete icon to remove users
   - **Warning:** Deleting a user will also delete:
     - All their bookings (as customer)
     - Their provider business (if PROVIDER)
     - All their notifications
     - All their bookmarks
     - All audit logs (preserved)

### Monitoring Bookings
1. Go to `/admin/bookings`
2. Filter by status to see specific types
3. Click cancel icon to cancel problematic bookings
4. Provide a clear cancellation reason
5. Both parties will be notified

### Reviewing Activity
1. Go to `/admin/audit-logs`
2. Scroll through recent actions
3. Look for suspicious patterns
4. Check action details in JSON format

## Troubleshooting

### Cannot Access Admin Dashboard
- Verify your user has `ADMIN` role in database
- Clear browser cache and cookies
- Check browser console for errors
- Verify JWT token is valid

### Stats Not Loading
- Check backend server is running
- Verify database connection
- Check browser network tab for API errors
- Look at backend console for error logs

### Cannot Delete User/Provider
- Check if user is another admin (cannot delete other admins)
- Verify you have proper ADMIN role
- Check for database constraints or dependencies

## Future Enhancements

Potential features for future development:
- Export data to CSV/Excel
- Advanced filtering and sorting
- Bulk operations (e.g., bulk delete)
- Email notifications to admins
- System health monitoring
- Revenue charts and analytics
- Provider approval workflow
- Custom admin permissions (super admin, moderator, etc.)
