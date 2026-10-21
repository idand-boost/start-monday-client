# Pitfalls

## Wrong flags you will meet elsewhere

Checked against `mapps --help`, version 4.10.8. If another skill, a doc page or an old example says otherwise, it's wrong.

| Where                                   | Says                                        | Correct                                                                            |
| --------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `code:logs --help` and older references | `History`; dates and `-r` "only with live"  | `history` lowercase; `-f` and `-e` required with `history`; `-r` broken (issue #6) |
| monday-code plugin, scheduler           | `scheduler:create ... -r US`                | Region is `--region` (`-z`). `-r` is `--maxRetries`                                |
| monday-code plugin, scheduler           | `scheduler:create ... -u /path`             | Target is `--targetUrl` (`-e`), endpoint name only                                 |
| monday-code plugin, scheduler           | `scheduler:delete -j <job_id>`              | `scheduler:delete --name <job name>`                                               |
| monday-code plugin, secrets             | "List secrets" with `-m set`                | `--mode list-keys`                                                                 |
| monday-code plugin, deploy              | `app-features:build ... -f <feature_id> -d` | Feature id is `--appFeatureId` (`-d`). There is no `-f`                            |
| monday-code plugin, migrate             | `mapps code:env:set`                        | `mapps code:env --mode set --key ... --value ...`                                  |
| Official docs                           | `-appId` with one dash                      | `--appId`                                                                          |
| Official docs                           | `app-version:builds -t <id>`                | `--appVersionId` (`-i`)                                                            |
| Official docs                           | `scheduler:create -u`                       | `--targetUrl` (`-e`)                                                               |

## Same letter, different meaning

| Letter | Means                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------- |
| `-i`   | App id in `app-version:list`, `code:env`, `code:secret`. Version id almost everywhere else               |
| `-v`   | Version id in `app:deploy`. Value in `code:env` and `code:secret`                                        |
| `-d`   | Folder in `code:push` and `app:deploy`. Feature id in `app-features:build`. Description in `scheduler:*` |
| `-f`   | Force in `code:push`. Start date in `code:logs`. File format in `storage:export`                         |
| `-t`   | Token in `init`. Build type in `app-features:build`. Logs type in `code:logs`. Timeout in `scheduler:*`  |

This is why the skill always writes long flags.

## Platform facts

- **Live versions are locked.** Code can still be force-pushed to live with `code:push --force`, but adding features or changing feature settings needs a new draft version, then `app:promote`. The new version has a new id: update every script and CI variable that stored the old one.
- **Promote is not install.** Promoting makes a version live for accounts that installed the app. To use it in your own account, install it: **Distribute > Install app > Install** in the Developer Center.
- **Client-side pushes need `index.html` at the root** of `--directoryPath`. With a bundler, that's the build folder (`dist`), not the project.
- **Env vars and secrets apply on the next push**, and per region for multi-region apps.
- **`MNDY_MONGODB_CONNECTION_STRING` is injected automatically** after the first deploy. Never set it.
- **Cron:** routes under `/mndy-cronjob/`, max 5 jobs per region, no cron in `il`.
- **Multi-region** is for public apps, must be enabled in the Developer Center before using the database, and can't be undone.
- **Account access:** monday code needs a developer-tier account or an admin to enable it. Free accounts don't have it.

## Instead of the CLI

When the monday apps MCP server is connected, these tools do the same without a shell: `monday_apps_get_all_apps`, `monday_apps_get_app_versions`, `monday_apps_get_app_features`, `monday_apps_get_deployment_status`, `monday_apps_promote_app`, `monday_apps_list_environment_variable_keys`, `monday_apps_set_environment_variable`, `monday_apps_export_storage_data`, `monday_apps_search_storage_records`. Pushing code still needs `mapps code:push`.
