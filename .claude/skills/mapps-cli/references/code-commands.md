# monday code commands

Flags from `mapps <command> --help`, version 4.10.8. Examples use long flags. `--region` (`-z`) accepts `us`, `eu`, `au` or `il` on every command that has it.

## Push

### `code:push`

Uploads your project to monday code.

| Short | Long              | Description                                                    |
| ----- | ----------------- | -------------------------------------------------------------- |
| `-a`  | `--appId`         | The app id                                                     |
| `-i`  | `--appVersionId`  | The version id                                                 |
| `-c`  | `--client-side`   | Upload to the CDN as client-side files (no server)             |
| `-d`  | `--directoryPath` | Folder to upload. Default: the current folder                  |
| `-f`  | `--force`         | Push to the live version                                       |
| `-s`  | `--security-scan` | Scan dependencies for vulnerabilities (doesn't block the push) |
| `-z`  | `--region`        | Region                                                         |

**Client-side app** (React, Vite): build first, then push the build folder. It must have `index.html` at its root.

```bash
npm run build
mapps code:push --client-side --directoryPath dist --appId 12435876 --appVersionId 19013873
```

**Server app**: push the project folder, without `--client-side`.

```bash
mapps code:push --directoryPath . --appId 12435876 --appVersionId 19013873
```

- Pushing to a **live** version needs `--force`. Without it the push targets a draft.
- The push leaves an archive behind (`dist.zip` or `code.tar.gz`). Delete it or add it to `.gitignore`.
- After a first push, connect each feature to it in the Developer Center, or with `app-features:build --buildType monday_code_cdn` (client-side) or `monday_code` (server).

**In GitHub Actions**, store `MONDAY_APP_ID` and `MONDAY_APP_VERSION_ID` as repository variables and `MONDAY_TOKEN` as a secret, then:

```yaml
- run: npm ci && npm run build
- run: npm install -g @mondaycom/apps-cli
- run: mapps init --token "${{ secrets.MONDAY_TOKEN }}"
- run: >
    mapps code:push --client-side --directoryPath dist
    --appId "${{ vars.MONDAY_APP_ID }}"
    --appVersionId "${{ vars.MONDAY_APP_VERSION_ID }}" --force
```

## Status

### `code:status`

| Short | Long             | Description    |
| ----- | ---------------- | -------------- |
| `-i`  | `--appVersionId` | The version id |
| `-z`  | `--region`       | Region         |

### `code:report`

Security scan report of the last push made with `--security-scan`.

| Short | Long             | Description                            |
| ----- | ---------------- | -------------------------------------- |
| `-i`  | `--appVersionId` | The version id                         |
| `-o`  | `--output`       | Save the full report as JSON           |
| `-d`  | `--outputDir`    | Folder for the JSON (needs `--output`) |
| `-z`  | `--region`       | Region                                 |

## Logs

### `code:logs`

Logs of server code. The `--help` text is wrong about which source the date flags belong to; this table is what actually works (mondaycom/agentic-monday issue #6).

| Short | Long                  | Description                                                                                              |
| ----- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| `-i`  | `--appVersionId`      | The version id                                                                                           |
| `-s`  | `--eventSource`       | **Always pass.** `live` or `history` (lowercase)                                                         |
| `-t`  | `--logsType`          | **Always pass.** `console` (stdout) or `http` (requests)                                                 |
| `-f`  | `--logsStartDate`     | `MM/DD/YYYY HH:mm`. Required with `history`                                                              |
| `-e`  | `--logsEndDate`       | `MM/DD/YYYY HH:mm`. Required with `history`                                                              |
| `-r`  | `--logSearchFromText` | Broken: with `live` returns nothing, with `history` ignored. Pass `""` with `history` to skip its prompt |
| `-z`  | `--region`            | Region                                                                                                   |

```bash
mapps code:logs --appVersionId 19013873 --eventSource live --logsType console
mapps code:logs --appVersionId 19013873 --eventSource history --logsType console \
  --logsStartDate "03/15/2026 00:00" --logsEndDate "03/15/2026 23:59" --logSearchFromText ""
```

To filter, pipe the output: `... | grep -E "error|timeout"`.

## Env

### `code:env` and `code:secret`

Same flags for both. Note: `-i` is the **app** id here.

| Short | Long       | Description                               |
| ----- | ---------- | ----------------------------------------- |
| `-i`  | `--appId`  | The app id                                |
| `-m`  | `--mode`   | `list-keys`, `set` or `delete`            |
| `-k`  | `--key`    | The key. Required for `set` and `delete`  |
| `-v`  | `--value`  | The value. Required for `set`             |
| `-z`  | `--region` | Region. Multi-region apps set each region |

```bash
mapps code:env --appId 12435876 --mode list-keys
mapps code:secret --appId 12435876 --mode set --key MONDAY_SIGNING_SECRET --value "$MONDAY_SIGNING_SECRET"
```

- Changes take effect after the next `code:push`.
- In server code, read them with `EnvironmentVariablesManager` and `SecretsManager` from `@mondaycom/apps-sdk`.
- Never set `MNDY_MONGODB_CONNECTION_STRING`: monday code injects it after the first deploy.

## Database

### `database:connection-string`

| Short | Long       | Description |
| ----- | ---------- | ----------- |
| `-a`  | `--appId`  | The app id  |
| `-z`  | `--region` | Region      |

The string takes 1 to 2 minutes to start working. Use it with MongoDB Compass or `mongosh`. Limits: 1 GiB per app, 50,000 reads and 20,000 writes per region per day.
