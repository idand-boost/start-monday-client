# 🧪 Testing Reference

## Testing Philosophy

Test **behavior**, not implementation. A test should verify what the user sees and does,
not how the internals work. If you refactor state management or swap libraries, tests should
still pass as long as the UI behavior is unchanged.

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner |
| **React Testing Library (RTL)** | Component rendering + user interaction |
| **MSW (Mock Service Worker)** | HTTP request mocking |
| **Playwright** | End-to-end browser tests |

## Test File Location

Co-locate test files next to the code they test:

```
features/discussions/
├── components/
│   ├── discussion-card.tsx
│   └── discussion-card.test.tsx   ← co-located
└── api/
    ├── get-discussions.ts
    └── get-discussions.test.ts
```

Or use a `__tests__/` sibling folder for larger test suites.

## Component Tests with RTL

```tsx
// discussion-card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscussionCard } from './discussion-card';

const mockDiscussion = {
  id: '1',
  title: 'Test Discussion',
  body: 'Test body content',
  author: { name: 'Alice' },
};

describe('DiscussionCard', () => {
  it('renders the discussion title', () => {
    render(<DiscussionCard discussion={mockDiscussion} />);
    expect(screen.getByText('Test Discussion')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn();
    render(<DiscussionCard discussion={mockDiscussion} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

## Mocking API Calls with MSW

MSW intercepts real HTTP calls at the network level — no mocking of modules needed.

```ts
// src/testing/mocks/handlers/discussions.ts
import { http, HttpResponse } from 'msw';

export const discussionHandlers = [
  http.get('/api/discussions', () => {
    return HttpResponse.json([
      { id: '1', title: 'Mock Discussion', body: '...' },
    ]);
  }),

  http.post('/api/discussions', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '2', ...body }, { status: 201 });
  }),
];
```

```ts
// src/testing/mocks/server.ts
import { setupServer } from 'msw/node';
import { discussionHandlers } from './handlers/discussions';

export const server = setupServer(...discussionHandlers);
```

```ts
// src/testing/setup.ts (vitest setup file)
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

MSW is also great for **prototyping** the frontend before the real API is ready. Define handlers,
build the UI, and swap to real API endpoints later with zero code changes.

## Integration Test with MSW

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { DiscussionList } from './discussion-list';
import { createWrapper } from '@/testing/test-utils';

test('loads and displays discussions', async () => {
  render(<DiscussionList />, { wrapper: createWrapper() });

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Mock Discussion')).toBeInTheDocument();
  });
});
```

## Test Utilities (`src/testing/test-utils.tsx`)

Create a custom `render` function that wraps with all providers:

```tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: createWrapper(), ...options });
}

export * from '@testing-library/react';
export { customRender as render, createWrapper };
```

## E2E Tests with Playwright

```ts
// e2e/discussions.spec.ts
import { test, expect } from '@playwright/test';

test('user can create a discussion', async ({ page }) => {
  await page.goto('/discussions');
  await page.getByRole('button', { name: 'New Discussion' }).click();
  await page.getByLabel('Title').fill('My New Discussion');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('My New Discussion')).toBeVisible();
});
```

Run in **browser mode** locally (with UI), **headless mode** in CI.

## What NOT to Test

- Implementation details (internal state, private methods)
- Exact CSS class names
- 3rd-party library internals