# App, version, feature and manifest commands

Flags from `mapps <command> --help`, version 4.10.8. Examples use long flags.

## init

Saves your monday API token to `~/.mappsrc` (or `./.mappsrc` with `--local`).

| Short | Long      | Description                                                            |
| ----- | --------- | ---------------------------------------------------------------------- |
| `-t`  | `--token` | monday API token: **avatar > Developers > API Token**                  |
| `-l`  | `--local` | Write `.mappsrc` in the current folder (a different token per project) |

```bash
mapps init --token "$MONDAY_TOKEN"
```

Without `--token` it prompts. If you use `--local`, add `.mappsrc` to `.gitignore`.

## Apps

### `app:list`

Lists your apps with their ids. No flags. Also a quick "am I logged in?" check.

### `app:create`

| Short | Long          | Description                 |
| ----- | ------------- | --------------------------- |
| `-n`  | `--name`      | The new app's name          |
| `-d`  | `--targetDir` | Folder to create the app in |

### `app:promote`

Makes a draft version live, for every account that installed the app.

| Short | Long             | Description                  |
| ----- | ---------------- | ---------------------------- |
| `-a`  | `--appId`        | The app id                   |
| `-i`  | `--appVersionId` | The draft version to promote |

```bash
mapps app:promote --appId 12435876 --appVersionId 19013873
```

### `app:deploy`

Deploys an app from a manifest file. Note: the version flag is `-v` here, not `-i`.

| Short | Long              | Description                                 |
| ----- | ----------------- | ------------------------------------------- |
| `-a`  | `--appId`         | The app id (uses the latest draft version)  |
| `-v`  | `--appVersionId`  | The version id                              |
| `-d`  | `--directoryPath` | Project folder. Default: the current folder |
| `-f`  | `--force`         | Push to the latest version, draft or live   |
| `-z`  | `--region`        | `us`, `eu`, `au` or `il`                    |

### `app:scaffold [DESTINATION] [PROJECT]`

Creates a project from a monday template, installs it and runs it.

| Short | Long              | Description                                       |
| ----- | ----------------- | ------------------------------------------------- |
| `-c`  | `--command`       | npm script to run after install. Default: `start` |
| `-s`  | `--signingSecret` | monday signing secret, written into `.env`        |

```bash
mapps app:scaffold ./my-app slack-node --signingSecret "$MONDAY_SIGNING_SECRET"
```

## Versions

### `app-version:list`

Lists every version of an app with its id and status (draft or live). Note: `-i` is the **app** id here.

| Short | Long      | Description |
| ----- | --------- | ----------- |
| `-i`  | `--appId` | The app id  |

```bash
mapps app-version:list --appId 12435876
```

### `app-version:builds`

| Short | Long             | Description    |
| ----- | ---------------- | -------------- |
| `-i`  | `--appVersionId` | The version id |

A live version is locked: to add or change features, create a new draft version (Developer Center, or `manifest:import --appId`), promote it, and update any place that stored the old version id, such as a CI variable.

## Features

### `app-features:list`

| Short | Long             | Description    |
| ----- | ---------------- | -------------- |
| `-a`  | `--appId`        | The app id     |
| `-i`  | `--appVersionId` | The version id |

### `app-features:create`

| Short | Long             | Description                 |
| ----- | ---------------- | --------------------------- |
| `-a`  | `--appId`        | The app id                  |
| `-i`  | `--appVersionId` | A draft version id          |
| `-n`  | `--featureName`  | The feature's name          |
| `-t`  | `--featureType`  | The type, for example below |

Types include `AppFeatureBoardView`, `AppFeatureItemView`, `AppFeatureDashboardWidget`, `AppFeatureWorkspaceView`, `AppFeatureObject`, `AppFeatureItemMenuAction`, `AppFeatureItemBatchAction`, `AppFeatureGroupMenuAction`, `AppFeatureIntegration`, `AppFeatureProductView`, `AppFeatureDocActions`, `AppFeatureAiBoardMainMenuHeader`, `AppFeatureAiDocQuickStart`, `AppFeatureAiDocTopBar`, `AppFeatureAiDocSlashCommand`.

### `app-features:build`

Tells a feature where its code lives. Note: the feature id is `-d`.

| Short | Long             | Description                                      |
| ----- | ---------------- | ------------------------------------------------ |
| `-a`  | `--appId`        | The app id                                       |
| `-i`  | `--appVersionId` | The version id                                   |
| `-d`  | `--appFeatureId` | The feature id (from `app-features:list`)        |
| `-t`  | `--buildType`    | `custom_url`, `monday_code` or `monday_code_cdn` |
| `-u`  | `--customUrl`    | The URL, or the path for monday code             |

`monday_code_cdn` is client-side files pushed with `code:push --client-side`. `monday_code` is server code. `custom_url` is any URL, like `http://localhost:5173` while developing. For the monday code types, `--customUrl` is the path inside your deployment (the docs show `/triggers` for server code). If a path isn't accepted for `monday_code_cdn`, set the feature in the Developer Center instead.

```bash
mapps app-features:build --appId 12435876 --appVersionId 19013873 \
  --appFeatureId 17654321 --buildType custom_url --customUrl http://localhost:5173
```

## Manifests

### `manifest:export`

| Short | Long             | Description                           |
| ----- | ---------------- | ------------------------------------- |
| `-a`  | `--appId`        | The app id (exports the live version) |
| `-i`  | `--appVersionId` | A specific version instead            |
| `-p`  | `--manifestPath` | Folder to write the manifest files to |

### `manifest:import`

| Short | Long                      | Description                                     |
| ----- | ------------------------- | ----------------------------------------------- |
| `-p`  | `--manifestPath`          | Path to the manifest file                       |
| `-a`  | `--appId`                 | Import into this app as a **new draft version** |
| `-i`  | `--appVersionId`          | Overwrite this version instead                  |
| `-n`  | `--newApp`                | Create a new app from the manifest              |
| `-m`  | `--allowMissingVariables` | Don't fail on missing template variables        |

```bash
mapps manifest:import --manifestPath ./manifest.json --appId 12435876
```
