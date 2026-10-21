# cli-create: Scaffold New TanStack Applications

## Priority: HIGH

## Explanation

`tanstack create` initializes TanStack Start (SSR by default) or Router-only apps with full add-on support. Always prefer `npx @tanstack/cli create` over manual setup — it wires `.tanstack.json`, integrations folder, and env scaffolding correctly.

## Syntax

```bash
npx @tanstack/cli create <project-name> [options]
# or after global install:
tanstack create <project-name> [options]
```

## Key Flags

| Flag                        | Description                                          |
|-----------------------------|------------------------------------------------------|
| `--add-ons <ids>`           | Comma-separated add-ons (e.g. `tanstack-query,clerk,drizzle`) |
| `--template <url-or-id>`    | Template source URL or ID                            |
| `--package-manager <pm>`    | `npm`, `pnpm`, `yarn`, `bun`, `deno`                 |
| `--framework <name>`        | `react` or `solid`                                   |
| `--router-only`             | File-based Router without Start/SSR                  |
| `--toolchain <id>`          | Toolchain add-on (e.g. Vite config)                  |
| `--deployment <id>`         | Deployment add-on (Vercel, Netlify, etc.)            |
| `--no-examples`             | Skip demo pages                                      |
| `--no-git`                  | Skip git init                                        |
| `--no-install`              | Skip dependency install                              |
| `-y, --yes`                 | Accept all defaults non-interactively                |
| `--list-add-ons`            | Print available add-ons and exit                     |
| `--addon-details <id>`      | Show detail for a specific add-on                    |
| `--json`                    | Machine-readable output                              |
| `--target-dir <path>`       | Output directory                                     |
| `-f, --force`               | Overwrite existing directory                         |

## Common Examples

```bash
# Interactive (recommended for first-time)
npx @tanstack/cli create my-app

# Full-stack with query + auth + DB
npx @tanstack/cli create my-app --add-ons tanstack-query,clerk,drizzle -y

# SPA only, no SSR
npx @tanstack/cli create my-app --router-only --package-manager bun

# List what add-ons are available
npx @tanstack/cli create --list-add-ons

# After creation
cd my-app && cp .env.example .env && pnpm dev
```

## Generated Structure

```
my-app/
├── routes/            # File-based routing (__root.tsx, index.tsx)
├── integrations/      # Add-on integration code
├── .tanstack.json     # CLI config (framework, add-ons, preferences)
└── .env.example       # Required env vars
```

## Context

- `.tanstack.json` is required by `tanstack add` — don't delete it
- SSR is on by default; use `--router-only` for pure client-side apps
- Run `tanstack add` later to add more add-ons without re-scaffolding
