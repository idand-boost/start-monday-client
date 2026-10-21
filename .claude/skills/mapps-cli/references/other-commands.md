# Scheduler, storage, tunnel and other commands

Flags from `mapps <command> --help`, version 4.10.8. Examples use long flags.

## Cron

Cron jobs call an endpoint in your server code on a schedule. The route must live under `/mndy-cronjob/`. Max 5 jobs per region. Region `il` has no cron.

### `scheduler:create` and `scheduler:update`

Same flags for both. `--name` picks the job to update.

| Short | Long                   | Description                                                             |
| ----- | ---------------------- | ----------------------------------------------------------------------- |
| `-a`  | `--appId`              | The app id                                                              |
| `-n`  | `--name`               | Job name, no spaces, unique per app                                     |
| `-s`  | `--schedule`           | Cron expression, in UTC                                                 |
| `-e`  | `--targetUrl`          | Endpoint name only: `daily-cleanup` calls `/mndy-cronjob/daily-cleanup` |
| `-d`  | `--description`        | Optional                                                                |
| `-r`  | `--maxRetries`         | Optional. Retries for failed runs (not the region)                      |
| `-b`  | `--minBackoffDuration` | Optional. Seconds between retries                                       |
| `-t`  | `--timeout`            | Optional. Seconds before a run is stopped                               |
| `-z`  | `--region`             | `us`, `eu`, `au` or `il`                                                |

```bash
mapps scheduler:create --appId 12435876 --name daily-cleanup --schedule "0 0 * * *" \
  --targetUrl daily-cleanup --maxRetries 3 --region us
```

### `scheduler:list`, `scheduler:run`, `scheduler:delete`

| Short | Long       | Description                        |
| ----- | ---------- | ---------------------------------- |
| `-a`  | `--appId`  | The app id                         |
| `-n`  | `--name`   | Job name (`run` and `delete` only) |
| `-z`  | `--region` | Region                             |

`scheduler:run` triggers a job now, without waiting for its schedule.

## Storage

Data your app saved with the storage API, for one customer account.

### `storage:export`

| Short | Long                | Description                     |
| ----- | ------------------- | ------------------------------- |
| `-a`  | `--appId`           | The app id                      |
| `-c`  | `--clientAccountId` | The customer account id         |
| `-f`  | `--fileFormat`      | `JSON` (default) or `CSV`       |
| `-d`  | `--fileDirectory`   | Folder. Default: current folder |

### `storage:search`

| Short | Long                | Description             |
| ----- | ------------------- | ----------------------- |
| `-a`  | `--appId`           | The app id              |
| `-c`  | `--clientAccountId` | The customer account id |
| `-t`  | `--term`            | Text to search for      |

### `storage:remove-data`

Deletes **all** storage data of that account, for good. Confirm with the user first, and only add `--force` if they ask.

| Short | Long                | Description                |
| ----- | ------------------- | -------------------------- |
| `-a`  | `--appId`           | The app id                 |
| `-c`  | `--clientAccountId` | The customer account id    |
| `-f`  | `--force`           | Skip the confirmation step |

## Tunnel

### `tunnel:create`

Gives a local port a public URL, so monday can reach code running on your computer (webhooks, integrations).

| Short | Long      | Description                             |
| ----- | --------- | --------------------------------------- |
| `-p`  | `--port`  | Local port. Default: `8080`             |
| `-a`  | `--appId` | Get a stable tunnel domain for this app |

```bash
mapps tunnel:create --port 8080 --appId 12435876
```

## Misc

- `mapps api:generate`: run in the project root to set up typed custom GraphQL queries (`@mondaydotcomorg/setup-api`).
- `mapps autocomplete zsh` (or `bash`, `powershell`): shell completion setup.
- `mapps help <command>` or `mapps <command> --help`: the source of truth for flags.
