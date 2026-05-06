# API Module Specification

## Overview
Centralized API configuration and service layer. Provides axios instance with automatic token refresh, request/response interceptors, and error handling. All API calls use HTTP-only cookies for authentication.

## Pages and Components
- **axiosInstance** - Configured axios client with interceptors
- **api.config** - API base URL and asset URL helpers
- **API files** - Module-specific API functions (auth, sales, purchases, stock, etc.)

## Key Features
- Automatic token refresh on 401 errors
- Request/response logging for debugging
- Failed request queue during token refresh
- Cookie-based authentication (withCredentials: true)
- Centralized error handling
- Asset URL helper for images and files

## State Management
- **No state**: Pure API functions that return promises
- **Request queue**: In-memory queue for failed requests during refresh

## API Calls
All API calls go through axiosInstance with base URL from `VITE_API_URL` env variable.

### Auth API
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET /auth/me`, `POST /auth/refresh`
- `POST /auth/verify-email`, `POST /auth/forgot-password`, `POST /auth/reset-password`

### Sales API
- Clients: `GET /clients`, `POST /clients`, `PATCH /clients/:id`, `DELETE /clients/:id`
- Quotes: `GET /quotes`, `POST /quotes`, `PATCH /quotes/:id`, `DELETE /quotes/:id`
- Orders: `GET /sales-orders`, `POST /sales-orders`, `PATCH /sales-orders/:id`
- Invoices: `GET /sales-invoices`, `POST /sales-invoices`, `PATCH /sales-invoices/:id`
- Delivery Notes: `GET /delivery-notes`, `POST /delivery-notes`
- Recurring Invoices: `GET /recurring-invoices`, `POST /recurring-invoices`

### Purchases API
- Suppliers: `GET /suppliers`, `POST /suppliers`, `PATCH /suppliers/:id`, `DELETE /suppliers/:id`
- POs: `GET /supplier-pos`, `POST /supplier-pos`, `PATCH /supplier-pos/:id`
- Goods Receipts: `GET /goods-receipts`, `POST /goods-receipts`
- Purchase Invoices: `GET /purchase-invoices`, `POST /purchase-invoices`, `PATCH /purchase-invoices/:id`

### Stock API
- Products: `GET /products`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`
- Categories: `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`
- Warehouses: `GET /warehouses`, `POST /warehouses`, `PATCH /warehouses/:id`
- Movements: `GET /stock-movements`, `POST /stock-movements`

### Treasury API
- Accounts: `GET /treasury/accounts`, `POST /treasury/accounts`
- Transactions: `GET /treasury/transactions`, `POST /treasury/transactions`
- Transfers: `GET /treasury/transfers`, `POST /treasury/transfers`

### Other APIs
- Permissions, Invitations, Business, Profile, Statistics, Audit Logs, Plans, Subscriptions

## Types and Interfaces
- `AxiosInstance` - Configured axios client
- `InternalAxiosRequestConfig` - Request config with _retry flag
- `AxiosError` - Error type with response data

## Dependencies
- axios - HTTP client library
- vite - For environment variables (import.meta.env)

## Permissions
API calls automatically include cookies. Backend validates permissions for each endpoint.

## Configuration
- **Base URL**: `VITE_API_URL` env variable (default: http://localhost:3001)
- **Credentials**: `withCredentials: true` for all requests
- **Headers**: `Content-Type: application/json`
- **Timeout**: No timeout (infinite)

## Error Handling
- **401 Unauthorized**: Automatic token refresh, retry original request
- **Network errors**: Reject with error message
- **500+ errors**: Log to console, reject with error
- **Other errors**: Pass through to caller
