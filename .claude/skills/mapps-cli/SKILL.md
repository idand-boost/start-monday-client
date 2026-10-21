---
name: mapps-cli
description: Run the monday apps CLI (mapps, @mondaycom/apps-cli) with correct, non-interactive commands, to push client-side or server code to monday code, promote versions, list apps, versions and features, manage env vars and secrets, read logs, schedule cron jobs, export storage, import or export manifests and open tunnels. Use when the user wants to deploy, push, ship or promote a monday app, mentions mapps, monday code, code:push, app:promote, app version ids, a GitHub Actions deploy to monday, or a mapps command fails, hangs on a prompt or has a wrong flag.
argument-hint: '<push | promote | versions | logs | env | secrets | scheduler | storage | tunnel>'
---

# mapps CLI

`mapps` is monday's command line tool for apps and monday code. It is used to manage, deploy, and interact with monday apps and their associated code and monday code services.

## Ground rules

- **`--help` beats every doc.** The official docs and the monday-code plugin skills both have wrong flags (see [references/pitfalls.md](references/pitfalls.md)). When unsure, run `mapps <command> --help` and trust it.
- **Write long flags.** `--appId`, `--appVersionId`, `--client-side`, never `-a`, `-i`, `-c`. Short letters mean different things in different commands (`-i` is the app id in `code:env` but the version id in `code:push`), so long flags are readable and safe.
- **Never let it prompt.** Any missing flag opens an interactive question, and an agent or CI job hangs. Pass every flag the command needs.
- **Never print the token.** `mapps init --token` writes it to `~/.mappsrc`. Read it from an env var or a CI secret, never put it in code, a commit or a chat.
- **Check the version first.** `mapps --version`. Below 4.10, `scheduler`, `manifest`, `code:report` and `database` commands are missing and region `il` isn't accepted. Upgrade with `npm install -g @mondaycom/apps-cli@latest`.

## Quick start

```bash
mapps app:list
mapps app-version:list --appId 12435876
mapps code:push --client-side --directoryPath dist --appId 12435876 --appVersionId 19013873
```

The two ids are in the Developer Center address: `.../apps/manage/<APP_ID>/app_versions/<APP_VERSION_ID>/...`.

## Commands

| Command                        | What it does                                                 | Reference                                                 |
| ------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------- |
| `init`                         | Save the API token to `.mappsrc`                             | [app-commands.md](references/app-commands.md#init)        |
| `app:list`, `app:create`       | List your apps, create an app                                | [app-commands.md](references/app-commands.md#apps)        |
| `app:promote`                  | Make a draft version live                                    | [app-commands.md](references/app-commands.md#apps)        |
| `app:deploy`                   | Deploy an app from a manifest file                           | [app-commands.md](references/app-commands.md#apps)        |
| `app:scaffold`                 | Start a project from a monday template                       | [app-commands.md](references/app-commands.md#apps)        |
| `app-version:list`, `:builds`  | List versions, list a version's builds                       | [app-commands.md](references/app-commands.md#versions)    |
| `app-features:list`, `:create` | List or create features on a version                         | [app-commands.md](references/app-commands.md#features)    |
| `app-features:build`           | Point a feature at a URL, monday code or the monday code CDN | [app-commands.md](references/app-commands.md#features)    |
| `manifest:export`, `:import`   | Save or load an app's setup as a manifest                    | [app-commands.md](references/app-commands.md#manifests)   |
| `code:push`                    | Upload client-side files (CDN) or server code                | [code-commands.md](references/code-commands.md#push)      |
| `code:status`, `code:report`   | Deployment status, security scan report                      | [code-commands.md](references/code-commands.md#status)    |
| `code:logs`                    | Live or past logs of server code                             | [code-commands.md](references/code-commands.md#logs)      |
| `code:env`, `code:secret`      | Environment variables and secrets on monday code             | [code-commands.md](references/code-commands.md#env)       |
| `database:connection-string`   | Connection string of the app's database                      | [code-commands.md](references/code-commands.md#database)  |
| `scheduler:*`                  | Create, list, run, update and delete cron jobs               | [other-commands.md](references/other-commands.md#cron)    |
| `storage:*`                    | Export, search or remove an account's storage data           | [other-commands.md](references/other-commands.md#storage) |
| `tunnel:create`                | Expose a local port with a public URL                        | [other-commands.md](references/other-commands.md#tunnel)  |
| `api:generate`, `autocomplete` | API typing setup, shell completion                           | [other-commands.md](references/other-commands.md#misc)    |

Every command also takes `--verbose` (more logs) and `--print-command` (print what ran).

## Before you run anything

```
- [ ] Logged in: mapps app:list works
- [ ] You have the app id, and the version id when the command needs one
- [ ] Every required flag is passed, in long form
- [ ] Anything that changes a live version or deletes data is confirmed with the user
```

Platform facts that bite (live versions are locked, env vars need a redeploy, cron limits, `index.html` for the CDN): [references/pitfalls.md](references/pitfalls.md).
