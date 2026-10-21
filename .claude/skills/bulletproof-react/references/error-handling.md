# ⚠️ Error Handling Reference

## Layers of Error Handling

1. **API interceptor** — catches HTTP errors globally
2. **Error boundaries** — catches render errors in component trees
3. **Query error state** — handles async/loading errors per query
4. **Error monitoring** — Sentry (production)

## 1. API Interceptor

Handle HTTP errors centrally in your axios instance:

```ts
// src/lib/axios.ts
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      // Redirect to login / clear auth state
      authStore.getState().logout();
    }

    if (status === 403) {
      // Show "forbidden" notification
    }

    // Show toast notification for all errors
    useNotificationsStore.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    });

    return Promise.reject(error);
  }
);
```

## 2. Error Boundaries

Use multiple granular error boundaries — not just one at the app root. This contains
failures to the affected section rather than crashing the whole app.

```tsx
// src/components/errors/main-error-fallback.tsx
export function MainErrorFallback() {
  return (
    <div role="alert">
      <h2>Something went wrong.</h2>
      <button onClick={() => window.location.assign(window.location.origin)}>
        Refresh
      </button>
    </div>
  );
}
```

```tsx
// src/app/provider.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { MainErrorFallback } from '@/components/errors/main-error-fallback';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
```

Place additional error boundaries around:
- Route components (page-level failures)
- Complex widgets (sidebar, data table, chart)
- Feature-specific sections

## 3. Handling Query Errors

```tsx
export function DiscussionList() {
  const { data, isLoading, error } = useDiscussions();

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div role="alert">
        <p>Failed to load discussions: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return <ul>{data?.map(d => <DiscussionCard key={d.id} discussion={d} />)}</ul>;
}
```

## 4. Error Monitoring with Sentry

```ts
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';
import { env } from '@/config/env';

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.APP_ENV,
  enabled: env.APP_ENV === 'production',
});
```

Integrate Sentry with your error boundary:

```tsx
import { ErrorBoundary } from '@sentry/react';

<ErrorBoundary fallback={<MainErrorFallback />}>
  {children}
</ErrorBoundary>
```

## Notification Pattern

Centralize error notifications through a store + component pair:

```tsx
// src/components/ui/notifications.tsx
import { useNotificationsStore } from '@/stores/notifications.store';

export function Notifications() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const dismiss = useNotificationsStore((s) => s.dismissNotification);

  return (
    <div className="notifications-container">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={dismiss} />
      ))}
    </div>
  );
}
```