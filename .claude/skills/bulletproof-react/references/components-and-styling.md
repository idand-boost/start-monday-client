# 🧱 Components & Styling Reference

## Component Location Rules

| Component type | Location |
|---------------|----------|
| Used across the whole app | `src/components/` |
| Used only within one feature | `src/features/<n>/components/` |
| UI primitives (Button, Input…) | `src/components/ui/` |

## Component Patterns

### Keep Components Small and Focused

Each component should do one thing. If a component accepts too many props, split it or use
composition via `children` or slots:

```tsx
// ❌ Prop explosion
<Card title="..." subtitle="..." icon="..." action="..." footer="..." />

// ✅ Composition
<Card>
  <Card.Header>
    <Card.Icon />
    <Card.Title />
  </Card.Header>
  <Card.Body />
  <Card.Footer />
</Card>
```

### Wrap 3rd-Party Components

Always create a thin wrapper around any 3rd-party component. This makes future
replacements easy and lets you adapt the API to your app:

```tsx
// src/components/ui/button.tsx
import { Button as ChakraButton } from '@chakra-ui/react';

type ButtonProps = {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <ChakraButton colorScheme={variantMap[variant]} {...props} />;
}
```

### Build Abstractions Before You Need Them

Before creating a shared component, identify at least 2–3 real use cases to avoid
premature/wrong abstractions. If you only have one usage, keep it local to the feature.

### PascalCase Exports, kebab-case Files

```
src/components/ui/
├── button.tsx          → export function Button
├── data-table.tsx      → export function DataTable
└── modal-dialog.tsx    → export function ModalDialog
```

## Styling Options

Bulletproof React is style-system agnostic. Common approaches:

### Tailwind CSS (recommended for new projects)
```tsx
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {children}
    </div>
  );
}
```

### CSS Modules
```tsx
import styles from './card.module.css';

export function Card({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}
```

### Styled Components
```tsx
import styled from 'styled-components';

const StyledCard = styled.div`
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 1rem;
`;

export function Card({ children }: { children: React.ReactNode }) {
  return <StyledCard>{children}</StyledCard>;
}
```

> ⚠️ **React Server Components**: If using RSC (Next.js App Router), avoid runtime styling
> solutions (styled-components, Emotion). Use Tailwind or CSS Modules instead.

## Component Library Recommendations

**Fully-styled (opinionated):**
- **Chakra UI** — Great DX, fast prototyping, accessible out of the box
- **Ant Design** — Best for admin dashboards, rich component set
- **MUI** — Most popular, Material Design or headless mode

**Headless (you bring the styles):**
- **Radix UI** — Accessible primitives, pairs well with Tailwind
- **Headless UI** — By Tailwind team, minimal and accessible
- **shadcn/ui** — Radix + Tailwind, components as code (not a package)
- **React Aria** — Adobe's headless library, excellent accessibility

## Code Consistency Rules

- Name components consistently: PascalCase everywhere
- One component per file
- Co-locate styles with the component (CSS Module or styled-component in the same file)
- Never use inline styles except for truly dynamic values
- Prefer `className` merging utilities (`clsx`, `cn`) over ternary-heavy className strings