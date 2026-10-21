// Runs after `npm run build` (postbuild). Fails the build if a secret or a dev-only piece ended up in
// dist/, which is what `mapps code:push` uploads for everyone to download.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { parseEnv } from 'node:util'

const DIST = 'dist'
const SECRET_NAMES = ['MONDAY_API_TOKEN', 'VITE_DEV_TOKEN']
const DEV_ONLY_MARKERS = ['/__monday', '[monday mock]']

function envValues() {
  const values = []
  for (const file of ['.env', '.env.local']) {
    if (!existsSync(file)) continue
    const env = parseEnv(readFileSync(file, 'utf8'))
    for (const name of SECRET_NAMES) if (env[name]?.trim()) values.push([name, env[name].trim()])
  }
  return values
}

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

const secrets = envValues()
const problems = []
for (const file of files(DIST)) {
  const text = readFileSync(file, 'utf8')
  for (const [name, value] of secrets) if (text.includes(value)) problems.push(`${file}: contains the value of ${name}`)
  for (const marker of DEV_ONLY_MARKERS)
    if (text.includes(marker)) problems.push(`${file}: contains dev-only code (${marker})`)
}

if (problems.length) {
  console.error(`\n✖ dist/ is not safe to deploy:\n  ${problems.join('\n  ')}\n`)
  process.exit(1)
}
console.log('✓ dist/ has no secrets and no dev-only code')
