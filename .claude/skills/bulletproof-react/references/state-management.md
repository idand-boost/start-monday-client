# 🗃️ State Management Reference

## State Categories

| State type | Where it lives | Tool |
|-----------|---------------|------|
| Server/async state | react-query cache | `@tanstack/react-query` |
| Global client state | `src/stores/` | Zustand / Jotai |
| Feature-local state | `features/<n>/stores/` | Zustand / Jotai |
| Form state | Component-local | React Hook Form |
| Simple local UI state | Component `useState` | React built-in |
| Complex local UI state | Component `useReducer` | React built-in |
| Low-velocity shared data | React Context | React built-in |

## Rule of Thumb

> **Use the smallest scope that works.** Only promote state to a wider scope when you actually need it shared.

1. `useState` → local component
2. Lift state up → shared between siblings
3. React Context → low-velocity (theme, auth, locale)
4. Zustand/Jotai → medium-to-high velocity global client state
5. react-query → anything from a server

## Global State with Zustand

```ts
// src/stores/notifications.store.ts
import { create } from 'zustand';

type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
};

type NotificationsStore = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
};

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), ...notification },
      ],
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

## Feature-Local State with Zustand

```ts
// src/features/comments/stores/comments-ui.store.ts
import { create } from 'zustand';

type CommentsUIStore = {
  selectedCommentId: string | null;
  setSelectedCommentId: (id: string | null) => void;
};

export const useCommentsUIStore = create<CommentsUIStore>((set) => ({
  selectedCommentId: null,
  setSelectedCommentId: (id) => set({ selectedCommentId: id }),
}));
```

## Form State with React Hook Form

Always create an abstracted `<Form>` component that wraps the library:

```tsx
// src/components/ui/form.tsx
import { useForm, FormProvider, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

type FormProps<TFormValues extends FieldValues> = {
  schema: ZodSchema;
  onSubmit: SubmitHandler<TFormValues>;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  className?: string;
};

export function Form<TFormValues extends FieldValues>({
  schema, onSubmit, children, className,
}: FormProps<TFormValues>) {
  const methods = useForm<TFormValues>({ resolver: zodResolver(schema) });
  return (
    <FormProvider {...methods}>
      <form className={className} onSubmit={methods.handleSubmit(onSubmit)}>
        {children(methods)}
      </form>
    </FormProvider>
  );
}
```

Usage:

```tsx
import { z } from 'zod';
import { Form } from '@/components/ui/form';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  return (
    <Form<LoginValues>
      schema={schema}
      onSubmit={(values) => console.log(values)}
    >
      {({ register, formState: { errors } }) => (
        <>
          <input {...register('email')} />
          {errors.email && <span>{errors.email.message}</span>}
        </>
      )}
    </Form>
  );
}
```

## React Context — When to Use

Use Context for **low-velocity** data only (rarely changes):
- Auth user object
- Theme (light/dark)
- Locale/i18n
- Feature flags

For **medium/high-velocity** data (changes often), use `use-context-selector` or switch to Zustand/Jotai to avoid unnecessary re-renders.

## Avoiding Expensive Re-renders

```ts
// ❌ Runs myExpensiveFn on every render
const [state, setState] = useState(myExpensiveFn());

// ✅ Runs myExpensiveFn only once
const [state, setState] = useState(() => myExpensiveFn());
```

For high-frequency state (tracking many elements), consider **Jotai** (atomic updates) over a single large Zustand store.