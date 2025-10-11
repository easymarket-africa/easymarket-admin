# 🔐 Admin Authentication Integration Guide

This guide explains how to use the integrated admin authentication system in the EasyMarket Admin application.

## 📋 Overview

The authentication system has been fully integrated with all the admin authentication endpoints provided. It includes:

- **Token Management**: Access and refresh token handling
- **Automatic Token Refresh**: Seamless token renewal
- **Route Protection**: Authentication guards for protected routes
- **Session Management**: Admin session tracking
- **Profile Management**: Admin profile updates

## 🚀 Quick Start

### 1. Login Flow

```typescript
import { useLogin } from "@/hooks/use-auth";

function LoginComponent() {
  const loginMutation = useLogin();

  const handleLogin = (email: string, password: string) => {
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          // User will be automatically redirected to dashboard
          console.log("Login successful!");
        },
        onError: (error) => {
          // If requiresVerification is true, user will be automatically redirected
          // to /verify-email page with email stored in localStorage
          if (error.requiresVerification) {
            console.log("Email verification required");
          } else {
            console.error("Login failed:", error.message);
          }
        },
      }
    );
  };

  return (
    <button
      onClick={() => handleLogin("admin@example.com", "password")}
      disabled={loginMutation.isPending}
    >
      {loginMutation.isPending ? "Signing in..." : "Sign In"}
    </button>
  );
}
```

### 2. Protected Routes

```typescript
import { AuthGuard } from "@/components/auth-guard";

function DashboardPage() {
  return (
    <AuthGuard>
      <div>Protected dashboard content</div>
    </AuthGuard>
  );
}
```

### 3. Get Current User

```typescript
import { useCurrentUser } from "@/hooks/use-auth";

function UserProfile() {
  const { data: admin, isLoading, error } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  return (
    <div>
      <h1>Welcome, {admin?.fullName}</h1>
      <p>Email: {admin?.email}</p>
      <p>Role: {admin?.role}</p>
    </div>
  );
}
```

### 4. Forgot Password Flow

```typescript
import { useRequestPasswordReset, useResetPassword } from "@/hooks/use-auth";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");

  const requestResetMutation = useRequestPasswordReset();
  const resetPasswordMutation = useResetPassword();

  const handleRequestReset = () => {
    requestResetMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setStep("reset");
        },
        onError: (error) => {
          console.error("Failed to send reset code:", error.message);
        },
      }
    );
  };

  const handleResetPassword = () => {
    resetPasswordMutation.mutate(
      { email, code: resetCode, newPassword },
      {
        onSuccess: () => {
          // User will be redirected to login page
          console.log("Password reset successful!");
        },
        onError: (error) => {
          console.error("Failed to reset password:", error.message);
        },
      }
    );
  };

  return (
    <div>
      {step === "email" ? (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button
            onClick={handleRequestReset}
            disabled={requestResetMutation.isPending}
          >
            {requestResetMutation.isPending ? "Sending..." : "Send Reset Code"}
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            placeholder="Enter reset code"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <button
            onClick={handleResetPassword}
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </div>
      )}
    </div>
  );
}
```

### 5. Email Verification Flow

```typescript
import {
  useVerifyEmail,
  useResendVerification,
  usePendingVerificationEmail,
} from "@/hooks/use-auth";

function EmailVerificationForm() {
  const [verificationCode, setVerificationCode] = useState("");
  const pendingEmail = usePendingVerificationEmail();

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  const handleVerifyEmail = () => {
    if (!pendingEmail || !verificationCode) return;

    verifyEmailMutation.mutate(
      { email: pendingEmail, code: verificationCode },
      {
        onSuccess: () => {
          // User will be redirected to dashboard
          console.log("Email verified successfully!");
        },
        onError: (error) => {
          console.error("Email verification failed:", error.message);
        },
      }
    );
  };

  const handleResendCode = () => {
    if (!pendingEmail) return;

    resendVerificationMutation.mutate(
      { email: pendingEmail },
      {
        onSuccess: () => {
          console.log("Verification email sent!");
        },
        onError: (error) => {
          console.error("Failed to resend verification email:", error.message);
        },
      }
    );
  };

  return (
    <div>
      <p>Enter the 6-digit code sent to {pendingEmail}</p>
      <input
        type="text"
        value={verificationCode}
        onChange={(e) =>
          setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        placeholder="Enter 6-digit code"
        maxLength={6}
      />
      <button
        onClick={handleVerifyEmail}
        disabled={
          verifyEmailMutation.isPending || verificationCode.length !== 6
        }
      >
        {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
      </button>
      <button
        onClick={handleResendCode}
        disabled={resendVerificationMutation.isPending}
      >
        {resendVerificationMutation.isPending ? "Sending..." : "Resend Code"}
      </button>
    </div>
  );
}
```

## 🔧 Available Hooks

### Authentication Hooks

| Hook                   | Description           | Returns                        |
| ---------------------- | --------------------- | ------------------------------ |
| `useLogin()`           | Login mutation        | `{ mutate, isPending, error }` |
| `useLogout()`          | Logout mutation       | `{ mutate, isPending, error }` |
| `useCurrentUser()`     | Get current admin     | `{ data, isLoading, error }`   |
| `useCurrentSession()`  | Get current session   | `{ data, isLoading, error }`   |
| `useIsAuthenticated()` | Check auth status     | `boolean`                      |
| `useStoredAdminData()` | Get stored admin data | `Admin \| null`                |

### Profile Management Hooks

| Hook                  | Description              | Returns                        |
| --------------------- | ------------------------ | ------------------------------ |
| `useChangePassword()` | Change password mutation | `{ mutate, isPending, error }` |
| `useUpdateProfile()`  | Update profile mutation  | `{ mutate, isPending, error }` |

### Password Reset Hooks

| Hook                        | Description                 | Returns                        |
| --------------------------- | --------------------------- | ------------------------------ |
| `useRequestPasswordReset()` | Request password reset code | `{ mutate, isPending, error }` |
| `useResetPassword()`        | Reset password with code    | `{ mutate, isPending, error }` |

### Email Verification Hooks

| Hook                            | Description               | Returns                        |
| ------------------------------- | ------------------------- | ------------------------------ |
| `useVerifyEmail()`              | Verify email with code    | `{ mutate, isPending, error }` |
| `useResendVerification()`       | Resend verification email | `{ mutate, isPending, error }` |
| `usePendingVerificationEmail()` | Get pending email         | `string \| null`               |

### Token Management Hooks

| Hook                | Description            | Returns                        |
| ------------------- | ---------------------- | ------------------------------ |
| `useRefreshToken()` | Refresh token mutation | `{ mutate, isPending, error }` |

## 🛡️ Route Protection

### Using AuthGuard Component

```typescript
import { AuthGuard } from "@/components/auth-guard";

function ProtectedPage() {
  return (
    <AuthGuard>
      <div>This content is only visible to authenticated admins</div>
    </AuthGuard>
  );
}
```

### Using HOC (Higher-Order Component)

```typescript
import { withAuthGuard } from "@/components/auth-guard";

function DashboardPage() {
  return <div>Dashboard content</div>;
}

export default withAuthGuard(DashboardPage);
```

### Custom Auth Check

```typescript
import { useIsAuthenticated, useStoredAdminData } from "@/hooks/use-auth";

function ConditionalContent() {
  const isAuthenticated = useIsAuthenticated();
  const adminData = useStoredAdminData();

  if (!isAuthenticated) {
    return <div>Please log in to view this content</div>;
  }

  if (adminData?.role !== "super_admin") {
    return <div>You don't have permission to view this content</div>;
  }

  return <div>Super admin content</div>;
}
```

## 🔄 Token Management

The system automatically handles token management:

### Automatic Token Refresh

- Access tokens are automatically refreshed when they expire
- Failed requests with 401 status trigger automatic token refresh
- Original requests are retried with new tokens

### Manual Token Management

```typescript
import { tokenManager } from "@/lib/api-client";

// Check authentication status
const isAuth = tokenManager.isAuthenticated();

// Get tokens
const accessToken = tokenManager.getAccessToken();
const refreshToken = tokenManager.getRefreshToken();

// Set tokens (usually done automatically after login)
tokenManager.setTokens(accessToken, refreshToken);

// Clear tokens (usually done automatically after logout)
tokenManager.clearTokens();
```

## 📡 API Endpoints

The system integrates with these admin authentication endpoints:

| Endpoint                      | Method | Description               |
| ----------------------------- | ------ | ------------------------- |
| `/admin/auth/login`           | POST   | Admin login               |
| `/admin/auth/logout`          | POST   | Admin logout              |
| `/admin/auth/refresh`         | POST   | Refresh access token      |
| `/admin/auth/session`         | GET    | Get current session       |
| `/admin/auth/change-password` | PUT    | Change password           |
| `/admin/auth/profile`         | PUT    | Update profile            |
| `/auth/forgot-password`       | POST   | Request password reset    |
| `/auth/reset-password`        | POST   | Reset password with code  |
| `/auth/verify-email`          | POST   | Verify email with code    |
| `/auth/resend-verification`   | POST   | Resend verification email |

### 📊 Statistics Endpoints

The system also integrates with these statistics endpoints:

| Endpoint                        | Method | Description            |
| ------------------------------- | ------ | ---------------------- |
| `/agents/statistics/overview`   | GET    | Get agent statistics   |
| `/products/statistics/overview` | GET    | Get product statistics |
| `/vendors/statistics/overview`  | GET    | Get vendor statistics  |

## 🔒 Security Features

### Admin Role Requirements

- User must have `role: 'admin'` or `role: 'super_admin'`
- User must have `status: 'active'`
- User must have `isEmailVerified: true`

### Token Security

- Access tokens expire (typically 24 hours)
- Refresh tokens expire (typically 7 days)
- Tokens are stored in localStorage (consider upgrading to httpOnly cookies for production)
- Automatic token refresh prevents session interruption

### Session Tracking

- IP address tracking
- User agent tracking
- Login time tracking
- Session activity monitoring

## 🧪 Testing

### Run Authentication Tests

```typescript
import { runAllAuthTests } from "@/lib/auth-test";

// Run all authentication tests
runAllAuthTests().then((allPassed) => {
  console.log("All tests passed:", allPassed);
});
```

### Test Individual Components

```typescript
import {
  testAuthIntegration,
  testApiClientTokenHandling,
} from "@/lib/auth-test";

// Test authentication integration
testAuthIntegration();

// Test API client token handling
testApiClientTokenHandling();
```

## 🚨 Error Handling

### Common Error Scenarios

1. **Invalid Credentials**

   ```typescript
   const loginMutation = useLogin();

   loginMutation.mutate(credentials, {
     onError: (error) => {
       if (error.message.includes("Invalid credentials")) {
         // Handle invalid credentials
       }
     },
   });
   ```

2. **Token Expired**

   ```typescript
   // Handled automatically by the API client
   // No manual intervention required
   ```

3. **Account Not Active**

   ```typescript
   const { data: admin } = useCurrentUser();

   if (admin?.status !== "active") {
     // Handle inactive account
   }
   ```

4. **Email Not Verified**

   ```typescript
   const { data: admin } = useCurrentUser();

   if (!admin?.isEmailVerified) {
     // Handle unverified email
   }
   ```

## 🔧 Configuration

### Environment Variables

Make sure these environment variables are set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3100
```

### API Client Configuration

The API client is configured in `/src/lib/api-client.ts`:

- Base URL: Uses `NEXT_PUBLIC_API_URL`
- Timeout: 30 seconds
- Automatic token attachment
- Automatic token refresh
- Error handling and redirects

## 📝 Example Usage

### Complete Login Component

```typescript
"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate(
      { email, password },
      {
        onError: (error) => {
          console.error("Login failed:", error.message);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loginMutation.isPending}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loginMutation.isPending}
        required
      />
      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
```

### Complete Protected Page

```typescript
"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { data: admin } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div>
      <h1>Welcome, {admin?.fullName}</h1>
      <p>Email: {admin?.email}</p>
      <p>Role: {admin?.role}</p>
      <Button onClick={handleLogout} disabled={logoutMutation.isPending}>
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
```

## 🎯 Best Practices

1. **Always use AuthGuard for protected routes**
2. **Handle loading and error states in your components**
3. **Use the provided hooks instead of direct API calls**
4. **Test authentication flows thoroughly**
5. **Monitor token expiration and refresh**
6. **Implement proper error handling**
7. **Consider upgrading to httpOnly cookies for production**

## 🆘 Troubleshooting

### Common Issues

1. **Login not working**

   - Check if API URL is correct
   - Verify backend is running
   - Check network requests in browser dev tools

2. **Token refresh failing**

   - Check if refresh token is valid
   - Verify refresh endpoint is working
   - Check for CORS issues

3. **Routes not protecting**

   - Ensure AuthGuard is properly implemented
   - Check if authentication state is being tracked
   - Verify token storage

4. **Session data not updating**
   - Check if query cache is being updated
   - Verify API responses match expected format
   - Check for stale data issues

### Debug Mode

Enable debug logging by adding this to your component:

```typescript
import { tokenManager } from "@/lib/api-client";

// Check authentication status
console.log("Is authenticated:", tokenManager.isAuthenticated());
console.log("Access token:", tokenManager.getAccessToken());
console.log("Refresh token:", tokenManager.getRefreshToken());
```

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [JWT Token Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Note**: This authentication system is designed for admin users only. Regular user authentication should be handled separately.
