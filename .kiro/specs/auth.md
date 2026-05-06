# Auth Module Specification

## Overview
Handles user authentication, registration, session management, and role-based access control. Uses HTTP-only cookies for secure token storage with automatic refresh on 401 errors.

## Pages and Components
- **LoginPage** - User login with email/password
- **RegisterPage** - Multi-step registration (User → Tenant → Business → Plan)
- **ForgotPasswordPage** - Request password reset email
- **ResetPasswordPage** - Reset password with token
- **VerifyEmailPage** - Email verification with token
- **AuthContext** - Global authentication state provider
- **ProtectedRoute** - Route guard based on user roles

## Key Features
- Cookie-based authentication (HTTP-only, secure)
- Automatic token refresh on 401 errors
- Multi-step registration flow
- Email verification
- Password reset flow
- Role-based route protection
- Session persistence across page reloads

## State Management
- **Context API**: AuthContext provides global auth state
- **Local State**: useState for form inputs and loading states
- **Session**: Cookies managed by backend (httpOnly, secure)

## API Calls
- `POST /auth/register` - Register new user with tenant and business
- `POST /auth/login` - Login user (sets httpOnly cookies)
- `POST /auth/logout` - Logout user (clears cookies)
- `GET /auth/me` - Get current user data
- `POST /auth/refresh` - Refresh access token (automatic)
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `PATCH /auth/profile` - Update user profile

## Types and Interfaces
- `User` - User entity with role, email, firstName, lastName
- `Role` - Enum: PLATFORM_ADMIN, BUSINESS_OWNER, BUSINESS_ADMIN, ACCOUNTANT, TEAM_MEMBER, CLIENT
- `LoginRequest` - { email, password }
- `RegisterRequest` - Multi-step data (user, tenant, business, taxRate, plan)
- `AuthContextType` - Context interface with login, register, logout, refreshUser

## Dependencies
- axios - HTTP client with interceptors
- react-router-dom - Navigation and route protection
- zod - Form validation schemas

## Permissions
- **PUBLIC**: Login, Register, Forgot Password, Reset Password, Verify Email
- **CLIENT**: Access to /portal
- **BUSINESS_OWNER, BUSINESS_ADMIN, ACCOUNTANT, TEAM_MEMBER**: Access to /app
- **PLATFORM_ADMIN**: Access to /console and /app
