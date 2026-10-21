# cli-search-docs: Query TanStack Documentation from Terminal

## Priority: HIGH

## Explanation

`tanstack search-docs` and `tanstack doc` let you fetch current TanStack documentation without leaving the terminal. Prefer these over web search when working with TanStack APIs — results are versioned, official, and scoped to the library you're using.

## search-docs: Full-Text Search

```bash
tanstack search-docs <query> [options]
```

| Flag                   | Description                              |
|------------------------|------------------------------------------|
| `--library <id>`       | Narrow to a specific library             |
| `--framework <name>`   | Filter by framework (`react`, `solid`)   |
| `--limit <n>`          | Max results (default 10, max 50)         |
| `--json`               | Machine-readable output                  |

### Examples

```bash
# Search all TanStack docs
tanstack search-docs "query key factory"

# Scoped to router docs
tanstack search-docs "search params validation" --library router

# Scoped to query, React, more results
tanstack search-docs "optimistic updates" --library query --framework react --limit 20

# Pipe JSON to jq
tanstack search-docs "dehydrate hydrate" --json | jq '.[].title'
```

## doc: Fetch a Specific Page

```bash
tanstack doc <library> <path> [options]
```

| Flag                      | Description                           |
|---------------------------|---------------------------------------|
| `--docs-version <version>`| Version (default: latest)             |
| `--json`                  | Machine-readable output               |

### Examples

```bash
# Fetch query overview
tanstack doc query overview

# Fetch router search-params guide
tanstack doc router search-params

# Pinned version
tanstack doc query optimistic-updates --docs-version 5

# Machine-readable for scripting
tanstack doc start ssr --json
```

## libraries: Discover What's Available

```bash
tanstack libraries [--group <group>] [--json]
```

Groups: `state`, `headlessUI`, `performance`, `tooling`

```bash
tanstack libraries                         # All libraries
tanstack libraries --group state           # State management only
tanstack libraries --json | jq '.[].id'   # Extract IDs
```

## ecosystem: Browse Partner Integrations

```bash
tanstack ecosystem [--category <cat>] [--library <id>] [--json]
```

```bash
tanstack ecosystem                                   # All partners
tanstack ecosystem --library query                   # Query integrations
tanstack ecosystem --category auth                   # Auth partners only
```

## Context

- Use `--json` + `jq` for scripting or when feeding results to another tool
- `search-docs` is best for exploring; `doc` is best when you know the exact page
- Library IDs: `query`, `router`, `start`, `table`, `form`, `virtual`, `ranger`, etc.
