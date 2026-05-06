# Routing Module Specification

## Overview
Application routing structure with role-based access control. Implements public routes, protected back-office routes, client portal, and platform admin console with nested layouts.

## Pages and Components
- **App.tsx** - Root component with BrowserRouter and route definitions
- **ProtectedRoute** - Route guard component checking user roles
- **BackOfficeLayout** - Layout for /app routes with sidebar navigation
- **PlatformAdminLayout** - Layout for /console routes
- **PlatformAdminGuard** - Guard for platform admin routes

## Key Features
- Role-based route protection
- Nested route layouts
- Public routes (landing, login, register, pricing)
- Client portal routes (CLIENT role only)
- Back-office routes (BUSINESS_OWNER, BUSINESS_ADMIN, ACCOUNTANT, TEAM_MEMBER)
- Platform admin console routes (PLATFORM_ADMIN only)
- Catch-all redirect to home
- Skip-to-content link for accessibility

## State Management
- **React Router**: useNavigate, useLocation, useParams
- **AuthContext**: User role and authentication state

## API Calls
No direct API calls. Routes trigger page components that make API calls.

## Types and Interfaces
- `Role` - User role enum from auth.types
- `RouteProps` - React Router route props

## Dependencies
- react-router-dom - Routing library (BrowserRouter, Routes, Route, Navigate)
- @tanstack/react-query - Query client provider

## Permissions
### Public Routes (/)
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/pricing` - Pricing page
- `/forgot-password` - Forgot password
- `/reset-password` - Reset password
- `/verify-email` - Email verification
- `/invitations/:token` - Accept invitation
- `/client-portal` - Sales order client portal
- `/quote-portal` - Quote portal
- `/supplier-portal` - Supplier portal
- `/supplier-register` - Supplier registration
- `/client-onboarding/:token` - Client onboarding
- `/subscription-manage` - Subscription management
- `/pay/:token` - Payment page
- `/pay/:token/success` - Payment success
- `/salary-respond/:token` - Salary response
- `/supplier/schedule/:token/:action` - Supplier schedule response

### Client Portal (/portal)
- **Allowed Roles**: CLIENT
- Client-specific dashboard and features

### Back Office (/app)
- **Allowed Roles**: BUSINESS_OWNER, BUSINESS_ADMIN, ACCOUNTANT, TEAM_MEMBER, PLATFORM_ADMIN
- `/app/dashboard` - Main dashboard
- `/app/clients` - Client management
- `/app/invoices` - Invoice management
- `/app/expenses` - Expense tracking
- `/app/reports` - Reports and analytics
- `/app/team` - Team management
- `/app/collaboration` - Collaboration features
- `/app/settings` - Business settings

#### Stock Routes (/app/stock)
- `/app/stock` - Stock dashboard
- `/app/stock/products` - Product management
- `/app/stock/services` - Service management
- `/app/stock/service-categories` - Service categories
- `/app/stock/categories` - Product categories
- `/app/stock/movements` - Stock movements
- `/app/stock/archive` - Archived products (BUSINESS_OWNER, BUSINESS_ADMIN only)

#### Warehouse Routes (/app/warehouses)
- `/app/warehouses` - Warehouse list
- `/app/warehouses/:id` - Warehouse detail

#### Sales Routes (/app/sales)
- `/app/sales/dashboard` - Sales dashboard
- `/app/sales/clients` - Client management
- `/app/sales/quotes` - Quote management
- `/app/sales/orders` - Sales order management
- `/app/sales/delivery-notes` - Delivery note management
- `/app/sales/invoices` - Sales invoice management
- `/app/sales/recurring-invoices` - Recurring invoice management

#### Purchase Routes (/app/purchases)
- `/app/purchases/dashboard` - Purchase dashboard
- `/app/purchases/suppliers` - Supplier management
- `/app/purchases/orders` - Purchase order management
- `/app/purchases/goods-receipts` - Goods receipt management
- `/app/purchases/invoices` - Purchase invoice management
- `/app/purchases/supplier-ranking` - Supplier ranking
- `/app/purchases/supplier-intelligence` - Supplier intelligence
- `/app/purchases/three-way-matching` - Three-way matching
- `/app/purchases/three-way-matching/:invoiceId` - Three-way matching detail
- `/app/purchases/ml-predictions` - ML predictions

#### Treasury Routes (/app/treasury)
- `/app/treasury/accounts` - Account management
- `/app/treasury/invoices` - Treasury invoices
- `/app/treasury/expenses` - Expenses to pay
- `/app/treasury/transactions` - Transaction history
- `/app/treasury/salaries` - Salary payments
- `/app/treasury/recurring-invoices` - Recurring invoices

### Platform Admin Console (/console)
- **Allowed Roles**: PLATFORM_ADMIN
- `/console/login` - Console login
- `/console/totp-verify` - TOTP verification
- `/console/dashboard` - Console dashboard
- `/console/tenants` - Tenant management
- `/console/tenants/:id` - Tenant detail
- `/console/subscriptions` - Subscription management
- `/console/subscriptions/overdue` - Overdue subscriptions
- `/console/plans` - Plan management
- `/console/ai-pricing` - AI pricing assistant
- `/console/support` - Support tickets
- `/console/audit-log` - Audit log viewer
