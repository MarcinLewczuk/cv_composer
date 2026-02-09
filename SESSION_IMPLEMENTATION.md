# Session Functionality Implementation Summary

## Overview
Implemented JWT-based session management for authenticated users. Sessions persist across browser reloads and automatically attach authentication tokens to API requests.

## Changes Made

### Backend Changes

#### 1. JWT Authentication Module (`backend/src/security/auth.ts`)
- **New file** created to handle JWT token generation and verification
- `generateToken()` - Creates signed JWT tokens with user ID and email
- `verifyToken()` middleware - Validates JWT tokens in requests
- Configurable token expiry (default 7 days)
- Extends Express Request interface to include authenticated user data

#### 2. Updated Login Endpoint (`backend/src/queries.ts`)
- Modified `loginUser()` function to return JWT tokens alongside user data
- Response format: `{ token: "jwt-token", user: { id, email } }`
- Maintains security by hashing passwords with bcrypt

#### 3. Protected Route (`backend/src/app.ts`)
- Added `GET /users/me` endpoint protected by `verifyToken` middleware
- Only accessible with valid JWT token in Authorization header
- Returns authenticated user's information

#### 4. Environment Configuration (`backend/private/.env`)
- Added `JWT_SECRET` for token signing
- Added `JWT_EXPIRY` for token lifetime configuration

### Frontend Changes

#### 1. Updated AuthService (`src/app/services/AuthService.ts`)
- Now stores and manages JWT tokens
- `login()` method extracts token from response
- `getToken()` method for accessing current token
- Persists token and user data in localStorage
- `restore()` method reconstructs session on app startup

#### 2. HTTP Interceptor (`src/app/services/auth.interceptor.ts`)
- **New file** to automatically attach JWT tokens to API requests
- Adds `Authorization: Bearer <token>` header to backend requests
- Only applies to requests to localhost:3000

#### 3. App Configuration (`src/app/app.config.ts`)
- Registered HTTP interceptor in application providers
- Ensures all HTTP requests include authentication token

#### 4. App Component (`src/app/app.ts`)
- Added `ngOnInit` to restore session from localStorage
- Sessions persist across page reloads

#### 5. Route Guard (`src/app/guards/auth.guard.ts`)
- **New file** with `authGuard` to protect routes
- Usage: `{ path: 'profile', component: ProfileComponent, canActivate: [authGuard] }`

## Session Flow

### Login Flow
1. User submits credentials
2. Backend validates credentials and generates JWT token
3. Frontend receives `{ token, user }` response
4. Token and user data stored in localStorage
5. User redirected to home page

### Persistent Session
1. User refreshes page or returns later
2. App component calls `restore()` on initialization
3. Session reconstructed from localStorage
4. All subsequent requests include JWT token via interceptor

### Logout
1. User clicks logout
2. Token and user data cleared from localStorage and signals
3. User redirected to login page

### Protected Requests
1. Client sends request with `Authorization: Bearer <token>` header
2. Backend validates token with `verifyToken` middleware
3. If valid, request proceeds with user context
4. If invalid/expired, returns 401 Unauthorized

## Installation

Dependencies already installed:
- `jsonwebtoken` - JWT token generation and verification

## Configuration

Update `backend/private/.env`:
```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d
```

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (vulnerable to XSS)
   - For production, consider httpOnly cookies
2. **Token Expiry**: Default 7 days
   - Adjust `JWT_EXPIRY` in `.env` as needed
3. **Secret Key**: Change `JWT_SECRET` in production environment
4. **HTTPS**: Use HTTPS in production to prevent token interception
5. **CORS**: Configure CORS properly to restrict token access

## Protected Routes Example

Update your routes to use the guard:

```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [authGuard] 
  },
  { path: '', component: HomeComponent }
];
```

## Testing Protected Endpoints

```bash
# Get JWT token from login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token to access protected endpoint
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer <jwt-token>"
```
