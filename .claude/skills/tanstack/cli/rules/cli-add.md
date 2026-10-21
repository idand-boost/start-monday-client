# cli-add: Add Add-ons to Existing TanStack Projects

## Priority: MEDIUM

## Explanation

`tanstack add` integrates add-ons into an existing TanStack project without re-scaffolding. Requires `.tanstack.json` in the project root (created by `tanstack create`).

## Syntax

```bash
tanstack add [add-on...] [options]
```

| Flag       | Description                       |
|------------|-----------------------------------|
| `--forced` | Override conflict detection       |

## Examples

```bash
# Add a single add-on
tanstack add clerk

# Add multiple at once
tanstack add drizzle vercel

# Override conflicts (use carefully)
tanstack add sentry --forced

# Discover available add-ons first
tanstack create --list-add-ons
# or detail a specific one
tanstack create --addon-details clerk
```

## Custom Add-on Development

```bash
# Extract current project state as a reusable add-on
tanstack add-on init            # Generates .add-on/ folder

# After modifying .add-on/ files, rebuild
tanstack add-on compile
```

## Templates

```bash
# Initialize a reusable project template
tanstack template init          # Generates template-info.json + template.json

# After editing, rebuild
tanstack template compile

# Use a custom template when creating
tanstack create my-app --template ./my-template
# or from URL/registry
tanstack create my-app --template https://github.com/org/template
```

## pin-versions: Lock Dependency Versions

```bash
tanstack pin-versions
```

Removes `^`/`~` prefixes from TanStack deps and adds missing peer dependencies. Run before cutting a release or when you need reproducible installs.

## Context

- `tanstack add` reads `.tanstack.json` — must be run from project root
- `--forced` should be a last resort; prefer fixing conflicts manually
- Custom add-ons in `.add-on/` are portable and can be shared via git or npm
