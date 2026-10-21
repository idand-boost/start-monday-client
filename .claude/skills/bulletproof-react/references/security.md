# 🔐 Security Reference

## Authentication

Store auth state in memory (Zustand) — not in `localStorage` for sensitive tokens.
Use httpOnly cookies for refresh tokens (server sets them, JS can't read them).

```ts
// src/features/auth/stores/auth.store.ts
import { create } from 'zustand';

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    set({ user: null });
    // Optionally call /api/auth/logout to clear httpOnly cookie
  },
}));
```

### Auth Provider Pattern

```tsx
// src/features/auth/components/auth-provider.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <FullPageSpinner />;

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Routes

```tsx
// src/app/routes/protected.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
```

## XSS Prevention

React automatically escapes values rendered via JSX. Be careful with:

```tsx
// ❌ Dangerous — bypasses React's escaping
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ If you must render HTML, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

Never use `eval()` or `new Function()` with user-provided strings.

## CSRF Protection

When using cookie-based auth, ensure your API sets `SameSite=Strict` or `SameSite=Lax` on cookies.
For APIs that require explicit CSRF tokens, add the token as a request header via the axios interceptor:

```ts
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});
```

## Input Validation

**Always validate on both client and server.** Use Zod for client-side schema validation:

```ts
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(10_000),
  tags: z.array(z.string()).max(5),
});

type CreatePostInput = z.infer<typeof createPostSchema>;
```

Wire Zod schemas into React Hook Form via `zodResolver` (see state-management.md).

## Environment Variables

Never expose secrets to the frontend. Use `.env` with Vite's `import.meta.env`:

```ts
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
});
```

- Prefix all public env vars with `VITE_`
- Never prefix secret keys — they won't be bundled
- Validate env vars at startup so you fail fast if something is missing

## Authorization: Role-Based Access

```tsx
// src/features/auth/components/authorization.tsx
type Role = 'admin' | 'moderator' | 'user';

type AuthorizationProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
  forbiddenFallback?: React.ReactNode;
};

export function Authorization({ allowedRoles, children, forbiddenFallback = null }: AuthorizationProps) {
  const user = useAuthStore((s) => s.user);
  if (!user || !allowedRoles.includes(user.role)) return <>{forbiddenFallback}</>;
  return <>{children}</>;
}
```

Usage:
```tsx
<Authorization allowedRoles={['admin']} forbiddenFallback={<p>No access.</p>}>
  <AdminPanel />
</Authorization>
```

## Security Headers

Configure these headers on your hosting/CDN layer:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`