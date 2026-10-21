---
name: tanstack
description: TanStack rules and best practices. ALWAYS load when the project uses any TanStack library.
---

# TanStack

Covers TanStack Query, Router, Router+Query integration, and the TanStack CLI.

## Query — `query/rules/`

| Priority | Prefix     | Key Rules                                               |
| -------- | ---------- | ------------------------------------------------------- |
| CRITICAL | `qk-`      | Factory pattern, array keys, hierarchical org           |
| CRITICAL | `cache-`   | staleTime, gcTime, defaults, targeted invalidation      |
| HIGH     | `mut-`     | Invalidate after mutation, optimistic updates, rollback |
| HIGH     | `err-`     | Error boundaries, retry config                          |
| MEDIUM   | `pf-`      | Intent prefetch, ensureQueryData                        |
| MEDIUM   | `ssr-`     | Dehydration, HydrationBoundary, per-request client      |
| LOW      | `perf-`    | select transform, notifyOnChangeProps                   |
| LOW      | `offline-` | network-mode, persist-queries                           |

## Router — `router/rules/`

| Priority | Prefix     | Key Rules                                            |
| -------- | ---------- | ---------------------------------------------------- |
| CRITICAL | `ts-`      | Register router, `from` param, route context typing  |
| CRITICAL | `org-`     | File-based routing, pathless layouts, virtual routes |
| HIGH     | `load-`    | Route loaders, ensureQueryData, parallel loading     |
| HIGH     | `search-`  | Validate params, custom serializers, middleware      |
| MEDIUM   | `nav-`     | Link component, useNavigate, route masks             |
| MEDIUM   | `split-`   | .lazy.tsx, autoCodeSplitting                         |
| MEDIUM   | `preload-` | Intent preloading, preload stale time                |

## Router + Query Integration — `integration/rules/`

| Priority | Prefix   | Key Rules                                             |
| -------- | -------- | ----------------------------------------------------- |
| CRITICAL | `setup-` | QueryClient through router context, provider wrapping |
| CRITICAL | `ssr-`   | setupRouterSsrQueryIntegration                        |
| HIGH     | `flow-`  | loader+ensureQueryData, useSuspenseQuery, server fns  |
| MEDIUM   | `cache-` | Single source of truth, preload coordination          |

## CLI — `cli/rules/`

| Rule              | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `cli-create`      | Scaffold new TanStack Start / Router apps    |
| `cli-add`         | Add add-ons to existing projects             |
| `cli-search-docs` | Search and fetch TanStack docs from terminal |

## Load by Task

- Data fetching → `query/rules/`
- Routing → `router/rules/`
- Full-stack app → all three + `cli/rules/`
- Scaffolding / doc lookup → `cli/rules/`
