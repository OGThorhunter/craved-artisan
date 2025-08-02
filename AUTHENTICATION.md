# Authentication Module Documentation

## Overview

The Craved Artisan application implements a comprehensive session-based authentication system with role-based access control. The system supports multiple user roles (Customer, Vendor, Admin) and provides secure login/signup functionality with automatic redirects and protected routes.

## Features

### ✅ Implemented Features

- **Session-based Authentication**: Secure cookie-based sessions with PostgreSQL storage
- **User Roles**: Customer, Vendor, and Admin roles with different permissions
- **Cookie/Session Management**: Automatic session handling with secure cookie settings
- **Auth Context**: React context for frontend state management
- **Access Control Middleware**: Backend middleware for protecting routes
- **Auto Redirect**: Automatic redirects based on authentication status and user role
- **Protected Routes**: Frontend route protection with role-based access
- **Form Validation**: Comprehensive form validation with Zod schemas
- **Error Handling**: Proper error handling and user feedback
- **Password Security**: Bcrypt password hashing with salt rounds

## Backend Implementation

### Authentication Middleware (`server/src/middleware/auth.ts`)

```typescript
// Middleware functions available:
- requireAuth()           // Requires authentication
- requireRole(roles[])    // Requires specific role(s)
- requireAdmin()          // Requires admin role
- requireVendor()         // Requires vendor role
- requireCustomer()       // Requires customer role
- requireVendorOrAdmin()  // Requires vendor or admin role
- optionalAuth()          // Optional authentication
```

### Authentication Routes (`server/src/routes/auth.ts`)

#### Available Endpoints:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/session` - Check session status

#### Request/Response Examples:

**Signup Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "CUSTOMER",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "About me...",
  "website": "https://example.com"
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Session Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "bio": "About me...",
      "website": "https://example.com"
    }
  }
}
```

### Session Configuration

Sessions are stored in PostgreSQL using `connect-pg-simple` with the following security settings:

- **Secure Cookies**: Enabled in production
- **HttpOnly**: Prevents XSS attacks
- **SameSite**: Strict in production, lax in development
- **Max Age**: 24 hours
- **Secret**: Environment variable (minimum 32 characters)

## Frontend Implementation

### Authentication Context (`client/src/contexts/AuthContext.tsx`)

The auth context provides:

- User state management
- Authentication functions (login, signup, logout)
- Session checking
- Error handling
- Loading states

#### Usage:

```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

### Protected Routes (`client/src/components/ProtectedRoute.tsx`)

Protects routes based on authentication status and user roles:

```typescript
// Require authentication only
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requiredRole="VENDOR">
  <VendorDashboardPage />
</ProtectedRoute>
```

### Authentication Pages

#### Login Page (`client/src/pages/LoginPage.tsx`)
- Email/password form with validation
- Password visibility toggle
- Error handling and user feedback
- Links to signup and role-specific join pages

#### Signup Page (`client/src/pages/SignupPage.tsx`)
- Role selection (Customer/Vendor)
- Comprehensive form validation
- Conditional fields based on role
- Password strength requirements

## User Roles and Permissions

### Customer Role
- Browse products
- Place orders
- View order history
- Access customer dashboard

### Vendor Role
- Create and manage products
- View sales and orders
- Access vendor dashboard
- Manage store profile

### Admin Role
- Full system access
- User management
- System administration
- Access admin dashboard

## Security Features

### Password Security
- Minimum 8 characters
- Must contain uppercase, lowercase, and number
- Bcrypt hashing with 12 salt rounds
- Secure password comparison

### Session Security
- HttpOnly cookies
- Secure flag in production
- SameSite protection
- Automatic session cleanup

### Input Validation
- Email validation
- Password strength requirements
- SQL injection prevention
- XSS protection

## Environment Setup

### Server Environment Variables

Create a `.env` file in the server directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/craved_artisan"
NODE_ENV="development"
SESSION_SECRET="your-super-secret-session-key-at-least-32-characters-long"
CLIENT_URL="http://localhost:3000"
```

### Client Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## Database Schema

The authentication system uses the existing Prisma schema with User and Profile models:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile?
}

model Profile {
  id        String   @id @default(uuid())
  firstName String
  lastName  String
  phone     String?
  bio       String?
  website   String?
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role {
  CUSTOMER
  VENDOR
  ADMIN
}
```

## Usage Examples

### Protecting Backend Routes

```typescript
// Require authentication
router.get('/profile', requireAuth, (req, res) => {
  // req.user is available
});

// Require specific role
router.post('/products', requireVendor, (req, res) => {
  // Only vendors can access
});

// Require multiple roles
router.get('/admin', requireVendorOrAdmin, (req, res) => {
  // Vendors or admins can access
});
```

### Protecting Frontend Routes

```typescript
// In App.tsx
<Route path="/dashboard/vendor">
  <ProtectedRoute requiredRole="VENDOR">
    <VendorDashboardPage />
  </ProtectedRoute>
</Route>
```

### Using Authentication in Components

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.profile?.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: Form validation with detailed error messages
- **Authentication Errors**: Clear feedback for login/signup failures
- **Session Errors**: Automatic session cleanup for invalid sessions
- **Network Errors**: Graceful handling of API failures

## Testing the Authentication System

1. **Start the server**: `npm run dev` in the server directory
2. **Start the client**: `npm run dev` in the client directory
3. **Create an account**: Navigate to `/signup`
4. **Test login**: Navigate to `/login`
5. **Test protected routes**: Try accessing `/dashboard` without authentication
6. **Test role-based access**: Create different user types and test role restrictions

## Security Best Practices

- Always use HTTPS in production
- Regularly rotate session secrets
- Implement rate limiting for auth endpoints
- Monitor for suspicious activity
- Keep dependencies updated
- Use environment variables for sensitive data
- Implement proper logging for security events

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, Facebook)
- [ ] Account deletion
- [ ] Session management (view active sessions)
- [ ] Audit logging
- [ ] Account lockout after failed attempts 